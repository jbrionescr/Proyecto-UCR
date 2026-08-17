# Plataforma Digital — Fundación de Exalumnos UCR

Plataforma que conecta a egresados de la Universidad de Costa Rica con estudiantes activos que enfrentan dificultades para financiar su proyecto de graduación o que cuentan con beca socioeconómica de nivel 4 o 5. Digitaliza el ciclo completo de la vinculación: verificación de identidad institucional, directorios cruzados, emparejamiento por afinidad, gestión de donaciones y herramientas administrativas para la Fundación.

El problema de fondo es de intermediación: existe voluntad de contribuir por parte de los exalumnos y existe la necesidad concreta del estudiantado, pero no había un canal que las hiciera visibles entre sí ni trazabilidad sobre lo aportado. La plataforma convierte esa intención dispersa en un flujo verificable.

---

## Stack Tecnológico

Arquitectura híbrida: una aplicación Next.js que concentra la interfaz y sus *Server Actions*, más una API Express independiente para los procesos de dominio y el envío transaccional de correo.

### Frontend

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 3 + Radix UI + shadcn/ui |
| Animación | Framer Motion, GSAP, Three.js |
| Formularios | React Hook Form + Zod |
| Gráficos | Recharts |
| Documentos | jsPDF, html2canvas, mammoth, pdf-parse |
| Autenticación | NextAuth v5 (beta) + Supabase Auth |
| ORM | Prisma 5 |

### Backend

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + Express 5 |
| Base de datos | PostgreSQL (Supabase) |
| Acceso a datos | Sequelize + cliente `pg` |
| Correo | Resend + Nodemailer + EmailJS |
| Arquitectura | Controladores → Servicios → Repositorios |

### Inteligencia Artificial

- **Groq (`@ai-sdk/groq`)** mediante el Vercel AI SDK: asistente de currículum y acompañamiento del proyecto de graduación.

---

## Funcionalidades Principales

### Verificación de identidad por correo institucional

El acceso de estudiantes se valida mediante *magic link* enviado a la dirección `@ucr.ac.cr`. La pertenencia a la universidad no se declara: se demuestra con el control del buzón institucional. Los exalumnos pasan además por un flujo de aprobación manual de la Fundación antes de que su cuenta quede activa.

### Directorios cruzados y emparejamiento

- **Directorio de exalumnos**: perfiles verificados con escuela, año de graduación y tipo de contribución ofrecida.
- **Directorio de proyectos**: iniciativas de graduación activas con su necesidad concreta.
- **Matches**: emparejamiento entre ambas partes con seguimiento de estado desde la propuesta hasta la concreción.

### Tipos de contribución

La plataforma modela cinco formas de aporte, no solo la económica: **mentoría**, **empleo formal**, **pasantía**, **proyecto empresarial** vinculado al trabajo de graduación y **donación económica**.

### Gestión de donaciones con validación por OCR

Soporte para SINPE Móvil y transferencia bancaria. El donante adjunta el comprobante y el sistema lo procesa automáticamente para extraer monto y referencia, evitando la conciliación manual contra el estado de cuenta.

### Herramientas para el estudiante

- **Constructor de currículum** con asistencia de IA: análisis, mejora y adaptación del CV a una posición concreta.
- **Aplicaciones a posiciones**: postulación a empleos y pasantías publicadas por exalumnos, con seguimiento de estado.
- **Talleres y Semana U**: inscripción a actividades formativas.
- **Voluntariados**: registro de participación.

### Feed social y mensajería

Espacio de publicaciones de la comunidad y mensajería directa entre exalumnos y estudiantes vinculados por un match.

### Panel administrativo

Aprobación de exalumnos, validación de comprobantes de beca, gestión de donaciones, moderación del feed y métricas agregadas de la operación.

---

## Desafíos Técnicos Resueltos

### Remediación de credenciales expuestas en el repositorio

La auditoría previa a la publicación detectó credenciales reales versionadas: la cadena completa de conexión a PostgreSQL en un script de diagnóstico (`usuario`, `contraseña` y host del *pooler* de Supabase) y una clave de API de Resend transcrita dentro de un documento de arquitectura. Se eliminaron los 25 scripts sueltos de depuración —volcados de usuarios, *seeds* con datos personales y pruebas de conexión— que no formaban parte de la aplicación ni estaban referenciados por ningún `package.json`, y se sustituyeron los valores del documento por marcadores de posición.

