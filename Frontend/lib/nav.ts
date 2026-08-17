"use client";
import { useRouter, usePathname } from "next/navigation";

const AREA = { alumni: "exalumno", student: "estudiante", admin: "admin" };
const areaOf = (role) => AREA[role] || "exalumno";

export function roleFromPath(pathname) {
  if (pathname.startsWith("/exalumno")) return "alumni";
  if (pathname.startsWith("/estudiante")) return "student";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

// Mapea una "key" de vista (la que usan los componentes) a su ruta real.
export function pathFor(key, role) {
  const a = areaOf(role);
  switch (key) {
    case "landing": return "/";
    case "register-alumni": return "/registro/exalumno";
    case "register-student": return "/registro/estudiante";
    case "dash-alumni": return "/exalumno";
    case "dash-student": return "/estudiante";
    case "admin": return "/admin";
    case "matching": return `/${a}/matches`;
    case "donations": return `/${a}/donaciones`;
    case "jobs": return role === "student" ? "/estudiante/aplicaciones" : "/exalumno/posiciones";
    case "directory-alumni": return role === "admin" ? "/admin/usuarios" : "/exalumno/directorio";
    case "directory-student": return "/estudiante/directorio";
    case "cv-editor": return "/estudiante/proyecto";
    case "cv-ai": return "/estudiante/cv-ia";
    case "semana-u": return role ? `/${a}/semana-u` : "/semana-u";
    default: return "/";
  }
}

// Mapea una ruta a la "key" de vista activa (para resaltar el menú).
export function keyFromPath(pathname) {
  if (pathname === "/") return "landing";
  if (pathname === "/semana-u") return "semana-u";
  const [, area, sub] = pathname.split("/");
  const maps = {
    exalumno: { "": "dash-alumni", matches: "matching", posiciones: "jobs", donaciones: "donations", directorio: "directory-alumni", "semana-u": "semana-u" },
    estudiante: { "": "dash-student", proyecto: "cv-editor", matches: "matching", aplicaciones: "jobs", "cv-ia": "cv-ai", directorio: "directory-student", donaciones: "donations", "semana-u": "semana-u" },
    admin: { "": "admin", donaciones: "donations", matches: "matching", usuarios: "directory-alumni", "semana-u": "semana-u" },
  };
  return (maps[area] || {})[sub || ""] || "";
}

// Hook de navegación: los componentes siguen llamando nav("matching"), etc.
export function useNav() {
  const router = useRouter();
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  return (key) => router.push(pathFor(key, role));
}
