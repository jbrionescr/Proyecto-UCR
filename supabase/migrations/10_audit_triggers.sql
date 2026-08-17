-- ================================================================
-- T-05: Triggers de auditoría en tablas críticas
-- ================================================================

-- DONACIONES: cambios de estado (pendiente → confirmada/rechazada)
DROP TRIGGER IF EXISTS audit_donaciones ON "DONACIONES";
CREATE TRIGGER audit_donaciones
AFTER UPDATE ON "DONACIONES"
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- APLICACIONES: cambios de estado del ciclo de vida
DROP TRIGGER IF EXISTS audit_aplicaciones ON "APLICACIONES";
CREATE TRIGGER audit_aplicaciones
AFTER UPDATE ON "APLICACIONES"
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- POSICIONES: creación, edición y cierre
DROP TRIGGER IF EXISTS audit_posiciones ON "POSICIONES";
CREATE TRIGGER audit_posiciones
AFTER INSERT OR UPDATE ON "POSICIONES"
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- MATCHES: confirmación/cierre (y cualquier cambio de estado)
DROP TRIGGER IF EXISTS audit_matches ON "MATCHES";
CREATE TRIGGER audit_matches
AFTER UPDATE ON "MATCHES"
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- USERS: cambios de status (suspensión, reactivación)
DROP TRIGGER IF EXISTS audit_users ON "USERS";
CREATE TRIGGER audit_users
AFTER UPDATE ON "USERS"
FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();
