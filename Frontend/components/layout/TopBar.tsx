"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Landmark } from "lucide-react";

import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";
import { ThemeToggle } from "@/components/fu/ThemeToggle";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

interface TopBarProps {
  title?: string;
  titleKey?: TranslationKeys;
}

function ExchangeRateBadge() {
  const [rate, setRate] = useState<{ venta: number; compra: number; date: string } | null>(null);

  useEffect(() => {
    const load = () => {
      fetch("/api/tipo-cambio")
        .then((r) => r.json())
        .then((d) => { if (d?.venta) setRate(d); })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30 * 60 * 1000); // refresca cada 30 min
    return () => clearInterval(interval);
  }, []);

  if (!rate) return null;

  return (
    <div
      title={`Tipo de cambio del dólar (BCCR)${rate.date ? ` — actualizado ${rate.date}` : ""}. Venta: ₡${rate.venta} · Compra: ₡${rate.compra}`}
      className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm"
    >
      <Landmark className="h-3.5 w-3.5 text-[#005da4] dark:text-sky-400" />
      ₡{rate.venta.toLocaleString("es-CR")} / $1
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  EXALUMNO: "Exalumno",
  ESTUDIANTE: "Estudiante",
};

function RoleBadge() {
  const { data: session } = useSession();
  const tipo = (session?.user as any)?.tipo ?? (session?.user as any)?.role;
  const role = typeof tipo === "string" ? tipo.toUpperCase() : null;
  const label = role ? ROLE_LABELS[role] : null;

  if (!label) return null;

  return (
    <span
      className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white px-3 py-1.5 rounded-full shadow-sm"
      style={{ backgroundColor: "var(--fu-sidebar)" }}
      title={`Estás conectado como ${label}`}
    >
      {label}
    </span>
  );
}

export function TopBar({ title, titleKey }: TopBarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTitle = mounted && titleKey ? t(titleKey) : title;

  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${isHome ? '-mb-16' : ''}`}>
      
      <header className="h-16 flex items-center justify-between px-8 transition-all duration-300 relative bg-transparent">
        <div className="flex items-center gap-4">
          {displayTitle && (
            <div className="flex items-center gap-3 animate-in slide-in-from-left-4 duration-500">
              <div className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[#005da4] to-sky-400 shadow-sm"></div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{displayTitle}</h2>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!session && (
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-ucr-celeste text-ucr-celeste-medium dark:text-sky-400 hover:bg-ucr-celeste/10 dark:hover:bg-sky-400/10 font-body font-semibold">
                {t("topbar.login")}
              </Button>
            </Link>
          )}

          {session && (
            <>
              <RoleBadge />
              <ExchangeRateBadge />
              <NotificationsDropdown />
              <UserDropdown />
            </>
          )}
        </div>
      </header>
    </div>
  );
}
