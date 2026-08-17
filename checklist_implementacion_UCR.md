# Checklist de Implementación — Plataforma Exalumnos UCR
**Estrategia:** Backend primero, luego conectar frontend. Cada bloque es deployable independientemente.

---

## BLOQUE 0 — Fundación (hacer ANTES de todo)
> Sin esto, nada funciona correctamente. Son fixes de arquitectura, no features.

### 0-A: Unificar los dos backends
- [ ] Decidir: ¿se usa Express+Sequelize O Next.js+Prisma? (recomendado: quedarse con Next.js+Prisma y eliminar el backend Express)
- [ ] Migrar la lógica de `auth.service.js` (Express) a Server Actions de Next.js
- [ ] Sincronizar los modelos: nombres de tablas, enums, campos faltantes en Prisma
- [ ] Verificar que Prisma apunta a la misma base de datos que el backend Express usa hoy

### 0-B: Activar autenticación en todas las rutas
- [ ] Descomentar `verifyToken` en `donacion.routes.js`
- [ ] Descomentar `verifyToken` en `match.routes.js`
- [ ] Descomentar `verifyToken` en `reporteperfil.routes.js`
- [ ] Descomentar `verifyToken` en `posicion.routes.js`
- [ ] Agregar `requireRole` donde corresponde (donaciones = solo EXALUMNO, etc.)

### 0-C: Unificar rutas del frontend con el spec
- [ ] Renombrar `/cv` → `/mi-curriculum`
- [ ] Crear carpeta `/mi-curriculum/adaptar/[id]`
- [ ] Crear `/perfil/[id]` (perfil público)
- [ ] Crear `/mis-donaciones`
- [ ] Crear `/mis-posiciones` (lista)
- [ ] Crear `/posiciones/[id]` (detalle)
- [ ] Crear `/posiciones/nueva`
- [ ] Crear `/mis-aplicaciones`
- [ ] Crear `/admin/matches`, `/admin/donaciones`, `/admin/reportes`, `/admin/usuarios`

---

## BLOQUE 1 — RF-01: Autenticación (semana 1)
> Fundamento de la plataforma. Todo lo demás depende de que esto funcione bien.

### Backend
- [ ] Corregir bug del doble magic link (unificar en el token de Supabase)
- [ ] Implementar ruta `GET /auth/verify?token=...` que active la cuenta
- [ ] Implementar expiración real de 24 horas en el token de verificación
- [ ] Configurar sesión de Supabase con TTL de 30 días de inactividad
- [ ] Agregar lógica: si exalumno tiene `@ucr.ac.cr`, preguntar si ya se graduó
- [ ] Corregir: guardar campo `carrera_ucr` al registrar exalumno (se pierde hoy)
- [ ] Crear ruta `POST /auth/reset-password` para recibir el token y cambiar contraseña

### Frontend
- [ ] Crear página `/auth/verificar?token=...` que consuma el endpoint de verificación
- [ ] Crear página `/auth/reset-password?token=...` para establecer nueva contraseña
- [ ] Conectar formulario de login a NextAuth (hoy no está conectado al backend real)
- [ ] Proteger todas las páginas del directorio con `auth()` de NextAuth (redirect a login si no hay sesión)
- [ ] Agregar redirección por rol post-login (ESTUDIANTE → `/mis-matches`, EXALUMNO → `/directorio/estudiantes`, ADMIN → `/admin`)

---

## BLOQUE 2 — RF-02 y RF-03: Perfiles (semana 1-2)
> Sin perfiles completos, el matching no puede funcionar.

### Backend — Perfil Exalumno (RF-02)
- [ ] Agregar campos faltantes al modelo Sequelize: `linkedin_url`, `bio`
- [ ] Implementar `GET /exalumnos/me` — retorna perfil del usuario autenticado
- [ ] Implementar `PUT /exalumnos/me` — actualiza perfil
- [ ] Implementar cálculo de `perfil_completo` (todos los campos obligatorios llenos → `true`)
- [ ] Implementar `GET /exalumnos/:id/public` — perfil público (sin `monto_donacion`, solo datos visibles)

