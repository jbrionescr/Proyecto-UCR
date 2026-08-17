"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { userProfileUpdateSchema, type UserProfileUpdateValues } from "@/lib/validations/profile";
import { generarSugerenciasParaEstudiante } from "@/actions/matching.actions";
import { calcularCompletitudExalumno, calcularCompletitudEstudiante } from "@/lib/profile-completeness";
import { Decimal } from "@prisma/client/runtime/library";
import { randomUUID } from "crypto";

// ─── GET perfil del usuario autenticado ───────────────────────────────────────

// Selects explícitos con solo columnas que existen en la BD (sin migration pendiente)
const EXALUMNO_DB_SELECT = {
  user_id: true, carnet_ucr: true, escuela_facultad: true,
  anio_graduacion: true, empresa_actual: true, cargo_actual: true,
  pais_ciudad: true, anios_experiencia: true, linkedin_url: true,
  biografia: true, github_url: true, website_url: true,
  habilidades: true, certificaciones: true, experiencia_laboral: true,
  ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
  ofrece_proyecto: true, ofrece_donacion_dinero: true,
  ofrece_guest_speaking: true, ofrece_volunteering: true,
  ofrece_career_advice: true, ofrece_networking: true,
} as const;

const ESTUDIANTE_DB_SELECT = {
  user_id: true, carnet_ucr: true, carrera: true, escuela_facultad: true,
  sede: true, anio_ingreso: true, nivel_academico: true, promedio_ponderado: true,
  nivel_beca: true, comprobante_beca_url: true,
  proyecto_titulo: true, proyecto_tipo: true, proyecto_descripcion: true,
  proyecto_porcentaje_avance: true, area_tematica: true, areas_interes: true,
  habilidades: true, soft_skills: true, idiomas: true,
  busca_financiamiento: true, busca_mentoria: true,
  busca_empleo: true, busca_pasantia: true,
} as const;

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const userId = session.user.id;

  // Usar Supabase directamente para evitar el ECIRCUITBREAKER de Prisma
  const { data: user, error: userError } = await supabaseAdmin
    .from("USERS")
    .select("id, email, nombre, tipo, email_verified, foto_url, activo, reportes_recibidos, cedula, fecha_nacimiento, genero, status")
    .eq("id", userId)
    .maybeSingle();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Usuario no encontrado.");

  const tipo = user.tipo as string;

  // T-11: áreas de interés desde la tabla relacional USUARIOS_AREAS
  const { data: areasRows } = await supabaseAdmin
    .from("USUARIOS_AREAS")
    .select("area_codigo")
    .eq("user_id", userId);
  const areasInteresCodigos = (areasRows ?? []).map((r) => r.area_codigo);

  let real_genero = user.genero ?? "";
  let real_phone = "";
  if (real_genero.includes("||PHONE:")) {
    const parts = real_genero.split("||PHONE:");
    real_genero = parts[0];
    real_phone = parts[1];
  }

  let ex: any = null;
  let est: any = null;

  if (tipo === "EXALUMNO") {
    const { data } = await supabaseAdmin
      .from("EXALUMNOS")
      .select("user_id, carnet_ucr, carrera, escuela_facultad, anio_graduacion, empresa_actual, cargo_actual, pais_ciudad, anios_experiencia, linkedin_url, biografia, github_url, website_url, habilidades, certificaciones, experiencia_laboral, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_proyecto, ofrece_donacion_dinero, ofrece_guest_speaking, ofrece_volunteering, ofrece_career_advice, ofrece_networking, perfil_completo, visible_en_directorio, sector, areas_interes")
      .eq("user_id", userId)
      .maybeSingle();
    ex = data;
  } else if (tipo === "ESTUDIANTE") {
    const { data } = await supabaseAdmin
      .from("ESTUDIANTES")
      .select("user_id, carnet_ucr, carrera, escuela_facultad, sede, anio_ingreso, nivel_academico, promedio_ponderado, nivel_beca, comprobante_beca_url, proyecto_titulo, proyecto_tipo, proyecto_descripcion, proyecto_porcentaje_avance, area_tematica, areas_interes, habilidades, soft_skills, idiomas, busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, activo, visible_en_directorio")
      .eq("user_id", userId)
      .maybeSingle();
    est = data;
  }

  // T-13: completitud calculada en vivo (no depende de que el flag en BD
  // esté sincronizado, aunque updateUserProfile también lo persiste).
  const completitud =
    tipo === "EXALUMNO"
      ? calcularCompletitudExalumno({ ...ex, areas_interes: areasInteresCodigos })
      : tipo === "ESTUDIANTE"
      ? calcularCompletitudEstudiante({ ...est, areas_interes: areasInteresCodigos })
      : { porcentaje: 0, completo: false, faltantes: [] as string[] };

  return {
    id: user.id,
    name: user.nombre,
    email: user.email,
    phone: real_phone,
    image: user.foto_url ?? "",
    tipo: user.tipo,
    bio: ex?.biografia ?? "",
    fecha_nacimiento: user.fecha_nacimiento
      ? (user.fecha_nacimiento as string).split("T")[0]
      : "",
    genero: real_genero,
    socialLinks: {
      linkedin: ex?.linkedin_url ?? "",
      github: ex?.github_url ?? "",
      twitter: "",
      website: ex?.website_url ?? "",
    },

    // Estudiante
    nivel_beca: est?.nivel_beca ?? "",
    comprobante_beca_url: est?.comprobante_beca_url ?? "",
    carnet_ucr: est?.carnet_ucr ?? ex?.carnet_ucr ?? "",
    carrera: est?.carrera ?? ex?.carrera ?? "",
    escuela_facultad: est?.escuela_facultad ?? ex?.escuela_facultad ?? "",
    sede: est?.sede ?? "",
    anio_ingreso: est?.anio_ingreso ?? "",
    nivel_academico: est?.nivel_academico ?? "",
    promedio_ponderado: est?.promedio_ponderado ? Number(est.promedio_ponderado) : "",
    proyecto_titulo: est?.proyecto_titulo ?? "",
    proyecto_tipo: est?.proyecto_tipo ?? "",
    proyecto_descripcion: est?.proyecto_descripcion ?? "",
    proyecto_necesidades: est?.proyecto_necesidades ?? [],
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance ?? 0,
    area_tematica: est?.area_tematica ?? "",
    areas_interes: areasInteresCodigos,
    habilidades: est?.habilidades ?? ex?.habilidades ?? [],
    certificaciones: ex?.certificaciones ?? [],
    experiencia_laboral: ex?.experiencia_laboral ?? [],
    soft_skills: est?.soft_skills ?? [],
    idiomas: est?.idiomas ?? [],
    busca_financiamiento: !!est?.busca_financiamiento,
    busca_mentoria: !!est?.busca_mentoria,
    busca_empleo: !!est?.busca_empleo,
    busca_pasantia: !!est?.busca_pasantia,
    perfil_pausado: est?.activo === false,
    visible_en_directorio: !!(ex?.visible_en_directorio ?? est?.visible_en_directorio),

    // Exalumno
    anio_graduacion: ex?.anio_graduacion ?? "",
    empresa_actual: ex?.empresa_actual ?? "",
    cargo_actual: ex?.cargo_actual ?? "",
    sector: ex?.sector ?? "",
    pais_ciudad: ex?.pais_ciudad ?? "",
    anios_experiencia: ex?.anios_experiencia ?? "",
    linkedin_url: ex?.linkedin_url ?? "",
    biografia: ex?.biografia ?? "",
    ofrece_mentoria: !!ex?.ofrece_mentoria,
    ofrece_empleo: !!ex?.ofrece_empleo,
    ofrece_pasantia: !!ex?.ofrece_pasantia,
    ofrece_proyecto: !!ex?.ofrece_proyecto,
    ofrece_donacion_dinero: !!ex?.ofrece_donacion_dinero,
    ofrece_guest_speaking: !!ex?.ofrece_guest_speaking,
    ofrece_volunteering: !!ex?.ofrece_volunteering,
    ofrece_career_advice: !!ex?.ofrece_career_advice,
    ofrece_networking: !!ex?.ofrece_networking,
    perfil_completo: completitud.completo,
    perfil_completitud_porcentaje: completitud.porcentaje,
    perfil_completitud_faltantes: completitud.faltantes,
  };
}

