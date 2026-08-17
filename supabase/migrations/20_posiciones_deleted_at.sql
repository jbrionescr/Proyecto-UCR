-- ================================================================
-- T-19: soft delete para POSICIONES (admin puede eliminar sin
-- destruir el historial de aplicaciones asociadas).
-- ================================================================

ALTER TABLE "POSICIONES" ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