### Backend — Perfil Estudiante (RF-03)
- [ ] Agregar campos faltantes al modelo Sequelize y Prisma: `carnet_ucr`, `sede`, `anio_ingreso`, `nivel_academico`, `proyecto_titulo`, `proyecto_descripcion`, `proyecto_tipo`, `proyecto_necesidades`, `habilidades`, flags de búsqueda
- [ ] Validar formato de carné UCR al guardar
- [ ] Implementar `GET /estudiantes/me` y `PUT /estudiantes/me`
- [ ] Implementar lógica: si `proyecto_porcentaje_avance = 100` → responder con pregunta de finalización
- [ ] Implementar `visible_en_directorio = false` cuando perfil no está completo

### Frontend
- [ ] Conectar `/perfil/editar` al endpoint `GET /exalumnos/me` o `GET /estudiantes/me` según rol
- [ ] Implementar formulario de 5 secciones para exalumno (Sección 1–5 del spec)
- [ ] Implementar formulario de 6 secciones para estudiante (Sección 1–6 del spec)
- [ ] Agregar indicador de progreso de perfil (% completado)
- [ ] Crear página `/perfil/[id]` con vista pública (foto, carrera, tipo de apoyo, etc.)

---

## BLOQUE 3 — RF-04 y RF-05: Directorios (semana 2)
> Primeras páginas que verán los usuarios reales. Deben tener datos reales.

### Backend
- [ ] Implementar `GET /exalumnos` con filtros: `carrera`, `sector`, `areas_interes`, `tipo_apoyo`, `pais_ciudad`, búsqueda por nombre parcial
- [ ] Implementar `GET /estudiantes` con filtros: `carrera`, `area_tematica`, `areas_interes`, `tipo_apoyo`, `tipo_proyecto`, `sede`
- [ ] Ambos endpoints: excluir perfiles con `visible_en_directorio = false`
- [ ] Ambos endpoints: no exponer `beca_socioeconomica` ni `promedio_ponderado` en la respuesta
- [ ] Ambos endpoints: responder solo a usuarios autenticados

### Frontend
- [ ] Conectar `/directorio/exalumnos` al endpoint real (reemplazar mock)
- [ ] Conectar `/directorio/estudiantes` al endpoint real (reemplazar mock)
- [ ] Implementar lógica de filtros (AND lógico, como dice el spec)
- [ ] Implementar búsqueda por nombre con debounce
- [ ] Implementar paginación o scroll infinito

---

## BLOQUE 4 — RF-06: Matching (semana 2-3)
> El core diferenciador del producto.

### Backend
- [ ] Implementar función `calcularScore(exalumno, estudiante)` con los 4 criterios:
  - Misma carrera UCR → 30 pts
  - Áreas de interés en común (proporcional) → 30 pts
  - Sector del exalumno ↔ área temática del proyecto → 20 pts
  - Tipo de apoyo ofrecido ↔ buscado → 20 pts
- [ ] Implementar `POST /matches/generar` — genera sugerencias para un usuario al completar perfil
- [ ] Implementar `GET /matches/mis-matches` — retorna matches del usuario autenticado ordenados por score
- [ ] Implementar `POST /matches/:id/iniciar` — una parte inicia la conexión, notifica por email a la otra
- [ ] Implementar `POST /matches/:id/aceptar` y `POST /matches/:id/rechazar`
- [ ] Al aceptar: cambiar estado a `activo`, compartir emails de ambas partes
- [ ] Al rechazar: impedir que el mismo exalumno vuelva a solicitar al mismo estudiante
- [ ] Notificación por email al admin cuando un match pasa a `activo`
- [ ] Implementar score extendido para posiciones (RF extendido): carrera ↔ sector (35 pts), habilidades (35 pts), áreas (20 pts), tipo (10 pts)

### Frontend
- [ ] Conectar `/mis-matches` al endpoint real (reemplazar mock)
- [ ] Implementar botón "Solicitar conexión" conectado a `POST /matches/:id/iniciar`
- [ ] Implementar vista de notificaciones de match pendiente
- [ ] Mostrar posiciones en `/mis-matches` con score cuando aplica

