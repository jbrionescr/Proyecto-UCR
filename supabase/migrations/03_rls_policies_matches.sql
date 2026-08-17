-- ================================================================
-- T-04: Políticas RLS — MATCHES
-- ================================================================

-- SELECT: cualquiera de las dos partes del match, o un admin
CREATE POLICY "Matches: partes del match o admin leen"
ON "MATCHES" FOR SELECT
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: sin política para authenticated/anon — los matches se crean por
-- el algoritmo de matching o por /api/connections, ambos vía service_role.

-- UPDATE: cualquiera de las dos partes del match, o un admin
CREATE POLICY "Matches: partes del match o admin actualizan"
ON "MATCHES" FOR UPDATE
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- DELETE: solo admin
CREATE POLICY "Matches: solo admin elimina"
ON "MATCHES" FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
