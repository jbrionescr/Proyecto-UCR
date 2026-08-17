"use server";

import { generateText } from "ai";

// ─── Tipo de cambio de referencia ─────────────────────────────────────────────
// 1 USD ≈ 520 CRC (referencia BCR 2026)

// ─── Fallback value estimates — en COLONES (₡) ────────────────────────────────
const FALLBACK_VALUES: Record<string, {
  valorDesarrollo: number;
  valorMercado: number;
  impactoSocial: number;
  valorAcademico: number;
  puntuacionGlobal: number;
  resumenEjecutivo: string;
  fortalezas: string[];
  oportunidades: string[];
  costoDesarrollo: number;
  roi: number;
}> = {
  "Tecnologías de la Información": {
    costoDesarrollo:   350_000,   // costo real del estudiante: licencias, hosting, tiempo
    valorDesarrollo: 1_200_000,   // valor estimado del producto terminado
    valorMercado:    3_500_000,   // precio si se comercializara en CR
    roi: 243,
    impactoSocial: 78,
    valorAcademico: 88,
    puntuacionGlobal: 84,
    resumenEjecutivo: "Este proyecto tecnológico tiene un alto potencial de mercado en el sector de software empresarial costarricense. La solución aborda una necesidad real de digitalización, con posibilidad de escalarse a nivel centroamericano.",
    fortalezas: ["Alta demanda del mercado tecnológico local", "Aplicabilidad inmediata en sector educativo y empresarial", "Posibilidad de spin-off o licenciamiento de software"],
    oportunidades: ["Alianzas con empresas tech de la GAM", "Fondos CONICIT para innovación tecnológica", "Concurso UCR Emprende 2026"],
  },
  "Inteligencia Artificial": {
    costoDesarrollo:   520_000,
    valorDesarrollo: 2_500_000,
    valorMercado:    7_000_000,
    roi: 294,
    impactoSocial: 82,
    valorAcademico: 95,
    puntuacionGlobal: 91,
    resumenEjecutivo: "Proyecto de alto valor científico y comercial. Los modelos de IA desarrollados pueden derivar en publicaciones indexadas, patentes y transferencia tecnológica al sector productivo nacional.",
    fortalezas: ["Altísima demanda de talento IA a nivel global", "Potencial de publicación en revistas Q1", "Aplicabilidad en múltiples industrias"],
    oportunidades: ["Fondos MICITT para investigación en IA", "Colaboración con empresas tech multinacionales", "Becas DAAD o Fulbright para posgrado"],
  },
  "Ingeniería Civil": {
    costoDesarrollo:   680_000,
    valorDesarrollo: 2_200_000,
    valorMercado:    5_500_000,
    roi: 223,
    impactoSocial: 88,
    valorAcademico: 85,
    puntuacionGlobal: 87,
    resumenEjecutivo: "Proyecto de ingeniería con impacto directo en la seguridad y ordenamiento territorial. Los estudios técnicos son altamente valorados por el MOPT, municipalidades y empresas constructoras.",
    fortalezas: ["Impacto directo en seguridad pública", "Alta demanda de estudios de ingeniería certificados", "Aplicabilidad en proyectos de infraestructura nacional"],
    oportunidades: ["Contratos con MOPT o ICE post-graduación", "Fondos del BID para infraestructura resiliente", "Consultoría en proyectos privados del CFIA"],
  },
  "Ingeniería Eléctrica": {
    costoDesarrollo:   580_000,
    valorDesarrollo: 1_800_000,
    valorMercado:    4_800_000,
    roi: 210,
    impactoSocial: 80,
    valorAcademico: 83,
    puntuacionGlobal: 82,
    resumenEjecutivo: "Proyecto con alta aplicabilidad en el sector energético y de automatización costarricense, áreas en constante crecimiento con el auge de las energías renovables y la industria 4.0.",
    fortalezas: ["Sector energético en constante expansión", "Alta demanda de ingenieros electricistas en CNFL, ICE", "Potencial en energías renovables"],
    oportunidades: ["Alianzas con el ICE o CNFL", "Fondos de eficiencia energética del MINAE", "Pasantías en empresas multinacionales del sector"],
  },
  "Biotecnología": {
    costoDesarrollo:   750_000,
    valorDesarrollo: 2_800_000,
    valorMercado:    8_000_000,
    roi: 267,
    impactoSocial: 90,
    valorAcademico: 92,
    puntuacionGlobal: 89,
    resumenEjecutivo: "Proyecto de biotecnología con alto potencial de impacto en salud, agricultura o medio ambiente. Costa Rica es un hub regional para la investigación en ciencias de la vida.",
    fortalezas: ["CR es hub de ciencias de la vida en Centroamérica", "Alta demanda de biotecnólogos en sector farmacéutico", "Potencial de patente de proceso o producto"],
    oportunidades: ["PROINNOVA de la Vicerrectoría UCR", "Fondos internacionales para investigación en salud", "Alianzas con empresas como Establishment Labs"],
  },
  "Salud Pública": {
    costoDesarrollo:   420_000,
    valorDesarrollo: 1_500_000,
    valorMercado:    4_000_000,
    roi: 252,
    impactoSocial: 95,
    valorAcademico: 87,
    puntuacionGlobal: 89,
    resumenEjecutivo: "Proyecto de alto impacto social en el sistema de salud costarricense. Las investigaciones en salud pública aportan valor directo a la CCSS y al MINSA, con potencial de influir en políticas sanitarias nacionales.",
    fortalezas: ["Impacto directo en bienestar de la población", "Alineado con objetivos de la CCSS", "Alta relevancia para financiadores internacionales"],
    oportunidades: ["Financiamiento OPS/OMS", "Colaboración con la CCSS para implementación", "Fondo FONACIT del Ministerio de Salud"],
  },
  "Energías Renovables": {
    costoDesarrollo:   610_000,
    valorDesarrollo: 2_000_000,
    valorMercado:    5_200_000,
    roi: 239,
    impactoSocial: 92,
    valorAcademico: 84,
    puntuacionGlobal: 88,
    resumenEjecutivo: "Costa Rica produce más del 99% de su electricidad de fuentes renovables. Proyectos en este sector tienen alta relevancia estratégica y potencial de financiamiento internacional.",
    fortalezas: ["Alineado con la política energética nacional", "CR líder mundial en energías limpias", "Alto interés de inversores verdes"],
    oportunidades: ["Fondos GEF y BID para energía limpia", "Alianzas con el ICE y MINAE", "Cooperación con países líderes en renovables"],
  },
  "Ciencias Sociales": {
    costoDesarrollo:   280_000,
    valorDesarrollo:   900_000,
    valorMercado:    2_200_000,
    roi: 186,
    impactoSocial: 88,
    valorAcademico: 82,
    puntuacionGlobal: 80,
    resumenEjecutivo: "Proyecto con impacto directo en políticas públicas y bienestar social. Las ciencias sociales generan conocimiento clave para la toma de decisiones en instituciones del Estado y ONGs.",
    fortalezas: ["Alto impacto en políticas públicas y comunidades", "Posibilidad de publicación en revistas LATAM", "Demanda de análisis sociales en el sector público"],
    oportunidades: ["Financiamiento de organismos como FLACSO", "Colaboración con IMAS, INEC o MIDEPLAN", "Becas de investigación CSUCA"],
  },
  "Economía y Negocios": {
    costoDesarrollo:   310_000,
    valorDesarrollo: 1_100_000,
    valorMercado:    3_000_000,
    roi: 254,
    impactoSocial: 72,
    valorAcademico: 80,
    puntuacionGlobal: 79,
    resumenEjecutivo: "Proyecto con aplicación directa en el sector empresarial costarricense. Los estudios económicos y de negocios son valorados por cámaras empresariales, bancos y organismos internacionales.",
    fortalezas: ["Aplicabilidad inmediata en sector privado", "Demanda de análisis económicos en banca y gobierno", "Posibilidad de consultoría post-graduación"],
    oportunidades: ["Fondos PROCOMER o CINDE", "Concursos de emprendimiento (Hult Prize)", "Alianzas con cámaras empresariales (CCCR, ACORDE)"],
  },
  "Educación": {
    costoDesarrollo:   260_000,
    valorDesarrollo:   850_000,
    valorMercado:    2_000_000,
    roi: 177,
    impactoSocial: 91,
    valorAcademico: 79,
    puntuacionGlobal: 82,
    resumenEjecutivo: "Proyecto con impacto directo en la calidad educativa nacional. Las propuestas pedagógicas innovadoras tienen alta demanda en el MEP y centros educativos privados.",
    fortalezas: ["Impacto directo en cobertura y calidad educativa", "Apoyo institucional del MEP y universidades", "Posibilidad de implementación a gran escala"],
    oportunidades: ["Fondos de cooperación del MEP y APSE", "Financiamiento UNICEF para educación en CR", "Alianzas con edtech emergentes en LATAM"],
  },
  "Agronomía": {
    costoDesarrollo:   480_000,
    valorDesarrollo: 1_600_000,
    valorMercado:    4_200_000,
    roi: 233,
    impactoSocial: 87,
    valorAcademico: 83,
    puntuacionGlobal: 85,
    resumenEjecutivo: "Proyecto agrónomo con impacto en la seguridad alimentaria y la economía rural costarricense. El sector agropecuario es estratégico para el país y cuenta con apoyo del MAG y el CNP.",
    fortalezas: ["Impacto directo en sector agropecuario nacional", "Apoyo institucional del MAG y SENASA", "Alta relevancia para pequeños y medianos productores"],
    oportunidades: ["Fondos del MAG y INDER para innovación agrícola", "Cooperación con IICA o FAO", "Programas del CATIE en Turrialba"],
  },
  "default": {
    costoDesarrollo:   300_000,
    valorDesarrollo:   950_000,
    valorMercado:    2_600_000,
    roi: 217,
    impactoSocial: 75,
    valorAcademico: 80,
    puntuacionGlobal: 78,
    resumenEjecutivo: "Este proyecto presenta un valor académico y práctico sólido. Con una adecuada difusión y vinculación con el sector productivo, puede generar un impacto significativo en su área de conocimiento.",
    fortalezas: ["Aporte original al conocimiento en el área", "Metodología rigurosa adaptada al contexto costarricense", "Potencial de transferencia al sector productivo"],
    oportunidades: ["Fondos CONICIT o MICITT", "Colaboración con cámaras empresariales", "Publicación en revistas académicas regionales LATAM"],
  },
};

