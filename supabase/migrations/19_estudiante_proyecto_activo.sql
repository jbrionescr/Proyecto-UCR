-- ================================================================
-- T-17: Preguntar si el proyecto finalizó al llegar al 100%
-- ================================================================

ALTER TABLE "ESTUDIANTES" ADD COLUMN IF NOT EXISTS proyecto_activo BOOLEAN NOT NULL DEFAULT true;
