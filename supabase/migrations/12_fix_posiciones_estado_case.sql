-- ================================================================
-- Fix: la política de T-04 para POSICIONES comparaba estado = 'ACTIVA'
-- (mayúsculas), pero el valor real que usa la app es 'activa' (ver T-07).
-- Sin este fix, la política de SELECT nunca dejaba pasar posiciones
-- activas para authenticated/anon (solo dueño/admin las veían).
-- ================================================================

DROP POLICY IF EXISTS "Posiciones: activas para todos, todas para dueño y admin" ON "POSICIONES";

CREATE POLICY "Posiciones: activas para todos, todas para dueño y admin"
ON "POSICIONES" FOR SELECT
TO authenticated
USING (
  estado = 'activa'
  OR exalumno_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