function getFallback(area: string) {
  const keys = Object.keys(FALLBACK_VALUES);
  const match = keys.find(k =>
    area.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(area.toLowerCase())
  );
  return FALLBACK_VALUES[match || "default"];
}

export interface ProjectValueResult {
  valorDesarrollo: number;     // ₡ — valor estimado del producto/solución terminada
  valorMercado: number;        // ₡ — precio si se comercializara en Costa Rica
  costoDesarrollo: number;     // ₡ — costo realista para desarrollar el proyecto
  roi: number;                 // % — retorno sobre inversión estimado
  impactoSocial: number;       // 0–100 — impacto social en CR
  valorAcademico: number;      // 0–100 — valor científico / novedad
  puntuacionGlobal: number;    // 0–100 — puntuación global ponderada
  resumenEjecutivo: string;
  fortalezas: string[];
  oportunidades: string[];
  isFallback?: boolean;
}

export async function calculateProjectValue(
  titulo: string,
  descripcion: string,
  area: string,
  modalidad: string,
  duracion: string,
  problema: string,
  objetivo: string,
  recursos: string[]
): Promise<{ success: boolean; data?: ProjectValueResult; error?: string }> {

  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;

  if (!apiKey) {
    const fallback = getFallback(area);
    return { success: true, data: { ...fallback, isFallback: true } };
  }

  const prompt = `Eres un experto evaluador de proyectos de graduación universitarios de la Universidad de Costa Rica (UCR).
Evaluarás el valor económico, académico y social de un proyecto TFG estudiantil.

IMPORTANTE: Todos los valores monetarios deben estar en COLONES COSTARRICENSES (₡).
Referencia: 1 USD ≈ 520 CRC. Los valores deben ser REALISTAS para el contexto de un proyecto de estudiante universitario en Costa Rica:
- El costoDesarrollo debe ser lo que un estudiante realmente gastaría (₡150,000 – ₡800,000 típicamente)
- El valorDesarrollo es el valor estimado del producto si estuviera terminado (₡500,000 – ₡3,000,000)
- El valorMercado es el precio si se vendiera como producto/servicio en CR (₡1,000,000 – ₡8,000,000)
- NO uses valores exageradamente altos.

Datos del proyecto:
- Título: "${titulo}"
- Área: "${area}"
- Modalidad: "${modalidad}"
- Duración: "${duracion}"
- Descripción: "${descripcion}"
- Problema que resuelve: "${problema}"
- Objetivo: "${objetivo}"
- Recursos: ${recursos.join(", ")}

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin texto extra):
{
  "valorDesarrollo": <entero en colones>,
  "valorMercado": <entero en colones>,
  "costoDesarrollo": <entero en colones — costo realista que el estudiante debe financiar>,
  "roi": <entero — porcentaje de retorno sobre inversión>,
  "impactoSocial": <0–100>,
  "valorAcademico": <0–100>,
  "puntuacionGlobal": <0–100>,
  "resumenEjecutivo": "<2-3 oraciones describiendo el valor del proyecto para CR>",
  "fortalezas": ["<fortaleza 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "oportunidades": ["<oportunidad de financiamiento 1>", "<oportunidad 2>", "<oportunidad 3>"]
}`;

  try {
    const { groq } = await import("@ai-sdk/groq");
    const { text } = await generateText({
      // @ts-expect-error type mismatch
      model: groq("llama3-70b-8192"),
      prompt,
      maxTokens: 800,
    });

    let clean = text.trim()
      .replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "").trim();

    const parsed = JSON.parse(clean) as ProjectValueResult;
    return { success: true, data: parsed };
  } catch (err) {
    console.error("[calculateProjectValue]:", err);
    const fallback = getFallback(area);
    return { success: true, data: { ...fallback, isFallback: true } };
  }
}
