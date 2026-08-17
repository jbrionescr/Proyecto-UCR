-- ================================================================
-- T-04: Políticas RLS — DONACIONES
-- ================================================================

-- SELECT: el exalumno donante, el estudiante dueño del proyecto beneficiario,
-- o un admin. (El plan original solo menciona "exalumno dueño + admin", pero
-- /api/donaciones ya permite a ESTUDIANTE ver las donaciones a su proyecto
-- vía proyecto_estudiante_id, así que se incluye aquí para no dejar un hueco.)
CREATE POLICY "Donaciones: exalumno, estudiante beneficiario o admin leen"
ON "DONACIONES" FOR SELECT
TO authenticated
USING (
  exalumno_id = auth.uid()
  OR proyecto_estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: solo el propio exalumno autenticado puede registrar una donación a su nombre
CREATE POLICY "Donaciones: exalumno autenticado crea su propia donación"
ON "DONACIONES" FOR INSERT
TO authenticated
WITH CHECK (
  exalumno_id = auth.uid()
);

-- UPDATE: solo admin (confirmar/rechazar)
CREATE POLICY "Donaciones: solo admin actualiza"
ON "DONACIONES" FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- DELETE: solo admin
CREATE POLICY "Donaciones: solo admin elimina"
ON "DONACIONES" FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
