// T-13: cálculo dinámico de perfil_completo (RF-02 / RF-03).
// Se recalcula en cada actualización de perfil — ver actions/profile.actions.ts.

export interface CompletitudResultado {
  porcentaje: number;
  completo: boolean;
  faltantes: string[];
}

function tieneAreasInteres(perfil: any): boolean {
  return Array.isArray(perfil?.areas_interes) && perfil.areas_interes.length >= 1;
}

const REQUERIDOS_EXALUMNO = [
  "carrera",
  "escuela_facultad",
  "anio_graduacion",
  "empresa_actual",
  "cargo_actual",
  "sector",
  "pais_ciudad",
  "linkedin_url",
  "biografia",
  "anios_experiencia",
] as const;

export function calcularCompletitudExalumno(exalumno: any): CompletitudResultado {
  const faltantes: string[] = REQUERIDOS_EXALUMNO.filter((campo) => !exalumno?.[campo]);
  if (!tieneAreasInteres(exalumno)) faltantes.push("areas_interes");

  const total = REQUERIDOS_EXALUMNO.length + 1;
  const completados = total - faltantes.length;
  const porcentaje = Math.round((completados / total) * 100);
  return { porcentaje, completo: porcentaje === 100, faltantes };
}

const REQUERIDOS_ESTUDIANTE = [
  "carnet_ucr",
  "carrera",
  "escuela_facultad",
  "sede",
  "anio_ingreso",
  "nivel_academico",
  "proyecto_titulo",
  "proyecto_tipo",
  "proyecto_descripcion",
  "area_tematica",
] as const;

export function calcularCompletitudEstudiante(estudiante: any): CompletitudResultado {
  const faltantes: string[] = REQUERIDOS_ESTUDIANTE.filter((campo) => !estudiante?.[campo]);
  if (!tieneAreasInteres(estudiante)) faltantes.push("areas_interes");

  const apoyoOK = !!(
    estudiante?.busca_financiamiento ||
    estudiante?.busca_mentoria ||
    estudiante?.busca_empleo ||
    estudiante?.busca_pasantia
  );
  if (!apoyoOK) faltantes.push("apoyo_buscado");

  const total = REQUERIDOS_ESTUDIANTE.length + 2;
  const completados = total - faltantes.length;
  const porcentaje = Math.round((completados / total) * 100);
  return { porcentaje, completo: porcentaje === 100, faltantes };
}
