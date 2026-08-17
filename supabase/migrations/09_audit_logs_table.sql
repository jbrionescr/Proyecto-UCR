-- ================================================================
-- T-05: Tabla AUDIT_LOGS + función genérica de auditoría (RNF-08)
-- ================================================================

CREATE TABLE IF NOT EXISTS "AUDIT_LOGS" (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla         TEXT NOT NULL,
  operacion     TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id   UUID NOT NULL,
  usuario_id    UUID,
  datos_antes   JSONB,
  datos_despues JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_tabla_registro_idx ON "AUDIT_LOGS" (tabla, registro_id);
CREATE INDEX IF NOT EXISTS audit_logs_usuario_idx ON "AUDIT_LOGS" (usuario_id);

-- Solo un admin puede leer los logs directamente (vía anon/authenticated).
-- El backend (service_role) los escribe siempre a través del trigger.
ALTER TABLE "AUDIT_LOGS" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs: solo admin lee"
ON "AUDIT_LOGS" FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- Sin políticas de INSERT/UPDATE/DELETE para anon/authenticated: los logs
-- son inmutables desde fuera de la base y solo los crea el trigger (que
-- corre con los privilegios del dueño de la función, ver SECURITY DEFINER).

-- ---------------------------------------------------------------
-- Función de trigger genérica: registra INSERT/UPDATE/DELETE de la
-- tabla en la que está instalada.
--
-- usuario_id se resuelve en dos pasos:
--   1) la variable de sesión `app.audit_user_id`, que la app puede fijar
--      con `SET LOCAL` antes de escribir (no usado hoy, listo a futuro).
--   2) si la fila tiene una columna `confirmado_por` (como DONACIONES),
--      se usa ese valor — así T-05 cumple con "usuario_id = admin" en
--      confirmar/rechazar donaciones sin tocar el endpoint existente.
--   3) si ninguna aplica, usuario_id queda NULL (ej. cambios del cron).
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_row JSONB;
BEGIN
  v_row := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;

  BEGIN
    v_usuario_id := NULLIF(current_setting('app.audit_user_id', true), '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
  END;

  IF v_usuario_id IS NULL THEN
    BEGIN
      v_usuario_id := (v_row->>'confirmado_por')::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_usuario_id := NULL;
    END;
  END IF;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO "AUDIT_LOGS" (tabla, operacion, registro_id, usuario_id, datos_despues)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, v_usuario_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO "AUDIT_LOGS" (tabla, operacion, registro_id, usuario_id, datos_antes, datos_despues)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, v_usuario_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO "AUDIT_LOGS" (tabla, operacion, registro_id, usuario_id, datos_antes)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, v_usuario_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
