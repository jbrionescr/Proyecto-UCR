import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPerfilAutoSuspendido } from "@/lib/email";

const REPORTES_PARA_SUSPENSION = 3;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const reportadorId = (session.user as any).id as string;

  let body: { reportadoId: string; motivo: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { reportadoId, motivo } = body;

  if (!reportadoId || !motivo) {
    return NextResponse.json({ message: "Faltan campos: reportadoId, motivo" }, { status: 400 });
  }

  if (reportadorId === reportadoId) {
    return NextResponse.json({ message: "No puedes reportarte a ti mismo" }, { status: 400 });
  }

  // Verificar que el usuario reportado existe
  const { data: reportado } = await supabaseAdmin
    .from("USERS")
    .select("id, nombre, email, status")
    .eq("id", reportadoId)
    .maybeSingle();

  if (!reportado) {
    return NextResponse.json({ message: "Usuario reportado no encontrado" }, { status: 404 });
  }

  // Verificar que el reportador no haya reportado ya al mismo usuario
  const { data: reportePrevio } = await supabaseAdmin
    .from("REPORTES_PERFIL")
    .select("id")
    .eq("reportado_por", reportadorId)
    .eq("perfil_reportado", reportadoId)
    .maybeSingle();

  if (reportePrevio) {
    return NextResponse.json(
      { message: "Ya has reportado a este usuario anteriormente" },
      { status: 409 }
    );
  }

  try {
    // Insertar el reporte
    const { error: insertError } = await supabaseAdmin
      .from("REPORTES_PERFIL")
      .insert({
        id: crypto.randomUUID(),
        reportado_por: reportadorId,
        perfil_reportado: reportadoId,
        motivo,
      });
    if (insertError) throw insertError;

    // Contar total de reportes
    const { count: totalReportes } = await supabaseAdmin
      .from("REPORTES_PERFIL")
      .select("id", { count: "exact", head: true })
      .eq("perfil_reportado", reportadoId);

    const total = totalReportes ?? 0;
    const yaSuspendido = reportado.status === "SUSPENDIDO";
    const debeSuspender = total >= REPORTES_PARA_SUSPENSION && !yaSuspendido;

    // Actualizar contador y suspender si aplica
    const updateData: any = { reportes_recibidos: total };
    if (debeSuspender) {
      updateData.status = "SUSPENDIDO";
      updateData.activo = false;
    }
    await supabaseAdmin.from("USERS").update(updateData).eq("id", reportadoId);

    // Notificar a admins si hubo auto-suspensión
    if (debeSuspender) {
      try {
        const { data: admins } = await supabaseAdmin
          .from("USERS")
          .select("email")
          .eq("tipo", "ADMIN");
        await Promise.all(
          (admins ?? [])
            .filter((a: any) => a.email)
            .map((a: any) =>
              sendPerfilAutoSuspendido(a.email, reportado.nombre, reportado.email, total)
            )
        );
      } catch (mailErr) {
        console.error("[POST /api/reportes] Falló el email a admins:", mailErr);
      }
    }

    return NextResponse.json(
      {
        message: debeSuspender
          ? "Reporte registrado. El usuario fue suspendido automáticamente."
          : "Reporte registrado exitosamente.",
        totalReportes: total,
        suspendidoAuto: debeSuspender,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/reportes]", error);
    return NextResponse.json({ message: "Error al registrar el reporte" }, { status: 500 });
  }
}

// GET: Lista de reportes agrupados (solo ADMIN)
export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Obtener todos los reportes
    const { data: todosReportes, error } = await supabaseAdmin
      .from("REPORTES_PERFIL")
      .select("id, perfil_reportado, motivo, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Agrupar por perfil_reportado
    const grouped = new Map<string, { motivos: string[]; count: number }>();
    for (const r of (todosReportes ?? [])) {
      const entry = grouped.get(r.perfil_reportado) ?? { motivos: [], count: 0 };
      entry.count++;
      entry.motivos.push(r.motivo);
      grouped.set(r.perfil_reportado, entry);
    }

    const reportadoIds = Array.from(grouped.keys());
    if (reportadoIds.length === 0) return NextResponse.json([]);

    const { data: usuarios } = await supabaseAdmin
      .from("USERS")
      .select("id, nombre, email, status, tipo")
      .in("id", reportadoIds);

    const result = reportadoIds
      .map((id) => {
        const grupo = grouped.get(id)!;
        const usuario = (usuarios ?? []).find((u: any) => u.id === id);
        return {
          usuario: usuario
            ? { ...usuario, name: usuario.nombre, role: usuario.tipo }
            : null,
          totalReportes: grupo.count,
          motivos: grupo.motivos,
        };
      })
      .sort((a, b) => b.totalReportes - a.totalReportes);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/reportes]", error);
    return NextResponse.json({ message: "Error al obtener reportes" }, { status: 500 });
  }
}
