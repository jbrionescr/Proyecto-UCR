-- ================================================================
-- "Retribuye a la UCR": un exalumno ofrece tiempo/experiencia (charla de
-- orientación, jurado evaluador de TFG, apoyo a proyectos de TFG, etc.).
-- El administrador acepta o rechaza la oferta y se notifica al exalumno.
-- ================================================================

CREATE TABLE IF NOT EXISTS "VOLUNTARIADOS_UCR" (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exalumno_id    UUID NOT NULL REFERENCES "EXALUMNOS"(user_id) ON DELETE CASCADE,
  tipo           TEXT NOT NULL,          -- clave del catálogo: orientacion | evaluacion | apoyo_proyecto
  titulo         TEXT NOT NULL,          -- copia del título mostrado al momento de ofrecerse
  categoria      TEXT,                   -- copia de la categoría (Orientación / Evaluación / Proyecto universitario)
  mensaje        TEXT,                   -- nota opcional del exalumno (disponibilidad, motivación, etc.)
  estado         TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA')),
  motivo_rechazo TEXT,
  revisado_por   UUID REFERENCES "USERS"(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS voluntariados_ucr_exalumno_idx ON "VOLUNTARIADOS_UCR" (exalumno_id);
CREATE INDEX IF NOT EXISTS voluntariados_ucr_estado_idx ON "VOLUNTARIADOS_UCR" (estado);

ALTER TABLE "VOLUNTARIADOS_UCR" ENABLE ROW LEVEL SECURITY;

-- SELECT: el propio exalumno que ofreció, o un admin
CREATE POLICY "Voluntariados: propio exalumno o admin leen"
ON "VOLUNTARIADOS_UCR" FOR SELECT
TO authenticated
USING (
  exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT/UPDATE: sin política para authenticated/anon — se gestionan desde
-- las rutas /api/voluntariados (creación) y /api/admin/voluntariados
-- (revisión), ambas vía service_role.
