-- ================================================================
-- Comprobante de beca del estudiante (imagen o PDF subido a Cloudinary).
-- Visible solo para el propio estudiante, el administrador, y el
-- exalumno con quien ya tenga un match aceptado (ver capa de aplicación).
-- ================================================================

ALTER TABLE "ESTUDIANTES" ADD COLUMN IF NOT EXISTS comprobante_beca_url TEXT;
