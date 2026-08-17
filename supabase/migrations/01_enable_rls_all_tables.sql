-- ================================================================
-- T-04: Habilitar Row Level Security en tablas críticas
-- Ejecutar en: Supabase Dashboard > SQL Editor (o conexión directa a Postgres)
--
-- Contexto: toda la app (rutas /api/**/route.ts y Server Actions) usa
-- exclusivamente el cliente `supabaseAdmin` (SUPABASE_SERVICE_KEY), que
-- Supabase excluye de RLS por defecto. Estas políticas NO afectan el
-- funcionamiento actual de la app — solo bloquean el acceso directo con
-- la anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY), que viaja expuesta en el
-- bundle del navegador y hoy puede leer/escribir estas tablas sin ninguna
-- restricción a través de la API REST de Supabase.
-- ================================================================

ALTER TABLE "USERS" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DONACIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MATCHES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "REPORTES_PERFIL" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "POSICIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "APLICACIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CURRICULUM" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CURRICULUM_EXPERIENCIA" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CURRICULUM_CERTIFICACIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CURRICULUM_VERSIONES" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- USERS es transversal (referenciada por todas las políticas de
-- admin de los demás archivos), así que sus políticas viven aquí.
-- ---------------------------------------------------------------

-- SELECT: cualquier usuario autenticado puede leer perfiles básicos
-- (nombre, foto, tipo) — necesario para mostrar nombres/fotos en
-- matches, conexiones y donaciones. Los datos sensibles de cada rol
-- (nivel de beca, salario, etc.) viven en ESTUDIANTES/EXALUMNOS, no en USERS.
CREATE POLICY "Usuarios autenticados leen perfiles"
ON "USERS" FOR SELECT
TO authenticated
USING (true);

-- UPDATE: solo el propio usuario o un admin puede modificar la fila
CREATE POLICY "Usuario actualiza su perfil o admin actualiza cualquiera"
ON "USERS" FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM "USERS" u WHERE u.id = auth.uid() AND u.tipo = 'ADMIN')
);

-- INSERT/DELETE: sin política para anon/authenticated — solo el
-- service_role (registro vía Server Actions) puede crear o borrar usuarios.
