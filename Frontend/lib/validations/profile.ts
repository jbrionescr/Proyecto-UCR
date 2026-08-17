import { z } from "zod";
import { CATALOGO_AREAS, SECTORES, TIPOS_APOYO } from "../constants";
import { CODIGOS_AREAS_INTERES } from "../catalogos";

// T-12: acepta https://linkedin.com/in/usuario o .../pub/usuario, con o sin
// subdominio regional (ej. es.linkedin.com), con o sin segmentos extra al
// final (ej. /in/usuario/detalles). No exige el esquema completo vía z.url()
// porque eso rechazaría cadenas vacías en campos opcionales.
const LINKEDIN_URL_REGEX = /^(https?:\/\/)?(www\.)?([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[\w\-À-ÿ%]+\/?/i;
const esLinkedinValido = (v: string | null | undefined) => !v || LINKEDIN_URL_REGEX.test(v);
const LINKEDIN_ERROR = { message: "Debe ser una URL de perfil de LinkedIn (ej: https://linkedin.com/in/usuario)" };

export const estudianteProfileSchema = z.object({
  carrera: z.string().min(2, "La carrera es obligatoria y debe ser válida."),
  avanceProyecto: z.number().min(0).max(100, "El avance debe ser entre 0 y 100%."),
  areaProyecto: z.enum(CATALOGO_AREAS).optional(),
  apoyoBuscado: z.array(z.enum(TIPOS_APOYO)).min(1, "Debes seleccionar al menos un tipo de apoyo buscado."),
  // nivelBeca es estrictamente privado y puede o no enviarse desde el UI, 
  // usualmente se valida internamente o como opcional en el formulario público.
  nivelBeca: z.string().optional(),
});

export const exalumnoProfileSchema = z.object({
  carrera: z.string().min(2, "La carrera es obligatoria."),
  sector: z.enum(SECTORES),
  areasInteres: z.array(z.enum(CATALOGO_AREAS)).min(1, "Debes seleccionar al menos un área de interés."),
  apoyoOfrecido: z.array(z.enum(TIPOS_APOYO)).min(1, "Debes seleccionar al menos un tipo de apoyo que ofreces."),
});

export type EstudianteProfileFormValues = z.infer<typeof estudianteProfileSchema>;
export type ExalumnoProfileFormValues = z.infer<typeof exalumnoProfileSchema>;

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Correo electrónico inválido."),
  phone: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "La biografía no puede exceder 500 caracteres.").optional(),
  socialLinks: z.object({
    linkedin: z.string().optional().or(z.literal("")).refine(esLinkedinValido, LINKEDIN_ERROR),
    twitter: z.string().url("URL inválida").optional().or(z.literal("")),
    github: z.string().url("URL inválida").optional().or(z.literal("")),
    website: z.string().url("URL inválida").optional().or(z.literal(""))
  }).optional(),
  
  fecha_nacimiento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  
  // Student fields
  nivel_beca: z.string().optional().nullable(),
  comprobante_beca_url: z.string().optional().nullable().or(z.literal("")),
  carnet_ucr: z.string().regex(/^[A-Za-z]?\d{5,9}$/, "Formato de carné inválido (Ej: B91234 o 123456).").optional().nullable().or(z.literal("")),
  carrera: z.string().optional().nullable(),
  escuela_facultad: z.string().optional().nullable(),
  sede: z.string().optional().nullable(),
  anio_ingreso: z.coerce.number().optional().nullable(),
  nivel_academico: z.string().optional().nullable(),
  promedio_ponderado: z.coerce.number().optional().nullable(),
  proyecto_titulo: z.string().optional().nullable(),
  proyecto_tipo: z.string().optional().nullable(),
  proyecto_descripcion: z.string().max(1000).optional().nullable(),
  proyecto_necesidades: z.array(z.string()).optional().nullable(),
  proyecto_porcentaje_avance: z.coerce.number().min(0).max(100).optional().nullable(),
  proyecto_activo: z.boolean().optional(),
  area_tematica: z.string().optional().nullable(),
  areas_interes: z.array(z.enum(CODIGOS_AREAS_INTERES)).optional().nullable(),
  habilidades: z.any().optional().nullable(),
  soft_skills: z.array(z.string()).optional().nullable(),
  idiomas: z.array(z.object({ idioma: z.string(), nivel: z.string() })).optional().nullable(),
  busca_financiamiento: z.boolean().optional(),
  busca_mentoria: z.boolean().optional(),
  busca_empleo: z.boolean().optional(),
  busca_pasantia: z.boolean().optional(),

  // Exalumni fields
  anio_graduacion: z.coerce.number().optional().nullable(),
  empresa_actual: z.string().optional().nullable(),
  cargo_actual: z.string().optional().nullable(),
  sector: z.string().optional().nullable(),
  pais_ciudad: z.string().optional().nullable(),
  anios_experiencia: z.coerce.number().optional().nullable(),
  linkedin_url: z.string().optional().nullable().refine(esLinkedinValido, LINKEDIN_ERROR),
  biografia: z.string().max(1000).optional().nullable(),
  certificaciones: z.any().optional().nullable(),
  experiencia_laboral: z.any().optional().nullable(),
  ofrece_mentoria: z.boolean().optional(),
  ofrece_empleo: z.boolean().optional(),
  ofrece_pasantia: z.boolean().optional(),
  ofrece_proyecto: z.boolean().optional(),
  ofrece_donacion_dinero: z.boolean().optional(),
  ofrece_guest_speaking: z.boolean().optional(),
  ofrece_volunteering: z.boolean().optional(),
  ofrece_career_advice: z.boolean().optional(),
  ofrece_networking: z.boolean().optional(),
  // Pausar perfil (estudiante) — activo = !perfil_pausado
  perfil_pausado: z.boolean().optional(),
});

export type UserProfileUpdateValues = z.infer<typeof userProfileUpdateSchema>;
