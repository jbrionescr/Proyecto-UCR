import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calcularAfinidad } from "@/lib/matching";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Traer todos los estudiantes con su proyecto y preferencias.
    // T-18: activo=false → perfil pausado, no debe recibir nuevas sugerencias.
    const { data: estudiantesRaw } = await supabaseAdmin
      .from("ESTUDIANTES")
      .select("user_id, carrera, escuela_facultad, area_tematica, proyecto_tipo, habilidades, busca_mentoria, busca_empleo, busca_pasantia, busca_financiamiento")
      .eq("activo", true);
      
    // Traer exalumnos activos
    const { data: exalumnosRaw } = await supabaseAdmin
      .from("EXALUMNOS")
      .select(`
        user_id, carrera, escuela_facultad, sector, habilidades,
        ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion_dinero, 
        ofrece_guest_speaking, ofrece_volunteering, ofrece_career_advice, ofrece_networking,
        user:USERS!EXALUMNOS_user_id_fkey!inner(activo, status)
      `)
      .eq("user.activo", true)
      .neq("user.status", "SUSPENDIDO");

    const estudiantes = estudiantesRaw ?? [];
    const exalumnos = exalumnosRaw ?? [];

    const parseJsonArray = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
      return [];
    };

    // T-11: áreas de interés desde la tabla relacional USUARIOS_AREAS
    const todosLosIds = [...estudiantes.map((e) => e.user_id), ...exalumnos.map((e) => e.user_id)];
    const { data: areasRaw } = await supabaseAdmin
      .from("USUARIOS_AREAS")
      .select("user_id, area_codigo")
      .in("user_id", todosLosIds);
    const areasPorUsuario = new Map<string, string[]>();
    for (const row of areasRaw ?? []) {
      const actuales = areasPorUsuario.get(row.user_id) ?? [];
      actuales.push(row.area_codigo);
      areasPorUsuario.set(row.user_id, actuales);
    }

    let creados = 0;
    let actualizados = 0;

    for (const est of estudiantes) {
      for (const exa of exalumnos) {
        const estCompat = {
          carrera: est.carrera || "",
          escuela_facultad: est.escuela_facultad || "",
          habilidades: parseJsonArray(est.habilidades),
          apoyoBuscado: [
            ...(est.busca_mentoria ? ["mentoria"] : []),
            ...(est.busca_empleo ? ["empleo"] : []),
            ...(est.busca_pasantia ? ["pasantia"] : []),
            ...(est.busca_financiamiento ? ["financiamiento"] : []),
          ],
          areaProyecto: est.proyecto_tipo || est.area_tematica || null,
          areasInteres: areasPorUsuario.get(est.user_id) ?? [],
        };

        const exaCompat = {
          carrera: exa.carrera || "",
          escuela_facultad: exa.escuela_facultad || "",
          sector: exa.sector || null,
          areasInteres: areasPorUsuario.get(exa.user_id) ?? [],
          habilidades: parseJsonArray(exa.habilidades),
          apoyoOfrecido: [
            ...(exa.ofrece_mentoria ? ["mentoria"] : []),
            ...(exa.ofrece_empleo ? ["empleo"] : []),
            ...(exa.ofrece_pasantia ? ["pasantia"] : []),
            ...(exa.ofrece_donacion_dinero ? ["financiamiento"] : []),
            ...(exa.ofrece_guest_speaking ? ["guest speaking"] : []),
            ...(exa.ofrece_volunteering ? ["volunteering"] : []),
            ...(exa.ofrece_career_advice ? ["career advice"] : []),
            ...(exa.ofrece_networking ? ["networking"] : []),
          ],
        };

        const { score, reasons } = calcularAfinidad(estCompat, exaCompat);

        if (score > 0) {
          const { data: existingMatch } = await supabaseAdmin
            .from("MATCHES")
            .select("id, score_match")
            .eq("estudiante_id", est.user_id)
            .eq("exalumno_id", exa.user_id)
            .maybeSingle();

          if (existingMatch) {
            if (existingMatch.score_match !== score) {
              await supabaseAdmin
                .from("MATCHES")
                .update({ score_match: score, match_reasons: reasons })
                .eq("id", existingMatch.id);
              actualizados++;
            }
          } else {
            await supabaseAdmin.from("MATCHES").insert({
              id: randomUUID(),
              estudiante_id: est.user_id,
              exalumno_id: exa.user_id,
              score_match: score,
              estado: "SUGERIDO",
              match_reasons: reasons,
            });
            creados++;
          }
        }
      }
    }

    return NextResponse.json({ message: "Proceso de matching completado", creados, actualizados });
  } catch (error) {
    console.error("[Matches] Error en generación:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