---

## BLOQUE 5 — RF-07: Donaciones (semana 3)
> Módulo de ingresos. Requiere lógica de negocio completa.

### Backend
- [ ] Agregar campos faltantes al modelo: `fecha_transferencia`, `numero_referencia`, `mensaje_estudiante`, `motivo_rechazo`, `comprobante_url`
- [ ] Implementar `POST /donaciones` — solo EXALUMNO, validar todos los campos, guardar en estado `pendiente`
- [ ] Notificar al admin por email en menos de 5 minutos tras recibir donación
- [ ] Implementar `POST /donaciones/:id/confirmar` — solo ADMIN, cambia estado, notifica a donante y estudiante
- [ ] Implementar `POST /donaciones/:id/rechazar` — solo ADMIN, motivo obligatorio, notifica al donante
- [ ] Auditar cada acción: quién, cuándo, qué comprobante
- [ ] Job o trigger: si pasan 48 horas sin confirmación, enviar recordatorio al admin
- [ ] Implementar `GET /donaciones/mis-donaciones` — historial del exalumno autenticado
- [ ] Configurar Supabase Storage para comprobantes con acceso restringido por rol

### Frontend
- [ ] Crear formulario real de donación: destino (proyecto o fondo general), monto, moneda, método, fecha, referencia, comprobante (upload)
- [ ] Mostrar SINPE Móvil o IBAN según método seleccionado
- [ ] Crear página `/mis-donaciones` con historial y estado de cada donación
- [ ] En panel admin: agregar `/admin/donaciones` con cola, visor de comprobante, botones confirmar/rechazar

---

## BLOQUE 6 — RF-08: Panel Admin completo (semana 3-4)

### Backend
- [ ] Completar endpoint `/api/admin/kpis` con métricas del spec: total donado CRC+USD, proyectos apoyados, matches activos, matches cerrados exitosamente, distribución por carrera, por sede, donantes nuevos vs. recurrentes
- [ ] Implementar `GET /admin/matches` con filtros: carrera, tipo de apoyo, estado, rango de fechas
- [ ] Implementar `PATCH /admin/matches/:id` para actualizar estado y agregar notas internas
- [ ] Implementar `GET /admin/matches/export` (CSV)
- [ ] Alerta automática: matches activos >6 meses → flag en respuesta
- [ ] Implementar `GET /admin/usuarios` con posibilidad de suspender/activar cuentas
- [ ] Implementar `DELETE /admin/usuarios/:id` para eliminación permanente

### Frontend
- [ ] Conectar `/admin` al endpoint real de KPIs (reemplazar mock)
- [ ] Crear `/admin/matches` con tabla, filtros, exportar CSV
- [ ] Crear `/admin/donaciones` (ya descrito en Bloque 5)
- [ ] Crear `/admin/reportes` con gráficos (distribución por carrera, sede, donantes) — filtro por rango de fechas, exportar como PDF
- [ ] Crear `/admin/usuarios` con tabla y acciones de suspender/activar

---

## BLOQUE 7 — RF-09: Seguridad y Fraude (semana 4)

### Backend
- [ ] Implementar lógica de auto-suspensión: al crear un reporte, contar reportes del perfil → si llega a 3, `activo = false`, notificar admin por email
- [ ] Garantizar anonimato: el endpoint de reportes nunca expone `reportado_por` en respuestas públicas
- [ ] Implementar `POST /admin/usuarios/:id/reactivar` para que admin reactive perfiles suspendidos
- [ ] Validaciones de coherencia RF-09.2:
  - Si `anio_ingreso + 8 años < hoy` y nivel sigue igual → crear alerta en admin
  - Si carné no cumple formato UCR → error 400

### Frontend
- [ ] Agregar botón "Reportar perfil" en `/perfil/[id]` con modal (motivo predefinido + descripción opcional)
- [ ] Asegurar que perfiles suspendidos no aparecen en directorios ni en matches

---

