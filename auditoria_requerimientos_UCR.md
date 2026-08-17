# Auditoría de Requerimientos — Plataforma Exalumnos UCR
**Fecha de revisión:** Junio 2026  
**Repositorio analizado:** `Proyecto-UCR`  
**Leyenda:** ✅ Implementado | ⚠️ Parcial / Con problemas | ❌ No implementado

---

## Resumen Ejecutivo

| Módulo | Estado |
|---|---|
| RF-01 Registro y Autenticación | ⚠️ Parcial |
| RF-02 Perfil de Exalumno | ⚠️ Parcial |
| RF-03 Perfil de Estudiante | ⚠️ Parcial |
| RF-04 Directorio de Exalumnos | ⚠️ Parcial (mock) |
| RF-05 Directorio de Estudiantes | ⚠️ Parcial (mock) |
| RF-06 Sistema de Matching | ⚠️ Parcial (sin algoritmo) |
| RF-07 Donaciones | ⚠️ Parcial (sin lógica de negocio) |
| RF-08 Panel Administrativo | ⚠️ Parcial (básico) |
| RF-09 Seguridad y Fraude | ⚠️ Parcial (sin auto-suspensión) |
| RF-10 Publicación de Posiciones | ⚠️ Parcial (sin ciclo de vida) |
| RF-11 Curriculum Vitae | ⚠️ Parcial (mock/UI) |
| RF-12 IA de Adaptación de CV | ❌ No implementado |
| RF-13 Proceso de Aplicación | ⚠️ Parcial (mock) |
| **RNF** | ⚠️ Parcial |

---

## RF-01: Registro y Autenticación

### RF-01.1 — Registro de Estudiante ⚠️
**Lo que está hecho:**
- Validación de correo `@ucr.ac.cr` implementada en `auth.service.js` (función `isUCREmail`)
- Validación de contraseña (mínimo 8 chars, 1 mayúscula, 1 número) — implementada
- Envío de magic link vía Resend — configurado en `email.js`
- Página de registro de estudiante existe en `/registro/estudiante`
- Modelo de base de datos `Estudiante` creado

**Problemas / Faltantes:**
- **Bug crítico:** El servicio genera un magic link de Supabase Y adicionalmente envía uno propio con `sendMagicLink()`. Esto genera dos tokens distintos — solo uno es válido. Hay que unificar a uno solo.
- **La ruta `/auth/verificar`** (donde apunta el magic link en el email) **no existe** en el frontend. El frontend tiene `/verificar-correo` pero no `/auth/verificar`.
- **No hay verificación de expiración del token en 24 horas** a nivel de código propio (depende de Supabase, pero no está validado en el flujo custom).
- La página de frontend `/verificar-correo` no está conectada al backend.

### RF-01.2 — Registro de Exalumno ⚠️
**Lo que está hecho:**
- Permite cualquier dominio de correo
- Validaciones de nombre, contraseña y año de graduación presentes
- Perfil creado con estado inactivo (`activo: false`) pendiente de aprobación de admin
- Correo de notificación al exalumno enviado (`sendAlumniPendingEmail`)
- Página frontend en `/registro/exalumno` existe

**Problemas / Faltantes:**
- **El spec dice** que el exalumno se verifica por correo (autodeclaración + confirmación de correo). El sistema lo implementó como **aprobación manual de admin**, lo cual es más restrictivo que lo especificado.
- El campo `carrera_ucr` **no se persiste** en el modelo `Exalumno` en el registro (solo se guardan `escuela_facultad` y `anio_graduacion`). La carrera se pierde.
- El flujo especial "si el exalumno aún tiene correo `@ucr.ac.cr`, preguntar si ya se graduó" **no está implementado**.

### RF-01.3 — Autenticación General ⚠️
**Lo que está hecho:**
- Login con correo y contraseña (`auth.service.js`)
- Opción "Olvidé mi contraseña" con restablecimiento por correo
- Página `/forgot-password` en el frontend
- Redirección basada en rol disponible en middleware

