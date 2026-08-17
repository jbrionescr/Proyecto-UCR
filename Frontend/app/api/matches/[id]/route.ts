import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMatchAceptado, sendMatchRechazado, sendMatchConnectionRequest, sendAdminNewActiveMatch } from "@/lib/email";

async function fetchMatchWithUsers(id: string) {
  const { data: match } = await supabaseAdmin
    .from("MATCHES")
    .select(`
      id, estado, score_match, tipo_apoyo, resultado,
      estudiante_id, exalumno_id, initiated_by,
      match_reasons, accepted_at, rejected_at, closed_at,
      created_at, updated_at,
      estudiante:ESTUDIANTES!MATCHES_estudiante_id_fkey(
        user_id, carrera, escuela_facultad, proyecto_titulo, proyecto_tipo,
        busca_mentoria, busca_empleo, busca_pasantia, busca_financiamiento,
        nivel_beca, comprobante_beca_url,
        user:USERS!ESTUDIANTES_user_id_fkey(nombre, email, foto_url)
      ),
      exalumno:EXALUMNOS!MATCHES_exalumno_id_fkey(
        user_id, escuela_facultad, empresa_actual, cargo_actual,
        ofrece_mentoria, ofrece_empleo, ofrece_pasantia,
        ofrece_donacion_dinero, ofrece_guest_speaking,
        ofrece_volunteering, ofrece_career_advice, ofrece_networking,
        user:USERS!EXALUMNOS_user_id_fkey(nombre, email, foto_url)
      )
    `)
    .eq("id", id)
    .maybeSingle();
  return match;
}

function flattenUser(data: any) {
  if (!data) return null;
  const u = Array.isArray(data.user) ? data.user[0] : data.user;
  return { ...data, user: u };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });

    const match = await fetchMatchWithUsers(params.id);
    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });

    const userId = session.user.id;
    const isAdmin = (session.user as any).tipo === "ADMIN";
    const isOwnStudent = match.estudiante_id === userId;
    const isOwnExalumno = match.exalumno_id === userId;
    if (!isOwnStudent && !isOwnExalumno && !isAdmin) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const est = flattenUser(Array.isArray(match.estudiante) ? match.estudiante[0] : match.estudiante);
    const exa = flattenUser(Array.isArray(match.exalumno) ? match.exalumno[0] : match.exalumno);

    // La info de beca (tipo y comprobante) es sensible: solo la ve el propio
    // estudiante, el admin, o el exalumno una vez que el match fue aceptado.
    const matchYaAceptado = !!match.accepted_at;
    const puedeVerBeca = isOwnStudent || isAdmin || matchYaAceptado;

    const estudianteResponse = est
      ? {
          ...est,
          id: est.user_id,
          user: { name: est.user?.nombre, email: est.user?.email, image: est.user?.foto_url },
          ...(puedeVerBeca ? {} : { nivel_beca: null, comprobante_beca_url: null }),
        }
      : null;

    return NextResponse.json({
      ...match,
      status: match.estado,
      afinidad: match.score_match,
      estudianteId: match.estudiante_id,
      exalumnoId: match.exalumno_id,
      initiatedBy: match.initiated_by,
      estudiante: estudianteResponse,
      exalumno: exa ? { ...exa, id: exa.user_id, user: { name: exa.user?.nombre, email: exa.user?.email, image: exa.user?.foto_url } } : null,
    });
  } catch (error) {
    console.error("[Match] Error GET:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    const userId = session.user.id!;

    const body = await req.json();
    const { action } = body;

    const match = await fetchMatchWithUsers(params.id);
    if (!match) return NextResponse.json({ message: "Match no encontrado" }, { status: 404 });

    const est = flattenUser(Array.isArray(match.estudiante) ? match.estudiante[0] : match.estudiante);
    const exa = flattenUser(Array.isArray(match.exalumno) ? match.exalumno[0] : match.exalumno);

    const isEstudiante = match.estudiante_id === userId;
    const isExalumno   = match.exalumno_id === userId;
    // T-20: el admin solo puede intervenir para cerrar (marcar como completado) un
    // match ya activo, no para las acciones de dos partes (contactar/aceptar/rechazar).
    const isAdmin      = (session.user as any).tipo === "ADMIN" && action === "CERRAR";
    if (!isEstudiante && !isExalumno && !isAdmin) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

    const emisorNombre  = isEstudiante ? est?.user?.nombre : exa?.user?.nombre;
    const receptorNombre = isEstudiante ? exa?.user?.nombre : est?.user?.nombre;
    const receptorEmail  = isEstudiante ? exa?.user?.email : est?.user?.email;

    if (action === "CONTACTAR") {
      if (match.estado !== "SUGERIDO") return NextResponse.json({ message: "Match ya no está sugerido" }, { status: 400 });
      const { data: updated, error } = await supabaseAdmin
        .from("MATCHES")
        .update({ estado: "CONTACTADO", initiated_by: userId })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      if (receptorEmail) await sendMatchConnectionRequest(receptorEmail, receptorNombre || "", emisorNombre || "");
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "ACEPTAR") {
      if (match.estado !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiated_by === userId) return NextResponse.json({ message: "No puedes aceptar tu propia solicitud" }, { status: 400 });
      const { data: updated, error } = await supabaseAdmin
        .from("MATCHES")
        .update({ estado: "ACTIVO", accepted_at: new Date().toISOString() })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      const emisorEmailOriginal = isEstudiante ? exa?.user?.email : est?.user?.email;
      if (emisorEmailOriginal) await sendMatchAceptado(emisorEmailOriginal, emisorNombre || "", receptorNombre || "");
      await sendAdminNewActiveMatch(
        process.env.ADMIN_EMAIL || "admin@alumni.ucr.ac.cr",
        est?.user?.nombre || "",
        exa?.user?.nombre || ""
      );
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "RECHAZAR") {
      if (match.estado !== "CONTACTADO") return NextResponse.json({ message: "Match no contactado" }, { status: 400 });
      if (match.initiated_by === userId) return NextResponse.json({ message: "No puedes rechazar tu propia solicitud" }, { status: 400 });
      const { data: updated, error } = await supabaseAdmin
        .from("MATCHES")
        .update({ estado: "CERRADO", rejected_at: new Date().toISOString() })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      const emisorEmailOriginal = isEstudiante ? exa?.user?.email : est?.user?.email;
      if (emisorEmailOriginal) await sendMatchRechazado(emisorEmailOriginal, emisorNombre || "");
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    if (action === "CERRAR") {
      if (match.estado !== "ACTIVO") return NextResponse.json({ message: "Solo puedes cerrar matches activos" }, { status: 400 });
      const { data: updated, error } = await supabaseAdmin
        .from("MATCHES")
        .update({
          estado: "CERRADO",
          closed_at: new Date().toISOString(),
          ...(isAdmin ? { resultado: "COMPLETADO" } : {}),
        })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ ...updated, status: updated.estado });
    }

    return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("[Match] Error PATCH:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
