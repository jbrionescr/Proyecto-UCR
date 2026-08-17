-- ================================================================
-- T-14: Estado EN_REVISION en el ciclo de vida de APLICACIONES (RF-13)
--
-- "AplicacionEstado" es un enum NATIVO de Postgres (no una columna TEXT),
-- así que se usa ALTER TYPE en vez de un UPDATE de datos. RENAME VALUE
-- actualiza automáticamente todas las filas existentes sin tocarlas una
-- por una.
-- ================================================================

ALTER TYPE "AplicacionEstado" RENAME VALUE 'PENDIENTE' TO 'ENVIADA';
ALTER TYPE "AplicacionEstado" ADD VALUE IF NOT EXISTS 'EN_REVISION' AFTER 'ENVIADA';
