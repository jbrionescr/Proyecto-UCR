"use client";

import Link from "next/link";
import { GraduationCap, Mail, MapPin, Heart, Instagram, Facebook, Linkedin, ArrowUpRight } from "lucide-react";
import { useLanguage, TranslationKeys } from "@/components/providers/LanguageContext";

const ENLACES_PLATAFORMA: { labelKey: TranslationKeys; href: string }[] = [
  { labelKey: "footer.link.jobs", href: "/posiciones" },
  { labelKey: "footer.link.directory", href: "/directorio/exalumnos" },
  { labelKey: "footer.link.workshops", href: "/talleres" },
  { labelKey: "footer.link.feed", href: "/feed" },
];

const ENLACES_IMPACTO: { labelKey: TranslationKeys; href: string }[] = [
  { labelKey: "footer.link.donations", href: "/donaciones" },
  { labelKey: "footer.link.giveback", href: "/retribuir" },
  { labelKey: "footer.link.matches", href: "/mis-matches" },
];

const ENLACES_LEGAL: { labelKey: TranslationKeys; href: string }[] = [
  { labelKey: "footer.link.privacy", href: "/politica-privacidad" },
  { labelKey: "footer.link.legal", href: "/aviso-legal" },
  { labelKey: "footer.link.help", href: "/ajustes?tab=help" },
];

/**
 * Footer universal de la plataforma — se muestra en todas las páginas
 * (dashboard autenticado, landing, login y registro) desde SidebarWrapper.
 * Fondo oscuro fijo (no depende de tema claro/oscuro) para dar un cierre
 * de marca consistente en toda la app, igual que el resto de la web UCR.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden bg-ucr-footer-bg text-slate-400 mt-auto">
      {/* Barra de acento con los 4 colores de marca */}
      <div className="fwd-accent-bar" />

      {/* Glow decorativo de marca */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(at 15% 0%, rgba(0,192,243,0.16) 0px, transparent 55%), radial-gradient(at 85% 100%, rgba(243,112,33,0.14) 0px, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-3">
          {/* Marca */}
          <div className="md:col-span-2 space-y-1.5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <img
                src="/logo.png"
                alt="Logo Fundación Exalumnos U"
                className="h-7 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-105"
              />
              <div>
                <span className="text-sm font-extrabold tracking-tight text-white font-display block leading-none">
                  EXALUMNOS U
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mt-0.5">
                  {t("footer.brandSubtitle")}
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-snug">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Facebook, label: "Facebook" },
                { Icon: Linkedin, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="h-6 w-6 flex items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                >
                  <Icon className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#00C0F3]" /> {t("footer.platform")}
            </h4>
            <ul className="space-y-1">
              {ENLACES_PLATAFORMA.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {t(link.labelKey)}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impacto */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#F37021]" /> {t("footer.impact")}
            </h4>
            <ul className="space-y-1">
              {ENLACES_IMPACTO.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-slate-400 hover:text-white transition-colors">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto / Legal */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-1.5">{t("footer.contact")}</h4>
            <ul className="space-y-1 mb-2">
              <li className="flex items-start gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>alumni@ucr.ac.cr</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{t("footer.contactAddress")}</span>
              </li>
            </ul>
            <ul className="space-y-1">
              {ENLACES_LEGAL.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            © {year} Fundación Exalumnos U — Universidad de Costa Rica. {t("footer.rights")}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            {t("footer.madeWith")} <Heart className="w-3 h-3 text-[#F37021] fill-[#F37021]" /> {t("footer.madeWithSuffix")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
