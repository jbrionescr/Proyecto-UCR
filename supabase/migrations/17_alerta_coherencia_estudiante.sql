-- ================================================================
-- T-16: Alertas de coherencia para estudiantes (RF-09.2)
-- ================================================================

ALTER TABLE "ESTUDIANTES" ADD COLUMN IF NOT EXISTS nivel_academico_actualizado_at TIMESTAMPTZ;
