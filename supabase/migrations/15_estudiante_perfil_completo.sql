-- ================================================================
-- T-13: cálculo dinámico de perfil_completo
-- EXALUMNOS ya tenía esta columna; ESTUDIANTES no la tenía.
-- ================================================================

ALTER TABLE "ESTUDIANTES" ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN NOT NULL DEFAULT false;
