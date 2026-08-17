import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendDonacionAprobada, sendDonacionRecibidaStudent, sendDonacionRechazada } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;
  const adminId = session?.user?.id;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { status: "CONFIRMADA" | "RECHAZADA"; motivo_rechazo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status } = body;
  const estadoMap: Record<string, "CONFIRMADA" | "RECHAZADA"> = {
    APROBADA: "CONFIRMADA",
    CONFIRMADA: "CONFIRMADA",
    RECHAZADA: "RECHAZADA",
  };

  const estado = estadoMap[status];
  if (!estado) {
    return NextResponse.json(
      { message: "Status debe ser CONFIRMADA (o APROBADA) o RECHAZADA" },
      { status: 400 }
    );
  }

  const motivo = body.motivo_rechazo?.trim();
  if (estado === "RECHAZADA" && !motivo) {
    return NextResponse.json(
      { message: "Debes indicar un motivo para rechazar la donación." },
      { status: 400 }
    );
  }

  try {
    // Fetch donation with related user data
    const { data: donacion, error: fetchErr } = await supabaseAdmin
      .from("DONACIONES")
      .select(`
        id, monto, destino, estado, exalumno_id, proyecto_estudiante_id,
        exalumno:EXALUMNOS!DONACIONES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(nombre, email)),
        estudiante:ESTUDIANTES!DONACIONES_proyecto_estudiante_id_fkey(proyecto_titulo, user:USERS!ESTUDIANTES_user_id_fkey(nombre, email))
      `)
      .eq("id", params.id)
      .maybeSingle();

    if (fetchErr || !donacion) {
      return NextResponse.json({ message: "Donación no encontrada" }, { status: 404 });
    }

    const updateData: any = { estado, confirmado_por: adminId };
    if (estado === "RECHAZADA") updateData.motivo_rechazo = motivo;
    else updateData.motivo_rechazo = null;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("DONACIONES")
      .update(updateData)
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw updateErr;

    console.log(`[AUDITORIA] Donación ${params.id} ha sido ${estado} por el admin ${adminId}.${estado === "RECHAZADA" ? ` Motivo: ${motivo}` : ""}`);

    const exaArr = donacion.exalumno;
    const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
    const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
    const estArr = donacion.estudiante;
    const est = Array.isArray(estArr) ? estArr[0] : estArr;
    const estUser = Array.isArray(est?.user) ? est.user[0] : est?.user;

    if (estado === "RECHAZADA" && exaUser?.email) {
      await sendDonacionRechazada(
        exaUser.email, exaUser.nombre || "Exalumno",
        Number(donacion.monto), donacion.destino || "Fondo General", motivo!
      );
    }

    if (estado === "CONFIRMADA") {
      if (exaUser?.email) {
        await sendDonacionAprobada(
          exaUser.email, exaUser.nombre || "Exalumno",
          Number(donacion.monto), donacion.destino || "Fondo General"
        );
      }
      if (estUser?.email) {
        await sendDonacionRecibidaStudent(
          estUser.email, estUser.nombre || "Estudiante",
          est?.proyecto_titulo || "Proyecto UCR", Number(donacion.monto)
        );
      }
    }

    return NextResponse.json({ ...updated, status: updated.estado });
  } catch (error) {
    console.error("[PATCH /api/admin/donaciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la donación" }, { status: 500 });
  }
}