// ─── GET perfil público por ID ────────────────────────────────────────────────

export async function getPublicProfile(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from("USERS")
    .select("id, nombre, foto_url, tipo, activo, status")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user || user.status === "SUSPENDIDO") return null;

  const tipo = user.tipo as string;

  // T-11: áreas de interés desde la tabla relacional USUARIOS_AREAS
  const { data: areasRows } = await supabaseAdmin
    .from("USUARIOS_AREAS")
    .select("area_codigo")
    .eq("user_id", userId);
  const areasInteresCodigos = (areasRows ?? []).map((r) => r.area_codigo);

  let ex: any = null;
  let est: any = null;

  if (tipo === "EXALUMNO") {
    const { data } = await supabaseAdmin
      .from("EXALUMNOS")
      .select("carrera, empresa_actual, cargo_actual, sector, pais_ciudad, anios_experiencia, anio_graduacion, escuela_facultad, linkedin_url, github_url, website_url, biografia, habilidades, certificaciones, experiencia_laboral, areas_interes, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_proyecto, ofrece_donacion_dinero, ofrece_guest_speaking, ofrece_volunteering, ofrece_career_advice, ofrece_networking, visible_en_directorio")
      .eq("user_id", userId)
      .maybeSingle();
    ex = data;
  } else if (tipo === "ESTUDIANTE") {
    const { data } = await supabaseAdmin
      .from("ESTUDIANTES")
      .select("carrera, escuela_facultad, area_tematica, areas_interes, habilidades, proyecto_titulo, proyecto_tipo, proyecto_descripcion, proyecto_porcentaje_avance, busca_financiamiento, busca_mentoria, busca_empleo, busca_pasantia, visible_en_directorio")
      .eq("user_id", userId)
      .maybeSingle();
    est = data;
  }

  // Solo exponer datos públicos
  return {
    id: user.id,
    nombre: user.nombre,
    foto_url: user.foto_url,
    tipo: user.tipo,
    // Exalumno público
    carrera: ex?.carrera ?? est?.carrera ?? null,
    empresa_actual: ex?.empresa_actual ?? null,
    cargo_actual: ex?.cargo_actual ?? null,
    sector: ex?.sector ?? null,
    pais_ciudad: ex?.pais_ciudad ?? null,
    anios_experiencia: ex?.anios_experiencia ?? null,
    anio_graduacion: ex?.anio_graduacion ?? null,
    escuela_facultad: ex?.escuela_facultad ?? est?.escuela_facultad ?? null,
    linkedin_url: ex?.linkedin_url ?? null,
    github_url: ex?.github_url ?? null,
    website_url: ex?.website_url ?? null,
    biografia: ex?.biografia ?? null,
    habilidades: ex?.habilidades ?? est?.habilidades ?? null,
    certificaciones: ex?.certificaciones ?? null,
    experiencia_laboral: ex?.experiencia_laboral ?? null,
    areas_interes: areasInteresCodigos,
    ofrece_mentoria: !!ex?.ofrece_mentoria,
    ofrece_empleo: !!ex?.ofrece_empleo,
    ofrece_pasantia: !!ex?.ofrece_pasantia,
    ofrece_proyecto: !!ex?.ofrece_proyecto,
    ofrece_donacion_dinero: !!ex?.ofrece_donacion_dinero,
    ofrece_guest_speaking: !!ex?.ofrece_guest_speaking,
    ofrece_volunteering: !!ex?.ofrece_volunteering,
    ofrece_career_advice: !!ex?.ofrece_career_advice,
    ofrece_networking: !!ex?.ofrece_networking,
    // Estudiante público (sin datos privados)
    area_tematica: est?.area_tematica ?? null,
    proyecto_titulo: est?.proyecto_titulo ?? null,
    proyecto_tipo: est?.proyecto_tipo ?? null,
    proyecto_descripcion: est?.proyecto_descripcion ?? null,
    proyecto_porcentaje_avance: est?.proyecto_porcentaje_avance ?? null,
    busca_financiamiento: !!est?.busca_financiamiento,
    busca_mentoria: !!est?.busca_mentoria,
    busca_empleo: !!est?.busca_empleo,
    busca_pasantia: !!est?.busca_pasantia,
    visible_en_directorio: !!(ex?.visible_en_directorio ?? est?.visible_en_directorio),
  };
}

