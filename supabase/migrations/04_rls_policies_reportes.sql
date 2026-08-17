-- ================================================================
-- T-04: Políticas RLS — REPORTES_PERFIL
-- ================================================================

-- SELECT: solo admin (los reportes son sensibles; ni reportador ni
-- reportado deben poder leerlos directamente)
CREATE POLICY "Reportes: solo admin lee"
ON "REPORTES_PERFIL" FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: cualquier usuario autenticado puede reportar, siempre que el
-- reporte quede registrado a su propio nombre (no se puede reportar "como" otro)
CREATE POLICY "Reportes: cualquier autenticado puede reportar"
ON "REPORTES_PERFIL" FOR INSERT
TO authenticated
WITH CHECK (
  reportado_por = auth.uid()
);

-- UPDATE: solo admin (resolver el reporte)
CREATE POLICY "Reportes: solo admin actualiza"
ON "REPORTES_PERFIL" FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- DELETE: solo admin
CREATE POLICY "Reportes: solo admin elimina"
ON "REPORTES_PERFIL" FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
