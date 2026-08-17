-- ================================================================
-- T-08: Evitar recordatorios duplicados de donaciones pendientes
-- ================================================================

ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS ultimo_recordatorio_at TIMESTAMPTZ;