## BLOQUE 8 — RF-10: Posiciones (semana 4-5)

### Backend
- [ ] Agregar campos faltantes al modelo Sequelize: `sector[]`, `habilidades_requeridas[]`, `descripcion_general`, `responsabilidades[]`, `contexto_equipo`, `lugar`, `jornada`, `modalidad`
- [ ] Implementar `POST /posiciones` — solo EXALUMNO con `perfil_completo = true`
- [ ] Implementar `GET /posiciones` con filtros: tipo, modalidad, sector, habilidades, jornada
- [ ] Implementar `PUT /posiciones/:id` — solo el exalumno dueño, mientras esté activa
- [ ] Implementar `POST /posiciones/:id/cubrir` — cambia estado, notifica aplicantes pendientes (descarte anónimo)
- [ ] Job/cron: cada día, cerrar posiciones cuya `fecha_limite` haya vencido
- [ ] Implementar `GET /posiciones/:id/aplicantes` — solo el exalumno dueño

### Frontend
- [ ] Crear `/posiciones/nueva` con formulario completo (todos los campos del spec)
- [ ] Crear `/posiciones/[id]` con detalle de la posición y botón "Aplicar" / "Adaptar mi CV"
- [ ] Crear `/mis-posiciones` con listado y estados
- [ ] Conectar `/posiciones` al endpoint real (reemplazar mock si aplica)
- [ ] Conectar `/mis-posiciones/[id]/aplicantes` al endpoint real (reemplazar mock)

---

## BLOQUE 9 — RF-11: Curriculum Vitae (semana 5)

### Backend
- [ ] Completar modelo `Curriculum` en Prisma con las 4 secciones completas
- [ ] Completar modelo `CurriculumExperiencia` con todos los campos del spec
- [ ] Implementar `GET /curriculum/mi-cv` — retorna CV del estudiante autenticado
- [ ] Implementar `PUT /curriculum/mi-cv` — actualiza CV (autosave)
- [ ] Validar: bullets máximo 5 por entrada, máximo 120 caracteres cada uno
- [ ] Implementar `GET /curriculum/mi-cv/export-pdf` — genera PDF del CV con formato limpio

### Frontend
- [ ] Reemplazar la maqueta de `/mi-curriculum` con un editor real de 4 secciones
- [ ] Sección 1: Información Académica (carrera, nivel, promedio, año ingreso, cursos, proyecto)
- [ ] Sección 2: Experiencia y Proyectos (tipo, rol, organización, fechas, bullets con límite de 120 chars)
- [ ] Sección 3: Habilidades e Idiomas (tags con nivel)
- [ ] Sección 4: Certificaciones y Logros
- [ ] Indicador de completitud por sección
- [ ] Botón "Exportar PDF" funcional
- [ ] Autosave cada 30 segundos

---

## BLOQUE 10 — RF-12: IA de Adaptación de CV (semana 5-6)
> Este es el más complejo. Requiere que RF-11 esté completo primero.

### Backend / API
- [ ] Instalar `@anthropic-ai/sdk` en el proyecto frontend (Next.js)
- [ ] Crear Server Action o Route Handler en `/api/cv/adaptar` que:
  1. Recibe `curriculum_id` y `posicion_id`
  2. Carga el CV del estudiante y los datos de la posición desde la BD
  3. Construye el prompt con el criterio de reclutador profesional (ver spec RF-12)
  4. Llama a `claude-sonnet-4-6` con streaming habilitado
  5. Retorna un stream de sugerencias estructuradas por sección
- [ ] Implementar el prompt del sistema con las 6 reglas del spec: verbos de acción, cuantificación, keywords ATS, eliminar relleno, relevancia, tono
- [ ] Guardar sugerencias en `curriculum_versiones` cuando el estudiante las acepta
- [ ] Validar: la IA nunca debe inventar experiencias — el prompt debe incluir instrucción explícita
- [ ] Limitar a 10 versiones guardadas por estudiante

