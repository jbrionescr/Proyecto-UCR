-- ================================================================
-- Fix: NOTIFICATIONS.reference_id faltaba en la tabla real, pero el código
-- ya lo usaba (connections accept/reject/cancel, listado de notificaciones
-- para enlazar match_accepted -> /mensajes?matchId=...). Esos inserts
-- fallaban en producción por columna inexistente.
-- ================================================================

ALTER TABLE "NOTIFICATIONS" ADD COLUMN IF NOT EXISTS reference_id UUID;
