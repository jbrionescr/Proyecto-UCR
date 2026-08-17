-- ================================================================
-- T-06: Trazabilidad de consentimiento de política de privacidad (Ley 8968)
-- ================================================================

ALTER TABLE "USERS" ADD COLUMN IF NOT EXISTS acepta_privacidad_at TIMESTAMPTZ;
