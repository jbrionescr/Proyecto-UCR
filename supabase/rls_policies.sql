-- ================================================================
-- Row Level Security (RLS) — Alumni UCR
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ================================================================

-- Habilitar RLS en la tabla Estudiante
ALTER TABLE "Estudiante" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- Política: Lectura pública de todos los campos EXCEPTO nivelBeca
-- (Supabase no permite column-level security directamente;
--  se controla a nivel de aplicación. Sin embargo, puedes crear
--  una VIEW que excluya la columna.)
-- ---------------------------------------------------------------

-- Vista segura que excluye nivelBeca (para consultas públicas)
CREATE OR REPLACE VIEW estudiante_publico AS
SELECT
  id,
  carrera,
  "avanceProyecto",
  "areaProyecto",
  "apoyoBuscado",
  "createdAt",
  "updatedAt"
FROM "Estudiante";

-- ---------------------------------------------------------------
-- Política 1: Permitir lectura del propio registro (incluyendo nivelBeca)
-- ---------------------------------------------------------------
CREATE POLICY "Estudiante puede leer su propio registro"
ON "Estudiante"
FOR SELECT
USING (
  auth.uid()::text = id
);

-- ---------------------------------------------------------------
-- Política 2: ADMIN puede leer todos los registros (incluyendo nivelBeca)
-- Requiere que el rol del usuario esté almacenado en user_metadata de Supabase Auth
-- ---------------------------------------------------------------
CREATE POLICY "Admin puede leer todos los estudiantes"
ON "Estudiante"
FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text = 'ADMIN'
);

-- ---------------------------------------------------------------
-- Política 3: Otros usuarios NO pueden leer nivelBeca
-- Se controla en la aplicación retornando la vista estudiante_publico
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- Habilitar RLS en tabla User también (para cuentaPausada)
-- ---------------------------------------------------------------
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Lectura pública de usuarios (sin datos sensibles)
CREATE POLICY "Lectura publica de usuarios"
ON "User"
FOR SELECT
USING (true);

-- Solo el propio usuario o ADMIN puede actualizar sus datos
CREATE POLICY "Usuario actualiza su propio perfil"
ON "User"
FOR UPDATE
USING (
  auth.uid()::text = id
  OR (auth.jwt() ->> 'role')::text = 'ADMIN'
);
