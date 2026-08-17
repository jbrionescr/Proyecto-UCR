import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { calculateMatchScore } from "@/services/match-engine.service";

export async function GET() {
  try {
    // Buscar estudiantes activos y visibles
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        activo: true,
        visible_en_directorio: true
      }
    });

    // Buscar exalumnos activos y visibles
    const exalumnos = await prisma.exalumno.findMany({
      where: {
        visible_en_directorio: true,
        user: { activo: true }
      }
    });

    let matchesCreados = 0;

    // Obtener todos los matches existentes para evitar duplicados
    const existingMatches = await prisma.match.findMany({
      select: { estudiante_id: true, exalumno_id: true }
    });

    const existingPairs = new Set(
      existingMatches.map(m => `${m.estudiante_id}-${m.exalumno_id}`)
    );

    // O(N*M) comparación - En un sistema real grande se usaría un message broker o batch processing
    for (const estudiante of estudiantes) {
      for (const exalumno of exalumnos) {
        const pairKey = `${estudiante.user_id}-${exalumno.user_id}`;
        
        // Si ya existe un match (en cualquier estado), lo saltamos
        if (existingPairs.has(pairKey)) continue;

        const { score, reasons, desglose } = calculateMatchScore(estudiante, exalumno);

        // Umbral de 50 puntos
        if (score >= 50) {
          // Determinar el tipo de apoyo principal para el registro
          let tipo_apoyo = "General";
          if (reasons.some(r => r.includes("Mentoría"))) tipo_apoyo = "Mentoría";
          else if (reasons.some(r => r.includes("Financiamiento"))) tipo_apoyo = "Financiamiento";
          else if (reasons.some(r => r.includes("Empleo") || r.includes("Pasantía"))) tipo_apoyo = "Laboral";

          await prisma.match.create({
            data: {
              estudiante_id: estudiante.user_id,
              exalumno_id: exalumno.user_id,
              estado: "SUGERIDO",
              score_match: score,
              tipo_apoyo: tipo_apoyo,
              match_reasons: { reasons, desglose },
              initiated_by: "sistema"
            }
          });
          matchesCreados++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generación completada. Se crearon ${matchesCreados} nuevas recomendaciones sugeridas.`
    });
  } catch (error: any) {
    console.error("[Match Engine] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