El aprendizaje que deja el hallazgo: un `.gitignore` protege el archivo `.env`, pero no impide que una credencial se filtre copiada dentro de un script auxiliar o pegada en documentación. La revisión debe cubrir **todo** el árbol versionado, no solo los archivos de configuración.

### Conexión a Postgres a través del pooler correcto

Supabase expone tres formas de conexión y elegir mal produce fallos que no apuntan a su causa. El host directo (`db.<ref>.supabase.co`) solo resuelve por IPv6 en el plan gratuito, lo que en una red IPv4 falla con un genérico *Can't reach database server*. La aplicación usa el **pooler en modo Transaction** (puerto 6543) para el tiempo de ejecución, mientras que las migraciones y la introspección de Prisma requieren el **pooler en modo Session** (puerto 5432), porque necesitan sentencias preparadas que el modo Transaction no mantiene entre consultas.

### Esquema versionado en SQL plano

Las 25 migraciones viven como archivos SQL numerados en `supabase/migrations/`, ejecutables en orden y legibles sin herramientas intermedias. Cada cambio de dominio —campos de validación de beca, referencias de notificaciones, borrado lógico de posiciones, tablas del feed— queda como una unidad auditable con nombre descriptivo, en lugar de diluirse en una sincronización automática del ORM.

### Extracción de texto desde múltiples formatos de documento

El constructor de currículum acepta tanto PDF como DOCX. Son formatos con estructuras internas incompatibles: se resuelven con `pdf-parse` y `mammoth` respectivamente, normalizando ambas salidas a texto plano antes de entregárselo al modelo. Sin esa normalización, el asistente recibiría entradas de calidad dispar y produciría resultados inconsistentes según el formato que subiera el usuario.

### Borrado lógico en entidades con historial

Las posiciones laborales incorporan `deleted_at` en lugar de eliminarse físicamente. Una posición borrada tiene aplicaciones asociadas cuyo historial el estudiante debe poder seguir consultando; un `DELETE` en cascada destruiría el registro de que esa persona postuló.

---

## Instalación y Ejecución Local

<details>
<summary>Haz clic aquí para ver la guía paso a paso</summary>

### 1. Prerrequisitos

