"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { calcularAfinidad, calcularScorePosicion, toApoyoBuscado, toApoyoOfrecido } from "@/lib/matching";
import {
  sendMatchAceptado,
  sendMatchRechazado,
  sendMatchConnectionRequest,
  sendAdminNewActiveMatch,
} from "@/lib/email";

export type MatchEstado = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// T-11: las áreas de interés viven en la tabla relacional USUARIOS_AREAS
// (catálogo fijo de 14 códigos), no en el campo Json `areas_interes`.
async function getAreasInteresCodigos(userId: string): Promise<string[]> {
  const rows = await prisma.usuarioArea.findMany({
    where: { user_id: userId },
    select: { area_codigo: true },
  });
  return rows.map((r) => r.area_codigo);
}

function parseJsonArray(val: any): string[] {
  if (!val) return [];
  let arr: any;
  if (Array.isArray(val)) {
    arr = val;
  } else {
    try { arr = JSON.parse(val as string); } catch { return []; }
  }
  if (!Array.isArray(arr)) return [];
  // Los campos Json son de texto libre; algunos registros reales tienen
  // elementos no-string (null, objetos) que rompen .toLowerCase() aguas abajo.
  return arr.filter((x): x is string => typeof x === "string");
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@alumni.ucr.ac.cr";

// ─── Queries ──────────────────────────────────────────────────────────────────

// Selects explícitos (columnas existentes en BD)
const MATCH_EXALUMNO_SELECT = {
  user_id: true, escuela_facultad: true, empresa_actual: true, cargo_actual: true,
  ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
  ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
  ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

const MATCH_ESTUDIANTE_SELECT = {
  user_id: true, carrera: true, proyecto_titulo: true, proyecto_tipo: true,
  busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
  user: { select: { nombre: true, email: true, foto_url: true } },
} as const;

const MATCH_BASE_SELECT = {
  id: true, exalumno_id: true, estudiante_id: true,
  tipo_apoyo: true, score_match: true, estado: true, resultado: true,
  initiated_by: true, match_reasons: true,
  rechazado_por_estudiante: true,
  accepted_at: true, rejected_at: true, closed_at: true,
  created_at: true, updated_at: true,
} as const;

export async function getMatchesForEstudiante(estudianteId?: string) {
  const session = await auth();
  const id = estudianteId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where: { estudiante_id: id },
    orderBy: { score_match: "desc" },
    select: { ...MATCH_BASE_SELECT, exalumno: { select: MATCH_EXALUMNO_SELECT } },
  });
}

export async function getMatchesForExalumno(exalumnoId?: string) {
  const session = await auth();
  const id = exalumnoId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  return prisma.match.findMany({
    where: { exalumno_id: id },
    orderBy: { score_match: "desc" },
    select: { ...MATCH_BASE_SELECT, estudiante: { select: MATCH_ESTUDIANTE_SELECT } },
  });
}

// ─── Transiciones de estado ───────────────────────────────────────────────────

