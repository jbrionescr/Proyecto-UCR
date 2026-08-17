-- ================================================================
-- Red social UCR (MVP): muro de publicaciones con "me gusta" y comentarios.
-- Publican y ven estudiantes y exalumnos; el admin puede moderar (eliminar
-- cualquier publicación o comentario).
-- ================================================================

CREATE TABLE IF NOT EXISTS "PUBLICACIONES" (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id    UUID NOT NULL REFERENCES "USERS"(id) ON DELETE CASCADE,
  contenido   TEXT NOT NULL,
  imagen_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "PUBLICACION_REACCIONES" (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES "PUBLICACIONES"(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES "USERS"(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (publicacion_id, user_id)
);

CREATE TABLE IF NOT EXISTS "PUBLICACION_COMENTARIOS" (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID NOT NULL REFERENCES "PUBLICACIONES"(id) ON DELETE CASCADE,
  autor_id       UUID NOT NULL REFERENCES "USERS"(id) ON DELETE CASCADE,
  contenido      TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS publicaciones_created_idx ON "PUBLICACIONES" (created_at DESC);
CREATE INDEX IF NOT EXISTS publicaciones_autor_idx ON "PUBLICACIONES" (autor_id);
CREATE INDEX IF NOT EXISTS reacciones_publicacion_idx ON "PUBLICACION_REACCIONES" (publicacion_id);
CREATE INDEX IF NOT EXISTS comentarios_publicacion_idx ON "PUBLICACION_COMENTARIOS" (publicacion_id);

ALTER TABLE "PUBLICACIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PUBLICACION_REACCIONES" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PUBLICACION_COMENTARIOS" ENABLE ROW LEVEL SECURITY;

-- SELECT: cualquier usuario autenticado ve el feed completo.
CREATE POLICY "Feed: publicaciones visibles a autenticados"
ON "PUBLICACIONES" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Feed: reacciones visibles a autenticados"
ON "PUBLICACION_REACCIONES" FOR SELECT TO authenticated USING (true);

CREATE POLICY "Feed: comentarios visibles a autenticados"
ON "PUBLICACION_COMENTARIOS" FOR SELECT TO authenticated USING (true);

-- INSERT/UPDATE/DELETE: sin política para authenticated/anon — se gestionan
-- desde actions/feed.actions.ts vía service_role, que valida autoría y rol.
