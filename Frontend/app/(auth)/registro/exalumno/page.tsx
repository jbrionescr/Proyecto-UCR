"use client";

import { ExalumnoRegisterForm } from "@/components/forms/ExalumnoRegisterForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/fu/ThemeToggle";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function RegistroExalumnoPage() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen bg-ucr-naranja font-body relative overflow-hidden justify-center items-center">

      {/* Panel Derecho (Formulario) */}
      <div className="w-full flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-y-auto z-20">
        <div className="absolute inset-0 bg-ucr-naranja z-0" />
        


        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.08] bg-cover bg-bottom mix-blend-overlay pointer-events-none z-0" />

        <div className="absolute top-8 left-8 sm:top-10 sm:left-10 z-50 flex items-center gap-4">
          <Link
            href="/login?view=registro"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">{t("auth.back")}</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Logo superior fuera de la tarjeta */}
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-16 w-auto brightness-0 invert relative z-10 mb-2 mt-8" 
        />
        
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm p-6 sm:p-10 rounded-[2rem] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] relative z-10 my-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-medium tracking-tight text-slate-800 font-display mb-3 uppercase">
              {t("auth.registroExalumno.title")}
            </h2>
            <p className="text-slate-500 font-medium font-body">
              {t("auth.registroExalumno.subtitle")}
            </p>
          </div>

          <ExalumnoRegisterForm />

          <div className="mt-8 text-center text-slate-500 font-medium font-body">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-bold text-ucr-celeste hover:underline transition-colors">
              {t("auth.loginHere")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