**Problemas / Faltantes:**
- **Sesión expira tras 30 días de inactividad**: No implementado. El backend devuelve el token de Supabase sin configurar TTL de sesión personalizado.
- El **reset de contraseña apunta a `/auth/reset-password`** en el email pero esa ruta no existe en el frontend.

---

## RF-02: Perfil de Exalumno ⚠️

**Lo que está hecho:**
- Página de edición de perfil en `/perfil/editar` con componente `ProfileEditForm`
- Modelo `Exalumno` en Sequelize (backend) y en Prisma (frontend)
- Campos básicos presentes en ambos esquemas

**Problemas / Faltantes:**
- El modelo `Exalumno` en Sequelize **omite campos críticos** del spec:
  - `pais_ciudad` ✅ (backend tiene) | `linkedin_url` ❌ falta en modelo Sequelize | `bio` ❌
  - `ofrece_mentoria`, `horas_mes_mentoria`, `ofrece_empleo`, `ofrece_pasantia`, `ofrece_proyecto` — ✅ presentes
  - `monto_maximo_donacion`, `moneda_donacion` — ✅ presentes
- El modelo Prisma (frontend) tiene un campo `areasInteres: String[]` pero no modela las **14 áreas del catálogo** — es texto libre, no selector del catálogo predefinido.
- **Indicador de progreso de perfil** y lógica de `perfil_completo = true` existen como campo en el modelo pero no hay lógica que lo calcule.
- El **perfil público** (`/perfil/[id]`) **no existe** en el frontend. Solo existe `/perfil/editar`.
- No hay validación de que el URL de LinkedIn sea válido.

---

## RF-03: Perfil de Estudiante ⚠️

**Lo que está hecho:**
- Modelo `Estudiante` presente en Sequelize y Prisma
- Campos de proyecto de graduación en el modelo de Sequelize
- Campo `beca_socioeconomica` presente con CHECK constraint

**Problemas / Faltantes:**
- El modelo Prisma (frontend) es **muy simplificado**: solo tiene `carrera`, `nivelBeca`, `avanceProyecto`, `areaProyecto`, `apoyoBuscado`. Faltan: `carnet_ucr`, `sede`, `anio_ingreso`, `nivel_academico`, `proyecto_titulo`, `proyecto_descripcion`, `proyecto_tipo`, `proyecto_necesidades`, `habilidades`, `busca_financiamiento`, `busca_mentoria`, `busca_empleo`, `busca_pasantia`.
- No hay validación del formato del carné UCR.
- La lógica de "si avance = 100%, preguntar si finalizó" no está implementada.
- La opción de **marcar perfil como "pausado"** no existe en la UI ni en los modelos.

---

## RF-04: Directorio de Exalumnos ⚠️

**Lo que está hecho:**
- Página en `/directorio/exalumnos` existe con UI de filtros y tarjetas
- Filtros visibles en UI: carrera, industria, tipo de apoyo

**Problemas / Faltantes:**
- **Los datos son completamente estáticos/mock** — la página no llama a ningún API.
- Los filtros no funcionan (no hay lógica de filtrado conectada).
- No hay verificación de que el directorio requiere autenticación (no hay `auth()` ni middleware protector en la página).
- El **botón "Conectar"** no dispara ninguna acción real.
- No hay lógica de ordenamiento por score de match.

---

## RF-05: Directorio de Estudiantes ⚠️

**Lo que está hecho:**
- Página en `/directorio/estudiantes` existe con UI y filtros
- La tarjeta no muestra nivel de beca (correcto)

**Problemas / Faltantes:**
- Mismos problemas que RF-04: datos mock, sin conexión a API, sin autenticación requerida.
- Filtros visualmente presentes pero sin funcionalidad.

---

## RF-06: Sistema de Matching ⚠️

**Lo que está hecho:**
- Modelo `Match` existe en Sequelize y Prisma con campos: `exalumno_id`, `estudiante_id`, `score_match`, `estado`
- Página `/mis-matches` existe en el frontend con UI de tarjetas y scores

