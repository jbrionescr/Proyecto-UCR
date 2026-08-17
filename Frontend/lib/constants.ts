export const CATALOGO_CARRERAS = [
  "Ingeniería en Computación",
  "Ingeniería Eléctrica",
  "Ingeniería Industrial",
  "Ingeniería Civil",
  "Ingeniería Mecánica",
  "Ingeniería Química",
  "Administración de Negocios",
  "Economía",
  "Contaduría Pública",
  "Derecho",
  "Medicina",
  "Farmacia",
  "Odontología",
  "Enfermería",
  "Arquitectura",
  "Ciencias de la Comunicación Colectiva",
  "Psicología",
  "Ciencias Políticas",
  "Trabajo Social",
  "Enseñanza",
  "Educación Primaria / Preescolar",
  "Física / Matemáticas",
  "Biología / Química",
  "Artes Plásticas / Escénicas",
  "Agronomía",
  "Nutrición",
  "Otra Carrera"
] as const;

export const MAPA_AREAS_KEYWORDS: Record<string, string[]> = {
  "Tecnología y Software": ["comput", "softw", "sistem", "tecnol", "info", "redes", "datos", "ia "],
  "Salud y Medicina": ["medicina", "salud", "enferm", "odont", "farma", "nutri", "psico", "terapia"],
  "Educación y Docencia": ["educa", "enseñ", "pedag", "docen", "preescolar"],
  "Ingeniería y Construcción": ["civil", "arquitec", "mecánic", "mecanic", "eléctr", "electr", "constru", "topo", "industr", "químic", "quimic"],
  "Negocios y Finanzas": ["admin", "econom", "contab", "finanz", "negocio", "mercad", "gerenc", "aduan"],
  "Arte y Diseño": ["arte", "diseñ", "grafi", "music", "pintur", "audiovis", "animac", "escénic"],
  "Ciencias Sociales": ["social", "psico", "socio", "antro", "histor", "geogra", "comunica"],
  "Ciencias Exactas y Naturales": ["biolo", "quimic", "químic", "fisic", "físic", "mate", "astron", "geolo"],
  "Derecho y Política": ["derecho", "legal", "polític", "politic", "ley"],
  "Medio Ambiente y Sostenibilidad": ["ambient", "sostenib", "ecolo", "bosque", "fores", "agrono"],
  "Comunicación y Periodismo": ["comunica", "periodis", "relacion", "publici", "audiovis"],
  "Turismo y Hospitalidad": ["turis", "hoteler", "gastrono", "hospi"],
  "Agricultura y Agroindustria": ["agro", "agricu", "zootec", "alimen", "agronom"],
  "Investigación y Desarrollo": ["investiga", "desarrol", "cienc", "labora", "físic", "químic", "biolo", "matem"],
};

export const CATALOGO_AREAS = [
  "Tecnología y Software",
  "Salud y Medicina",
  "Educación y Docencia",
  "Ingeniería y Construcción",
  "Negocios y Finanzas",
  "Arte y Diseño",
  "Ciencias Sociales",
  "Ciencias Exactas y Naturales",
  "Derecho y Política",
  "Medio Ambiente y Sostenibilidad",
  "Comunicación y Periodismo",
  "Turismo y Hospitalidad",
  "Agricultura y Agroindustria",
  "Investigación y Desarrollo",
] as const;

export const TIPOS_APOYO = [
  "Mentoría Profesional",
  "Revisión de CV",
  "Práctica Profesional / Pasantía",
  "Oportunidad Laboral",
  "Apoyo para Proyecto de Graduación",
  "Consejería Académica",
  "Networking",
] as const;

export const SECTORES = [
  "Sector Privado",
  "Sector Público",
  "ONG / Sin Fines de Lucro",
  "Academia e Investigación",
  "Emprendimiento / Startup",
  "Trabajador Independiente / Freelance",
] as const;

export const SEDES_UCR = [
  "Sede Rodrigo Facio",
  "Sede de Occidente",
  "Sede del Atlántico",
  "Sede de Guanacaste",
  "Sede del Pacífico",
  "Sede del Caribe",
  "Sede Interuniversitaria de Alajuela",
  "Sede del Sur",
  "Recinto de Paraíso",
  "Recinto de Guápiles",
  "Recinto de Santa Cruz"
] as const;

export const NIVELES_ACADEMICOS = [
  "Bachillerato",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Especialidad"
] as const;