export async function contactarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const { createClient } = require("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: match } = await supabaseAdmin.from('MATCHES').select('*').eq('id', matchId).maybeSingle();
  if (!match) throw new Error("Match no encontrado");
  if (match.estado === "CERRADO") throw new Error("Esta conexión fue cerrada previamente. No puede reactivarse.");
  if (match.estado !== "SUGERIDO") throw new Error("El match ya no está en estado sugerido");
  if (match.estudiante_id !== userId) throw new Error("Solo el estudiante puede contactar");

  const { error: updateError } = await supabaseAdmin.from('MATCHES')
    .update({ estado: "CONTACTADO", initiated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', matchId);
  
  if (updateError) throw updateError;

  const { data: estUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.estudiante_id).maybeSingle();
  const { data: exaUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.exalumno_id).maybeSingle();

  const receptorEmail = exaUser?.email;
  const receptorNombre = exaUser?.nombre || "Exalumno";
  const emisorNombre = estUser?.nombre || "Estudiante";

  if (receptorEmail) {
    await sendMatchConnectionRequest(receptorEmail, receptorNombre, emisorNombre);
  }

  revalidatePath("/mis-matches");
  return { estado: "CONTACTADO" };
}

export async function aceptarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const { createClient } = require("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: match } = await supabaseAdmin.from('MATCHES').select('*').eq('id', matchId).maybeSingle();
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "CONTACTADO") throw new Error("El match no está en estado contactado");
  if (match.initiated_by === userId) throw new Error("No puedes aceptar tu propia solicitud");

  const { error: updateError } = await supabaseAdmin.from('MATCHES')
    .update({ estado: "ACTIVO", accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', matchId);
    
  if (updateError) throw updateError;

  const { data: estUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.estudiante_id).maybeSingle();
  const { data: exaUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.exalumno_id).maybeSingle();

  const estudianteEmail = estUser?.email;
  const estudianteNombre = estUser?.nombre || "Estudiante";
  const exalumnoNombre = exaUser?.nombre || "Exalumno";

  if (estudianteEmail) {
    await sendMatchAceptado(estudianteEmail, estudianteNombre, exalumnoNombre);
  }
  await sendAdminNewActiveMatch(ADMIN_EMAIL, estudianteNombre, exalumnoNombre);

  revalidatePath("/mis-matches");
  return { estado: "ACTIVO" };
}

export async function rechazarMatch(matchId: string, rejectedBy: "estudiante" | "exalumno") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  const userId = session.user.id;

  const { createClient } = require("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: match } = await supabaseAdmin.from('MATCHES').select('*').eq('id', matchId).maybeSingle();
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "CONTACTADO") throw new Error("El match no está en estado contactado");
  if (match.initiated_by === userId) throw new Error("No puedes rechazar tu propia solicitud");

  const { error: updateError } = await supabaseAdmin.from('MATCHES')
    .update({
      estado: "CERRADO",
      rejected_at: new Date().toISOString(),
      rechazado_por_estudiante: rejectedBy === "estudiante",
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (updateError) throw updateError;

  const { data: estUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.estudiante_id).maybeSingle();
  const { data: exaUser } = await supabaseAdmin.from('USERS').select('nombre, email').eq('id', match.exalumno_id).maybeSingle();

  const initiatorId = match.initiated_by;
  const isStudentInitiated = initiatorId === match.estudiante_id;
  const emisorEmail = isStudentInitiated ? estUser?.email : exaUser?.email;
  const emisorNombre = isStudentInitiated ? (estUser?.nombre || "Estudiante") : (exaUser?.nombre || "Exalumno");

  if (emisorEmail) {
    await sendMatchRechazado(emisorEmail, emisorNombre);
  }

  revalidatePath("/mis-matches");
  return { estado: "CERRADO" };
}

export async function cerrarMatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");

  const { createClient } = require("@supabase/supabase-js");
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: match } = await supabaseAdmin.from('MATCHES').select('*').eq('id', matchId).maybeSingle();
  if (!match) throw new Error("Match no encontrado");
  if (match.estado !== "ACTIVO") throw new Error("Solo puedes cerrar matches activos");
  if (match.estudiante_id !== session.user.id && match.exalumno_id !== session.user.id) {
    throw new Error("No autorizado");
  }

  const { error: updateError } = await supabaseAdmin.from('MATCHES')
    .update({ estado: "CERRADO", closed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', matchId);

  if (updateError) throw updateError;

  revalidatePath("/mis-matches");
  return { estado: "CERRADO" };
}

/**
 * Ofrecer Apoyo — el EXALUMNO inicia la conexión desde el directorio de estudiantes.
 * Previene duplicados y bloquea si el exalumno fue rechazado previamente por el estudiante.
 */
export async function ofrecerApoyo(estudianteId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const exalumnoId = session.user.id;

  // Block if previously rejected by student (rejected_at set + initiated by alumni)
  const previousRejection = await prisma.match.findFirst({
    where: {
      estudiante_id: estudianteId,
      exalumno_id: exalumnoId,
      estado: "CERRADO",
      rejected_at: { not: null },
      initiated_by: exalumnoId,
    },
  });
  if (previousRejection) {
    throw new Error("Este estudiante ya rechazó previamente tu solicitud de conexión.");
  }

  // Return existing open match (or stop if one exists)
  const existing = await prisma.match.findFirst({
    where: { estudiante_id: estudianteId, exalumno_id: exalumnoId },
  });
  if (existing && existing.estado !== "CERRADO") {
    return { success: true, matchId: existing.id };
  }
  // CERRADO match exists → will re-open via upsert below (fall through)

  // Compute affinity score con los 4 criterios completos (T-18)
  const [estudianteData, exalumnoData, areasEstudiante, areasExalumno] = await Promise.all([
    prisma.estudiante.findUnique({
      where: { user_id: estudianteId },
      select: {
        carrera: true, escuela_facultad: true, habilidades: true, area_tematica: true, proyecto_tipo: true,
        busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
      },
    }),
    prisma.exalumno.findUnique({
      where: { user_id: exalumnoId },
      select: {
        carrera: true, escuela_facultad: true, sector: true, habilidades: true,
        ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
        ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
        ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
      },
    }),
    getAreasInteresCodigos(estudianteId),
    getAreasInteresCodigos(exalumnoId),
  ]);

  const { score, reasons, breakdown } = calcularAfinidad(
    {
      carrera: estudianteData?.carrera,
      escuela_facultad: estudianteData?.escuela_facultad,
      habilidades: parseJsonArray(estudianteData?.habilidades),
      apoyoBuscado: toApoyoBuscado(estudianteData ?? {}),
      areaProyecto: estudianteData?.area_tematica ?? estudianteData?.proyecto_tipo ?? null,
      areasInteres: areasEstudiante,
    },
    {
      carrera: exalumnoData?.carrera,
      escuela_facultad: exalumnoData?.escuela_facultad,
      habilidades: parseJsonArray(exalumnoData?.habilidades),
      sector: exalumnoData?.sector ?? null,
      apoyoOfrecido: toApoyoOfrecido(exalumnoData ?? {}),
      areasInteres: areasExalumno,
    }
  );

  const tipoApoyo = `C:${breakdown.carrera},I:${breakdown.intereses},A:${breakdown.sector},S:${breakdown.apoyo}`;

  const matchData = {
    estado:       "CONTACTADO" as const,
    score_match:  score,
    tipo_apoyo:   tipoApoyo,
    match_reasons: reasons,
    initiated_by: exalumnoId,
    rejected_at:  null,
    accepted_at:  null,
    closed_at:    null,
  };

  const match = await prisma.match.upsert({
    where: { estudiante_id_exalumno_id: { estudiante_id: estudianteId, exalumno_id: exalumnoId } },
    create: { estudiante_id: estudianteId, exalumno_id: exalumnoId, ...matchData },
    update: matchData,
  });

  // Notify student
  const [estudianteUser, exalumnoUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: estudianteId }, select: { nombre: true, email: true } }),
    prisma.user.findUnique({ where: { id: exalumnoId }, select: { nombre: true } }),
  ]);

  if (estudianteUser?.email) {
    await sendMatchConnectionRequest(
      estudianteUser.email,
      estudianteUser.nombre || "Estudiante",
      exalumnoUser?.nombre || "Exalumno"
    );
  }

  revalidatePath("/directorio/estudiantes");
  revalidatePath("/mis-matches");
  return { success: true, matchId: match.id };
}