**Problemas / Faltantes:**
- **El algoritmo de puntuación (0–100 pts) NO está implementado.** El servicio `match.service.js` es un CRUD básico sin ninguna lógica de cálculo de score. No existe código que compute los 4 criterios del spec (carrera, áreas de interés, sector, tipo de apoyo).
- La página `/mis-matches` usa **datos completamente hardcodeados** (mock), no llama a ningún endpoint.
- No hay flujo de "aceptar/rechazar conexión" implementado en backend.
- El estado `cerrado` falta en el enum de Prisma (solo tiene `SUGERIDO`, `CONTACTADO`, `ACTIVO`).
- No hay notificaciones por email cuando se inicia o acepta una conexión.
- La regla "un exalumno rechazado no puede volver a solicitar" no está implementada.

---

## RF-07: Donaciones ⚠️

**Lo que está hecho:**
- Página `/donaciones` existe con UI diferenciada por rol (estudiante vs exalumno)
- Modelo `Donacion` en Sequelize y Prisma
- Subida de comprobante referenciada en el modelo
- Rutas de API CRUD para donaciones existen

**Problemas / Faltantes:**
- **El servicio de donaciones es CRUD puro** — sin lógica de negocio: no valida rol (solo exalumnos), no notifica al admin, no tiene SLA de 48 horas, no envía emails al confirmar/rechazar.
- **Las rutas están desprotegidas** — `verifyToken` está comentado en `donacion.routes.js`. Cualquiera puede crear donaciones.
- No existe el flujo completo: selección de proyecto → mostrar SINPE/IBAN → subir comprobante → notificación admin en 5 minutos → confirmación/rechazo con motivo.
- No existe `/mis-donaciones` (historial de donaciones del exalumno).
- El recordatorio automático a las 48 horas si el admin no confirma no está implementado.
- La página de donaciones del frontend usa componentes (`StudentProjectsList`, `MyApplicationsList`) que parecen mockeados.

---

## RF-08: Panel Administrativo ⚠️

**Lo que está hecho:**
- Página `/admin` existe con KPIs básicos (datos mock) y sección anti-fraude visual
- Endpoint `/api/admin/kpis` devuelve conteos reales desde Supabase
- Endpoint `/api/admin/alumni-pending` para aprobar exalumnos existe y funciona
- Middleware `requireRole('ADMINISTRADOR', 'ADMIN')` protege las rutas de admin

**Problemas / Faltantes:**
- Las métricas del dashboard en el frontend **son mock**, no consumen el endpoint `/api/admin/kpis`.
- **Faltan las sub-páginas del panel admin:**
  - `/admin/matches` — no existe
  - `/admin/donaciones` (cola de donaciones con confirmación/rechazo) — no existe
  - `/admin/reportes` (dashboard de impacto con gráficos) — no existe
  - `/admin/usuarios` — no existe
- El panel admin del spec incluye: exportar matches a CSV, alertas de matches activos >6 meses, visor de comprobantes, auditoría de acciones, gráficos por carrera/sede, donantes nuevos vs. recurrentes. Nada de esto está implementado.
- El endpoint de KPIs falla porque referencia tablas con nombres en mayúsculas (`"Estudiantes"`) pero los modelos Sequelize los definen como `'ESTUDIANTES'` — hay inconsistencia de nombres de tabla.

---

## RF-09: Seguridad y Gestión de Fraude ⚠️

**Lo que está hecho:**
- Modelo `ReportePerfil` / `reportes_perfil` existe en ambos esquemas
- El campo `reportes_recibidos` existe en el modelo `User` de Sequelize
- Rutas CRUD para reportes existen

**Problemas / Faltantes:**
- **Auto-suspensión tras 3 reportes NO está implementada.** El servicio `reporteperfil.service.js` es CRUD puro, no hay lógica que cuente reportes y suspenda automáticamente.
- Las rutas de reportes están **desprotegidas** (`verifyToken` comentado).
- El anonimato del reportador no está garantizado a nivel de API (el endpoint devuelve todos los datos incluyendo `reportado_por`).
- No hay notificación al admin cuando un perfil es suspendido automáticamente.
- Las validaciones de coherencia de RF-09.2 (año de ingreso + 8 años sin cambio, carné con formato inválido) no están implementadas.

