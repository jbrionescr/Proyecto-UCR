// prisma/seed.mjs — Datos de prueba Plataforma Exalumnos UCR
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

/* ── Carga manual de variables de entorno ───────────────────── */
function loadEnvFile(path) {
  try {
    for (const line of readFileSync(path, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const idx = t.indexOf('=');
      if (idx < 1) continue;
      const key = t.slice(0, idx).trim();
      const val = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {}
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const PWD = 'A12345678';

/* ── Definiciones de los 15 usuarios ────────────────────────── */
const USER_DEFS = [
  // 1 – ADMIN
  { email: 'admin.test@ucr.ac.cr',           nombre: 'María Rodríguez',  tipo: 'ADMIN',      genero: 'F' },
  // 8 – EXALUMNOS
  { email: 'carlos.mora.seed@gmail.com',     nombre: 'Carlos Mora',      tipo: 'EXALUMNO',   genero: 'M' },
  { email: 'laura.vargas.seed@gmail.com',    nombre: 'Laura Vargas',     tipo: 'EXALUMNO',   genero: 'F' },
  { email: 'diego.salas.seed@gmail.com',     nombre: 'Diego Salas',      tipo: 'EXALUMNO',   genero: 'M' },
  { email: 'andrea.jimenez.seed@gmail.com',  nombre: 'Andrea Jiménez',   tipo: 'EXALUMNO',   genero: 'F' },
  { email: 'roberto.castro.seed@gmail.com',  nombre: 'Roberto Castro',   tipo: 'EXALUMNO',   genero: 'M' },
  { email: 'valeria.brenes.seed@gmail.com',  nombre: 'Valeria Brenes',   tipo: 'EXALUMNO',   genero: 'F' },
  { email: 'juan.fallas.seed@gmail.com',     nombre: 'Juan Fallas',      tipo: 'EXALUMNO',   genero: 'M' },
  { email: 'sofia.montero.seed@gmail.com',   nombre: 'Sofía Montero',    tipo: 'EXALUMNO',   genero: 'F' },
  // 6 – ESTUDIANTES
  { email: 'pablo.araya.seed@ucr.ac.cr',     nombre: 'Pablo Araya',      tipo: 'ESTUDIANTE', genero: 'M' },
  { email: 'ana.bermudez.seed@ucr.ac.cr',    nombre: 'Ana Bermúdez',     tipo: 'ESTUDIANTE', genero: 'F' },
  { email: 'kevin.ulate.seed@ucr.ac.cr',     nombre: 'Kevin Ulate',      tipo: 'ESTUDIANTE', genero: 'M' },
  { email: 'natalia.rios.seed@ucr.ac.cr',    nombre: 'Natalia Ríos',     tipo: 'ESTUDIANTE', genero: 'F' },
  { email: 'marcos.leon.seed@ucr.ac.cr',     nombre: 'Marcos León',      tipo: 'ESTUDIANTE', genero: 'M' },
  { email: 'camila.chaves.seed@ucr.ac.cr',   nombre: 'Camila Chaves',    tipo: 'ESTUDIANTE', genero: 'F' },
];

/* ── Perfiles de Exalumnos ───────────────────────────────────── */
const EXALUMNO_PROFILES = {
  'carlos.mora.seed@gmail.com': {
    carrera: 'Computación e Informática',
    escuela_facultad: 'Escuela de Ciencias de la Computación e Informática',
    anio_graduacion: 2015,
    empresa_actual: 'TechCR Solutions',
    cargo_actual: 'Senior Software Engineer',
    sector: 'Tecnología',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 9,
    linkedin_url: 'https://linkedin.com/in/carlos-mora-cr',
    biografia: 'Ingeniero en sistemas con 9 años de experiencia en React Native, Node.js y arquitecturas cloud. Apasionado por mentorear a la próxima generación de desarrolladores costarricenses.',
    habilidades: ['JavaScript', 'React Native', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'],
    areas_interes: ['Desarrollo móvil', 'Cloud computing', 'Startup tech'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_mentoria: true, ofrece_empleo: true, ofrece_pasantia: true,
    ofrece_career_advice: true, ofrece_networking: true,
  },
  'laura.vargas.seed@gmail.com': {
    carrera: 'Ingeniería Industrial',
    escuela_facultad: 'Escuela de Ingeniería Industrial',
    anio_graduacion: 2017,
    empresa_actual: 'Bridgestone Costa Rica',
    cargo_actual: 'Gerente de Operaciones',
    sector: 'Manufactura e Industria',
    pais_ciudad: 'Cartago, Costa Rica',
    anios_experiencia: 7,
    linkedin_url: 'https://linkedin.com/in/laura-vargas-ind',
    biografia: 'Ingeniera industrial con experiencia en optimización de procesos y gestión de operaciones en manufactura. Quiero apoyar a estudiantes interesados en el área industrial.',
    habilidades: ['Lean Manufacturing', 'Six Sigma', 'AutoCAD', 'SAP', 'Gestión de proyectos'],
    areas_interes: ['Optimización de procesos', 'Manufactura sostenible', 'Logística'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_mentoria: true, ofrece_pasantia: true, ofrece_career_advice: true,
  },
  'diego.salas.seed@gmail.com': {
    carrera: 'Administración de Empresas',
    escuela_facultad: 'Facultad de Ciencias Económicas',
    anio_graduacion: 2013,
    empresa_actual: 'Banco de Costa Rica',
    cargo_actual: 'Director de Inversiones',
    sector: 'Banca y Finanzas',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 11,
    linkedin_url: 'https://linkedin.com/in/diego-salas-finance',
    biografia: 'Experto en finanzas corporativas y banca de inversión. He liderado estructuraciones de deuda por más de $200M. Me apasiona guiar a jóvenes interesados en el sector financiero.',
    habilidades: ['Análisis financiero', 'Modelado financiero', 'Bloomberg', 'Excel avanzado', 'Gestión de portafolios'],
    areas_interes: ['Banca de inversión', 'Mercados de capital', 'Fintech'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_empleo: true, ofrece_career_advice: true,
    ofrece_networking: true, ofrece_guest_speaking: true,
  },
  'andrea.jimenez.seed@gmail.com': {
    carrera: 'Biología',
    escuela_facultad: 'Escuela de Biología',
    anio_graduacion: 2016,
    empresa_actual: 'INBIO — Instituto Nacional de Biodiversidad',
    cargo_actual: 'Investigadora Principal',
    sector: 'Ciencias Biológicas',
    pais_ciudad: 'Heredia, Costa Rica',
    anios_experiencia: 8,
    linkedin_url: 'https://linkedin.com/in/andrea-jimenez-bio',
    biografia: 'Bióloga investigadora con enfoque en biodiversidad de ecosistemas tropicales. Más de 15 publicaciones científicas y experiencia en gestión de proyectos internacionales.',
    habilidades: ['Ecología molecular', 'R', 'Python', 'QGIS', 'Taxonomía', 'Escritura científica'],
    areas_interes: ['Biodiversidad', 'Biología molecular', 'Conservación'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_mentoria: true, ofrece_proyecto: true,
    ofrece_guest_speaking: true, ofrece_networking: true,
  },
  'roberto.castro.seed@gmail.com': {
    carrera: 'Derecho',
    escuela_facultad: 'Facultad de Derecho',
    anio_graduacion: 2010,
    empresa_actual: 'Castro & Asociados Abogados',
    cargo_actual: 'Socio Director',
    sector: 'Servicios Jurídicos',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 14,
    linkedin_url: 'https://linkedin.com/in/roberto-castro-ley',
    biografia: 'Abogado especializado en derecho corporativo y propiedad intelectual. Fundador del estudio Castro & Asociados. Me complace orientar a estudiantes de derecho.',
    habilidades: ['Derecho corporativo', 'Propiedad intelectual', 'Litigación', 'Redacción jurídica', 'Arbitraje internacional'],
    areas_interes: ['Derecho corporativo', 'Startups legales', 'Arbitraje internacional'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_mentoria: true, ofrece_career_advice: true,
    ofrece_networking: true, ofrece_guest_speaking: true,
  },
  'valeria.brenes.seed@gmail.com': {
    carrera: 'Medicina',
    escuela_facultad: 'Facultad de Medicina',
    anio_graduacion: 2012,
    empresa_actual: 'Hospital CIMA',
    cargo_actual: 'Médica Especialista en Cardiología',
    sector: 'Salud',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 12,
    linkedin_url: 'https://linkedin.com/in/valeria-brenes-medica',
    biografia: 'Cardióloga con subespecialidad en intervención cardíaca. Docente universitaria y apasionada por la investigación clínica. Apoyo a futuros médicos e investigadores.',
    habilidades: ['Cardiología intervencionista', 'Investigación clínica', 'Docencia', 'Hemodinamia'],
    areas_interes: ['Cardiología', 'Investigación biomédica', 'Salud digital'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_mentoria: true, ofrece_guest_speaking: true, ofrece_networking: true,
  },
  'juan.fallas.seed@gmail.com': {
    carrera: 'Ingeniería Civil',
    escuela_facultad: 'Escuela de Ingeniería Civil',
    anio_graduacion: 2014,
    empresa_actual: 'Constructora Fallas & Quirós',
    cargo_actual: 'Ingeniero Director de Proyectos',
    sector: 'Construcción e Infraestructura',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 10,
    linkedin_url: 'https://linkedin.com/in/juan-fallas-civil',
    biografia: 'Ingeniero civil especializado en estructuras y gestión de proyectos de gran escala. He dirigido proyectos por más de $50M. Guío a estudiantes de ingeniería hacia el mundo laboral.',
    habilidades: ['AutoCAD', 'SAP2000', 'Gestión de proyectos', 'Concreto reforzado', 'BIM'],
    areas_interes: ['Infraestructura vial', 'Edificaciones', 'Proyectos sostenibles'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_empleo: true, ofrece_pasantia: true,
    ofrece_mentoria: true, ofrece_career_advice: true,
  },
  'sofia.montero.seed@gmail.com': {
    carrera: 'Comunicación Colectiva',
    escuela_facultad: 'Escuela de Ciencias de la Comunicación Colectiva',
    anio_graduacion: 2018,
    empresa_actual: 'Agencia Creativa Voz CR',
    cargo_actual: 'Directora de Marketing Digital',
    sector: 'Marketing y Comunicación',
    pais_ciudad: 'San José, Costa Rica',
    anios_experiencia: 6,
    linkedin_url: 'https://linkedin.com/in/sofia-montero-mktg',
    biografia: 'Comunicadora y marketera digital con experiencia en estrategias de contenido y branding. Directora de Voz CR, agencia boutique especializada en marcas locales.',
    habilidades: ['Marketing digital', 'SEO/SEM', 'Adobe Creative Suite', 'Estrategia de contenido', 'Google Analytics'],
    areas_interes: ['Marketing digital', 'Comunicación corporativa', 'Branding'],
    perfil_completo: true, visible_en_directorio: true,
    ofrece_empleo: true, ofrece_pasantia: true,
    ofrece_networking: true, ofrece_career_advice: true, ofrece_mentoria: true,
  },
};

/* ── Perfiles de Estudiantes ─────────────────────────────────── */
const ESTUDIANTE_PROFILES = {
  'pablo.araya.seed@ucr.ac.cr': {
    carnet_ucr: 'A89201',
    carrera: 'Computación e Informática',
    escuela_facultad: 'Escuela de Ciencias de la Computación e Informática',
    sede: 'Rodrigo Facio', anio_ingreso: 2021, nivel_academico: 'Bachillerato',
    promedio_ponderado: 8.7,
    proyecto_titulo: 'App móvil de monitoreo de salud preventiva',
    proyecto_tipo: 'TFG',
    proyecto_descripcion: 'Aplicación móvil en React Native que recopila indicadores de salud y usa ML para detectar patrones de riesgo.',
    proyecto_necesidades: ['Mentoría técnica en mobile', 'Contactos en HealthTech', 'Financiamiento para pruebas de usuario'],
    proyecto_porcentaje_avance: 60,
    habilidades: ['JavaScript', 'React Native', 'Python', 'Machine Learning básico', 'Git'],
    area_tematica: 'Desarrollo de software',
    areas_interes: ['Mobile development', 'HealthTech', 'IA'],
    visible_en_directorio: true, activo: true,
    busca_mentoria: true, busca_empleo: true,
  },
  'ana.bermudez.seed@ucr.ac.cr': {
    carnet_ucr: 'B91034',
    carrera: 'Biología',
    escuela_facultad: 'Escuela de Biología',
    sede: 'Rodrigo Facio', anio_ingreso: 2020, nivel_academico: 'Licenciatura',
    promedio_ponderado: 9.1,
    proyecto_titulo: 'Diversidad de macroinvertebrados en ríos del Pacífico Central',
    proyecto_tipo: 'Tesis',
    proyecto_descripcion: 'Evaluación de macroinvertebrados como bioindicadores de calidad del agua en cuencas costeras del Pacífico Central de Costa Rica.',
    proyecto_necesidades: ['Financiamiento para trabajo de campo', 'Mentoría en análisis estadístico', 'Acceso a laboratorios externos'],
    proyecto_porcentaje_avance: 75,
    habilidades: ['R', 'QGIS', 'Taxonomía de invertebrados', 'Muestreo de campo', 'Escritura científica'],
    area_tematica: 'Ecología acuática',
    areas_interes: ['Biodiversidad', 'Conservación marina', 'Bioindicadores'],
    visible_en_directorio: true, activo: true,
    busca_financiamiento: true, busca_mentoria: true,
  },
  'kevin.ulate.seed@ucr.ac.cr': {
    carnet_ucr: 'C92518',
    carrera: 'Administración de Empresas',
    escuela_facultad: 'Facultad de Ciencias Económicas',
    sede: 'Rodrigo Facio', anio_ingreso: 2022, nivel_academico: 'Bachillerato',
    promedio_ponderado: 8.4,
    proyecto_titulo: 'Modelo de valoración de riesgo crediticio para PyMEs costarricenses',
    proyecto_tipo: 'TFG',
    proyecto_descripcion: 'Modelo cuantitativo para evaluar el riesgo crediticio en PyMEs usando regresión logística y análisis discriminante.',
    proyecto_necesidades: ['Acceso a datos financieros', 'Mentoría en modelado cuantitativo', 'Contactos en sector bancario'],
    proyecto_porcentaje_avance: 40,
    habilidades: ['Excel avanzado', 'R estadístico', 'Análisis financiero', 'Power BI', 'SQL básico'],
    area_tematica: 'Finanzas',
    areas_interes: ['Banca', 'Finanzas corporativas', 'Fintech'],
    visible_en_directorio: true, activo: true,
    busca_empleo: true, busca_pasantia: true,
  },
  'natalia.rios.seed@ucr.ac.cr': {
    carnet_ucr: 'D90876',
    carrera: 'Derecho',
    escuela_facultad: 'Facultad de Derecho',
    sede: 'Rodrigo Facio', anio_ingreso: 2020, nivel_academico: 'Licenciatura',
    promedio_ponderado: 9.3,
    proyecto_titulo: 'Protección de datos personales en plataformas de economía colaborativa en Costa Rica',
    proyecto_tipo: 'Tesis',
    proyecto_descripcion: 'Análisis de la normativa costarricense y comparada sobre protección de datos en aplicaciones tipo Uber, Airbnb y similares.',
    proyecto_necesidades: ['Mentoría en derecho digital', 'Acceso a casos jurisprudenciales internacionales'],
    proyecto_porcentaje_avance: 55,
    habilidades: ['Investigación jurídica', 'Redacción legal', 'GDPR', 'Derecho digital', 'Inglés jurídico'],
    area_tematica: 'Derecho digital',
    areas_interes: ['Derecho corporativo', 'Privacidad de datos', 'Derecho tecnológico'],
    visible_en_directorio: true, activo: true,
    busca_mentoria: true,
  },
  'marcos.leon.seed@ucr.ac.cr': {
    carnet_ucr: 'E93102',
    carrera: 'Computación e Informática',
    escuela_facultad: 'Escuela de Ciencias de la Computación e Informática',
    sede: 'Rodrigo Facio', anio_ingreso: 2022, nivel_academico: 'Bachillerato',
    promedio_ponderado: 8.9,
    proyecto_titulo: 'Sistema de detección de vulnerabilidades en código fuente usando análisis estático',
    proyecto_tipo: 'TFG',
    proyecto_descripcion: 'Herramienta de análisis estático que detecta vulnerabilidades de seguridad en proyectos Python y JavaScript.',
    proyecto_necesidades: ['Mentoría en ciberseguridad', 'Acceso a datasets de código vulnerable', 'Pasantía en empresa de seguridad'],
    proyecto_porcentaje_avance: 35,
    habilidades: ['Python', 'JavaScript', 'Seguridad informática', 'Docker', 'Git', 'Linux'],
    area_tematica: 'Ciberseguridad',
    areas_interes: ['Ciberseguridad', 'DevOps', 'Backend development'],
    visible_en_directorio: true, activo: true,
    busca_empleo: true, busca_pasantia: true,
  },
  'camila.chaves.seed@ucr.ac.cr': {
    carnet_ucr: 'F91765',
    carrera: 'Comunicación Colectiva',
    escuela_facultad: 'Escuela de Ciencias de la Comunicación Colectiva',
    sede: 'Rodrigo Facio', anio_ingreso: 2021, nivel_academico: 'Bachillerato',
    promedio_ponderado: 8.6,
    proyecto_titulo: 'Estrategia de comunicación digital para emprendimientos sociales en Costa Rica',
    proyecto_tipo: 'TFG',
    proyecto_descripcion: 'Framework de comunicación digital para emprendimientos de impacto social, con énfasis en storytelling y comunidades en línea.',
    proyecto_necesidades: ['Mentoría en marketing digital', 'Casos de estudio de agencias', 'Pasantía profesional'],
    proyecto_porcentaje_avance: 50,
    habilidades: ['Redacción periodística', 'Redes sociales', 'Adobe Premiere', 'Fotografía', 'Canva', 'Copywriting'],
    area_tematica: 'Comunicación digital',
    areas_interes: ['Marketing de contenidos', 'Comunicación corporativa', 'Periodismo digital'],
    visible_en_directorio: true, activo: true,
    busca_empleo: true, busca_mentoria: true,
  },
};

/* ── Helper: crear/actualizar usuario en Supabase Auth ──────── */
async function ensureSupabaseUser(email, nombre, tipo) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: PWD, email_confirm: true,
    }).catch(() => {});
    console.log(`  ↑ Actualizado: ${email}`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email, password: PWD, email_confirm: true,
    user_metadata: { nombre, tipo },
  });
  if (error) throw new Error(`Supabase [${email}]: ${error.message}`);
  console.log(`  + Creado: ${email} → ${data.user.id}`);
  return data.user.id;
}

/* ── Seed principal ──────────────────────────────────────────── */
async function main() {
  console.log('\n🌱  Seed de datos de prueba — Plataforma Exalumnos UCR\n');

  /* 1. Usuarios ─────────────────────────────────────────────── */
  console.log('── Usuarios (Supabase Auth + DB) ───────────────────────');
  const ids = {};
  for (const u of USER_DEFS) {
    const id = await ensureSupabaseUser(u.email, u.nombre, u.tipo);
    ids[u.email] = id;
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id,
        email: u.email,
        nombre: u.nombre,
        tipo: u.tipo,
        genero: u.genero,
        status: 'ACTIVO',
        activo: true,
        email_verified: true,
        foto_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=005da4&color=fff&size=128`,
      },
      update: {
        nombre: u.nombre,
        tipo: u.tipo,
        status: 'ACTIVO',
        activo: true,
        email_verified: true,
      },
    });
  }

  /* 2. Perfiles Exalumnos ────────────────────────────────────── */
  console.log('\n── Perfiles Exalumnos ──────────────────────────────────');
  for (const [email, profile] of Object.entries(EXALUMNO_PROFILES)) {
    await prisma.exalumno.upsert({
      where: { user_id: ids[email] },
      create: { user_id: ids[email], ...profile },
      update: profile,
    });
    console.log(`  ✓ ${email}`);
  }

  /* 3. Perfiles Estudiantes ──────────────────────────────────── */
  console.log('\n── Perfiles Estudiantes ────────────────────────────────');
  for (const [email, profile] of Object.entries(ESTUDIANTE_PROFILES)) {
    await prisma.estudiante.upsert({
      where: { user_id: ids[email] },
      create: { user_id: ids[email], ...profile },
      update: profile,
    });
    console.log(`  ✓ ${email}`);
  }

  /* 4. Matches (15 combinaciones) ────────────────────────────── */
  console.log('\n── Matches ─────────────────────────────────────────────');
  const I = (email) => ids[email]; // alias corto

  const MATCHES = [
    {
      est: 'pablo.araya.seed@ucr.ac.cr',   exal: 'carlos.mora.seed@gmail.com',
      score: 92, estado: 'ACTIVO',     tipo_apoyo: 'Mentoría + Empleo',
      initiated_by: 'sistema',         accepted_at: new Date('2026-05-10'),
      match_reasons: { carrera: true, sector: 'Tecnología', habilidades_comunes: ['JavaScript', 'React Native'], oferta_busqueda: 'mentoria', nota: 'Misma carrera y sector tech' },
    },
    {
      est: 'pablo.araya.seed@ucr.ac.cr',   exal: 'diego.salas.seed@gmail.com',
      score: 45, estado: 'SUGERIDO',   tipo_apoyo: 'Career Advice',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Finanzas', habilidades_comunes: [], nota: 'Habilidades analíticas en común' },
    },
    {
      est: 'pablo.araya.seed@ucr.ac.cr',   exal: 'laura.vargas.seed@gmail.com',
      score: 35, estado: 'CERRADO',    tipo_apoyo: 'Networking',
      initiated_by: 'sistema',         closed_at: new Date('2026-04-20'),
      match_reasons: { carrera: false, sector: 'Manufactura', nota: 'Bajo score: áreas muy distintas' },
    },
    {
      est: 'ana.bermudez.seed@ucr.ac.cr',  exal: 'andrea.jimenez.seed@gmail.com',
      score: 87, estado: 'ACTIVO',     tipo_apoyo: 'Mentoría + Proyecto',
      initiated_by: 'sistema',         accepted_at: new Date('2026-05-18'),
      match_reasons: { carrera: true, sector: 'Ciencias Biológicas', habilidades_comunes: ['R', 'QGIS', 'Taxonomía'], oferta_busqueda: 'mentoria' },
    },
    {
      est: 'ana.bermudez.seed@ucr.ac.cr',  exal: 'valeria.brenes.seed@gmail.com',
      score: 70, estado: 'CONTACTADO', tipo_apoyo: 'Mentoría',
      initiated_by: null, // estudiante inicia — se asigna abajo
      match_reasons: { carrera: false, sector: 'Salud', nota: 'Ciencias biológicas y salud convergen' },
    },
    {
      est: 'kevin.ulate.seed@ucr.ac.cr',   exal: 'diego.salas.seed@gmail.com',
      score: 82, estado: 'ACTIVO',     tipo_apoyo: 'Empleo + Career Advice',
      initiated_by: 'sistema',         accepted_at: new Date('2026-05-05'),
      match_reasons: { carrera: true, sector: 'Banca y Finanzas', habilidades_comunes: ['Análisis financiero', 'Excel avanzado'], oferta_busqueda: 'empleo' },
    },
    {
      est: 'kevin.ulate.seed@ucr.ac.cr',   exal: 'sofia.montero.seed@gmail.com',
      score: 58, estado: 'SUGERIDO',   tipo_apoyo: 'Networking',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Marketing', nota: 'Gestión de proyectos en común' },
    },
    {
      est: 'natalia.rios.seed@ucr.ac.cr',  exal: 'roberto.castro.seed@gmail.com',
      score: 89, estado: 'CONTACTADO', tipo_apoyo: 'Mentoría + Career Advice',
      initiated_by: null,
      match_reasons: { carrera: true, sector: 'Servicios Jurídicos', habilidades_comunes: ['Redacción jurídica', 'Derecho corporativo'], oferta_busqueda: 'mentoria' },
    },
    {
      est: 'marcos.leon.seed@ucr.ac.cr',   exal: 'carlos.mora.seed@gmail.com',
      score: 90, estado: 'ACTIVO',     tipo_apoyo: 'Empleo + Pasantía',
      initiated_by: 'sistema',         accepted_at: new Date('2026-05-22'),
      match_reasons: { carrera: true, sector: 'Tecnología', habilidades_comunes: ['JavaScript', 'Python', 'Docker'], oferta_busqueda: 'pasantia' },
    },
    {
      est: 'marcos.leon.seed@ucr.ac.cr',   exal: 'juan.fallas.seed@gmail.com',
      score: 28, estado: 'SUGERIDO',   tipo_apoyo: 'Networking',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Construcción', nota: 'Bajo score: áreas muy distintas' },
    },
    {
      est: 'camila.chaves.seed@ucr.ac.cr', exal: 'sofia.montero.seed@gmail.com',
      score: 76, estado: 'ACTIVO',     tipo_apoyo: 'Empleo + Mentoría',
      initiated_by: 'sistema',         accepted_at: new Date('2026-06-01'),
      match_reasons: { carrera: true, sector: 'Marketing y Comunicación', habilidades_comunes: ['Adobe Creative Suite', 'Estrategia de contenido'], oferta_busqueda: 'empleo' },
    },
    {
      est: 'camila.chaves.seed@ucr.ac.cr', exal: 'laura.vargas.seed@gmail.com',
      score: 42, estado: 'CERRADO',    tipo_apoyo: 'Networking',
      initiated_by: 'sistema',         closed_at: new Date('2026-05-01'),
      match_reasons: { carrera: false, sector: 'Manufactura', nota: 'Estudiante cerró la conexión' },
    },
    {
      est: 'ana.bermudez.seed@ucr.ac.cr',  exal: 'laura.vargas.seed@gmail.com',
      score: 33, estado: 'SUGERIDO',   tipo_apoyo: 'Networking',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Manufactura', nota: 'Bajo score' },
    },
    {
      est: 'natalia.rios.seed@ucr.ac.cr',  exal: 'diego.salas.seed@gmail.com',
      score: 51, estado: 'SUGERIDO',   tipo_apoyo: 'Networking',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Banca', nota: 'Derecho financiero como área de convergencia' },
    },
    {
      est: 'marcos.leon.seed@ucr.ac.cr',   exal: 'diego.salas.seed@gmail.com',
      score: 38, estado: 'SUGERIDO',   tipo_apoyo: 'Career Advice',
      initiated_by: 'sistema',
      match_reasons: { carrera: false, sector: 'Finanzas', nota: 'Bajo score' },
    },
  ];

  const matchIds = {};
  for (const m of MATCHES) {
    const estudiante_id  = I(m.est);
    const exalumno_id    = I(m.exal);
    // Para CONTACTADO iniciado por estudiante, initiated_by = UUID del estudiante
    const initiated_by   = m.initiated_by === null ? estudiante_id : m.initiated_by;

    const match = await prisma.match.upsert({
      where: { estudiante_id_exalumno_id: { estudiante_id, exalumno_id } },
      create: {
        estudiante_id, exalumno_id,
        score_match:   m.score,
        estado:        m.estado,
        tipo_apoyo:    m.tipo_apoyo,
        initiated_by,
        accepted_at:   m.accepted_at ?? null,
        closed_at:     m.closed_at   ?? null,
        match_reasons: m.match_reasons,
      },
      update: {
        score_match:   m.score,
        estado:        m.estado,
        tipo_apoyo:    m.tipo_apoyo,
        initiated_by,
        accepted_at:   m.accepted_at ?? null,
        closed_at:     m.closed_at   ?? null,
        match_reasons: m.match_reasons,
      },
    });

    const key = `${m.est}|${m.exal}`;
    matchIds[key] = match.id;
    const label = `${m.est.split('.')[0].padEnd(8)} ↔ ${m.exal.split('.')[0].padEnd(8)}`;
    console.log(`  ✓ ${label} [${m.estado.padEnd(10)} / score ${m.score}]`);
  }

  /* 5. Mensajes para matches ACTIVOS ─────────────────────────── */
  console.log('\n── Mensajes ────────────────────────────────────────────');
  const CONVS = [
    {
      key: 'pablo.araya.seed@ucr.ac.cr|carlos.mora.seed@gmail.com',
      msgs: [
        { s: 'carlos.mora.seed@gmail.com',    c: '¡Hola Pablo! Me alegra conectar. Vi tu proyecto de app de salud, suena muy interesante.' },
        { s: 'pablo.araya.seed@ucr.ac.cr',    c: 'Hola Carlos! Gracias. Estoy desarrollando en React Native para monitoreo preventivo. ¿Tienes experiencia en mobile?' },
        { s: 'carlos.mora.seed@gmail.com',    c: 'Sí, trabajé 3 años con React Native en TechCR. Te puedo ayudar con arquitectura y flujo de datos.' },
        { s: 'pablo.araya.seed@ucr.ac.cr',    c: '¡Excelente! ¿Cuándo podríamos tener una videollamada para revisarlo?' },
        { s: 'carlos.mora.seed@gmail.com',    c: 'Estoy disponible el jueves después de las 4pm. ¿Te funciona?' },
        { s: 'pablo.araya.seed@ucr.ac.cr',    c: 'Perfecto, el jueves a las 4:30pm me viene muy bien. ¡Muchas gracias Carlos!' },
      ],
    },
    {
      key: 'kevin.ulate.seed@ucr.ac.cr|diego.salas.seed@gmail.com',
      msgs: [
        { s: 'kevin.ulate.seed@ucr.ac.cr',    c: 'Buenos días Diego, gracias por aceptar la conexión. Estoy muy interesado en banca de inversión.' },
        { s: 'diego.salas.seed@gmail.com',    c: 'Hola Kevin! Con gusto te oriento. ¿En qué área de finanzas te estás especializando?' },
        { s: 'kevin.ulate.seed@ucr.ac.cr',    c: 'En finanzas cuantitativas. Mi tesis es sobre modelos de riesgo crediticio para PyMEs.' },
        { s: 'diego.salas.seed@gmail.com',    c: 'Excelente tema. En el BCR usamos modelos similares. ¿Ya conoces los fundamentos de regresión logística?' },
        { s: 'kevin.ulate.seed@ucr.ac.cr',    c: 'Sí, es exactamente lo que estoy usando. ¿Podría enviarte un borrador para que me des feedback?' },
        { s: 'diego.salas.seed@gmail.com',    c: 'Por supuesto. Mándame el borrador al correo. También tengo una apertura de practicante para enero.' },
      ],
    },
    {
      key: 'marcos.leon.seed@ucr.ac.cr|carlos.mora.seed@gmail.com',
      msgs: [
        { s: 'marcos.leon.seed@ucr.ac.cr',    c: 'Hola Carlos! Soy Marcos, estudiante de Computación. Me interesa el área de ciberseguridad.' },
        { s: 'carlos.mora.seed@gmail.com',    c: 'Hola Marcos! Yo me especializo en full-stack, pero he hecho análisis de vulnerabilidades. ¿Qué tipo de ciberseguridad te interesa?' },
        { s: 'marcos.leon.seed@ucr.ac.cr',    c: 'Análisis estático de código. Mi proyecto detecta vulnerabilidades en Python y JS.' },
        { s: 'carlos.mora.seed@gmail.com',    c: 'Interesante. Podrías integrar tu herramienta con pipelines CI/CD usando GitHub Actions.' },
        { s: 'marcos.leon.seed@ucr.ac.cr',    c: 'Exacto, estoy explorando eso. ¿Tienes algún recurso que recomiendas?' },
      ],
    },
    {
      key: 'camila.chaves.seed@ucr.ac.cr|sofia.montero.seed@gmail.com',
      msgs: [
        { s: 'sofia.montero.seed@gmail.com',  c: '¡Hola Camila! Vi tu proyecto de comunicación para emprendimientos sociales. Me parece muy valioso.' },
        { s: 'camila.chaves.seed@ucr.ac.cr',  c: '¡Gracias Sofía! Estoy creando un framework práctico. Tu agencia hace exactamente lo que me inspira.' },
        { s: 'sofia.montero.seed@gmail.com',  c: 'Qué bueno! ¿Ya tienes definidas las herramientas de medición de impacto?' },
        { s: 'camila.chaves.seed@ucr.ac.cr',  c: 'Todavía no. ¿Qué KPIs usarías tú para comunicación en una organización social?' },
        { s: 'sofia.montero.seed@gmail.com',  c: 'Engagement orgánico, alcance cualitativo y conversión a acciones concretas. Tengo templates que te puedo compartir.' },
        { s: 'camila.chaves.seed@ucr.ac.cr',  c: '¡Eso sería increíble! ¿Hay oportunidad de hacer mi práctica en la agencia?' },
        { s: 'sofia.montero.seed@gmail.com',  c: 'Sí, tenemos apertura para el segundo semestre. Coordinamos una reunión esta semana.' },
      ],
    },
  ];

  for (const conv of CONVS) {
    const matchId = matchIds[conv.key];
    if (!matchId) { console.log(`  ⚠  Match no encontrado: ${conv.key}`); continue; }
    await prisma.message.deleteMany({ where: { match_id: matchId } });
    for (const msg of conv.msgs) {
      await prisma.message.create({
        data: { match_id: matchId, sender_id: ids[msg.s], content: msg.c },
      });
    }
    const [est, exal] = conv.key.split('|');
    console.log(`  ✓ ${est.split('.')[0]} ↔ ${exal.split('.')[0]}: ${conv.msgs.length} mensajes`);
  }

  /* 6. Posiciones ─────────────────────────────────────────────── */
  console.log('\n── Posiciones ──────────────────────────────────────────');
  const POSICIONES = [
    {
      exalumno: 'carlos.mora.seed@gmail.com',
      data: {
        tipo: 'Pasantía', titulo: 'Pasante en Desarrollo de Software',
        modalidad: 'Híbrida', jornada: 'Tiempo completo', empresa: 'TechCR Solutions',
        fecha_limite: new Date('2026-08-31'), estado: 'Abierta',
        descripcion: 'Buscamos un pasante apasionado por el desarrollo móvil y web para unirse a nuestro equipo de ingeniería trabajando en proyectos reales.',
        responsabilidades: 'Desarrollo de features en React Native y React.js. Participación en code reviews. Documentación técnica.',
        horario: 'Lunes a viernes, 8am-5pm con flexibilidad remota',
        beneficios: ['Beca ₡350,000/mes', 'Capacitaciones AWS', 'Ambiente tech moderno'],
        nivel_grado_minimo: 'Estudiante avanzado', area_estudio: 'Computación e Informática o afín',
        hard_skills: ['JavaScript', 'React Native', 'Git', 'REST APIs'],
        idiomas_requeridos: [{ idioma: 'Inglés', nivel: 'Intermedio' }],
        soft_skills: ['Trabajo en equipo', 'Comunicación', 'Proactividad'],
      },
    },
    {
      exalumno: 'diego.salas.seed@gmail.com',
      data: {
        tipo: 'Empleo', titulo: 'Analista Financiero Junior',
        modalidad: 'Presencial', jornada: 'Tiempo completo', empresa: 'Banco de Costa Rica',
        fecha_limite: new Date('2026-07-31'), estado: 'Abierta',
        descripcion: 'El Banco de Costa Rica busca analista financiero junior para la Dirección de Inversiones. Excelente oportunidad de crecimiento en el sector bancario público.',
        responsabilidades: 'Análisis de portafolios. Elaboración de reportes financieros. Modelado de riesgo crediticio.',
        horario: 'Lunes a viernes, 8am-4:30pm',
        beneficios: ['Salario competitivo', 'Seguro médico', 'Estabilidad laboral', 'Bloomberg'],
        nivel_grado_minimo: 'Bachillerato en proceso o egresado', area_estudio: 'Administración, Economía o Finanzas',
        hard_skills: ['Excel avanzado', 'R o Python', 'Análisis financiero'],
        idiomas_requeridos: [{ idioma: 'Inglés', nivel: 'Intermedio' }],
        soft_skills: ['Atención al detalle', 'Pensamiento analítico', 'Responsabilidad'],
      },
    },
    {
      exalumno: 'sofia.montero.seed@gmail.com',
      data: {
        tipo: 'Pasantía', titulo: 'Asistente de Marketing Digital',
        modalidad: 'Híbrida', jornada: 'Medio tiempo', empresa: 'Agencia Creativa Voz CR',
        fecha_limite: new Date('2026-09-15'), estado: 'Abierta',
        descripcion: 'Voz CR busca asistente de marketing digital creativo/a. Trabajarás directamente con la directora en campañas para clientes reales.',
        responsabilidades: 'Gestión de redes sociales. Creación de contenido. Análisis de métricas. Apoyo en pauta digital.',
        horario: 'Lunes a viernes, 4 horas/día flexible',
        beneficios: ['Beca ₡200,000/mes', 'Portafolio profesional real', 'Ambiente creativo'],
        nivel_grado_minimo: 'Estudiante de tercer año en adelante', area_estudio: 'Comunicación, Marketing o Diseño',
        hard_skills: ['Redes sociales', 'Canva o Adobe', 'Redacción', 'Google Analytics básico'],
        idiomas_requeridos: [{ idioma: 'Inglés', nivel: 'Básico' }],
        soft_skills: ['Creatividad', 'Puntualidad', 'Atención al detalle'],
      },
    },
    {
      exalumno: 'juan.fallas.seed@gmail.com',
      data: {
        tipo: 'Pasantía', titulo: 'Pasante en Ingeniería de Proyectos',
        modalidad: 'Presencial', jornada: 'Tiempo completo', empresa: 'Constructora Fallas & Quirós',
        fecha_limite: new Date('2026-08-15'), estado: 'Abierta',
        descripcion: 'Buscamos pasante de Ingeniería Civil para apoyar en proyectos de infraestructura activos en la GAM.',
        responsabilidades: 'Apoyo en diseño estructural. Visitas de obra. Elaboración de memorias de cálculo. Control de planos.',
        horario: 'Lunes a viernes, 7am-4pm',
        beneficios: ['Beca ₡300,000/mes', 'Transporte a sitios de obra', 'Experiencia en proyectos reales'],
        nivel_grado_minimo: 'Cuarto o quinto año', area_estudio: 'Ingeniería Civil',
        hard_skills: ['AutoCAD', 'SAP2000 básico', 'MS Project'],
        idiomas_requeridos: [{ idioma: 'Inglés', nivel: 'Básico' }],
        soft_skills: ['Responsabilidad', 'Trabajo en campo', 'Trabajo en equipo'],
      },
    },
  ];

  const posIds = {};
  for (const p of POSICIONES) {
    const existing = await prisma.posicion.findFirst({
      where: { exalumno_id: I(p.exalumno), titulo: p.data.titulo },
    });
    const posicion = existing
      ? await prisma.posicion.update({ where: { id: existing.id }, data: { exalumno_id: I(p.exalumno), ...p.data } })
      : await prisma.posicion.create({ data: { exalumno_id: I(p.exalumno), ...p.data } });
    posIds[p.data.titulo] = posicion.id;
    console.log(`  ✓ "${p.data.titulo}" (${p.data.empresa})`);
  }

  /* 7. Aplicaciones ───────────────────────────────────────────── */
  console.log('\n── Aplicaciones ────────────────────────────────────────');
  const APLICACIONES = [
    { est: 'pablo.araya.seed@ucr.ac.cr',    pos: 'Pasante en Desarrollo de Software',  estado: 'ENVIADA' },
    { est: 'marcos.leon.seed@ucr.ac.cr',    pos: 'Pasante en Desarrollo de Software',  estado: 'ENVIADA' },
    { est: 'kevin.ulate.seed@ucr.ac.cr',    pos: 'Analista Financiero Junior',          estado: 'SELECCIONADO' },
    { est: 'natalia.rios.seed@ucr.ac.cr',   pos: 'Analista Financiero Junior',          estado: 'DESCARTADO' },
    { est: 'camila.chaves.seed@ucr.ac.cr',  pos: 'Asistente de Marketing Digital',      estado: 'ENVIADA' },
  ];

  for (const a of APLICACIONES) {
    const posId = posIds[a.pos];
    if (!posId) continue;
    const existing = await prisma.aplicacion.findFirst({
      where: { posicion_id: posId, estudiante_id: I(a.est) },
    });
    if (existing) {
      await prisma.aplicacion.update({ where: { id: existing.id }, data: { estado: a.estado } });
    } else {
      await prisma.aplicacion.create({
        data: { posicion_id: posId, estudiante_id: I(a.est), estado: a.estado },
      });
    }
    console.log(`  ✓ ${a.est.split('.')[0].padEnd(10)} → "${a.pos.substring(0, 35)}…" [${a.estado}]`);
  }

  /* 8. Donaciones ─────────────────────────────────────────────── */
  console.log('\n── Donaciones ──────────────────────────────────────────');
  const DONACIONES = [
    { exal: 'carlos.mora.seed@gmail.com',    est: 'ana.bermudez.seed@ucr.ac.cr',
      monto: 50000, destino: 'Proyecto de investigación en biodiversidad',
      moneda: 'CRC', metodo_pago: 'SINPE Móvil', estado: 'CONFIRMADA' },
    { exal: 'diego.salas.seed@gmail.com',    est: 'pablo.araya.seed@ucr.ac.cr',
      monto: 30000, destino: 'Desarrollo de app móvil de salud',
      moneda: 'CRC', metodo_pago: 'Transferencia bancaria', estado: 'PENDIENTE' },
    { exal: 'andrea.jimenez.seed@gmail.com', est: 'ana.bermudez.seed@ucr.ac.cr',
      monto: 75000, destino: 'Equipamiento para trabajo de campo',
      moneda: 'CRC', metodo_pago: 'SINPE Móvil', estado: 'CONFIRMADA' },
    { exal: 'roberto.castro.seed@gmail.com', est: 'natalia.rios.seed@ucr.ac.cr',
      monto: 20000, destino: 'Acceso a bases de datos jurídicas internacionales',
      moneda: 'CRC', metodo_pago: 'SINPE Móvil', estado: 'PENDIENTE' },
  ];

  for (const d of DONACIONES) {
    const existing = await prisma.donacion.findFirst({
      where: { exalumno_id: I(d.exal), proyecto_estudiante_id: I(d.est) },
    });
    if (!existing) {
      await prisma.donacion.create({
        data: {
          exalumno_id: I(d.exal), proyecto_estudiante_id: I(d.est),
          monto: d.monto, destino: d.destino, moneda: d.moneda,
          metodo_pago: d.metodo_pago, estado: d.estado,
        },
      });
    }
    console.log(`  ✓ ${d.exal.split('.')[0].padEnd(10)} → ${d.est.split('.')[0].padEnd(10)} ₡${d.monto.toLocaleString()} [${d.estado}]`);
  }

  /* ── Resumen final ───────────────────────────────────────────── */
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         ✅  SEED COMPLETADO — USUARIOS DE PRUEBA             ║
║                 🔑  Contraseña: A12345678                     ║
╠══════════════════════════════════════════════════════════════╣
║  ADMIN                                                        ║
║    admin.test@ucr.ac.cr            María Rodríguez            ║
╠══════════════════════════════════════════════════════════════╣
║  EXALUMNOS                                                    ║
║    carlos.mora.seed@gmail.com      Carlos Mora  (Tech)        ║
║    laura.vargas.seed@gmail.com     Laura Vargas (Industrial)  ║
║    diego.salas.seed@gmail.com      Diego Salas  (Finanzas)    ║
║    andrea.jimenez.seed@gmail.com   Andrea Jiménez (Biología)  ║
║    roberto.castro.seed@gmail.com   Roberto Castro (Derecho)   ║
║    valeria.brenes.seed@gmail.com   Valeria Brenes (Salud)     ║
║    juan.fallas.seed@gmail.com      Juan Fallas  (Civil)       ║
║    sofia.montero.seed@gmail.com    Sofía Montero (Marketing)  ║
╠══════════════════════════════════════════════════════════════╣
║  ESTUDIANTES                                                  ║
║    pablo.araya.seed@ucr.ac.cr      Pablo Araya  (Computación) ║
║    ana.bermudez.seed@ucr.ac.cr     Ana Bermúdez (Biología)    ║
║    kevin.ulate.seed@ucr.ac.cr      Kevin Ulate  (Admin)       ║
║    natalia.rios.seed@ucr.ac.cr     Natalia Ríos (Derecho)     ║
║    marcos.leon.seed@ucr.ac.cr      Marcos León  (Computación) ║
║    camila.chaves.seed@ucr.ac.cr    Camila Chaves(Comunicación)║
╚══════════════════════════════════════════════════════════════╝
`);
}

main()
  .catch((e) => { console.error('\n❌ Error en seed:\n', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