### Frontend
- [ ] Crear `/mi-curriculum/adaptar/[posicion_id]` con vista lado a lado (CV original vs. sugerido)
- [ ] Implementar streaming: mostrar sugerencias conforme llegan (no esperar respuesta completa)
- [ ] Por cada sugerencia: botones "Aceptar" / "Editar y aceptar" / "Descartar"
- [ ] Al finalizar: guardar como "CV para [título del puesto]"
- [ ] En `/posiciones/[id]`: agregar botón "Adaptar mi CV a esta posición" que redirige a la ruta anterior

---

## BLOQUE 11 — RF-13: Aplicaciones (semana 6)
> Depende de que RF-10, RF-11 y RF-12 estén completos.

### Backend
- [ ] Implementar `POST /aplicaciones` — solo ESTUDIANTE, incluye `posicion_id`, `curriculum_version_id` (opcional), `mensaje_presentacion`
- [ ] Validar unicidad (no doble aplicación — constraint ya existe en Prisma)
- [ ] Notificar al exalumno por email cuando recibe una aplicación
- [ ] Implementar `DELETE /aplicaciones/:id` — solo mientras estado sea `enviada`
- [ ] Implementar `PATCH /aplicaciones/:id/estado` — solo el exalumno dueño de la posición
- [ ] Al seleccionar un candidato: notificar al seleccionado, descartar los demás (email anónimo)
- [ ] Implementar `GET /aplicaciones/mis-aplicaciones` — historial del estudiante autenticado

### Frontend
- [ ] En `/posiciones/[id]`: implementar modal de aplicación (selector CV + mensaje)
- [ ] Crear `/mis-aplicaciones` con historial y estado de cada aplicación
- [ ] Conectar `/mis-posiciones/[id]/aplicantes` al endpoint real con score de compatibilidad visible

---

## BLOQUE 12 — RNF: No Funcionales (continuo + semana 6)

### RNF-03 Seguridad (ya cubierto en Bloque 0-B, verificar)
- [ ] Confirmar que ningún endpoint sensible es accesible sin token
- [ ] Row Level Security (RLS) activado en Supabase para tablas de datos sensibles

### RNF-05 Accesibilidad
- [ ] Revisar todos los botones de acción: agregar `aria-label` donde no hay texto visible
- [ ] Verificar contraste de color en componentes de la UI (mínimo 4.5:1)
- [ ] Asegurar navegación por teclado en modales y formularios

### RNF-06 Idioma
- [ ] Cambiar textos en inglés a español: "Directory" → "Directorio", "CV Optimization" → "Optimización de CV", "AI Career Assistant" → "Asistente de CV con IA", "Hiring" → "Contratación"

### RNF-07 Privacidad (Ley 8968)
- [ ] Agregar checkbox de consentimiento en formularios de registro
- [ ] Crear página `/privacidad` con política de datos
- [ ] Vincular política de privacidad desde el registro

### RNF-08 Auditoría
- [ ] Crear tabla `audit_log` en la BD: `user_id`, `accion`, `entidad`, `entidad_id`, `timestamp`, `ip`
- [ ] Registrar en el log: confirmar donación, rechazar donación, suspender usuario, reactivar usuario

---

## Orden recomendado de ejecución

```
Bloque 0 (fixes críticos)
    ↓
Bloque 1 (auth)
    ↓
Bloques 2+3 (perfiles + directorios) — pueden ir en paralelo
    ↓
Bloque 4 (matching) — depende de perfiles
    ↓
Bloques 5+6+7 (donaciones + admin + fraude) — pueden ir en paralelo
    ↓
Bloque 8 (posiciones)
    ↓
Bloque 9 (CV) — depende de posiciones para el contexto de adaptación
    ↓
Bloque 10 (IA de CV) — depende de CV + posiciones
    ↓
Bloque 11 (aplicaciones) — depende de posiciones + CV
    ↓
Bloque 12 (RNF) — continuo durante todo el proceso
```

**Total estimado:** 6 semanas a ritmo de desarrollo activo, o 3-4 semanas con dos desarrolladores.
**Bloques para empezar hoy:** Bloque 0 (30 min de fixes) + Bloque 1 (auth completo).
