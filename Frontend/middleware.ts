import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Rutas que requieren estar autenticado
const PROTECTED_PREFIXES = [
  "/mis-matches",
  "/directorio",
  "/mi-curriculum",
  "/mis-donaciones",
  "/mis-posiciones",
  "/posiciones/nueva",
  "/mis-aplicaciones",
  "/perfil/editar",
  "/completar-perfil",
  "/admin",
  "/donaciones",
  "/proyecto/",
  "/proyectos",
  "/mentoria",
  "/ajustes",
  "/retribuir",
  "/talleres",
  "/feed",
];

// Solo EXALUMNO (o ADMIN) pueden acceder
const EXALUMNO_ONLY = [
  "/mis-posiciones",
  "/posiciones/nueva",
  "/directorio/estudiantes",
  "/donaciones",
  "/retribuir",
];

// Solo ESTUDIANTE (o ADMIN) pueden acceder
// Nota: "/proyecto/" lleva la barra final a propósito — sin ella,
// startsWith("/proyecto") también atrapaba "/proyectos/[id]" (la vista
// pública de un proyecto, que cualquier usuario autenticado puede ver).
const ESTUDIANTE_ONLY = [
  "/mis-aplicaciones",
  "/mi-curriculum",
  "/proyecto/",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod";

  const cookieName =
    req.cookies.get("__Secure-authjs.session-token") !== undefined
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await getToken({ req, secret, cookieName }).catch(() => null);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Sin sesión → login
  if (!token && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    const role = (token.tipo as string | undefined)?.toUpperCase() ?? "";

    // Admin-only: /admin
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // EXALUMNO-only: redirigir a ESTUDIANTE
    if (
      role === "ESTUDIANTE" &&
      EXALUMNO_ONLY.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // ESTUDIANTE-only: redirigir a EXALUMNO
    if (
      role === "EXALUMNO" &&
      ESTUDIANTE_ONLY.some((p) => pathname.startsWith(p))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|registro|auth|$|\\.png|\\.jpg|\\.svg|\\.ico).*)",
  ],
};
