import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  sendAplicacionSeleccionada,
  sendAplicacionDescartada,
} from "@/lib/email";

// PATCH — exalumno selecciona o descarta un aplicante
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden gestionar aplicaciones" }, { status: 403 });

  let body: { action: string; cerrarPosicion?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { action, cerrarPosicion = false } = body;
  if (!["seleccionar", "descartar", "marcar_revision"].includes(action))
    return NextResponse.json({ message: "Acción inválida. Use 'seleccionar', 'descartar' o 'marcar_revision'" }, { status: 400 });

  // Fetch the application with context
  const { data: aplicacion, error: apErr } = await supabaseAdmin
    .from("APLICACIONES")
    .select(`
      id, estado, posicion_id, estudiante_id,
      posicion:POSICIONES!APLICACIONES_posicion_id_fkey(id, titulo, empresa, exalumno_id, estado),
      estudiante:ESTUDIANTES!APLICACIONES_estudiante_id_fkey(
        user:USERS!ESTUDIANTES_user_id_fkey(nombre, email)
      )
    `)
    .eq("id", params.id)
    .maybeSingle();

  if (apErr || !aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });

  const pos = Array.isArray(aplicacion.posicion) ? aplicacion.posicion[0] : aplicacion.posicion;
  const estArr = aplicacion.estudiante;
  const est = Array.isArray(estArr) ? estArr[0] : estArr;
  const estUser = Array.isArray(est?.user) ? est.user[0] : est?.user;

  if (tipo !== "ADMIN" && pos?.exalumno_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para gestionar esta aplicación" }, { status: 403 });

  // T-14: marcar_revision es idempotente y solo aplica desde ENVIADA — se
  // resuelve antes de la validación genérica de "ya fue procesada", que es
  // específica de seleccionar/descartar.
  if (action === "marcar_revision") {
    if (aplicacion.estado !== "ENVIADA") {
      return NextResponse.json({ ok: true, estado: aplicacion.estado });
    }
    const { data: updated, error } = await supabaseAdmin
      .from("APLICACIONES")
      .update({ estado: "EN_REVISION", updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select("id, estado")
      .single();
    if (error) return NextResponse.json({ message: "Error al actualizar la aplicación" }, { status: 500 });
    return NextResponse.json({ ok: true, estado: updated.estado });
  }

  if (!["ENVIADA", "EN_REVISION"].includes(aplicacion.estado))
    return NextResponse.json({ message: "Esta aplicación ya fue procesada" }, { status: 400 });

  // Get exalumno user data for emails
  const { data: exaUser } = await supabaseAdmin
    .from("USERS")
    .select("nombre, email")
    .eq("id", pos?.exalumno_id)
    .maybeSingle();

  const estudianteEmail  = estUser?.email ?? null;
  const estudianteNombre = estUser?.nombre ?? "Estudiante";
  const posicionTitulo   = pos?.titulo ?? "la posición";
  const exalumnoNombre   = exaUser?.nombre ?? "";
  const exalumnoEmail    = exaUser?.email ?? "";

  try {
    if (action === "seleccionar") {
      const { data: updated, error } = await supabaseAdmin
        .from("APLICACIONES")
        .update({ estado: "SELECCIONADO", updated_at: new Date().toISOString() })
        .eq("id", params.id)
        .select("id, estado")
        .single();
      if (error) throw error;

      if (estudianteEmail) {
        await sendAplicacionSeleccionada(estudianteEmail, estudianteNombre, posicionTitulo, exalumnoNombre, exalumnoEmail);
      }

      if (cerrarPosicion) {
        // Get other pending applicants to notify them (ENVIADA o EN_REVISION, ambos "no decididos")
        const { data: otrosPendientes } = await supabaseAdmin
          .from("APLICACIONES")
          .select(`id, estudiante:ESTUDIANTES!APLICACIONES_estudiante_id_fkey(user:USERS!ESTUDIANTES_user_id_fkey(email, nombre))`)
          .eq("posicion_id", aplicacion.posicion_id)
          .neq("id", params.id)
          .in("estado", ["ENVIADA", "EN_REVISION"]);

        // Batch reject
        await supabaseAdmin
          .from("APLICACIONES")
          .update({ estado: "DESCARTADO", updated_at: new Date().toISOString() })
          .eq("posicion_id", aplicacion.posicion_id)
          .neq("id", params.id)
          .in("estado", ["ENVIADA", "EN_REVISION"]);

        // Close position
        await supabaseAdmin
          .from("POSICIONES")
          .update({ estado: "cubierta" })
          .eq("id", aplicacion.posicion_id);

        // Send rejection emails
        await Promise.allSettled(
          (otrosPendientes ?? []).map((a: any) => {
            const u = Array.isArray(a.estudiante) ? a.estudiante[0]?.user : a.estudiante?.user;
            const userInfo = Array.isArray(u) ? u[0] : u;
            if (userInfo?.email) return sendAplicacionDescartada(userInfo.email, userInfo.nombre ?? "Estudiante", posicionTitulo);
          })
        );
      }

      return NextResponse.json({ ok: true, estado: updated.estado });
    }

    if (action === "descartar") {
      const { data: updated, error } = await supabaseAdmin
        .from("APLICACIONES")
        .update({ estado: "DESCARTADO" })
        .eq("id", params.id)
        .select("id, estado")
        .single();
      if (error) throw error;

      if (estudianteEmail) {
        await sendAplicacionDescartada(estudianteEmail, estudianteNombre, posicionTitulo);
      }

      return NextResponse.json({ ok: true, estado: updated.estado });
    }
  } catch (error) {
    console.error("[PATCH /api/aplicaciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la aplicación" }, { status: 500 });
  }
}

// DELETE — estudiante retira su aplicación (solo si ENVIADA)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "ESTUDIANTE")
    return NextResponse.json({ message: "Solo estudiantes pueden retirar aplicaciones" }, { status: 403 });

  const { data: aplicacion } = await supabaseAdmin
    .from("APLICACIONES")
    .select("id, estado, estudiante_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });
  if (aplicacion.estudiante_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para retirar esta aplicación" }, { status: 403 });
  if (aplicacion.estado !== "ENVIADA")
    return NextResponse.json({ message: "Solo puedes retirar aplicaciones que aún no han sido revisadas por el exalumno." }, { status: 400 });

  try {
    const { error } = await supabaseAdmin.from("APLICACIONES").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/aplicaciones/[id]]", error);
    return NextResponse.json({ message: "Error al retirar la aplicación" }, { status: 500 });
  }
}
