"use server";

import prisma from "@/lib/prisma";
import { extractMontoObjetivo } from "@/lib/funding";
import { getExchangeRate, usdToCrc } from "@/lib/exchangeRate";

export async function getJobPositions() {
  try {
    const posiciones = await prisma.posicion.findMany({
      where: { estado: "activa" },
      select: {
        id: true, titulo: true, tipo: true, modalidad: true,
        empresa: true, jornada: true, fecha_limite: true,
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return posiciones.map((p) => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      modalidad: p.modalidad,
      empresa: p.empresa,
      jornada: p.jornada,
      fecha_limite: p.fecha_limite?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("Error fetching posiciones:", error);
    return [];
  }
}

export async function getStudentProjects() {
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: estudiantes, error } = await supabaseAdmin
      .from('ESTUDIANTES')
      .select('user_id, carrera, proyecto_titulo, proyecto_tipo, proyecto_descripcion, proyecto_porcentaje_avance, proyecto_necesidades, user:USERS(nombre, foto_url, activo)')
      .eq('visible_en_directorio', true)
      .eq('busca_financiamiento', true)
      .not('proyecto_titulo', 'is', null);

    if (error || !estudiantes) {
      console.error("Supabase error fetching student projects:", error);
      return [];
    }

    // Filtramos manualmente por activo == true ya que Supabase no soporta filtro anidado fácil sin inner join en rpc
    const activeEstudiantes = estudiantes.filter((e: any) => e.user?.activo === true);

    // Suma de donaciones confirmadas por estudiante, en una sola consulta.
    const estudianteIds = activeEstudiantes.map((e: any) => e.user_id);
    const recaudadoPorEstudiante = new Map<string, number>();
    if (estudianteIds.length > 0) {
      const { data: donaciones } = await supabaseAdmin
        .from('DONACIONES')
        .select('proyecto_estudiante_id, monto')
        .in('proyecto_estudiante_id', estudianteIds)
        .eq('estado', 'CONFIRMADA');
      for (const d of donaciones ?? []) {
        const actual = recaudadoPorEstudiante.get(d.proyecto_estudiante_id) ?? 0;
        recaudadoPorEstudiante.set(d.proyecto_estudiante_id, actual + Number(d.monto));
      }
    }

    // La meta se registra en dólares (ver app/proyectos/nuevo); se convierte a
    // colones con el tipo de cambio actual para poder compararla contra lo
    // recaudado, que siempre está en colones.
    const rate = await getExchangeRate();

    return activeEstudiantes
      .map((e: any) => {
        const montoObjetivoUsd = extractMontoObjetivo(e.proyecto_necesidades);
        return {
          id: e.user_id,
          nombre: e.proyecto_titulo ?? "Sin título",
          carrera: e.carrera ?? "Carrera no especificada",
          descripcion: e.proyecto_descripcion ?? e.proyecto_tipo ?? "Proyecto de estudiante",
          avance: e.proyecto_porcentaje_avance ?? 0,
          estudianteNombre: e.user?.nombre ?? "Estudiante",
          montoObjetivo: montoObjetivoUsd > 0 ? usdToCrc(montoObjetivoUsd, rate) : 0,
          montoObjetivoUsd,
          montoRecaudado: recaudadoPorEstudiante.get(e.user_id) ?? 0,
        };
      })
      // Los proyectos con más avance aparecen primero.
      .sort((a: any, b: any) => (b.avance ?? 0) - (a.avance ?? 0));
  } catch (error) {
    console.error("Error fetching student projects:", error);
    return [];
  }
}