/**
 * Genera sugerencias de match para un estudiante contra todos los exalumnos activos visibles.
 * Se llama automáticamente al completar el perfil del estudiante.
 */
export async function generarSugerenciasParaEstudiante(estudianteId: string) {
  const estudianteData = await prisma.estudiante.findUnique({
    where: { user_id: estudianteId },
    select: {
      carrera: true, escuela_facultad: true, habilidades: true, area_tematica: true, proyecto_tipo: true,
      busca_mentoria: true, busca_empleo: true, busca_pasantia: true, busca_financiamiento: true,
    },
  });
  if (!estudianteData) return [];

  // Solo exalumnos visibles en el directorio (perfil completo) y no suspendidos
  const exalumnos = await prisma.exalumno.findMany({
    where: {
      visible_en_directorio: true,
      user: { activo: true, status: { not: "SUSPENDIDO" as const } },
    },
    select: {
      user_id: true,
      carrera: true, escuela_facultad: true, sector: true, habilidades: true,
      ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
      ofrece_donacion_dinero: true, ofrece_guest_speaking: true,
      ofrece_volunteering: true, ofrece_career_advice: true, ofrece_networking: true,
    },
  });

  const [areasEstudiante, areasExalumnosRows] = await Promise.all([
    getAreasInteresCodigos(estudianteId),
    prisma.usuarioArea.findMany({
      where: { user_id: { in: exalumnos.map((e) => e.user_id) } },
      select: { user_id: true, area_codigo: true },
    }),
  ]);
  const areasPorExalumno = new Map<string, string[]>();
  for (const row of areasExalumnosRows) {
    const actuales = areasPorExalumno.get(row.user_id) ?? [];
    actuales.push(row.area_codigo);
    areasPorExalumno.set(row.user_id, actuales);
  }

  const estCompat = {
    carrera: estudianteData.carrera,
    escuela_facultad: estudianteData.escuela_facultad,
    habilidades: parseJsonArray(estudianteData.habilidades),
    apoyoBuscado: toApoyoBuscado(estudianteData),
    areaProyecto: estudianteData.area_tematica ?? estudianteData.proyecto_tipo ?? null,
    areasInteres: areasEstudiante,
  };

  const results = await Promise.allSettled(
    exalumnos.map(async (exa) => {
      // Don't suggest if previously rejected
      const rejected = await prisma.match.findFirst({
        where: { estudiante_id: estudianteId, exalumno_id: exa.user_id, estado: "CERRADO", rejected_at: { not: null } },
      });
      if (rejected) return null;

      const { score, reasons, breakdown } = calcularAfinidad(estCompat, {
        carrera: exa.carrera,
        escuela_facultad: exa.escuela_facultad,
        habilidades: parseJsonArray(exa.habilidades),
        sector: exa.sector ?? null,
        apoyoOfrecido: toApoyoOfrecido(exa),
        areasInteres: areasPorExalumno.get(exa.user_id) ?? [],
      });

      if (score === 0) return null;

      const tipoApoyo = `C:${breakdown.carrera},I:${breakdown.intereses},A:${breakdown.sector},S:${breakdown.apoyo}`;

      return prisma.match.upsert({
        where: { estudiante_id_exalumno_id: { estudiante_id: estudianteId, exalumno_id: exa.user_id } },
        create: {
          estudiante_id: estudianteId,
          exalumno_id: exa.user_id,
          estado: "SUGERIDO",
          score_match: score,
          tipo_apoyo: tipoApoyo,
          match_reasons: reasons,
        },
        update: { score_match: score, tipo_apoyo: tipoApoyo, match_reasons: reasons },
      });
    })
  );

  revalidatePath("/mis-matches");
  return results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}

