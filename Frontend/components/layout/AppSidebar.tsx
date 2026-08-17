"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Briefcase, Heart, UserCircle,
  Settings, HelpCircle, FolderOpen, ChevronDown, Handshake,
  FileBarChart2, Receipt, ClipboardList, FileText, HeartHandshake,
  GraduationCap, Globe2, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSession } from "next-auth/react";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

interface NavSubItem {
  labelKey?: TranslationKeys;
  label?: string;
  href: string;
}

interface NavItem {
  labelKey?: TranslationKeys;
  label?: string;
  href?: string;
  icon: any;
  children?: NavSubItem[];
}

export function AppSidebar() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const tipo = (session?.user as any)?.tipo ?? (session?.user as any)?.role;
  const role = typeof tipo === "string" ? tipo.toUpperCase() : null;

  function toggleSubmenu(key: string) {
    setOpenSubmenu((prev) => (prev === key ? null : key));
  }

  if (status === "loading" || role === null) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-20 bg-[var(--fu-sidebar)] border-none flex flex-col z-30 shadow-2xl">
        <div className="px-4 pt-5 pb-4 flex items-center justify-center border-b border-white/10">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
        </div>
        <nav className="flex-1 px-3 mt-6 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </nav>
      </aside>
    );
  }

  // ── NAV ITEMS ────────────────────────────────────────────────────────────────

  const adminNav: NavItem[] = [
    { label: "Panel Principal",    href: "/admin",            icon: LayoutDashboard },
    { label: "Usuarios",           href: "/admin/usuarios",   icon: Users },
    { label: "Vacantes",           href: "/admin/posiciones", icon: Briefcase },
    { label: "Gestión de Matches", href: "/admin/matches",    icon: Handshake },
    { label: "Cola Donaciones",    href: "/admin/donaciones", icon: Heart },
    { label: "Voluntariado UCR",   href: "/admin/voluntariados", icon: HeartHandshake },
    { label: "Talleres",           href: "/admin/talleres",   icon: GraduationCap },
    { label: "Feed Comunidad",     href: "/feed",             icon: Globe2 },
    { label: "Semana UCR",         href: "/semana-u",         icon: Sparkles },
    { label: "Reportes",           href: "/admin/reportes",   icon: FileBarChart2 },
  ];

    const exalumnoNav: NavItem[] = [
    { labelKey: "sidebar.dashboard",          href: "/",                       icon: LayoutDashboard },
    { labelKey: "sidebar.feed",               href: "/feed",                   icon: Globe2 },
    { labelKey: "sidebar.semanaU",            href: "/semana-u",               icon: Sparkles },
    { labelKey: "sidebar.directory.student",  href: "/directorio/estudiantes", icon: Users },
    { labelKey: "sidebar.positions.own",      href: "/mis-posiciones",          icon: Briefcase },
    { labelKey: "sidebar.donations.exalumno", href: "/donaciones",              icon: Heart },
    { labelKey: "sidebar.donations.history",  href: "/mis-donaciones",          icon: Receipt },
    { labelKey: "sidebar.matches",            href: "/mis-matches/exalumno",    icon: Handshake },
    { labelKey: "sidebar.retribuye",          href: "/retribuir",               icon: HeartHandshake },
    { labelKey: "sidebar.profile.exalumno",   href: "/perfil/editar",           icon: UserCircle },
  ];

  const estudianteNav: NavItem[] = [
    { labelKey: "sidebar.dashboard",            href: "/",                     icon: LayoutDashboard },
    { labelKey: "sidebar.feed",                 href: "/feed",                 icon: Globe2 },
    { labelKey: "sidebar.semanaU",              href: "/semana-u",             icon: Sparkles },
    { labelKey: "sidebar.directory.exalumno",   href: "/directorio/exalumnos", icon: Users },
    { labelKey: "sidebar.positions.student",    href: "/posiciones",            icon: Briefcase },
    { labelKey: "sidebar.applications.student", href: "/mis-aplicaciones",      icon: ClipboardList },
    { labelKey: "sidebar.donations.student",    href: "/mis-donaciones",        icon: Heart },
    { labelKey: "sidebar.matches",              href: "/mis-matches",           icon: Handshake },
    { labelKey: "sidebar.talleres",             href: "/talleres",              icon: GraduationCap },
    {
      labelKey: "sidebar.project.student",
      icon: FolderOpen,
      children: [
        { labelKey: "sidebar.project.new",  href: "/proyectos/nuevo" },
        { labelKey: "sidebar.project.view", href: "/proyectos/ver" },
      ],
    },
    { labelKey: "sidebar.cv",              href: "/mi-curriculum",             icon: FileText },
    { labelKey: "sidebar.profile.student", href: "/perfil/editar",             icon: UserCircle },
  ];

  const navItems: NavItem[] =
    role === "ADMIN" ? adminNav :
    role === "EXALUMNO" ? exalumnoNav :
    estudianteNav;

  // ── CLASSES ──────────────────────────────────────────────────────────────────

  // A much more obvious active state so the user can tell it changed
  const activeCls = "bg-white text-[var(--fu-sidebar)] shadow-md font-bold scale-[1.02]";

  const linkCls =
    "relative flex items-center justify-center group-hover:justify-start gap-0 group-hover:gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold text-white/70 hover:bg-white/10 transition-all duration-300 w-full group/link hover:translate-x-2";

  const accentCls = "bg-black/10 border-b-2 border-white/15";

  return (
    <aside
      onMouseLeave={() => setOpenSubmenu(null)}
      className="fixed top-0 left-0 h-screen w-20 hover:w-64 bg-[var(--fu-sidebar)] backdrop-blur-2xl flex flex-col z-30 transition-all duration-500 ease-out group shadow-[8px_0_30px_rgba(0,0,0,0.15)] hover:shadow-[16px_0_40px_rgba(0,0,0,0.2)] overflow-hidden"
    >
      {/* Logo */}
      <div className={`px-4 group-hover:px-6 pt-6 pb-5 flex flex-col items-center group-hover:items-start gap-2 group-hover:gap-0 transition-all duration-300 ${accentCls}`}>
        <img
          src="/logo.png"
          alt="Logo U"
          className="h-10 group-hover:h-14 w-auto object-contain transition-all duration-300 brightness-0 invert"
        />
        <div className="mt-0 group-hover:mt-2 text-center group-hover:text-left transition-all duration-300 w-0 group-hover:w-auto opacity-0 group-hover:opacity-100 overflow-hidden whitespace-nowrap">
          {role === "ADMIN" ? (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-white">ADMIN UCR</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-white/70">Panel Administrativo</p>
            </>
          ) : role === "EXALUMNO" ? (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-white">EXALUMNOS U</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-white/70">Impacto y Legado</p>
            </>
          ) : (
            <>
              <h1 className="text-sm group-hover:text-base font-extrabold tracking-tight text-white">ESTUDIANTE UCR</h1>
              <p className="text-[9px] group-hover:text-[10px] font-semibold text-white/70">Talento en Formación</p>
            </>
          )}
        </div>
      </div>

      {/* FWD accent bar — 4 brand colors under the logo */}
      <div className="fwd-accent-bar shrink-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 group-hover:px-4 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const itemKey = item.label ?? (item.labelKey as string) ?? "";
          const isActive = item.href ? pathname === item.href : false;
          const isSubmenuOpen = openSubmenu === itemKey;
          const displayLabel = item.label ?? t(item.labelKey!);

          if (item.children) {
            const anyChildActive = item.children.some((c) => pathname.startsWith(c.href));
            const parentActive = anyChildActive || isSubmenuOpen;
            return (
              <div key={itemKey}>
                <button
                  onClick={() => toggleSubmenu(itemKey)}
                  className={`${linkCls} ${parentActive ? activeCls : ""}`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 group-hover/link:scale-110 ${parentActive ? "text-[var(--fu-sidebar)]" : "text-white/70 group-hover/link:text-white"}`} />
                  <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left ${parentActive ? "text-[var(--fu-sidebar)] font-bold" : "group-hover/link:bg-clip-text group-hover/link:text-transparent group-hover/link:bg-gradient-to-r group-hover/link:from-cyan-400 group-hover/link:via-yellow-400 group-hover/link:to-pink-400 group-hover/link:font-extrabold"}`}>
                    {displayLabel}
                  </span>
                  <ChevronDown
                    className={`opacity-0 group-hover:opacity-100 w-3.5 h-3.5 shrink-0 transition-all duration-200 ${isSubmenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isSubmenuOpen && (
                  <div className="overflow-hidden transition-all duration-300 ml-4 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                    {item.children.map((child) => {
                      const childLabel = child.label ?? t(child.labelKey!);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block text-xs font-semibold py-1.5 px-2 rounded-md whitespace-nowrap transition-colors group/subitem ${pathname === child.href ? "bg-white shadow-md" : "text-sky-100 hover:bg-white hover:shadow-md dark:hover:bg-slate-800"}`}
                        >
                          <span className={pathname === child.href ? "font-bold text-[var(--fu-sidebar)]" : "group-hover/subitem:bg-clip-text group-hover/subitem:text-transparent group-hover/subitem:bg-gradient-to-r group-hover/subitem:from-cyan-400 group-hover/subitem:via-yellow-400 group-hover/subitem:to-pink-400 group-hover/subitem:font-extrabold"}>
                            {childLabel}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={itemKey || item.href}
              href={item.href!}
              className={`${linkCls} ${isActive ? activeCls : ""}`}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 group-hover/link:scale-110 ${isActive ? "text-[var(--fu-sidebar)]" : "text-white/70 group-hover/link:text-white"}`} />
              <span className={`opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto transition-all duration-300 whitespace-nowrap overflow-hidden ${isActive ? "" : "group-hover/link:bg-clip-text group-hover/link:text-transparent group-hover/link:bg-gradient-to-r group-hover/link:from-cyan-400 group-hover/link:via-yellow-400 group-hover/link:to-pink-400 group-hover/link:font-extrabold"}`}>
                {displayLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-3 group-hover:p-4 space-y-2 border-t border-white/10 mt-auto transition-all duration-300 bg-transparent">
        <Link href="/ajustes" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-white/70 hover:bg-white/10 hover:text-white px-2 group-hover:px-3 hover:translate-x-1 transition-all rounded-xl h-11 group/btn">
            <Settings className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:rotate-45 group-hover/btn:text-white" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden text-[13px] font-semibold group-hover/btn:bg-clip-text group-hover/btn:text-transparent group-hover/btn:bg-gradient-to-r group-hover/btn:from-cyan-400 group-hover/btn:via-yellow-400 group-hover/btn:to-pink-400">
              {t("sidebar.settings")}
            </span>
          </Button>
        </Link>
        <Link href="/ajustes?tab=help" className="block w-full">
          <Button variant="ghost" className="w-full flex items-center justify-center group-hover:justify-start text-white/70 hover:bg-white/10 hover:text-white px-2 group-hover:px-3 hover:translate-x-1 transition-all rounded-xl h-11 group/btn">
            <HelpCircle className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:text-white" />
            <span className="opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto ml-0 group-hover:ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden text-[13px] font-semibold group-hover/btn:bg-clip-text group-hover/btn:text-transparent group-hover/btn:bg-gradient-to-r group-hover/btn:from-cyan-400 group-hover/btn:via-yellow-400 group-hover/btn:to-pink-400">
              {t("sidebar.help")}
            </span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