- Node.js 20 o superior
- Un proyecto en [Supabase](https://supabase.com) (incluye PostgreSQL y Auth)
- Cuenta en [Resend](https://resend.com) para el correo transaccional
- Clave de API de [Groq](https://console.groq.com) para las funciones de IA

### 2. Clonar e instalar

```bash
git clone https://github.com/<tu-usuario>/Proyecto-UCR.git
cd Proyecto-UCR
npm install
```

Las dependencias de cada módulo se instalan por separado:

```bash
npm install --prefix Frontend
npm install --prefix backend
```

### 3. Variables de entorno del Frontend

Crear `Frontend/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # solo servidor, nunca al cliente

# Prisma
# DATABASE_URL -> pooler Transaction (6543) para el runtime
# DIRECT_URL   -> pooler Session     (5432) para migraciones e introspección
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-N-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-N-<region>.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_SECRET=genera_una_clave_aleatoria_larga
NEXTAUTH_URL=http://localhost:3000

# IA
GROQ_API_KEY=
```

> **Sobre el host del pooler:** el prefijo `aws-N` varía por proyecto (`aws-0`, `aws-1`, ...). Copiar la cadena exacta desde el botón **Connect** del panel de Supabase; la de la documentación oficial siempre muestra `aws-0` y rara vez coincide.
>
> La plantilla completa y comentada, con todas las variables de correo, IA y automatizaciones, está en [`Frontend/.env.example`](Frontend/.env.example).

### 4. Variables de entorno del Backend

Crear `backend/.env`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL (Supabase)
DATABASE_URL=

# Correo transaccional
RESEND_API_KEY=tu_api_key_de_resend
TEMPLATE_ALUMNI_APPROVED=id_del_template
FROM_EMAIL=no-reply@tu-dominio.com
```

> Plantilla completa: [`backend/.env.example`](backend/.env.example).

### 5. Aplicar el esquema

Ejecutar en orden los archivos de `supabase/migrations/` desde el editor SQL de Supabase, o mediante la utilidad incluida:

```bash
node backend/run_migration.js
```

Luego generar el cliente de Prisma:

```bash
npm run prisma:generate
```

### 6. Arrancar

```bash
npm run dev     # levanta Frontend y backend en paralelo (concurrently)
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

</details>

---

## Documentación Complementaria

| Documento | Contenido |
|---|---|
| [Requerimientos_Plataforma_Exalumnos_UCR.md](./Requerimientos_Plataforma_Exalumnos_UCR.md) | Especificación funcional completa |
| [ADMIN_APPROVAL_SYSTEM.md](./ADMIN_APPROVAL_SYSTEM.md) | Flujo de aprobación de exalumnos |
| [BD_CONTEXT.MD](./BD_CONTEXT.MD) | Contexto y convenciones del modelo de datos |
| [plan_maestro_UCR.md](./plan_maestro_UCR.md) | Plan de implementación por fases |
| [auditoria_requerimientos_UCR.md](./auditoria_requerimientos_UCR.md) | Trazabilidad entre requerimientos y desarrollo |

---

## Estructura del Proyecto

<details>
<summary>Haz clic aquí para desplegar la arquitectura de carpetas</summary>

```text
Proyecto-UCR/
├── Frontend/                    # Aplicación Next.js 14 (App Router)
│   ├── app/
│   │   ├── (auth)/              # Rutas de autenticación agrupadas
│   │   ├── api/                 # Route Handlers (incluye endpoints de IA para CV)
│   │   ├── admin/               # Panel administrativo de la Fundación
│   │   ├── directorio/          # Directorio de exalumnos
│   │   ├── proyectos/           # Proyectos de graduación
│   │   ├── mis-matches/         # Emparejamientos del usuario
│   │   ├── donaciones/          # Flujo de donación (SINPE y transferencia)
│   │   ├── cv/                  # Constructor de currículum con IA
│   │   ├── posiciones/          # Empleos y pasantías
│   │   ├── feed/                # Publicaciones de la comunidad
│   │   ├── mensajes/            # Mensajería directa
│   │   ├── talleres/            # Actividades formativas
│   │   └── semana-u/            # Programa Semana U
│   ├── actions/                 # Server Actions (auth, CV, asistente)
│   ├── components/              # Componentes de UI
│   ├── lib/                     # Clientes, utilidades y correo
│   ├── hooks/                   # Hooks compartidos
│   └── prisma/                  # Esquema y semilla de Prisma
│
├── backend/                     # API REST (Express)
│   └── src/
│       ├── config/              # Base de datos y plantillas de correo
│       ├── controllers/         # Capa HTTP
│       ├── services/            # Lógica de dominio
│       ├── repositories/        # Acceso a datos
│       ├── middlewares/         # Autenticación y control de errores
│       ├── models/              # Modelos Sequelize
│       ├── routes/              # Definición de endpoints
│       ├── templates/           # Plantillas de correo
│       └── utils/               # Utilidades compartidas
│
├── supabase/
│   └── migrations/              # 25 migraciones SQL numeradas
└── n8n/                         # Flujos de automatización
```

</details>

---

## Notas sobre el Modelo de Seguridad

| Decisión | Motivo |
|---|---|
| Magic link a correo `@ucr.ac.cr` | La pertenencia a la universidad se demuestra, no se declara |
| Aprobación manual de exalumnos | Un directorio de contacto con estudiantes exige control de acceso humano |
| `service_role` key solo en servidor | Esa clave ignora las políticas de acceso: nunca debe llegar al navegador |
| Pooler en lugar del host directo | Evita depender de IPv6 y agota menos conexiones |
| Borrado lógico en posiciones | Preserva el historial de aplicaciones de los estudiantes |
| Migraciones SQL numeradas | Cambios de esquema auditables y reproducibles |

### Limitación conocida

Las credenciales encontradas durante la auditoría fueron retiradas de este repositorio, pero **permanecen en el historial del repositorio original**. Retirar un secreto del código no lo invalida: la única remediación efectiva es rotarlo en el proveedor.
