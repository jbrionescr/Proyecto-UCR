# Plan Maestro — Plataforma Exalumnos UCR
> Checklist + análisis de trade-offs por bloque. Orden de ejecución recomendado de arriba hacia abajo.

---

## Bloque 0 — Fundación
> ⚠️ Hacer antes de todo. Sin esto, cada bloque siguiente acumula más deuda.

**Qué hacer**
- [ ] Decidir arquitectura única: quedarse con **Next.js + Prisma**, eliminar Express
- [ ] Migrar lógica de `auth.service.js` a Server Actions de Next.js
- [ ] Descomentar `verifyToken` en todas las rutas del backend (donaciones, matches, posiciones, reportes)
- [ ] Renombrar rutas según el spec (`/cv` → `/mi-curriculum`, etc.)
- [ ] Crear páginas faltantes del spec: `/mis-donaciones`, `/mis-posiciones`, `/posiciones/[id]`, `/mis-aplicaciones`, `/admin/matches`, `/admin/donaciones`, `/admin/reportes`

**✅ Pros**
- Elimina la deuda técnica más crítica de golpe
- Reduce el código a mantener a la mitad (un solo backend)
- Activa seguridad real en todos los endpoints

**❌ Contras**
- Cero valor visible para usuarios — semana de trabajo sin features nuevas
- Alto riesgo de romper funcionalidad existente si la migración no es cuidadosa
- Renombrar rutas puede romper links guardados o bookmarks

---

## Bloque 1 — RF-01: Autenticación *(semana 1)*
> Base de todo. Si falla, nada más importa.

**Qué hacer**
- [ ] Corregir bug del doble magic link
- [ ] Implementar `GET /auth/verify?token=` con expiración real de 24 horas
- [ ] Crear `POST /auth/reset-password` y su página frontend
- [ ] Conectar formulario de login al backend real (hoy no está conectado)
- [ ] Configurar TTL de sesión a 30 días de inactividad
- [ ] Agregar redirección por rol post-login: ESTUDIANTE → `/mis-matches`, EXALUMNO → `/directorio/estudiantes`, ADMIN → `/admin`

**✅ Pros**
- El bug del magic link doble confunde usuarios desde el primer contacto con la app — corregirlo mejora la primera impresión radicalmente
- La redirección por rol es UX de alto impacto con bajo costo de implementación

**❌ Contras**
- Cambiar el flujo de verificación puede bloquear temporalmente cuentas ya activas durante la migración
- Implementar reset-password correctamente (token de un solo uso, expiración) toma más tiempo del aparente

---

## Bloque 2+3 — RF-02/03/04/05: Perfiles + Directorios *(semana 1-2)*
> Sin perfiles completos, el matching no puede funcionar. Van juntos.

**Qué hacer**
- [ ] Agregar campos faltantes a los modelos: `linkedin_url`, `bio`, `carnet_ucr`, `sede`, `anio_ingreso`, `proyecto_titulo`, `habilidades`
- [ ] Implementar `GET /exalumnos/me`, `PUT /exalumnos/me`, `GET /estudiantes/me`, `PUT /estudiantes/me`
- [ ] Implementar cálculo de `perfil_completo` — activar `visible_en_directorio = false` si está incompleto
- [ ] Agregar indicador de progreso de perfil (% completado) en el frontend
- [ ] Conectar `/directorio/exalumnos` y `/directorio/estudiantes` al endpoint real (reemplazar mocks)
- [ ] Implementar filtros con AND lógico + búsqueda por nombre con debounce
- [ ] No exponer `beca_socioeconomica` ni `promedio_ponderado` en respuestas públicas

**✅ Pros**
- Perfiles ricos son el input del matching — a mejor perfil, mejor score
- El indicador de progreso motiva a completar los datos
- Los directorios son la primera funcionalidad con valor real visible para ambos roles

**❌ Contras**
- Migración de BD con muchos campos nuevos — riesgo en producción si hay datos existentes
- Los filtros con AND lógico pueden devolver 0 resultados si los datos son escasos — mala UX difícil de resolver
- Sin datos reales y perfiles completos, el directorio se ve vacío y pierde todo su valor

---

## Bloque 4 — RF-06: Matching *(semana 2-3)*
> El core diferenciador del producto.

