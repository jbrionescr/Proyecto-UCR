// Cálculos de recaudación para el financiamiento de proyectos estudiantiles.
// La meta se guarda en ESTUDIANTES.proyecto_necesidades.financiero.monto
// (ver app/proyectos/nuevo/page.tsx); lo recaudado es la suma de DONACIONES
// confirmadas con proyecto_estudiante_id = el estudiante.

export interface FundingStats {
  objetivo: number;
  recaudado: number;
  faltante: number;
  porcentaje: number; // recaudado / objetivo, 0-100
}

export function computeFundingStats(objetivo: number | null | undefined, recaudado: number | null | undefined): FundingStats {
  const obj = Number(objetivo) || 0;
  const rec = Number(recaudado) || 0;
  const faltante = Math.max(0, obj - rec);
  const porcentaje = obj > 0 ? Math.min(100, Math.round((rec / obj) * 100)) : 0;
  return { objetivo: obj, recaudado: rec, faltante, porcentaje };
}

export function extractMontoObjetivo(proyecto_necesidades: any): number {
  const raw = proyecto_necesidades?.financiero?.monto;
  return raw ? Number(raw) || 0 : 0;
}