/**
 * Calcula el score estudiante ↔ posición para todas las posiciones activas
 * y devuelve solo las que superan 50 puntos, ordenadas de mayor a menor.
 * Se calcula al vuelo (sin cache) — el volumen de posiciones activas no
 * justifica todavía una tabla de cache tipo POSICION_SCORES.
 */
export async function generarScoresPosiciones(estudianteId?: string) {
  const session = await auth();
  const id = estudianteId ?? session?.user?.id;
  if (!id) throw new Error("No autenticado");

  const estudianteData = await prisma.estudiante.findUnique({
    where: { user_id: id },
    select: {
      carrera: true, escuela_facultad: true, habilidades: true, soft_skills: true,
      busca_empleo: true, busca_pasantia: true,
    },
  });
  if (!estudianteData) return [];

  const posiciones = await prisma.posicion.findMany({
    where: { estado: "activa" },
    select: {
      id: true, titulo: true, empresa: true, tipo: true, modalidad: true, jornada: true,
      area_estudio: true, hard_skills: true, soft_skills: true, estado: true, fecha_limite: true,
    },
  });

  const estCompat = {
    carrera: estudianteData.carrera,
    escuela_facultad: estudianteData.escuela_facultad,
    habilidades: parseJsonArray(estudianteData.habilidades),
    soft_skills: parseJsonArray(estudianteData.soft_skills),
    busca_empleo: estudianteData.busca_empleo,
    busca_pasantia: estudianteData.busca_pasantia,
  };

  return posiciones
    .map((p) => {
      const { score, breakdown, reasons } = calcularScorePosicion(estCompat, {
        tipo: p.tipo,
        area_estudio: p.area_estudio,
        hard_skills: parseJsonArray(p.hard_skills),
        soft_skills: parseJsonArray(p.soft_skills),
        estado: p.estado,
      });
      return {
        id: p.id,
        titulo: p.titulo,
        empresa: p.empresa,
        tipo: p.tipo,
        modalidad: p.modalidad,
        jornada: p.jornada,
        fecha_limite: p.fecha_limite,
        score,
        breakdown,
        reasons,
      };
    })
    .filter((p) => p.score > 50)
    .sort((a, b) => b.score - a.score);
}
