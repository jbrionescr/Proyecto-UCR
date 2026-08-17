-- ================================================================
-- Talleres: un exalumno propone un taller/capacitación para estudiantes
-- (y visible también para otros exalumnos). El administrador aprueba o
-- rechaza; una vez aprobado, los estudiantes pueden postularse hasta
-- llenar los cupos disponibles.
-- ================================================================

CREATE TABLE IF NOT EXISTS "TALLERES" (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exalumno_id    UUID NOT NULL REFERENCES "EXALUMNOS"(user_id) ON DELETE CASCADE,
  titulo         TEXT NOT NULL,
  descripcion    TEXT NOT NULL,
  fecha_hora     TIMESTAMPTZ,
  cupos_totales  INTEGER NOT NULL DEFAULT 0 CHECK (cupos_totales >= 0),
  modalidad      TEXT NOT NULL DEFAULT 'ONLINE' CHECK (modalidad IN ('ONLINE', 'PRESENCIAL', 'HIBRIDO')),
  estado         TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO')),
  motivo_rechazo TEXT,
  revisado_por   UUID REFERENCES "USERS"(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TALLER_INSCRIPCIONES" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  taller_id     UUID NOT NULL REFERENCES "TALLERES"(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES "USERS"(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (taller_id, estudiante_id)
);

CREATE INDEX IF NOT EXISTS talleres_exalumno_idx ON "TALLERES" (exalumno_id);
CREATE INDEX IF NOT EXISTS talleres_estado_idx ON "TALLERES" (estado);
CREATE INDEX IF NOT EXISTS taller_inscripciones_taller_idx ON "TALLER_INSCRIPCIONES" (taller_id);

ALTER TABLE "TALLERES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TALLER_INSCRIPCIONES" ENABLE ROW LEVEL SECURITY;

-- SELECT en TALLERES: cualquier usuario autenticado ve los aprobados;
-- el creador y el admin ven también los suyos en cualquier estado.
CREATE POLICY "Talleres: aprobados visibles a todos, propios y admin ven todo"
ON "TALLERES" FOR SELECT
TO authenticated
USING (
  estado = 'APROBADO'
  OR exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- SELECT en inscripciones: el propio estudiante inscrito, el exalumno
-- dueño del taller, o un admin.
CREATE POLICY "Inscripciones: propio estudiante, dueño del taller o admin"
ON "TALLER_INSCRIPCIONES" FOR SELECT
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "TALLERES" t WHERE t.id = taller_id AND t.exalumno_id = auth.uid())
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT/UPDATE: sin política para authenticated/anon — se gestionan desde
-- /api/talleres, /api/admin/talleres y las acciones de postulación, todas
-- vía service_role.
