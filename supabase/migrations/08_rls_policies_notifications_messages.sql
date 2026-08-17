-- ================================================================
-- T-04 (extensión): Políticas RLS — NOTIFICATIONS y MESSAGES
--
-- No estaban en el alcance original de T-04, pero ambas contienen datos
-- privados por usuario (notificaciones dirigidas, contenido de chats 1:1)
-- y quedaban expuestas al mismo riesgo de la anon key que el resto de
-- tablas. Igual que en los demás archivos, esto no afecta a la app
-- actual porque toda la lectura/escritura pasa por supabaseAdmin.
-- ================================================================

ALTER TABLE "NOTIFICATIONS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MESSAGES" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------

-- SELECT: solo el destinatario o un admin
CREATE POLICY "Notificaciones: solo el destinatario o admin leen"
ON "NOTIFICATIONS" FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- UPDATE: solo el destinatario (marcar como leída) o un admin
CREATE POLICY "Notificaciones: destinatario marca como leída o admin actualiza"
ON "NOTIFICATIONS" FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT/DELETE: sin política para authenticated/anon — las notificaciones
-- las genera el sistema (service_role) cuando ocurre un evento relevante.

-- ---------------------------------------------------------------
-- MESSAGES
-- ---------------------------------------------------------------

-- SELECT: solo las partes del match asociado, o un admin
CREATE POLICY "Mensajes: partes del match o admin leen"
ON "MESSAGES" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "MATCHES" m
    WHERE m.id = "MESSAGES".match_id
      AND (m.estudiante_id = auth.uid() OR m.exalumno_id = auth.uid())
  )
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT: solo una de las partes del match, y únicamente en nombre propio
CREATE POLICY "Mensajes: partes del match envían en su propio nombre"
ON "MESSAGES" FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM "MATCHES" m
    WHERE m.id = "MESSAGES".match_id
      AND (m.estudiante_id = auth.uid() OR m.exalumno_id = auth.uid())
  )
);

-- UPDATE: solo el autor del mensaje puede editarlo
CREATE POLICY "Mensajes: solo el autor edita el suyo"
ON "MESSAGES" FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

-- DELETE: solo el autor del mensaje, o un admin
CREATE POLICY "Mensajes: autor elimina el suyo o admin elimina cualquiera"
ON "MESSAGES" FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);
