// Catálogo relacional de áreas de interés (T-11).
//
// Los códigos y etiquetas deben coincidir 1:1 con `CATALOGO_AREAS` en
// lib/constants.ts (que ya se usaba para validar el formulario de exalumno
// contra un enum fijo) y con el seed en supabase/migrations/14_catalogo_areas.sql.
// Si agregas/quitas un área, actualiza los tres lugares.

export interface AreaInteres {
  codigo: string;
  etiqueta: string;
}

export const CATALOGO_AREAS_INTERES: AreaInteres[] = [
  { codigo: "tecnologia_software", etiqueta: "Tecnología y Software" },
  { codigo: "salud_medicina", etiqueta: "Salud y Medicina" },
  { codigo: "educacion_docencia", etiqueta: "Educación y Docencia" },
  { codigo: "ingenieria_construccion", etiqueta: "Ingeniería y Construcción" },
  { codigo: "negocios_finanzas", etiqueta: "Negocios y Finanzas" },
  { codigo: "arte_diseno", etiqueta: "Arte y Diseño" },
  { codigo: "ciencias_sociales", etiqueta: "Ciencias Sociales" },
  { codigo: "ciencias_exactas", etiqueta: "Ciencias Exactas y Naturales" },
  { codigo: "derecho_politica", etiqueta: "Derecho y Política" },
  { codigo: "medio_ambiente", etiqueta: "Medio Ambiente y Sostenibilidad" },
  { codigo: "comunicacion_periodismo", etiqueta: "Comunicación y Periodismo" },
  { codigo: "turismo_hospitalidad", etiqueta: "Turismo y Hospitalidad" },
  { codigo: "agricultura_agroindustria", etiqueta: "Agricultura y Agroindustria" },
  { codigo: "investigacion_desarrollo", etiqueta: "Investigación y Desarrollo" },
];

export const CODIGOS_AREAS_INTERES = CATALOGO_AREAS_INTERES.map((a) => a.codigo) as [string, ...string[]];

export function etiquetaDeArea(codigo: string): string {
  return CATALOGO_AREAS_INTERES.find((a) => a.codigo === codigo)?.etiqueta ?? codigo;
}

export function codigoDeEtiqueta(etiqueta: string): string | null {
  return CATALOGO_AREAS_INTERES.find((a) => a.etiqueta === etiqueta)?.codigo ?? null;
}
