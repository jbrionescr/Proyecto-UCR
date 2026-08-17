-- ============================================================
-- LIMPIEZA DE TABLAS LEGACY (PascalCase / Prisma antiguo)
-- Proyecto UCR - Exalumnos Platform
-- 
-- ESTAS TABLAS SON LEGACY: fueron creadas cuando el frontend
-- usaba Prisma directamente. El sistema ahora usa el backend
-- Node.js/Sequelize con las tablas en MAYÚSCULAS.
--
-- Las tablas ACTIVAS (NO tocar) son:
--   USERS, EXALUMNOS, ESTUDIANTES, MATCHES, MATCH_HISTORY,
--   CONNECTIONS, NOTIFICATIONS, POSICIONES, APLICACIONES,
--   DONACIONES, CURRICULUM, CURRICULUM_CERTIFICACIONES,
--   CURRICULUM_EXPERIENCIA, CURRICULUM_VERSIONES, REPORTES_PERFIL
-- ============================================================

-- Deshabilitar restricciones de FK temporalmente para facilitar el DROP
SET session_replication_role = replica;

-- ─── 1. Tablas dependientes primero (hijos antes que padres) ─────────────────

-- Tabla suelta de reportes (superada por REPORTES_PERFIL)
DROP TABLE IF EXISTS public."reports" CASCADE;

-- Tablas de NextAuth adapter (no se usan, NextAuth usa JWT strategy)
DROP TABLE IF EXISTS public."VerificationToken" CASCADE;
DROP TABLE IF EXISTS public."Session" CASCADE;
DROP TABLE IF EXISTS public."Account" CASCADE;

-- Versiones de CV (depende de Curriculum)
DROP TABLE IF EXISTS public."CurriculumVersion" CASCADE;

-- Aplicaciones (depende de Posicion, Estudiante, CurriculumVersion)
DROP TABLE IF EXISTS public."Aplicacion" CASCADE;

-- Curriculum (depende de Estudiante)
DROP TABLE IF EXISTS public."Curriculum" CASCADE;

-- Donaciones legacy (depende de Exalumno)
DROP TABLE IF EXISTS public."Donacion" CASCADE;

-- Posiciones legacy (depende de Exalumno)
DROP TABLE IF EXISTS public."Posicion" CASCADE;

-- Matches legacy (depende de Estudiante, Exalumno)
DROP TABLE IF EXISTS public."Match" CASCADE;

-- Reportes de perfil legacy (depende de User)
DROP TABLE IF EXISTS public."ReportePerfil" CASCADE;

-- ─── 2. Tablas de perfil legacy ──────────────────────────────────────────────

-- Exalumno legacy (depende de User)
DROP TABLE IF EXISTS public."Exalumno" CASCADE;

-- Estudiante legacy (depende de User)
DROP TABLE IF EXISTS public."Estudiante" CASCADE;

-- ─── 3. Tabla base User legacy ───────────────────────────────────────────────

-- User legacy (tabla base del sistema Prisma antiguo)
DROP TABLE IF EXISTS public."User" CASCADE;

-- ─── Re-habilitar restricciones de FK ────────────────────────────────────────
SET session_replication_role = DEFAULT;

-- ─── Verificación final ───────────────────────────────────────────────────────
-- Ejecuta esto para ver las tablas que quedan (deben ser solo las MAYÚSCULAS)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
