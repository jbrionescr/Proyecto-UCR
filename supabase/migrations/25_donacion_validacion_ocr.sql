-- ================================================================
-- Verificación de comprobantes de donación con OCR (RF-07 / RF-08.2).
-- Se agregan los datos de la transferencia que declara el exalumno (para
-- cruzarlos contra el OCR) y el veredicto que devuelve el workflow de n8n.
-- El OCR PRE-VALIDA; la confirmación final la sigue haciendo el admin.
-- ================================================================

ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS fecha_transferencia TIMESTAMPTZ;
ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS numero_referencia   TEXT;

-- Veredicto del OCR (n8n). validacion_estado:
--   'pre_validada'    → verde: todo coincide
--   'discrepancia'    → rojo: algún campo crítico no coincide
--   'revision_manual' → amarillo: el OCR no pudo leer un campo
ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS validacion_estado    TEXT
  CHECK (validacion_estado IN ('pre_validada', 'discrepancia', 'revision_manual'));
ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS validacion_confianza INTEGER;
ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS validacion_detalle   JSONB;
ALTER TABLE "DONACIONES" ADD COLUMN IF NOT EXISTS validacion_at        TIMESTAMPTZ;