**Qué hacer**
- [ ] Implementar `calcularScore` en el backend con 4 criterios: carrera (30 pts), intereses (30 pts), sector↔área (20 pts), tipo apoyo (20 pts) — *ya existe en frontend, mover al backend*
- [ ] Implementar `POST /matches/generar` al completar perfil
- [ ] Implementar `GET /matches/mis-matches` ordenado por score
- [ ] Implementar `POST /matches/:id/iniciar`, `aceptar`, `rechazar`
- [ ] Al aceptar: compartir emails de ambas partes + notificar admin
- [ ] Al rechazar: bloquear que el mismo exalumno vuelva a solicitar al mismo estudiante
- [ ] Ejecutar migración SQL pendiente: `ALTER TABLE "NOTIFICATIONS" ADD COLUMN IF NOT EXISTS reference_id UUID;`

**✅ Pros**
- Razón de existir de la plataforma — el algoritmo ya está implementado en el frontend, solo falta moverlo al backend
- Automatizar la generación de matches elimina trabajo manual del admin

**❌ Contras**
- Depende completamente de Bloque 2 — sin perfiles ricos, los scores serán 0 para la mayoría
- "Impedir re-solicitud al mismo estudiante" requiere lógica de estado persistente que puede complicarse con el tiempo
- El score para posiciones es diferente al score de mentorías — mantener dos algoritmos aumenta el riesgo de inconsistencias

---

## Bloque 5 — RF-07: Donaciones *(semana 3)*
> Módulo de ingresos. Sin pasarela de pagos real, el proceso es manual y no escala.

**Qué hacer**
- [ ] Agregar campos faltantes al modelo: `fecha_transferencia`, `numero_referencia`, `comprobante_url`, `motivo_rechazo`
- [ ] Implementar `POST /donaciones` (solo EXALUMNO), `POST /donaciones/:id/confirmar` y `rechazar` (solo ADMIN)
- [ ] Notificar al admin por email en <5 minutos tras recibir donación
- [ ] Recordatorio automático al admin si pasan 48 horas sin confirmación
- [ ] Configurar Supabase Storage para comprobantes con acceso por rol
- [ ] Crear formulario real de donación: destino, monto, moneda (CRC/USD), método (SINPE/IBAN), upload de comprobante
- [ ] Crear `/mis-donaciones` con historial y estado de cada donación

**✅ Pros**
- Único módulo de monetización directa — sin esto la plataforma no tiene impacto económico medible
- El flujo comprobante + confirmación admin da confianza y trazabilidad completa

**❌ Contras**
- Sin integración con pasarela de pagos (SINPE/Stripe), el proceso es completamente manual y propenso a fraude
- El flujo de aprobación manual es un cuello de botella — no escala si el volumen crece
- "Notificar en <5 minutos" requiere worker o webhook — infraestructura adicional

---

## Bloque 6 — RF-08: Panel Admin *(semana 3-4)*
> Control del negocio. Alto costo de desarrollo para audiencia pequeña (1-3 admins).

**Qué hacer**
- [ ] Completar `/api/admin/kpis` con métricas completas: total donado CRC+USD, proyectos apoyados, matches activos/cerrados, distribución por carrera y sede
- [ ] Implementar `GET /admin/matches` con filtros + flag de matches activos >6 meses
- [ ] Implementar `GET /admin/matches/export` (CSV)
- [ ] Crear `/admin/matches`, `/admin/donaciones`, `/admin/reportes`, `/admin/usuarios` en el frontend
- [ ] Implementar `DELETE /admin/usuarios/:id` para eliminación permanente (necesario para Ley 8968)

**✅ Pros**
- El flag de matches >6 meses permite intervención oportuna antes de que se vuelvan inactivos
- Exportar CSV democratiza el análisis sin depender del dashboard

**❌ Contras**
- Alto costo de desarrollo para una audiencia de 1-3 personas
- Los gráficos de reportes requieren librería adicional (Recharts) y tiempo de diseño
- Exportar PDF con estilos limpios es técnicamente complejo (puppeteer o similar)

---

## Bloque 7 — RF-09: Seguridad y Fraude *(paralelo con Bloque 4)*
> Transversal. Conviene activarlo pronto antes de que haya usuarios reales.

**Qué hacer**
- [ ] Auto-suspensión al llegar a 3 reportes + notificar admin por email
- [ ] Garantizar que el endpoint de reportes nunca expone `reportado_por`
- [ ] Implementar `POST /admin/usuarios/:id/reactivar`
- [ ] Validar formato de carné UCR (error 400 si no cumple)
- [ ] Agregar botón "Reportar perfil" en `/perfil/[id]` con modal

