// lib/matching.ts — Algoritmo de afinidad UCR Alumni
// Scoring: carrera(30) + areas_interes(30 prop) + sector↔area_tematica(20) + apoyo(20) = 100

export interface EstudianteCompat {
  carrera?: string | null;
  escuela_facultad?: string | null;
  apoyoBuscado?: string[];       // ["mentoria", "empleo", ...]
  areaProyecto?: string | null;  // area_tematica o proyecto_tipo
  areasInteres?: string[];       // areas_interes JSON/relation array
  habilidades?: string[];        // habilidades JSON array
  avanceProyecto?: number | null;
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

export interface ExalumnoCompat {
  carrera?: string | null;
  escuela_facultad?: string | null;
  sector?: string | null;
  apoyoOfrecido?: string[];  // ["mentoria", "empleo", ...]
  areasInteres?: string[];   // areas_interes JSON/relation array
  habilidades?: string[];    // habilidades JSON array
  user?: { name?: string | null; image?: string | null };
  [key: string]: any;
}

function parseArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map(x => String(x).toLowerCase().trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map(x => String(x).toLowerCase().trim()).filter(Boolean);
      }
    } catch {
      return val.split(",").map(x => x.toLowerCase().trim()).filter(Boolean);
    }
  }
  return [];
}

/**
 * Calcula la afinidad entre un estudiante y un exalumno de forma precisa.
 * Devuelve { score, reasons, breakdown } donde score máximo es 100.
 *
 * Criterios (Suma 100):
 * 1. Carrera / Facultad (Max 30 pts):
 *    - Misma carrera: 30 pts
 *    - Misma escuela/facultad: 15 pts
 * 2. Apoyo Coincidente (Max 30 pts):
 *    - 1 coincidencia: 15 pts
 *    - 2 coincidencias: 25 pts
 *    - 3+ coincidencias: 30 pts
 * 3. Habilidades e Intereses Comunes (Max 25 pts):
 *    - Overlap proporcional de la unión de intereses y habilidades
 * 4. Sector vs Área de Proyecto (Max 15 pts):
 *    - Coincidencia de sector laboral y área temática de proyecto
 */
export function toApoyoBuscado(est: any): string[] {
  const a: string[] = [];
  if (est.busca_mentoria) a.push("mentoria");
  if (est.busca_empleo) a.push("empleo");
  if (est.busca_pasantia) a.push("pasantia");
  if (est.busca_financiamiento) a.push("financiamiento");
  return a;
}

export function toApoyoOfrecido(exa: any): string[] {
  const a: string[] = [];
  if (exa.ofrece_mentoria) a.push("mentoria");
  if (exa.ofrece_empleo) a.push("empleo");
  if (exa.ofrece_pasantia) a.push("pasantia");
  if (exa.ofrece_donacion_dinero) a.push("financiamiento");
  if (exa.ofrece_guest_speaking) a.push("guest speaking");
  if (exa.ofrece_volunteering) a.push("volunteering");
  if (exa.ofrece_career_advice) a.push("career advice");
  if (exa.ofrece_networking) a.push("networking");
  return a;
}

