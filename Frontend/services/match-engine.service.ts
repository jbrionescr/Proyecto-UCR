import { Estudiante, Exalumno } from "@prisma/client";

export interface MatchScoreDetails {
  score: number;
  reasons: string[];
  desglose: { C: number; I: number; A: number; S: number };
}

function parseArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return [value]; }
  }
  return [];
}

export function calculateMatchScore(estudiante: Estudiante, exalumno: Exalumno): MatchScoreDetails {
  const reasons: string[] = [];
  const desglose = { C: 0, I: 0, A: 0, S: 0 }; // C: Carrera, I: Intereses, A: Sector/Area (Alineacion), S: Apoyo (Support)

  // 1. Carrera y Facultad (Max 30 pts)
  const carrEst = (estudiante.carrera || "").toLowerCase().trim();
  const carrExa = (exalumno.carrera || "").toLowerCase().trim();
  const escEst = (estudiante.escuela_facultad || "").toLowerCase().trim();
  const escExa = (exalumno.escuela_facultad || "").toLowerCase().trim();

  if (carrEst && carrExa && (carrEst === carrExa || carrEst.includes(carrExa) || carrExa.includes(carrEst))) {
    desglose.C = 30;
    reasons.push("Estudiaron exactamente la misma carrera.");
  } else if (escEst && escExa && (escEst === escExa || escEst.includes(escExa) || escExa.includes(escEst))) {
    desglose.C = 15;
    reasons.push("Pertenecen a la misma facultad o escuela.");
  }

  // 2. Necesidades vs Ofertas de Apoyo (Max 30 pts)
  const apoyoBuscado: string[] = [];
  if (estudiante.busca_mentoria) apoyoBuscado.push("mentoria");
  if (estudiante.busca_empleo) apoyoBuscado.push("empleo");
  if (estudiante.busca_pasantia) apoyoBuscado.push("pasantia");
  if (estudiante.busca_financiamiento) apoyoBuscado.push("financiamiento");

  const apoyoOfrecido: string[] = [];
  if (exalumno.ofrece_mentoria) apoyoOfrecido.push("mentoria");
  if (exalumno.ofrece_empleo) apoyoOfrecido.push("empleo");
  if (exalumno.ofrece_pasantia) apoyoOfrecido.push("pasantia");
  if (exalumno.ofrece_donacion_dinero) apoyoOfrecido.push("financiamiento");
  if (exalumno.ofrece_guest_speaking) apoyoOfrecido.push("guest speaking");
  if (exalumno.ofrece_volunteering) apoyoOfrecido.push("volunteering");
  if (exalumno.ofrece_career_advice) apoyoOfrecido.push("career advice");
  if (exalumno.ofrece_networking) apoyoOfrecido.push("networking");

  const apoyoComun = apoyoBuscado.filter(a => apoyoOfrecido.includes(a));

  if (apoyoComun.length > 0) {
    let puntosApoyo = 15;
    if (apoyoComun.length === 2) puntosApoyo = 25;
    if (apoyoComun.length >= 3) puntosApoyo = 30;
    
    desglose.S = puntosApoyo;
    const labels = apoyoComun.map(a => 
      a === "mentoria" ? "Mentoría" : 
      a === "empleo" ? "Empleo" : 
      a === "pasantia" ? "Pasantías" : 
      a === "financiamiento" ? "Financiamiento" : a
    );
    reasons.push(`Coincidencia en tipos de apoyo: ${labels.join(", ")}.`);
  }

  // 3. Habilidades e Intereses Comunes (Max 25 pts)
  const intEst = parseArray(estudiante.areas_interes);
  const intExa = parseArray(exalumno.areas_interes);
  const habEst = parseArray(estudiante.habilidades);
  const habExa = parseArray(exalumno.habilidades);

  const itemsEst = Array.from(new Set([...intEst, ...habEst]));
  const itemsExa = Array.from(new Set([...intExa, ...habExa]));
  const interseccion = itemsEst.filter(item => itemsExa.includes(item));

  if (itemsEst.length > 0 && interseccion.length > 0) {
    const scoreIntereses = Math.round(25 * (interseccion.length / itemsEst.length));
    desglose.I = Math.min(scoreIntereses, 25);
    const itemsLabel = interseccion.slice(0, 3).map(i => i.charAt(0).toUpperCase() + i.slice(1));
    reasons.push(`Comparten intereses/habilidades: ${itemsLabel.join(", ")}.`);
  }

  // 4. Sector vs Área de Proyecto (Max 15 pts)
  const sector = (exalumno.sector || "").toLowerCase().trim();
  const areaProyecto = (estudiante.area_tematica || estudiante.proyecto_tipo || "").toLowerCase().trim();

  if (sector && areaProyecto && (sector === areaProyecto || sector.includes(areaProyecto) || areaProyecto.includes(sector))) {
    desglose.A = 15;
    reasons.push("El sector laboral del exalumno se alinea con el área del proyecto del estudiante.");
  } else if (desglose.C > 0 && (sector || areaProyecto)) {
    desglose.A = 5;
  }

  const score = Math.min(desglose.C + desglose.I + desglose.A + desglose.S, 100);

  return {
    score,
    reasons,
    desglose
  };
}
