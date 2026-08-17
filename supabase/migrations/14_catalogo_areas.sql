-- ================================================================
-- T-11: Catálogo relacional de áreas de interés
-- ================================================================

CREATE TABLE IF NOT EXISTS "CATALOGO_AREAS" (
  codigo   TEXT PRIMARY KEY,
  etiqueta TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "USUARIOS_AREAS" (
  user_id     UUID NOT NULL REFERENCES "USERS"(id) ON DELETE CASCADE,
  area_codigo TEXT NOT NULL REFERENCES "CATALOGO_AREAS"(codigo) ON DELETE CASCADE,
  PRIMARY KEY (user_id, area_codigo)
);

CREATE INDEX IF NOT EXISTS usuarios_areas_area_idx ON "USUARIOS_AREAS" (area_codigo);

INSERT INTO "CATALOGO_AREAS" (codigo, etiqueta) VALUES
  ('tecnologia_software',       'Tecnología y Software'),
  ('salud_medicina',            'Salud y Medicina'),
  ('educacion_docencia',        'Educación y Docencia'),
  ('ingenieria_construccion',   'Ingeniería y Construcción'),
  ('negocios_finanzas',         'Negocios y Finanzas'),
  ('arte_diseno',               'Arte y Diseño'),
  ('ciencias_sociales',         'Ciencias Sociales'),
  ('ciencias_exactas',          'Ciencias Exactas y Naturales'),
  ('derecho_politica',          'Derecho y Política'),
  ('medio_ambiente',            'Medio Ambiente y Sostenibilidad'),
  ('comunicacion_periodismo',   'Comunicación y Periodismo'),
  ('turismo_hospitalidad',      'Turismo y Hospitalidad'),
  ('agricultura_agroindustria', 'Agricultura y Agroindustria'),
  ('investigacion_desarrollo',  'Investigación y Desarrollo')
ON CONFLICT (codigo) DO UPDATE SET etiqueta = EXCLUDED.etiqueta;

-- Tabla de referencia pública (catálogo fijo) — lectura abierta a autenticados
ALTER TABLE "CATALOGO_AREAS" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalogo areas: cualquier autenticado lee"
ON "CATALOGO_AREAS" FOR SELECT
TO authenticated
USING (true);

-- USUARIOS_AREAS: mismo criterio de acceso que el resto de datos de perfil
-- (ESTUDIANTES/EXALUMNOS), que hoy no tienen RLS propio — se deja consistente
-- y sin políticas por ahora; se puede revisar junto con esas tablas a futuro.
