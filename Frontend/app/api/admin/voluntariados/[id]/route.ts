import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendVoluntariadoAceptado, sendVoluntariadoRechazado } from "@/lib/email";

// PATCH — el admin acepta o rechaza una oferta de voluntariado
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const adminId = session?.user?.id;
  if (!session?.user || (session.user as any).tipo !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { estado: "ACEPTADA" | "RECHAZADA"; motivo_rechazo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { estado } = body;
  if (estado !== "ACEPTADA" && estado !== "RECHAZADA") {
    return NextResponse.json({ message: "Estado debe ser ACEPTADA o RECHAZADA" }, { status: 400 });
  }

  const motivo = body.motivo_rechazo?.trim();
  if (estado === "RECHAZADA" && !motivo) {
    return NextResponse.json({ message: "Debes indicar un motivo para rechazar la oferta." }, { status: 400 });
  }

  try {
    const { data: oferta, error: fetchErr } = await supabaseAdmin
      .from("VOLUNTARIADOS_UCR")
      .select(`
        id, titulo, estado, exalumno_id,
        exalumno:EXALUMNOS!VOLUNTARIADOS_UCR_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))
      `)
      .eq("id", params.id)
      .maybeSingle();

    if (fetchErr || !oferta) {
      return NextResponse.json({ message: "Oferta no encontrada" }, { status: 404 });
    }
    if (oferta.estado !== "PENDIENTE") {
      return NextResponse.json({ message: "Esta oferta ya fue revisada." }, { status: 400 });
    }

    const updateData: any = { estado, revisado_por: adminId };
    updateData.motivo_rechazo = estado === "RECHAZADA" ? motivo : null;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("VOLUNTARIADOS_UCR")
      .update(updateData)
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    console.log(`[AUDITORIA] Voluntariado ${params.id} fue ${estado} por el admin ${adminId}.${estado === "RECHAZADA" ? ` Motivo: ${motivo}` : ""}`);

    const exaArr = oferta.exalumno as any;
    const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
    const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;

    // Notificación in-app
    if (exaUser?.id) {
      const ahora = new Date().toISOString();
      await supabaseAdmin.from("NOTIFICATIONS").insert({
        id: randomUUID(),
        user_id: exaUser.id,
        title: estado === "ACEPTADA" ? "¡Tu oferta de apoyo fue aceptada!" : "Sobre tu oferta de apoyo",
        message:
          estado === "ACEPTADA"
            ? `La Fundación UCR aceptó tu oferta para "${oferta.titulo}".`
            : `Tu oferta para "${oferta.titulo}" no fue aceptada. Motivo: ${motivo}`,
        type: estado === "ACEPTADA" ? "voluntariado_aceptado" : "voluntariado_rechazado",
        read: false,
        reference_id: params.id,
        created_at: ahora,
        updated_at: ahora,
      });
    }

    // Notificación por correo
    if (exaUser?.email) {
      if (estado === "ACEPTADA") {
        await sendVoluntariadoAceptado(exaUser.email, exaUser.nombre || "Exalumno", oferta.titulo);
      } else {
        await sendVoluntariadoRechazado(exaUser.email, exaUser.nombre || "Exalumno", oferta.titulo, motivo!);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/voluntariados/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la oferta" }, { status: 500 });
  }
}