---

## RF-10: Publicación de Posiciones ⚠️

**Lo que está hecho:**
- Modelo `Posicion` en Sequelize y Prisma con campos principales
- Rutas CRUD para posiciones existen
- Página `/posiciones` con listado existe
- Página `/mis-posiciones/[id]/aplicantes` existe (con datos mock)

**Problemas / Faltantes:**
- **El cierre automático de posiciones al vencer `fecha_limite`** no está implementado (no hay cron job ni trigger).
- Los campos `sector`, `habilidades_requeridas`, `descripcion_general`, `responsabilidades`, `lugar`, `jornada`, `modalidad` **faltan en el modelo Sequelize** (solo tiene campos básicos).
- No existe `/posiciones/[id]` (detalle de posición) en el frontend.
- No existe `/posiciones/nueva` (formulario para publicar posición).
- No existe `/mis-posiciones` (listado de posiciones del exalumno).
- Las rutas de posiciones están **desprotegidas** (`verifyToken` comentado).
- No hay validación de que solo exalumnos con perfil completo puedan publicar.
- La notificación a aplicantes cuando una posición se marca como "cubierta" no está implementada.

---

## RF-11: Curriculum Vitae ⚠️

**Lo que está hecho:**
- Página `/cv` existe con UI de vista lado a lado (original vs. sugerida por IA)
- Modelos `Curriculum`, `CurriculumExperiencia`, `CurriculumCertificacion`, `CurriculumVersion` existen en Sequelize
- Modelo `Curriculum` existe en Prisma con campo `datosBase: Json`
- Rutas CRUD para todas las entidades del CV existen

**Problemas / Faltantes:**
- La página `/cv` **muestra datos completamente hardcodeados** de "Mariana Rodríguez" — no es un editor funcional.
- El spec define el CV en **4 secciones** (Académica, Experiencia, Habilidades, Certificaciones). La UI actual muestra una maqueta visual, no un editor real de cada sección.
- El **botón "Descargar PDF"** no tiene funcionalidad implementada.
- La ruta correcta del spec es `/mi-curriculum`, no `/cv`.
- La ruta `/mi-curriculum/adaptar/[id]` no existe.
- El indicador de completitud por sección no está implementado.
- El límite de 120 caracteres por bullet no está enforced.

---

## RF-12: IA de Adaptación de CV ❌

**Lo que está hecho:**
- La UI en `/cv` muestra visualmente la estructura lado a lado (CV original vs. sugerido)
- El stack tecnológico define Claude API (`claude-sonnet-4-6`) y está en el `package.json` del spec

**Problemas / Faltantes:**
- **No hay integración con la API de Claude en ningún archivo del repositorio.** No se encontró ninguna llamada a `api.anthropic.com` ni uso del SDK de Anthropic.
- El prompt de sistema con criterios de reclutador profesional no está definido en ningún archivo.
- El streaming de respuestas no está implementado.
- La lógica de "aceptar / editar / descartar" sugerencias no funciona (UI hardcodeada).
- Las versiones adaptadas de CV no se guardan (la tabla `CurriculumVersion` existe pero no se usa para esto).
- El límite de 10 versiones simultáneas no está implementado.

---

## RF-13: Proceso de Aplicación ⚠️

**Lo que está hecho:**
- Modelo `Aplicacion` existe en Sequelize y Prisma con estados
- Rutas CRUD para aplicaciones existen
- Página de gestión de aplicantes `/mis-posiciones/[id]/aplicantes` existe con UI
- El constraint `UNIQUE (posicion_id, estudiante_id)` existe en Prisma (evita doble aplicación)

