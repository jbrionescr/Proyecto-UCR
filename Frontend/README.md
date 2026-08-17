# Alumni UCR — Next.js + TypeScript (App Router)

Plataforma SaaS de la Fundación Exalumnos de la UCR, estructurada con el **App Router**
de Next.js 14: una ruta por vista, áreas por rol y navegación con `next/navigation`.

## Correr

```bash
npm install
npm run dev      # http://localhost:3000
```

Dependencias: `next`, `react`, `react-dom`, `lucide-react`, `recharts`. Tailwind ya está
configurado. Las tipografías (Barlow Semi Condensed + Work Sans) se cargan en `app/layout.tsx`.
El alias `@/` apunta a la raíz del proyecto (`tsconfig.json`).

## Mapa de rutas

| Ruta | Vista | Área (Shell) |
|------|-------|--------------|
| `/` | Landing | pública |
| `/semana-u` | Semana U (pública) | pública |
| `/registro/exalumno` · `/registro/estudiante` | Registro multipaso | pública |
| `/exalumno` | Dashboard exalumno | Exalumno |
| `/exalumno/matches` · `/posiciones` · `/donaciones` · `/directorio` · `/semana-u` | — | Exalumno |
| `/estudiante` | Dashboard estudiante | Estudiante |
| `/estudiante/proyecto` · `/matches` · `/aplicaciones` · `/cv-ia` · `/directorio` · `/donaciones` · `/semana-u` | — | Estudiante |
| `/admin` | Panel administrativo | Admin |
| `/admin/donaciones` · `/matches` · `/usuarios` · `/semana-u` | — | Admin |

## Cómo está organizado

```
app/
  layout.tsx              Layout raíz (html/body, fuentes, DemoSwitcher global)
  globals.css             Tailwind + estilos base
  page.tsx                "/" → Landing
  semana-u/page.tsx       Semana U pública
  registro/.../page.tsx   Registro exalumno / estudiante
  exalumno/   layout.tsx → <RoleShell role="alumni">  + páginas del área
  estudiante/ layout.tsx → <RoleShell role="student"> + páginas del área
  admin/      layout.tsx → <RoleShell role="admin">   + páginas del área

components/
  brand/   Isotipo · Brand · Sunburst
  ui/      Button · Card · Badge · Avatar · Progress · Ring · Eyebrow · Field ·
           EmptyState · Title · Img
  layout/  Shell · PageHead · StatTile · FilterBar · DonationTable · ViewSwitcher ·
           RoleShell (envuelve cada área en el Shell)
  DemoSwitcher.tsx         Navegador flotante de demo (quitar en producción)

views/     Una pantalla por archivo (Landing, Register, DashAlumni, …, SemanaU)

lib/
  theme.ts  Tokens de marca (colores C, tipografías)
  data.ts   Datos de ejemplo + URLs de imágenes (IMGS)
  nav.js    useNav(), pathFor(key,role) y keyFromPath(path): traducen las "keys"
            de vista que usan los componentes a rutas reales y viceversa.
```

## Notas

- **`"use client"`**: las vistas y componentes de UI son interactivos (estado, handlers),
  por eso llevan la directiva. Los layouts de área y el layout raíz son del servidor.
- **Navegación**: los componentes siguen llamando `nav("matching")`, `nav("semana-u")`, etc.
  `useNav()` (en `lib/nav.ts`) traduce esa key a la ruta correcta según el rol del área
  actual, así no hubo que reescribir los componentes. Para enlaces SEO-friendly podrías
  cambiar los botones por `<Link>` de `next/link`.
- **DemoSwitcher**: el botón flotante para saltar entre las 14 vistas es solo para la demo;
  elimínalo de `app/layout.tsx` en producción.
- **Datos y Semana U**: el programa de la Semana U (fechas/horarios/actividades) es de
  ejemplo. Las imágenes (UCR / Wikimedia Commons CC BY-SA) son ilustrativas y el componente
  `Img` muestra un respaldo de marca si una URL no carga.

## TypeScript

Proyecto en `.tsx`/`.ts` con `tsconfig.json` (alias `@/*`). Para mantener el código tal
cual (sin reescribir lógica), `strict` está en `false` y los componentes reciben sus props
como `: any` (siguen siendo opcionales, como en la versión JS). Si más adelante quieres
tipado estricto, puedes activar `strict: true` e ir tipando props componente por componente.
