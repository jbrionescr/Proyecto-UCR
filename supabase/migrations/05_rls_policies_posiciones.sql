-- ================================================================
-- T-04: Políticas RLS — POSICIONES
-- ================================================================

-- SELECT: cualquier autenticado ve las posiciones activas; el exalumno
-- dueño y el admin ven todas (incluyendo cubiertas/canceladas/vencidas)
-- Nota: el valor real de POSICIONES.estado es minúscula ("activa"), no
-- "ACTIVA" como en el ejemplo original del plan — ver T-07.
CREATE POLICY "Posiciones: activas para todos, todas para dueño y admin"
ON "POSICIONES" FOR SELECT
TO authenticated
USING (
  estado = 'activa'
  OR exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: solo el exalumno dueño puede crear una posición a su nombre
CREATE POLICY "Posiciones: solo el exalumno dueño crea"
ON "POSICIONES" FOR INSERT
TO authenticated
WITH CHECK (
  exalumno_id = auth.uid()
);

-- UPDATE: el exalumno dueño o un admin
CREATE POLICY "Posiciones: dueño o admin actualizan"
ON "POSICIONES" FOR UPDATE
TO authenticated
USING (
  exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- DELETE: solo admin
CREATE POLICY "Posiciones: solo admin elimina"
ON "POSICIONES" FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