// ─── UPDATE perfil del usuario autenticado ────────────────────────────────────

// Formato carné UCR: letra opcional + 5-9 dígitos (ej. A12345, B123456, 12345678)
const CARNE_UCR_REGEX = /^[A-Za-z]?\d{5,9}$/;

export async function updateUserProfile(data: UserProfileUpdateValues) {
  const parsed = userProfileUpdateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Datos de perfil inválidos.");

  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const userId = session.user.id;
  const tipo = ((session.user as any).tipo as string)?.toUpperCase();
  const d = parsed.data;

  // Validar formato de carné UCR (T-11)
  if (d.carnet_ucr && !CARNE_UCR_REGEX.test(d.carnet_ucr.trim())) {
    throw new Error("El carné UCR tiene un formato inválido. Ejemplo válido: A12345 o 123456.");
  }

  const genero_y_telefono = d.phone ? `${d.genero || ""}||PHONE:${d.phone}` : d.genero || null;

  // 1. Actualizar tabla USERS
  const { error: userError } = await supabaseAdmin
    .from("USERS")
    .update({
      nombre: d.name,
      foto_url: d.image || null,
      fecha_nacimiento: d.fecha_nacimiento ? d.fecha_nacimiento : null,
      genero: genero_y_telefono,
    })
    .eq("id", userId);

  if (userError) throw new Error(`Error actualizando usuario: ${userError.message}`);

  // T-11: áreas de interés (catálogo relacional USUARIOS_AREAS). Aplica a
  // ambos roles por igual — se reemplaza el set completo con lo enviado.
  if (d.areas_interes !== undefined) {
    const { error: deleteAreasError } = await supabaseAdmin
      .from("USUARIOS_AREAS")
      .delete()
      .eq("user_id", userId);
    if (deleteAreasError) throw new Error(`Error actualizando áreas de interés: ${deleteAreasError.message}`);

    const nuevasAreas = (d.areas_interes ?? []).filter(Boolean);
    if (nuevasAreas.length > 0) {
      const { error: insertAreasError } = await supabaseAdmin
        .from("USUARIOS_AREAS")
        .insert(nuevasAreas.map((area_codigo) => ({ user_id: userId, area_codigo })));
      if (insertAreasError) throw new Error(`Error actualizando áreas de interés: ${insertAreasError.message}`);
    }
  }

  // T-13: áreas ya reflejan el estado post-actualización, se reutilizan para
  // calcular perfil_completo más abajo.
  const { data: areasActuales } = await supabaseAdmin
    .from("USUARIOS_AREAS")
    .select("area_codigo")
    .eq("user_id", userId);
  const areasCodigosActuales = (areasActuales ?? []).map((r) => r.area_codigo);

  if (tipo === "EXALUMNO") {
    const exBase = {
      user_id:              userId,
      carnet_ucr:           d.carnet_ucr || null,
      escuela_facultad:     d.escuela_facultad || null,
      anio_graduacion:      d.anio_graduacion ? Number(d.anio_graduacion) : null,
      empresa_actual:       d.empresa_actual || null,
      cargo_actual:         d.cargo_actual || null,
      pais_ciudad:          d.pais_ciudad || null,
      sector:               (d as any).sector || null,
      anios_experiencia:    d.anios_experiencia ? Number(d.anios_experiencia) : null,
      linkedin_url:         d.linkedin_url || d.socialLinks?.linkedin || null,
      github_url:           d.socialLinks?.github || null,
      website_url:          d.socialLinks?.website || null,
      biografia:            (d as any).biografia || d.bio || null,
      habilidades:          (d as any).habilidades ?? null,
      certificaciones:      (d as any).certificaciones ?? null,
      experiencia_laboral:  (d as any).experiencia_laboral ?? null,
      ofrece_mentoria:      !!d.ofrece_mentoria,
      ofrece_empleo:        !!d.ofrece_empleo,
      ofrece_pasantia:      !!d.ofrece_pasantia,
      ofrece_proyecto:      !!d.ofrece_proyecto,
      ofrece_donacion_dinero: !!d.ofrece_donacion_dinero,
      ofrece_guest_speaking:  !!d.ofrece_guest_speaking,
      ofrece_volunteering:    !!d.ofrece_volunteering,
      ofrece_career_advice:   !!d.ofrece_career_advice,
      ofrece_networking:      !!d.ofrece_networking,
    };

    // exBase es parcial (ej. no incluye `carrera`, fijada solo en el registro,
    // para no borrarla en cada guardado) — se fusiona con la fila actual para
    // calcular la completitud sobre el estado real post-actualización.
    const { data: exalumnoActual } = await supabaseAdmin
      .from("EXALUMNOS")
      .select("carrera")
      .eq("user_id", userId)
      .maybeSingle();

    const { completo: perfil_completo } = calcularCompletitudExalumno({
      ...exalumnoActual,
      ...exBase,
      areas_interes: areasCodigosActuales,
    });

    const { error: exError } = await supabaseAdmin
      .from("EXALUMNOS")
      .upsert({ ...exBase, perfil_completo }, { onConflict: "user_id" });

    if (exError) throw new Error(`Error actualizando exalumno: ${exError.message}`);
  }

  let proyectoCompleto = false;

  if (tipo === "ESTUDIANTE") {
    // T-16/T-17: se necesita el estado actual para detectar si `nivel_academico`
    // realmente cambió (fechar `nivel_academico_actualizado_at`) y si el avance
    // del proyecto acaba de llegar a 100% (preguntar si se marca como finalizado).
    const { data: estudianteActual } = await supabaseAdmin
      .from("ESTUDIANTES")
      .select("nivel_academico, nivel_academico_actualizado_at, proyecto_porcentaje_avance, proyecto_activo")
      .eq("user_id", userId)
      .maybeSingle();

    const nuevoNivelAcademico = d.nivel_academico || null;
    const nivelAcademicoCambio = nuevoNivelAcademico !== (estudianteActual?.nivel_academico ?? null);

    const estBase: Record<string, any> = {
      user_id:              userId,
      nivel_beca:           (d as any).nivel_beca || null,
      comprobante_beca_url: (d as any).comprobante_beca_url || null,
      carnet_ucr:           d.carnet_ucr?.trim() || null,
      carrera:              (d as any).carrera || null,
      escuela_facultad:     d.escuela_facultad || null,
      sede:                 d.sede || null,
      anio_ingreso:         d.anio_ingreso ? Number(d.anio_ingreso) : null,
      nivel_academico:      nuevoNivelAcademico,
      promedio_ponderado:   d.promedio_ponderado ? Number(d.promedio_ponderado) : null,
      proyecto_titulo:      d.proyecto_titulo || null,
      proyecto_tipo:        d.proyecto_tipo || null,
      proyecto_descripcion: d.proyecto_descripcion || null,
      proyecto_porcentaje_avance: d.proyecto_porcentaje_avance ?? null,
      area_tematica:        (d as any).area_tematica || null,
      habilidades:          (d as any).habilidades ?? null,
      soft_skills:          (d as any).soft_skills?.length ? (d as any).soft_skills : null,
      idiomas:              (d as any).idiomas?.length ? (d as any).idiomas : null,
      busca_financiamiento: !!d.busca_financiamiento,
      busca_mentoria:       !!d.busca_mentoria,
      busca_empleo:         !!d.busca_empleo,
      busca_pasantia:       !!d.busca_pasantia,
    };

    // T-18: "Pausar mi perfil temporalmente" (checkbox en /perfil/editar) se
    // traduce a ESTUDIANTES.activo, que ya usa el directorio y el matching
    // para decidir visibilidad. No toca USERS.activo/status (eso bloquearía
    // el login — ver bug encontrado en /ajustes).
    if ((d as any).perfil_pausado !== undefined) {
      estBase.activo = !(d as any).perfil_pausado;
    }

    // Solo se pisa la fecha si el nivel académico realmente cambió; si no,
    // se omite la llave para que el upsert conserve el valor existente.
    if (nivelAcademicoCambio) {
      estBase.nivel_academico_actualizado_at = new Date().toISOString();
    }

    // T-17: si el cliente confirma explícitamente que el proyecto se
    // finaliza (o se reactiva), se respeta ese valor; si no se envía, se
    // omite la llave para no tocar el valor existente en el upsert.
    if ((d as any).proyecto_activo !== undefined) {
      estBase.proyecto_activo = (d as any).proyecto_activo;
    }

    // Preguntar solo quando el avance acaba de llegar a 100% (transición),
    // no en cada guardado posterior mientras siga en 100%, y no si el
    // proyecto ya fue marcado como finalizado.
    const yaEstabaEn100 = (estudianteActual?.proyecto_porcentaje_avance ?? null) === 100;
    const proyectoYaFinalizado = estudianteActual?.proyecto_activo === false;
    proyectoCompleto =
      estBase.proyecto_porcentaje_avance === 100 && !yaEstabaEn100 && !proyectoYaFinalizado;

    const { completo: perfil_completo } = calcularCompletitudEstudiante({
      ...estBase,
      areas_interes: areasCodigosActuales,
    });

    const { error: estError } = await supabaseAdmin
      .from("ESTUDIANTES")
      .upsert({ ...estBase, perfil_completo }, { onConflict: "user_id" });

    if (estError) throw new Error(`Error actualizando estudiante: ${estError.message}`);

    // T-16: alerta de coherencia — estudiante con más de 8 años en la UCR
    // (según anio_ingreso) que nunca ha actualizado su nivel académico.
    const nivelAcademicoActualizadoAt = nivelAcademicoCambio
      ? estBase.nivel_academico_actualizado_at
      : estudianteActual?.nivel_academico_actualizado_at ?? null;

    if (!nivelAcademicoActualizadoAt && estBase.anio_ingreso) {
      const aniosEnUcr = new Date().getFullYear() - estBase.anio_ingreso;
      if (aniosEnUcr > 8) {
        await crearAlertaCoherenciaSiNoExiste(userId);
      }
    }

    try {
      await generarSugerenciasParaEstudiante(userId);
    } catch (e) {
      console.error("[updateUserProfile] Falló la generación de sugerencias de match:", e);
    }
  }

  revalidatePath("/perfil/editar");
  revalidatePath("/directorio/estudiantes");
  revalidatePath("/directorio/exalumnos");

  return { success: true, proyectoCompleto };
}