**✅ Pros**
- La auto-suspensión protege a usuarios sin requerir acción constante del admin
- El anonimato en reportes fomenta que se usen sin miedo a represalias

**❌ Contras**
- La auto-suspensión puede afectar usuarios legítimos si hay campañas de reportes maliciosos — necesita un techo o rate limiting
- Las validaciones de coherencia temporal (año de ingreso + 8 años) son heurísticas con falsos positivos inevitables

---

## Bloque 8 — RF-10: Posiciones de Trabajo *(semana 4-5)*
> Segundo módulo de valor después del matching. Abre la puerta a empleo real.

**Qué hacer**
- [ ] Agregar campos al modelo: `sector[]`, `habilidades_requeridas[]`, `responsabilidades[]`, `lugar`, `jornada`, `modalidad`
- [ ] Implementar `POST /posiciones` (solo EXALUMNO con `perfil_completo = true`)
- [ ] Implementar `GET /posiciones` con filtros: tipo, modalidad, sector, habilidades
- [ ] Implementar `POST /posiciones/:id/cubrir` + cron de cierre automático por `fecha_limite`
- [ ] Crear `/posiciones/nueva`, `/posiciones/[id]`, `/mis-posiciones`

**✅ Pros**
- Cierra el círculo de valor: no solo mentoría, también empleo real
- El botón "Adaptar mi CV" conecta directamente con el bloque de IA — flujo de alto valor

**❌ Contras**
- Solo exalumnos con perfil completo pueden publicar — requiere que Bloque 2 esté sólido
- El cron de cierre automático requiere infraestructura adicional (Supabase Edge Functions o similar)
- "Notificar aplicantes descartados anónimamente" es delicado — los emails deben ser empáticos y no desmotivar

---

## Bloque 9 — RF-11: Curriculum Vitae *(semana 5)*
> Habilita la IA del Bloque 10. Sin CV estructurado, la adaptación automática no tiene datos.

**Qué hacer**
- [ ] Completar modelos `Curriculum` y `CurriculumExperiencia` en Prisma con todas las secciones
- [ ] Implementar `GET /curriculum/mi-cv` y `PUT /curriculum/mi-cv` (autosave)
- [ ] Implementar `GET /curriculum/mi-cv/export-pdf`
- [ ] Reemplazar la maqueta actual con editor real de 4 secciones (académica, experiencia, habilidades, certificaciones)
- [ ] Agregar indicador de completitud por sección + autosave cada 30 segundos
- [ ] Validar: máximo 5 bullets por entrada, máximo 120 caracteres por bullet

**✅ Pros**
- El autosave previene pérdida de datos — UX de alta percepción de calidad
- Exportar PDF da un entregable inmediato de valor sin necesidad de IA

**❌ Contras**
- El editor de 4 secciones es el componente frontend más complejo del proyecto
- Generar PDF con estilos limpios en el servidor es técnicamente difícil (requiere puppeteer o biblioteca similar)
- Sin un CV bien lleno, la IA del Bloque 10 tiene poco material con qué trabajar — los bloques son muy interdependientes

---

## Bloque 10 — RF-12: IA de Adaptación de CV *(semana 5-6)*
> El feature más diferenciador del producto. Requiere Bloque 9 completo.

**Qué hacer**
- [ ] Instalar `@anthropic-ai/sdk` en el proyecto Next.js
- [ ] Crear Route Handler `/api/cv/adaptar` que cargue CV + posición, construya el prompt y llame a `claude-sonnet-4-6` con streaming
- [ ] El prompt debe incluir las 6 reglas del spec: verbos de acción, cuantificación, keywords ATS, eliminar relleno, relevancia, tono profesional
- [ ] Instrucción explícita: **la IA nunca debe inventar experiencias**
- [ ] Guardar sugerencias aceptadas en `curriculum_versiones` (máximo 10 por estudiante)
- [ ] Crear `/mi-curriculum/adaptar/[posicion_id]` con vista lado a lado (original vs. sugerido) y botones Aceptar / Editar / Descartar por sugerencia

**✅ Pros**
- Es el argumento de venta más fuerte de la plataforma — diferencia real frente a cualquier otra red de alumni
- El streaming hace que la respuesta parezca inmediata aunque tarde varios segundos

**❌ Contras**
- Costo por llamada a la API de Claude — si se usa masivamente puede volverse significativo
- Cadena de dependencias más larga del proyecto (necesita Bloques 1, 2, 8 y 9 completos)
- Limitar a 10 versiones requiere definir política de rotación (¿se elimina la más antigua? ¿la menos usada?)