export function calcularAfinidad(
  estudiante: EstudianteCompat,
  exalumno: ExalumnoCompat
): { score: number; reasons: string[]; breakdown: Record<string, number> } {
  const reasons: string[] = [];
  const breakdown: Record<string, number> = { carrera: 0, intereses: 0, sector: 0, apoyo: 0 };

  // 1. Carrera y Facultad (Max 30 pts)
  const carrEst = (estudiante.carrera || "").toLowerCase().trim();
  const carrExa = (exalumno.carrera || "").toLowerCase().trim();
  const escEst = (estudiante.escuela_facultad || "").toLowerCase().trim();
  const escExa = (exalumno.escuela_facultad || "").toLowerCase().trim();

  if (carrEst && carrExa && (carrEst === carrExa || carrEst.includes(carrExa) || carrExa.includes(carrEst))) {
    breakdown.carrera = 30;
    reasons.push("Estudiaron la misma carrera.");
  } else if (escEst && escExa && (escEst === escExa || escEst.includes(escExa) || escExa.includes(escEst))) {
    breakdown.carrera = 15;
    reasons.push("Pertenecen a la misma facultad o escuela.");
  }

  // 2. Necesidades vs Ofertas de Apoyo (Max 30 pts)
  const apoyoBuscado = (estudiante.apoyoBuscado || []).map(a => a.toLowerCase().trim()).filter(Boolean);
  const apoyoOfrecido = (exalumno.apoyoOfrecido || []).map(a => a.toLowerCase().trim()).filter(Boolean);
  const apoyoComun = apoyoBuscado.filter(a => apoyoOfrecido.includes(a));

  if (apoyoComun.length > 0) {
    let puntosApoyo = 15;
    if (apoyoComun.length === 2) puntosApoyo = 25;
    if (apoyoComun.length >= 3) puntosApoyo = 30;
    
    breakdown.apoyo = puntosApoyo;
    const labels = apoyoComun.map(a => 
      a === "mentoria" ? "Mentoría" : 
      a === "empleo" ? "Empleo" : 
      a === "pasantia" ? "Pasantías" : 
      a === "financiamiento" ? "Financiamiento" : a
    );
    reasons.push(`Coincidencia en apoyo: ${labels.join(", ")}.`);
  }

  // 3. Habilidades e Intereses Comunes (Max 25 pts)
  const intEst = parseArray(estudiante.areasInteres);
  const intExa = parseArray(exalumno.areasInteres);
  const habEst = parseArray(estudiante.habilidades);
  const habExa = parseArray(exalumno.habilidades);

  const itemsEst = Array.from(new Set([...intEst, ...habEst]));
  const itemsExa = Array.from(new Set([...intExa, ...habExa]));
  const interseccion = itemsEst.filter(item => itemsExa.includes(item));

  if (itemsEst.length > 0 && interseccion.length > 0) {
    const scoreIntereses = Math.round(25 * (interseccion.length / itemsEst.length));
    breakdown.intereses = Math.min(scoreIntereses, 25);
    const itemsLabel = interseccion.slice(0, 3).map(i => i.charAt(0).toUpperCase() + i.slice(1));
    reasons.push(`Comparten intereses/habilidades: ${itemsLabel.join(", ")}.`);
  }

  // 4. Sector vs Área de Proyecto (Max 15 pts)
  const sector = (exalumno.sector || "").toLowerCase().trim();
  const areaProyecto = (estudiante.areaProyecto || estudiante.area_tematica || "").toLowerCase().trim();

  if (sector && areaProyecto && (sector === areaProyecto || sector.includes(areaProyecto) || areaProyecto.includes(sector))) {
    breakdown.sector = 15;
    reasons.push("El sector laboral del exalumno se alinea con el área del proyecto del estudiante.");
  } else if (breakdown.carrera > 0 && (sector || areaProyecto)) {
    // Si tienen la misma carrera y al menos uno tiene área/sector especificado, damos un bonus parcial
    breakdown.sector = 5;
  }

  const score = Math.min(breakdown.carrera + breakdown.intereses + breakdown.sector + breakdown.apoyo, 100);
  return { score, reasons, breakdown };
}

// ─── Matching estudiante ↔ posición (RF-06 extendido) ──────────────────────────
// Scoring: areaEstudio(35) + habilidadesDuras(35 prop) + habilidadesBlandas(20 prop) + apoyo(10) = 100
//
// Nota: a diferencia del diseño original de referencia (que asumía un campo
// `sector` tipo array en POSICIONES), el schema real de esta app no tiene ese
// campo. Se usa `area_estudio` (string) para el criterio de carrera/área, y
// `hard_skills`/`soft_skills` (ambos en POSICIONES y en ESTUDIANTES) para los
// dos criterios de habilidades.