// T-16: crea una notificación por admin avisando de inconsistencia de datos
// de un estudiante (>8 años en la UCR sin cambiar de nivel académico). No hay
// columna `reference_id` en NOTIFICATIONS, así que la deduplicación se hace
// codificando el estudiante dentro de `type`.
async function crearAlertaCoherenciaSiNoExiste(estudianteUserId: string) {
  const tipoAlerta = `ALERTA_COHERENCIA:${estudianteUserId}`;

  const { data: yaExiste } = await supabaseAdmin
    .from("NOTIFICATIONS")
    .select("id")
    .eq("type", tipoAlerta)
    .limit(1)
    .maybeSingle();

  if (yaExiste) return;

  const { data: admins } = await supabaseAdmin
    .from("USERS")
    .select("id")
    .eq("tipo", "ADMIN");

  if (!admins || admins.length === 0) return;

  const ahora = new Date().toISOString();
  const { error } = await supabaseAdmin.from("NOTIFICATIONS").insert(
    admins.map((admin) => ({
      id: randomUUID(),
      user_id: admin.id,
      title: "Alerta de coherencia de datos",
      message: "Un estudiante lleva más de 8 años en la UCR sin actualizar su nivel académico. Revisa su perfil.",
      type: tipoAlerta,
      read: false,
      created_at: ahora,
      updated_at: ahora,
    }))
  );

  if (error) console.error("[crearAlertaCoherenciaSiNoExiste] Error creando alertas:", error.message);
}
