import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendNuevaAplicacion } from "@/lib/email";

// GET — aplicaciones del usuario
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;
  const { searchParams } = new URL(request.url);
  const posicionId = searchParams.get("posicion_id") || null;

  try {
    let data: any[] = [];

    if (tipo === "ESTUDIANTE") {
      const { data: rows, error } = await supabaseAdmin
        .from("APLICACIONES")
        .select(`
          id, estado, created_at, updated_at,
          posicion:POSICIONES!APLICACIONES_posicion_id_fkey(
            id, titulo, tipo, modalidad, empresa, estado, fecha_limite,
            exalumno:EXALUMNOS!POSICIONES_exalumno_id_fkey(
              user:USERS!EXALUMNOS_user_id_fkey(nombre, foto_url)
            )
          )
        `)
        .eq("estudiante_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      data = (rows ?? []).map((a: any) => {
        const pos = Array.isArray(a.posicion) ? a.posicion[0] : a.posicion;
        const exaArr = pos?.exalumno;
        const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
        const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
        return {
          id: a.id,
          estado: a.estado,
          created_at: a.created_at,
          updated_at: a.updated_at,
          estudiante_id: null,
          posicion: pos ? {
            id: pos.id,
            titulo: pos.titulo,
            tipo: pos.tipo ?? null,
            modalidad: pos.modalidad ?? null,
            empresa: pos.empresa ?? null,
            estado: pos.estado ?? null,
            fecha_limite: pos.fecha_limite ?? null,
            exalumno_nombre: exaUser?.nombre ?? null,
            exalumno_foto: exaUser?.foto_url ?? null,
          } : null,
          estudiante: null,
        };
      });

    } else if (tipo === "EXALUMNO" || tipo === "ADMIN") {
      let posQuery = supabaseAdmin
        .from("APLICACIONES")
        .select(`
          id, estado, created_at, updated_at, estudiante_id,
          posicion:POSICIONES!APLICACIONES_posicion_id_fkey(id, titulo, empresa, exalumno_id),
          estudiante:ESTUDIANTES!APLICACIONES_estudiante_id_fkey(
            carrera, nivel_academico,
            user:USERS!ESTUDIANTES_user_id_fkey(nombre, foto_url, email)
          )
        `)
        .order("created_at", { ascending: false });

      if (tipo === "EXALUMNO") {
        // Filter to only aplicaciones for this exalumno's positions
        // We need to filter via posicion.exalumno_id - use inner join approach
        const { data: misPos } = await supabaseAdmin
          .from("POSICIONES")
          .select("id")
          .eq("exalumno_id", userId);
        const misIds = (misPos ?? []).map((p: any) => p.id);
        if (misIds.length === 0) return NextResponse.json({ data: [], total: 0 });
        posQuery = posQuery.in("posicion_id", misIds);
      }

      if (posicionId) posQuery = posQuery.eq("posicion_id", posicionId);

      const { data: rows, error } = await posQuery;
      if (error) throw error;

      data = (rows ?? []).map((a: any) => {
        const pos = Array.isArray(a.posicion) ? a.posicion[0] : a.posicion;
        const estArr = a.estudiante;
        const est = Array.isArray(estArr) ? estArr[0] : estArr;
        const estUser = Array.isArray(est?.user) ? est.user[0] : est?.user;
        return {
          id: a.id,
          estado: a.estado,
          created_at: a.created_at,
          updated_at: a.updated_at,
          estudiante_id: a.estudiante_id ?? null,
          posicion: pos ? { id: pos.id, titulo: pos.titulo, empresa: pos.empresa ?? null } : null,
          estudiante: est ? {
            nombre: estUser?.nombre ?? null,
            foto_url: estUser?.foto_url ?? null,
            email: estUser?.email ?? null,
            carrera: est.carrera ?? null,
            nivel_academico: est.nivel_academico ?? null,
          } : null,
        };
      });
    } else {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json({ data, total: data.length });
  } catch (error) {
    console.error("[GET /api/aplicaciones]", error);
    return NextResponse.json({ message: "Error al obtener aplicaciones" }, { status: 500 });
  }
}

// POST — aplicar a una posición (solo estudiante)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "ESTUDIANTE")
    return NextResponse.json({ message: "Solo estudiantes pueden aplicar" }, { status: 403 });

  let body: { posicion_id: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.posicion_id)
    return NextResponse.json({ message: "posicion_id es requerido" }, { status: 400 });

  // Verificar que la posición existe y está activa
  const { data: posicion, error: posErr } = await supabaseAdmin
    .from("POSICIONES")
    .select("id, estado, titulo, exalumno_id")
    .eq("id", body.posicion_id)
    .maybeSingle();

  if (posErr || !posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });
  if (posicion.estado !== "activa")
    return NextResponse.json({ message: "Esta posición ya no está activa" }, { status: 400 });

  // Verificar que no haya aplicado ya
  const { data: existing } = await supabaseAdmin
    .from("APLICACIONES")
    .select("id")
    .eq("posicion_id", body.posicion_id)
    .eq("estudiante_id", userId)
    .maybeSingle();

  if (existing)
    return NextResponse.json({ message: "Ya aplicaste a esta posición" }, { status: 409 });

  // Verificar que el estudiante tiene perfil
  const { data: estPerfil } = await supabaseAdmin
    .from("ESTUDIANTES")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!estPerfil)
    return NextResponse.json({ message: "Debes completar tu perfil de estudiante primero" }, { status: 400 });

  try {
    const { data: aplicacion, error } = await supabaseAdmin
      .from("APLICACIONES")
      .insert({
        id: crypto.randomUUID(),
        posicion_id: body.posicion_id,
        estudiante_id: userId,
        estado: "ENVIADA",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    // Notificar al exalumno dueño de la posición
    try {
      const [{ data: exaUser }, { data: estUser }] = await Promise.all([
        supabaseAdmin.from("USERS").select("nombre, email").eq("id", posicion.exalumno_id).maybeSingle(),
        supabaseAdmin.from("USERS").select("nombre").eq("id", userId).maybeSingle(),
      ]);
      if (exaUser?.email) {
        await sendNuevaAplicacion(
          exaUser.email,
          exaUser.nombre ?? "Exalumno",
          posicion.titulo ?? "la posición",
          estUser?.nombre ?? "Estudiante"
        );
      }
    } catch (emailErr) {
      console.error("[POST /api/aplicaciones] Email error:", emailErr);
    }

    return NextResponse.json(aplicacion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/aplicaciones]", error);
    return NextResponse.json({ message: "Error al registrar aplicación" }, { status: 500 });
  }
}