---

## Bloque 11 — RF-13: Aplicaciones *(semana 6)*
> Cierra el flujo completo. Depende de los tres bloques anteriores.

**Qué hacer**
- [ ] Implementar `POST /aplicaciones` (solo ESTUDIANTE, con `posicion_id`, `curriculum_version_id` opcional, `mensaje_presentacion`)
- [ ] Implementar `DELETE /aplicaciones/:id` (solo mientras estado sea `enviada`)
- [ ] Implementar `PATCH /aplicaciones/:id/estado` (solo el exalumno dueño de la posición)
- [ ] Al seleccionar candidato: notificar al seleccionado, enviar descarte anónimo a los demás
- [ ] Crear `/mis-aplicaciones` con historial y estado de cada aplicación
- [ ] En `/posiciones/[id]`: implementar modal de aplicación (selector de versión de CV + mensaje)

**✅ Pros**
- Cierra el flujo completo: posición → adaptar CV → aplicar → ser seleccionado
- La unicidad de aplicación (constraint en Prisma) ya existe — no hay que crearla

**❌ Contras**
- Es el bloque con más dependencias — cualquier retraso en Bloques 8, 9 o 10 lo retrasa también
- Los emails de descarte son de alta sensibilidad — deben llegar al destinatario correcto sin ambigüedad
- El `curriculum_version_id` opcional complica la lógica de presentación: ¿qué ve el exalumno si el estudiante no eligió versión?

---

## Bloque 12 — RNF: No Funcionales *(continuo)*
> No son opcionales. Hacerlos al final garantiza que nunca se hacen.

**Qué hacer**
- [ ] Activar Row Level Security (RLS) en Supabase para tablas sensibles
- [ ] Agregar `aria-label` en botones sin texto visible + verificar contraste mínimo 4.5:1
- [ ] Cambiar textos en inglés: "Directory" → "Directorio", "CV Optimization" → "Optimización de CV", "Hiring" → "Contratación"
- [ ] Agregar checkbox de consentimiento en registro (Ley 8968 de Costa Rica)
- [ ] Crear página `/privacidad` vinculada desde el registro
- [ ] Crear tabla `audit_log`: `user_id`, `accion`, `entidad`, `entidad_id`, `timestamp`, `ip`
- [ ] Registrar en el log: confirmar donación, rechazar donación, suspender/reactivar usuario

**✅ Pros**
- RLS en Supabase es la capa de seguridad más sólida — protege datos incluso si hay bugs en el código
- El cumplimiento con Ley 8968 es una obligación legal en Costa Rica, no una opción
- La tabla `audit_log` es imprescindible para resolver disputas de donaciones

**❌ Contras**
- Son tareas transversales — si se dejan para el final, nunca se hacen
- Crear `/privacidad` con lenguaje legal correcto puede requerir asesoría jurídica fuera del equipo de dev
- La tabla `audit_log` crece rápido en producción — necesita política de retención desde el inicio

---

## Tabla de priorización

| Bloque | Valor usuario | Riesgo técnico | Dependencias | Semana |
|--------|:---:|:---:|---|:---:|
| 0 — Fundación | Ninguno | 🔴 Alto | — | Antes de todo |
| 1 — Auth | Medio | 🟡 Medio | Bloque 0 | 1 |
| 2+3 — Perfiles + Directorios | 🟢 Alto | 🟡 Medio | Bloque 1 | 1-2 |
| 4 — Matching | 🟢 Muy alto | 🟡 Medio | Bloques 2+3 | 2-3 |
| 7 — Seguridad | Medio | 🟢 Bajo | Bloque 2 | Paralelo con 4 |
| 5+6 — Donaciones + Admin | 🟢 Alto | 🔴 Alto | Bloques 2+4 | 3-4 |
| 8 — Posiciones | 🟢 Alto | 🔴 Alto | Bloque 2 | 4-5 |
| 9 — CV | 🟢 Alto | 🔴 Alto | Bloque 8 | 5 |
| 10 — IA de CV | 🟢 Muy alto | 🔴 Alto | Bloques 9+8+2+1 | 5-6 |
| 11 — Aplicaciones | 🟢 Alto | 🟡 Medio | Bloques 8+9+10 | 6 |
| 12 — RNF | Legal/calidad | 🟢 Bajo | Continuo | Todo el proceso |

**Estimación total:** 6 semanas con un desarrollador activo · 3-4 semanas con dos desarrolladores en paralelo.
