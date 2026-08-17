-- ============================================================
-- RF-06: Sistema de Matching - Campos y tabla de mensajes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 0. Agregar columnas faltantes a USERS (requeridas por Prisma)
ALTER TABLE "USERS"
  ADD COLUMN IF NOT EXISTS status       TEXT    NOT NULL DEFAULT 'ACTIVO',
  ADD COLUMN IF NOT EXISTS report_count INTEGER NOT NULL DEFAULT 0;

-- 1. Agregar columnas a MATCHES
ALTER TABLE "MATCHES"
  ADD COLUMN IF NOT EXISTS initiated_by TEXT NOT NULL DEFAULT 'sistema',
  ADD COLUMN IF NOT EXISTS rechazado_por_estudiante BOOLEAN NOT NULL DEFAULT false;

-- Actualizar matches existentes que vienen del algoritmo
UPDATE "MATCHES" SET initiated_by = 'sistema' WHERE initiated_by = 'sistema';

-- 2. Crear tabla MESSAGES para el chat
CREATE TABLE IF NOT EXISTS "MESSAGES" (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id      UUID        NOT NULL REFERENCES "MATCHES"(id) ON DELETE CASCADE,
  sender_id     UUID        NOT NULL REFERENCES "USERS"(id),
  content       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match_id   ON "MESSAGES"(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "MESSAGES"(created_at);

-- Verificación
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'MATCHES'
  AND column_name  IN ('initiated_by','rechazado_por_estudiante')
ORDER BY column_name;

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'MESSAGES';
