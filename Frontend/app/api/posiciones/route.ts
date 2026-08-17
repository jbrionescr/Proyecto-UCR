import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MAPA_AREAS_KEYWORDS } from "@/lib/constants";

const PAGE_SIZE = 12;

// GET — lista pública de posiciones activas (estudiantes y exalumnos pueden ver)
export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo      = searchParams.get("tipo")      || undefined;
  const modalidad = searchParams.get("modalidad") || undefined;
  const empresa   = searchParams.get("empresa")   || undefined;
  const titulo    = searchParams.get("titulo")    || undefined;
  const area      = searchParams.get("area_estudio") || undefined;
  const page      = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    let query = supabaseAdmin
      .from("POSICIONES")
      .select("*, APLICACIONES(count), exalumno:EXALUMNOS!inner(user:USERS!inner(id, nombre, foto_url))", { count: "exact" })
      .eq("estado", "activa")
      .is("deleted_at", null);

    if (tipo) query = query.ilike("tipo", `%${tipo}%`);
    if (modalidad) query = query.ilike("modalidad", `%${modalidad}%`);
    if (empresa) query = query.ilike("empresa", `%${empresa}%`);
    if (titulo) query = query.ilike("titulo", `%${titulo}%`);
    
    if (area) {
      const keywords = MAPA_AREAS_KEYWORDS[area] || [];
      const orFilters = [
        `area_estudio.ilike.%${area}%`,
        ...keywords.map(kw => `area_estudio.ilike.%${kw}%`)
      ];
      query = query.or(orFilters.join(','));
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data: rows, count, error } = await query;

    if (error) {
      console.error("[Supabase Error Posiciones]", error);
      throw error;
    }

    const data = (rows || []).map((p: any) => {
      const exaArr = p.exalumno;
      const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
      const uArr = exa?.user;
      const u = Array.isArray(uArr) ? uArr[0] : uArr;
      return {
        id: p.id,
        titulo: p.titulo,
        tipo: p.tipo,
        modalidad: p.modalidad,
        jornada: p.jornada,
        empresa: p.empresa,
        estado: p.estado,
        fecha_limite: p.fecha_limite ? new Date(p.fecha_limite).toISOString() : null,
        created_at: new Date(p.created_at).toISOString(),
        aplicantes: p.APLICACIONES?.[0]?.count || 0,
        exalumno: {
          id: u?.id ?? null,
          nombre: u?.nombre ?? null,
          foto_url: u?.foto_url ?? null,
        },
      };
    });

    return NextResponse.json({ data, total: count || 0, page, totalPages: Math.ceil((count || 0) / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/posiciones]", error);
    return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
  }
}

// POST — crear nueva posición (solo exalumno)
export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if (token.tipo !== "EXALUMNO" && token.tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden publicar posiciones" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const {
    titulo, tipo, modalidad, jornada, empresa, fecha_limite,
    descripcion, responsabilidades, horario, beneficios,
    nivel_grado_minimo, area_estudio, hard_skills, idiomas_requeridos, soft_skills,
    matching_weights,
  } = body;
  if (!titulo) return NextResponse.json({ message: "El título es requerido" }, { status: 400 });

  try {
    const { data: posicion, error } = await supabaseAdmin
      .from("POSICIONES")
      .insert({
        id: randomUUID(),
        exalumno_id: token.id as string,
        titulo,
        tipo: tipo || null,
        modalidad: modalidad || null,
        jornada: jornada || null,
        empresa: empresa || null,
        estado: "activa",
        fecha_limite: fecha_limite ? new Date(fecha_limite).toISOString() : null,
        descripcion: descripcion || null,
        responsabilidades: responsabilidades || null,
        horario: horario || null,
        beneficios: beneficios || null,
        nivel_grado_minimo: nivel_grado_minimo || null,
        area_estudio: area_estudio || null,
        hard_skills: hard_skills || null,
        idiomas_requeridos: idiomas_requeridos || null,
        soft_skills: soft_skills || null,
        matching_weights: matching_weights || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(posicion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posiciones]", error);
    return NextResponse.json({ message: "Error al crear posición" }, { status: 500 });
  }
}
