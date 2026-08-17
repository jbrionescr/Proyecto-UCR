import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getAuthToken(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: req.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getAuthToken(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { data: posicion, error } = await supabaseAdmin
      .from("POSICIONES")
      .select(`
        id, titulo, tipo, modalidad, jornada, empresa, estado,
        fecha_limite, created_at, updated_at, exalumno_id,
        descripcion, responsabilidades, horario, beneficios,
        nivel_grado_minimo, area_estudio, hard_skills,
        idiomas_requeridos, soft_skills, matching_weights,
        APLICACIONES(count),
        exalumno:EXALUMNOS!POSICIONES_exalumno_id_fkey(
          cargo_actual, empresa_actual, pais_ciudad,
          user:USERS!EXALUMNOS_user_id_fkey(id, nombre, foto_url)
        )
      `)
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });

    // Get current user's application if exists
    const { data: miAplicacion } = await supabaseAdmin
      .from("APLICACIONES")
      .select("id, estado, created_at")
      .eq("posicion_id", params.id)
      .eq("estudiante_id", token.id as string)
      .maybeSingle();

    const exa = Array.isArray(posicion.exalumno) ? posicion.exalumno[0] : posicion.exalumno;
    const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;

    return NextResponse.json({
      id: posicion.id,
      titulo: posicion.titulo,
      tipo: posicion.tipo,
      modalidad: posicion.modalidad,
      jornada: posicion.jornada,
      empresa: posicion.empresa,
      estado: posicion.estado,
      fecha_limite: posicion.fecha_limite ?? null,
      created_at: posicion.created_at,
      updated_at: posicion.updated_at,
      exalumno_id: posicion.exalumno_id,
      aplicantes: posicion.APLICACIONES?.[0]?.count ?? 0,
      descripcion: posicion.descripcion,
      responsabilidades: posicion.responsabilidades,
      horario: posicion.horario,
      beneficios: posicion.beneficios,
      nivel_grado_minimo: posicion.nivel_grado_minimo,
      area_estudio: posicion.area_estudio,
      hard_skills: posicion.hard_skills,
      idiomas_requeridos: posicion.idiomas_requeridos,
      soft_skills: posicion.soft_skills,
      matching_weights: posicion.matching_weights,
      exalumno: {
        id: exaUser?.id ?? null,
        nombre: exaUser?.nombre ?? null,
        foto_url: exaUser?.foto_url ?? null,
        cargo_actual: exa?.cargo_actual ?? null,
        empresa_actual: exa?.empresa_actual ?? null,
        pais_ciudad: exa?.pais_ciudad ?? null,
      },
      mi_aplicacion: miAplicacion ?? null,
    });
  } catch (error) {
    console.error("[GET /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al obtener posición" }, { status: 500 });
  }
}

// PATCH — actualizar posición (solo dueño o admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getAuthToken(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { data: posicion } = await supabaseAdmin
    .from("POSICIONES")
    .select("exalumno_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!posicion) return NextResponse.json({ message: "No encontrada" }, { status: 404 });
  if (token.tipo !== "ADMIN" && posicion.exalumno_id !== token.id)
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const updateData: any = {};
  if (body.titulo !== undefined)            updateData.titulo = String(body.titulo);
  if (body.tipo !== undefined)              updateData.tipo = body.tipo;
  if (body.modalidad !== undefined)         updateData.modalidad = body.modalidad;
  if (body.jornada !== undefined)           updateData.jornada = body.jornada;
  if (body.empresa !== undefined)           updateData.empresa = body.empresa;
  if (body.estado !== undefined)            updateData.estado = body.estado;
  if (body.fecha_limite !== undefined)      updateData.fecha_limite = body.fecha_limite || null;
  if (body.descripcion !== undefined)       updateData.descripcion = body.descripcion;
  if (body.responsabilidades !== undefined) updateData.responsabilidades = body.responsabilidades;
  if (body.horario !== undefined)           updateData.horario = body.horario;
  if (body.beneficios !== undefined)        updateData.beneficios = body.beneficios;
  if (body.nivel_grado_minimo !== undefined) updateData.nivel_grado_minimo = body.nivel_grado_minimo;
  if (body.area_estudio !== undefined)      updateData.area_estudio = body.area_estudio;
  if (body.hard_skills !== undefined)       updateData.hard_skills = body.hard_skills;
  if (body.idiomas_requeridos !== undefined) updateData.idiomas_requeridos = body.idiomas_requeridos;
  if (body.soft_skills !== undefined)       updateData.soft_skills = body.soft_skills;
  if (body.matching_weights !== undefined)  updateData.matching_weights = body.matching_weights;

  try {
    const { data: updated, error } = await supabaseAdmin
      .from("POSICIONES")
      .update(updateData)
      .eq("id", params.id)
      .select("id, titulo, tipo, modalidad, jornada, empresa, estado, fecha_limite, descripcion, responsabilidades, horario")
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE — elimina una posición (solo dueño o admin).
// T-19: antes era un hard delete; como APLICACIONES.posicion_id tiene
// onDelete: Cascade, esto borraba silenciosamente el historial de
// aplicaciones de los estudiantes. Ahora es soft delete (deleted_at +
// estado: "eliminada") para preservarlas.
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await getAuthToken(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { data: posicion } = await supabaseAdmin
      .from("POSICIONES")
      .select("exalumno_id")
      .eq("id", params.id)
      .maybeSingle();

    if (!posicion) return NextResponse.json({ message: "No encontrada" }, { status: 404 });
    if (token.tipo !== "ADMIN" && posicion.exalumno_id !== token.id)
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { error } = await supabaseAdmin
      .from("POSICIONES")
      .update({
        estado: "eliminada",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al eliminar" }, { status: 500 });
  }
}
