-- ================================================================
-- T-04: Políticas RLS — APLICACIONES
-- ================================================================

-- SELECT: el estudiante dueño de la aplicación, el exalumno dueño de la
-- posición, o un admin
CREATE POLICY "Aplicaciones: estudiante, exalumno de la posición o admin leen"
ON "APLICACIONES" FOR SELECT
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "POSICIONES" p
    WHERE p.id = "APLICACIONES".posicion_id AND p.exalumno_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: solo el propio estudiante puede crear su aplicación
CREATE POLICY "Aplicaciones: solo el estudiante crea la suya"
ON "APLICACIONES" FOR INSERT
TO authenticated
WITH CHECK (
  estudiante_id = auth.uid()
);

-- UPDATE: el exalumno dueño de la posición (cambiar estado del ciclo de vida)
-- o el propio estudiante (ej. retirar su aplicación)
CREATE POLICY "Aplicaciones: exalumno de la posición o el estudiante actualizan"
ON "APLICACIONES" FOR UPDATE
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "POSICIONES" p
    WHERE p.id = "APLICACIONES".posicion_id AND p.exalumno_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- DELETE: el propio estudiante puede retirar su aplicación (ver T-15),
-- o un admin. (El plan original marca DELETE como "—", pero el endpoint
-- de retiro de aplicación usa DELETE, así que se habilita para el dueño.)
CREATE POLICY "Aplicaciones: el estudiante retira la suya o admin elimina"
ON "APLICACIONES" FOR DELETE
TO authenticated
USING (
  estudiante_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
