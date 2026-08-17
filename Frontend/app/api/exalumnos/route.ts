import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { createClient } from "@supabase/supabase-js";
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
  const nombre      = searchParams.get("nombre")      || undefined;
  const carrera     = searchParams.get("carrera")     || undefined;
  const empresa     = searchParams.get("empresa")     || undefined;
  const pais_ciudad = searchParams.get("pais_ciudad") || undefined;
  const tipo_apoyo  = searchParams.get("tipo_apoyo")  || undefined;
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    let query = supabase
      .from('EXALUMNOS')
      .select('*, user:USERS!inner(id, nombre, foto_url, activo, status)', { count: 'exact' })
      .eq('user.activo', true)
      .neq('user.status', 'SUSPENDIDO')
      .eq('perfil_completo', true); // T-13: solo perfiles al 100%

    if (nombre) query = query.ilike('user.nombre', `%${nombre}%`);
    if (empresa) query = query.ilike('empresa_actual', `%${empresa}%`);
    if (pais_ciudad) query = query.ilike('pais_ciudad', `%${pais_ciudad}%`);

    if (carrera) {
      const keywords = MAPA_AREAS_KEYWORDS[carrera] || [];
      const orFilters = [
        `escuela_facultad.ilike.%${carrera}%`,
        ...keywords.map(kw => `escuela_facultad.ilike.%${kw}%`)
      ];
      query = query.or(orFilters.join(','));
    }

    if (tipo_apoyo === "mentoria")            query = query.eq('ofrece_mentoria', true);
    else if (tipo_apoyo === "empleo")         query = query.eq('ofrece_empleo', true);
    else if (tipo_apoyo === "pasantia")       query = query.eq('ofrece_pasantia', true);
    else if (tipo_apoyo === "proyecto")       query = query.eq('ofrece_proyecto', true);
    else if (tipo_apoyo === "donacion")       query = query.eq('ofrece_donacion_dinero', true);
    else if (tipo_apoyo === "guest_speaking") query = query.eq('ofrece_guest_speaking', true);
    else if (tipo_apoyo === "career_advice")  query = query.eq('ofrece_career_advice', true);
    else if (tipo_apoyo === "networking")     query = query.eq('ofrece_networking', true);
    else if (tipo_apoyo === "volunteering")   query = query.eq('ofrece_volunteering', true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Un estudiante ve el % de afinidad y la lista ordenada de mayor a menor
    // match, así que en ese caso se trae el set filtrado completo para
    // ordenar por score antes de paginar (no se puede ordenar por un campo
    // calculado directamente en la consulta a Supabase).
    const isEstudiante = token.tipo === "ESTUDIANTE";
    if (!isEstudiante) {
      query = query.order('created_at', { foreignTable: 'user', ascending: false }).range(from, to);
    }

    const { data: rows, count, error } = await query;

    if (error) {
      console.error("[Supabase Error]", error);
      throw error;
    }

    const exalumnoIds = (rows || []).map((ex: any) => ex.user_id);
    const areasPorExalumno = new Map<string, string[]>();
    if (exalumnoIds.length > 0) {
      const { data: areasRows } = await supabase
        .from('USUARIOS_AREAS')
        .select('user_id, area_codigo')
        .in('user_id', exalumnoIds);
      for (const r of areasRows ?? []) {
        const list = areasPorExalumno.get(r.user_id) ?? [];
        list.push(r.area_codigo);
        areasPorExalumno.set(r.user_id, list);
      }
    }

    let estudianteCompat: { carrera: string | null; areaProyecto: string | null; apoyoBuscado: string[]; areasInteres: string[] } | null = null;
    if (isEstudiante && token.id) {
      const { data: estRow } = await supabase
        .from('ESTUDIANTES')
        .select('carrera, area_tematica, proyecto_tipo, busca_mentoria, busca_empleo, busca_pasantia, busca_financiamiento')
        .eq('user_id', token.id as string)
        .maybeSingle();
      if (estRow) {
        const { data: estAreasRows } = await supabase
          .from('USUARIOS_AREAS')
          .select('area_codigo')
          .eq('user_id', token.id as string);
        estudianteCompat = {
          carrera: estRow.carrera ?? null,
          areaProyecto: estRow.area_tematica ?? estRow.proyecto_tipo ?? null,
          apoyoBuscado: toApoyoBuscado(estRow),
          areasInteres: (estAreasRows ?? []).map((r: any) => r.area_codigo),
        };
      }
    }

    let data = (rows || []).map((ex: any) => {
      const areasInteres = areasPorExalumno.get(ex.user_id) ?? [];
      const base = {
        user_id: ex.user_id,
        carrera: ex.escuela_facultad ?? "",
        escuela_facultad: ex.escuela_facultad ?? "",
        sector: ex.sector ?? null,
        anio_graduacion: ex.anio_graduacion ?? null,
        empresa_actual: ex.empresa_actual ?? "",
        cargo_actual: ex.cargo_actual ?? "",
        pais_ciudad: ex.pais_ciudad ?? null,
        anios_experiencia: ex.anios_experiencia ?? null,
        linkedin_url: ex.linkedin_url ?? null,
        biografia: ex.biografia ?? null,
        github_url: ex.github_url ?? null,
        website_url: ex.website_url ?? null,
        habilidades: ex.habilidades ?? [],
        areas_interes: areasInteres,
        ofrece_mentoria: !!ex.ofrece_mentoria,
        ofrece_empleo: !!ex.ofrece_empleo,
        ofrece_pasantia: !!ex.ofrece_pasantia,
        ofrece_proyecto: !!ex.ofrece_proyecto,
        ofrece_donacion_dinero: !!ex.ofrece_donacion_dinero,
        ofrece_guest_speaking: !!ex.ofrece_guest_speaking,
        ofrece_volunteering: !!ex.ofrece_volunteering,
        ofrece_career_advice: !!ex.ofrece_career_advice,
        ofrece_networking: !!ex.ofrece_networking,
        User: {
          id: ex.user?.id || ex.user_id,
          nombre: ex.user?.nombre || "Exalumno",
          foto_url: ex.user?.foto_url || null,
          email: null,
        },
      };

      if (!estudianteCompat) return base;

      const { score, breakdown, reasons } = calcularAfinidad(estudianteCompat, {
        carrera: ex.carrera ?? ex.escuela_facultad ?? null,
        sector: ex.sector ?? null,
        apoyoOfrecido: toApoyoOfrecido(ex),
        areasInteres,
      });
      return { ...base, matchScore: score, matchBreakdown: breakdown, matchReasons: reasons };
    });

    let total = count || 0;
    if (isEstudiante) {
      data.sort((a: any, b: any) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      total = data.length;
      data = data.slice(from, to + 1);
    }

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE)
    });
  } catch (error) {
    console.error("[GET /api/exalumnos]", error);
    return NextResponse.json({ message: "Error al obtener el directorio" }, { status: 500 });
  }
}