**Problemas / Faltantes:**
- La página de aplicantes usa **datos completamente mock** — no llama al API.
- No existe la página `/mis-aplicaciones` (historial del estudiante).
- El modal de aplicación (selector de CV + mensaje) no está conectado al backend.
- Las notificaciones por email al exalumno (nueva aplicación) y al estudiante (seleccionado/descartado) no están implementadas.
- Los estados de aplicación del spec son `enviada`, `en_revision`, `seleccionado`, `descartado` — el modelo Prisma los tiene como `PENDIENTE`, `SELECCIONADO`, `DESCARTADO` (falta `en_revision`).
- La regla "el estudiante puede retirar su aplicación mientras está en estado enviada" no está implementada.
- El score de compatibilidad (matching estudiante ↔ posición) del spec extendido no está implementado.

---

## Requerimientos No Funcionales

| ID | Requerimiento | Estado | Observaciones |
|---|---|---|---|
| RNF-01 | Páginas cargan < 3 segundos con 500 perfiles | ⚠️ Sin datos | Las páginas usan datos mock, no hay pruebas de carga real. El directorio no está paginado. |
| RNF-02 | Responsivo desde 375px | ✅ Parcial | UI construida con Tailwind CSS + shadcn/ui, clases responsive presentes. Sin pruebas de breakpoint real. |
| RNF-03 | Datos sensibles (beca, comprobantes) con acceso por rol | ❌ Crítico | Las rutas de backend tienen `verifyToken` **comentado**. Cualquier request sin autenticación puede leer y modificar donaciones, matches y reportes. |
| RNF-04 | 99% de uptime mensual | ⚠️ Sin verificar | Depende de Vercel + Supabase. No hay configuración de monitoring ni alertas. |
| RNF-05 | Cumplimiento WCAG 2.1 nivel AA | ⚠️ Parcial | shadcn/ui incluye ARIA básico. No hay pruebas formales de accesibilidad. Faltan `aria-label` en varios botones de acción. |
| RNF-06 | Plataforma en español | ⚠️ Parcial | Partes del frontend están en inglés: "Directory", "CV Optimization", "AI Career Assistant". El spec exige todo en español. |
| RNF-07 | Cumplimiento Ley 8968 (Datos Personales CR) | ❌ No implementado | No hay política de privacidad, no hay consentimiento explícito al registrarse, y los datos sensibles (beca socioeconómica) están potencialmente expuestos por las rutas desprotegidas. |
| RNF-08 | Auditoría de acciones del admin sobre donaciones | ❌ No implementado | El servicio de donaciones no registra quién hizo qué ni cuándo. No hay tabla de auditoría. |

---

## Resumen de Problemas Críticos (Prioridad Alta)

1. **Seguridad — Rutas desprotegidas:** Los endpoints de donaciones, matches, reportes y posiciones tienen el middleware de autenticación comentado. Cualquier persona puede acceder sin autenticación. Esto debe resolverse **antes** de cualquier prueba con usuarios reales.

2. **RF-12 sin implementar:** La integración con Claude API (adaptación de CV) está completamente ausente. Es la funcionalidad diferenciadora del producto y aparece como requisito de alta prioridad.

3. **Algoritmo de matching sin implementar:** El `match.service.js` es CRUD puro. El core del producto (el matching inteligente con score 0–100) no existe.

4. **Páginas frontend con datos mock:** La mayoría de páginas (`/mis-matches`, `/directorio/exalumnos`, `/directorio/estudiantes`, `/cv`, `/admin`, aplicantes) muestran datos hardcodeados y no consumen los APIs del backend.

5. **Inconsistencia de dos backends:** El proyecto tiene un backend en Express/Sequelize y un frontend con Prisma + NextAuth. Los modelos no están sincronizados: los nombres de tablas, campos y enums difieren entre sí, lo que causará errores al conectar frontend y backend.

6. **Rutas del spec faltantes en el frontend:** `/perfil/[id]`, `/admin/matches`, `/admin/donaciones`, `/admin/reportes`, `/admin/usuarios`, `/posiciones/[id]`, `/posiciones/nueva`, `/mis-posiciones`, `/mis-donaciones`, `/mi-curriculum`, `/mi-curriculum/adaptar/[id]`, `/mis-aplicaciones`.
