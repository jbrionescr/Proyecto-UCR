import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendTallerAprobado, sendTallerRechazado } from "@/lib/email";

// PATCH — el admin aprueba o rechaza un taller propuesto
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!session?.user || (session.user as any).tipo !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { estado: "APROBADO" | "RECHAZADO"; motivo_rechazo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { estado } = body;
  if (estado !== "APROBADO" && estado !== "RECHAZADO") {
    return NextResponse.json({ message: "Estado debe ser APROBADO o RECHAZADO" }, { status: 400 });
  }

  const motivo = body.motivo_rechazo?.trim();
  if (estado === "RECHAZADO" && !motivo) {
    return NextResponse.json({ message: "Debes indicar un motivo para rechazar el taller." }, { status: 400 });
  }

  try {
    const { data: taller, error: fetchErr } = await supabaseAdmin
      .from("TALLERES")
      .select(`
        id, titulo, estado,
        exalumno:EXALUMNOS!TALLERES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))
      `)
      .eq("id", params.id)
      .maybeSingle();

    if (fetchErr || !taller) {
      return NextResponse.json({ message: "Taller no encontrado" }, { status: 404 });
    }
    if (taller.estado !== "PENDIENTE") {
      return NextResponse.json({ message: "Este taller ya fue revisado." }, { status: 400 });
    }

    const updateData: any = { estado, revisado_por: adminId };
    updateData.motivo_rechazo = estado === "RECHAZADO" ? motivo : null;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("TALLERES")
      .update(updateData)
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    console.log(`[AUDITORIA] Taller ${params.id} fue ${estado} por el admin ${adminId}.${estado === "RECHAZADO" ? ` Motivo: ${motivo}` : ""}`);

    const exaArr = taller.exalumno as any;
    const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
    const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;

    if (exaUser?.id) {
      const ahora = new Date().toISOString();
      await supabaseAdmin.from("NOTIFICATIONS").insert({
        id: randomUUID(),
        user_id: exaUser.id,
        title: estado === "APROBADO" ? "¡Tu taller fue aprobado!" : "Sobre tu taller propuesto",
        message:
          estado === "APROBADO"
            ? `Tu taller "${taller.titulo}" fue aprobado y ya es visible para la comunidad UCR.`
            : `Tu taller "${taller.titulo}" no fue aprobado. Motivo: ${motivo}`,
        type: estado === "APROBADO" ? "taller_aprobado" : "taller_rechazado",
        read: false,
        reference_id: params.id,
        created_at: ahora,
        updated_at: ahora,
      });
    }

    if (exaUser?.email) {
      if (estado === "APROBADO") {
        await sendTallerAprobado(exaUser.email, exaUser.nombre || "Exalumno", taller.titulo);
      } else {
        await sendTallerRechazado(exaUser.email, exaUser.nombre || "Exalumno", taller.titulo, motivo!);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/talleres/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar el taller" }, { status: 500 });
  }
}