export interface EstudiantePosicionCompat {
  carrera?: string | null;
  escuela_facultad?: string | null;
  habilidades?: string[];       // habilidades técnicas (hard skills) del estudiante
  soft_skills?: string[];
  busca_empleo?: boolean;
  busca_pasantia?: boolean;
}

export interface PosicionCompat {
  tipo?: string | null;               // "EMPLEO" | "PASANTIA" | "PRACTICA" | "VOLUNTARIADO"
  area_estudio?: string | null;
  hard_skills?: string[];
  soft_skills?: string[];
  estado?: string | null;             // valor real: "activa" (no "ACTIVA")
}

/**
 * Calcula la afinidad entre un estudiante y una posición publicada.
 * Devuelve { score, breakdown, reasons } donde score máximo es 100.
 *
 * Criterios:
 * +35: Carrera/escuela compatible con el área de estudio de la posición
 * +35: Habilidades técnicas requeridas (proporcional al overlap)
 * +20: Habilidades blandas (proporcional al overlap)
 * +10: Tipo de posición (empleo/pasantía) ↔ lo que busca el estudiante
 */
export function calcularScorePosicion(
  estudiante: EstudiantePosicionCompat,
  posicion: PosicionCompat
): { score: number; breakdown: Record<string, number>; reasons: string[] } {
  const breakdown = { areaSector: 0, habilidades: 0, areas: 0, apoyo: 0 };
  const reasons: string[] = [];

  if (posicion.estado !== "activa") {
    return { score: 0, breakdown, reasons };
  }

  // 1. Carrera/escuela ↔ área de estudio de la posición (+35)
  const escuela = (estudiante.escuela_facultad || estudiante.carrera || "").toLowerCase().trim();
  const areaPosicion = (posicion.area_estudio || "").toLowerCase().trim();
  if (escuela && areaPosicion && (areaPosicion.includes(escuela) || escuela.includes(areaPosicion))) {
    breakdown.areaSector = 35;
    reasons.push("Carrera compatible con el área de la posición");
  }

  // 2. Habilidades técnicas requeridas (+35 proporcional)
  // Los campos Json son de texto libre; se filtran elementos no-string antes
  // de normalizar, ya que algunos registros reales traen valores inválidos.
  const toLowerStrings = (arr?: string[]) =>
    (arr || []).filter((h): h is string => typeof h === "string").map((h) => h.toLowerCase().trim()).filter(Boolean);

  const hardReq = toLowerStrings(posicion.hard_skills);
  const hardEst = toLowerStrings(estudiante.habilidades);
  const interseccionHard = hardReq.filter((h) => hardEst.includes(h));
  if (hardReq.length > 0 && interseccionHard.length > 0) {
    breakdown.habilidades = Math.round(35 * (interseccionHard.length / hardReq.length));
    reasons.push(`Habilidades: ${interseccionHard.slice(0, 3).join(", ")}`);
  }

  // 3. Habilidades blandas requeridas (+20 proporcional)
  const softReq = toLowerStrings(posicion.soft_skills);
  const softEst = toLowerStrings(estudiante.soft_skills);
  const interseccionSoft = softReq.filter((s) => softEst.includes(s));
  if (softReq.length > 0 && interseccionSoft.length > 0) {
    breakdown.areas = Math.round(20 * (interseccionSoft.length / softReq.length));
    reasons.push("Habilidades blandas alineadas");
  }

  // 4. Tipo de posición ↔ lo que busca el estudiante (+10)
  const tipo = (posicion.tipo || "").toUpperCase();
  const matchApoyo =
    (tipo === "EMPLEO" && estudiante.busca_empleo) ||
    ((tipo === "PASANTIA" || tipo === "PRACTICA") && estudiante.busca_pasantia);
  if (matchApoyo) {
    breakdown.apoyo = 10;
    reasons.push(tipo === "EMPLEO" ? "Buscas empleo" : "Buscas pasantía");
  }

  const score = Math.min(breakdown.areaSector + breakdown.habilidades + breakdown.areas + breakdown.apoyo, 100);
  return { score, breakdown, reasons };
}
