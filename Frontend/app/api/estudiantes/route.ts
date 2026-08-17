import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MAPA_AREAS_KEYWORDS } from "@/lib/constants";
import { calcularAfinidad, toApoyoBuscado, toApoyoOfrecido } from "@/lib/matching";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: request.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);

  if (!token) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const nombre     = searchParams.get("nombre")       || null;
  const carrera    = searchParams.get("carrera")      || null;
  const tipo_apoyo = searchParams.get("tipo_apoyo")   || null;
  const sede       = searchParams.get("sede")         || null;
  const area       = searchParams.get("area_tematica") || null;
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const offset     = (page - 1) * PAGE_SIZE;

  try {
    // ── Consultar ESTUDIANTES con filtros en Supabase ──────────────────────────
    let query = supabaseAdmin
      .from("ESTUDIANTES")
      .select(
        `user_id, carrera, escuela_facultad, sede, nivel_academico, area_tematica,
         proyecto_titulo, proyecto_tipo, proyecto_descripcion, proyecto_porcentaje_avance,
         busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia,
         USERS!inner(id, nombre, foto_url, activo, status)`,
        { count: "exact" }
      )
      .eq("visible_en_directorio", true)
      .eq("activo", true)
      .eq("perfil_completo", true) // T-13: solo perfiles al 100%
      .eq("proyecto_activo", true) // T-17: proyectos finalizados salen del directorio
      .eq("USERS.activo", true)
      .neq("USERS.status", "SUSPENDIDO");

    // Filtros opcionales
    if (carrera)    query = query.ilike("carrera", `%${carrera}%`);
    if (sede)       query = query.ilike("sede", `%${sede}%`);
    if (nombre)     query = query.ilike("USERS.nombre", `%${nombre}%`);

    // Filtro por tipo de apoyo
    if (tipo_apoyo === "mentoria")        query = query.eq("busca_mentoria", true);
    else if (tipo_apoyo === "empleo")     query = query.eq("busca_empleo", true);
    else if (tipo_apoyo === "pasantia")   query = query.eq("busca_pasantia", true);
    else if (tipo_apoyo === "financiamiento") query = query.eq("busca_financiamiento", true);

    // Filtro por área temática (aproximación: ilike)
    if (area) query = query.ilike("area_tematica", `%${area}%`);

    // Un exalumno ve el % de afinidad y la lista ordenada de mayor a menor
    // match, así que en ese caso se trae el set filtrado completo para
    // ordenar por score antes de paginar (no se puede ordenar por un campo
    // calculado directamente en la consulta a Supabase).
    const isExalumno = token.tipo === "EXALUMNO";
    if (!isExalumno) {
      query = query.order("user_id", { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
    }

    const { data: rows, error, count } = await query;

    if (error) {
      console.error("[GET /api/estudiantes] Supabase error:", error);
      return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
    }

    const estudianteIds = (rows ?? []).map((est: any) => est.user_id);
    const areasPorEstudiante = new Map<string, string[]>();
    if (estudianteIds.length > 0) {
      const { data: areasRows } = await supabaseAdmin
        .from("USUARIOS_AREAS")
        .select("user_id, area_codigo")
        .in("user_id", estudianteIds);
      for (const r of areasRows ?? []) {
        const list = areasPorEstudiante.get(r.user_id) ?? [];
        list.push(r.area_codigo);
        areasPorEstudiante.set(r.user_id, list);
      }
    }

    let exalumnoCompat: { carrera: string | null; sector: string | null; apoyoOfrecido: string[]; areasInteres: string[] } | null = null;
    if (isExalumno && token.id) {
      const { data: exaRow } = await supabaseAdmin
        .from("EXALUMNOS")
        .select("carrera, escuela_facultad, sector, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion_dinero, ofrece_guest_speaking, ofrece_volunteering, ofrece_career_advice, ofrece_networking")
        .eq("user_id", token.id as string)
        .maybeSingle();
      if (exaRow) {
        const { data: exaAreasRows } = await supabaseAdmin
          .from("USUARIOS_AREAS")
          .select("area_codigo")
          .eq("user_id", token.id as string);
        exalumnoCompat = {
          carrera: exaRow.carrera ?? exaRow.escuela_facultad ?? null,
          sector: exaRow.sector ?? null,
          apoyoOfrecido: toApoyoOfrecido(exaRow),
          areasInteres: (exaAreasRows ?? []).map((r: any) => r.area_codigo),
        };
      }
    }

    let data = (rows ?? []).map((est: any) => {
      const user = Array.isArray(est.USERS) ? est.USERS[0] : est.USERS;
      const areasInteres = areasPorEstudiante.get(est.user_id) ?? [];
      const base: any = {
        id: est.user_id,
        carrera: est.carrera ?? "",
        avanceProyecto: est.proyecto_porcentaje_avance ?? 0,
        areaProyecto: est.area_tematica ?? null,
        proyectoTipo: est.proyecto_tipo ?? null,
        proyectoTitulo: est.proyecto_titulo ?? null,
        proyectoDescripcion: est.proyecto_descripcion ?? null,
        sede: est.sede ?? null,
        nivelAcademico: est.nivel_academico ?? null,
        apoyoBuscado: [
          est.busca_mentoria        ? "Mentoría"       : null,
          est.busca_empleo          ? "Empleo"         : null,
          est.busca_pasantia        ? "Pasantía"       : null,
          est.busca_financiamiento  ? "Financiamiento" : null,
        ].filter(Boolean) as string[],
        user: {
          id: user?.id,
          name: user?.nombre,
          image: user?.foto_url,
          bio: null,
          proyectoFinalizado: (est.proyecto_porcentaje_avance ?? 0) === 100,
        },
      };

      if (!exalumnoCompat) return base;

      const { score, breakdown, reasons } = calcularAfinidad(
        {
          carrera: est.carrera,
          apoyoBuscado: toApoyoBuscado(est),
          areaProyecto: est.area_tematica ?? est.proyecto_tipo ?? null,
          areasInteres,
        },
        exalumnoCompat
      );
      return { ...base, matchScore: score, matchBreakdown: breakdown, matchReasons: reasons };
    });

    let total = count ?? 0;
    if (isExalumno) {
      data.sort((a: any, b: any) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      total = data.length;
      data = data.slice(offset, offset + PAGE_SIZE);
    }

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/estudiantes]", error);
    return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
  }
}
