"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/fu/ThemeToggle";
import { Footer } from "./Footer";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Rutas donde NO queremos mostrar el sidebar
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/registro") || pathname?.startsWith("/verificar-correo") || pathname?.startsWith("/forgot-password");

  const isHome = pathname === "/";

  // Mostrar el sidebar solo si el usuario está autenticado y no está en ruta de autenticación
  const showSidebar = !!session && !isAuthRoute;

  // Color de marca por rol (sidebar y botones): Estudiante = azul (default),
  // Exalumno = naranja, Admin = cian/amarillo. Ver [data-role] en globals.css.
  const tipo = (session?.user as any)?.tipo ?? (session?.user as any)?.role;
  const role = typeof tipo === "string" ? tipo.toUpperCase() : null;
  const dataRole = role === "ADMIN" ? "admin" : role === "EXALUMNO" ? "exalumno" : "estudiante";

  // La landing (isHome sin sesión) y login/registro-estudiante/registro-exalumno
  // ya traen su propio toggle junto al link "Volver" de su header; el resto de
  // rutas de autenticación (forgot-password, verificar-correo, selector de
  // registro) no tienen header propio, así que aquí les damos uno flotante.
  const hasOwnToggle =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/registro/estudiante") ||
    pathname?.startsWith("/registro/exalumno");

  if (!showSidebar) {
    return (
      <main className="relative flex-1 flex flex-col min-h-screen bg-[#f8fafc] dark:bg-slate-900">
        {!isHome && !hasOwnToggle && <ThemeToggle className="fixed top-4 right-4 z-50" />}
        <div className="flex-1">{children}</div>
        <Footer />
      </main>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent" data-role={dataRole}>
      {/* Global Background Image for Authenticated Pages */}
      <div
        className="fixed inset-0 z-[0] bg-[url('/Gemini_Generated_Image_3swc4f3swc4f3swc.png')] bg-repeat opacity-[0.04] pointer-events-none"
      />
      <div className="relative z-10 flex w-full flex-1">
        <AppSidebar />
        <main className={`flex-1 ml-20 flex flex-col relative z-10 ${isHome ? "bg-transparent" : "bg-white/40 dark:bg-slate-950/40 backdrop-blur-[2px] transition-colors duration-300 min-h-screen"}`}>
          <TopBar />
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
