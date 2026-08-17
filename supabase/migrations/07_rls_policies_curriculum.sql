-- ================================================================
-- T-04: Políticas RLS — CURRICULUM, CURRICULUM_EXPERIENCIA,
--       CURRICULUM_CERTIFICACIONES, CURRICULUM_VERSIONES
--
-- Regla única para las 4 tablas: solo el estudiante dueño del currículum
-- puede leer, crear, modificar o borrar (SELECT/INSERT/UPDATE/DELETE = FOR ALL).
-- ================================================================

-- CURRICULUM tiene estudiante_id directo
CREATE POLICY "Curriculum: solo el estudiante dueño"
ON "CURRICULUM" FOR ALL
TO authenticated
USING (estudiante_id = auth.uid())
WITH CHECK (estudiante_id = auth.uid());

-- Las siguientes 3 tablas cuelgan de CURRICULUM vía curriculum_id
CREATE POLICY "Curriculum experiencia: solo el estudiante dueño"
ON "CURRICULUM_EXPERIENCIA" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_EXPERIENCIA".curriculum_id AND c.estudiante_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_EXPERIENCIA".curriculum_id AND c.estudiante_id = auth.uid()
  )
);

CREATE POLICY "Curriculum certificaciones: solo el estudiante dueño"
ON "CURRICULUM_CERTIFICACIONES" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_CERTIFICACIONES".curriculum_id AND c.estudiante_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_CERTIFICACIONES".curriculum_id AND c.estudiante_id = auth.uid()
  )
);

CREATE POLICY "Curriculum versiones: solo el estudiante dueño"
ON "CURRICULUM_VERSIONES" FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_VERSIONES".curriculum_id AND c.estudiante_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "CURRICULUM" c
    WHERE c.id = "CURRICULUM_VERSIONES".curriculum_id AND c.estudiante_id = auth.uid()
  )
);
