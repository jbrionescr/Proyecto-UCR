"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft, GraduationCap, Briefcase, ArrowRight, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/fu/ThemeToggle";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Determinar vista inicial según parámetro de URL
  const initialView = searchParams?.get("view") === "registro" ? "registro" : "login";
  const [activeView, setActiveView] = useState<"login" | "registro">(initialView);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animDirection, setAnimDirection] = useState<"to-registro" | "to-login" | null>(null);
  const [mounted, setMounted] = useState(false);

  // Limpiar cookies de sesión previas al cargar la página de login
  useEffect(() => {
    setMounted(true);
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const name = cookie.split("=")[0].trim();
      if (name.startsWith("authjs.") || name.startsWith("__Secure-authjs.") || name.startsWith("next-auth.")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure`;
      }
    }
  }, []);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Mostrar confirmación tras verificar el correo (redirigido desde /auth/callback)
  useEffect(() => {
    if (searchParams?.get("verified") === "1") {
      toast({
        title: "¡Correo verificado!",
        description: "Ya puedes iniciar sesión con tu cuenta.",
      });
      const verifiedEmail = searchParams.get("email");
      if (verifiedEmail) {
        setFormData((prev) => ({ ...prev, email: verifiedEmail }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      "CredentialsSignin": t("auth.login.errorCredentials"),
      "Credenciales inválidas": t("auth.login.errorCredentials"),
      "Configuration": t("auth.login.errorConfiguration"),
      "AccessDenied": t("auth.login.errorAccessDenied"),
      "Email no verificado": t("auth.login.errorEmailNotVerified"),
    };
    return messages[errorCode] || errorCode || t("auth.login.errorGeneric");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });
      if (result?.error) {
        const errorMessage = getErrorMessage(result.error);
        const isEmailNotVerified = /verificar|verificado|verify|verified/i.test(errorMessage);
        toast({
          title: t("auth.login.toastErrorTitle") + (isEmailNotVerified ? t("auth.login.toastErrorUnverifiedSuffix") : ""),
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({ title: t("auth.login.toastSuccessTitle"), description: t("auth.login.toastSuccessDesc") });
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast({ title: t("auth.login.toastGenericErrorTitle"), description: t("auth.login.toastUnexpectedError"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar entre login y registro con animación
  const switchToRegistro = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimDirection("to-registro");
    
    // Cambiar la vista activa a la mitad de la transición (350ms)
    setTimeout(() => {
      setActiveView("registro");
      window.history.replaceState(null, "", "/registro");
    }, 350);

    // Finalizar la animación a los 750ms
    setTimeout(() => {
      setAnimDirection(null);
      setIsAnimating(false);
    }, 750);
  };

  const switchToLogin = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setAnimDirection("to-login");
    
    setTimeout(() => {
      setActiveView("login");
      window.history.replaceState(null, "", "/login");
    }, 350);

    setTimeout(() => {
      setAnimDirection(null);
      setIsAnimating(false);
    }, 750);
  };

  // Determine panel positions based on active view and animation state
  const isLogin = activeView === "login";
  const goingToRegistro = animDirection === "to-registro";
  const goingToLogin = animDirection === "to-login";

  const showLogin = activeView === "login" && animDirection !== "to-registro";
  const showRegistro = activeView === "registro" && animDirection !== "to-login";

  return (
    <>
      <style>{`
        .panel-slide {
          transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1);
        }
        .panel-slide-fast {
          transition: transform 0.7s cubic-bezier(0.65, 0, 0.35, 1),
                      opacity 0.35s ease;
        }
        @keyframes contentFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-content-in {
          animation: contentFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }
      `}</style>

      <div className="relative w-full min-h-screen overflow-hidden bg-ucr-naranja font-body">
        
        {/* ===== IMAGEN DE FONDO (se mueve entre izquierda y derecha) ===== */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 z-0 overflow-hidden hidden lg:block ${mounted ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" : ""} ${
            (isLogin && !goingToRegistro) || goingToLogin
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/pretilUCR.png')" }}
          />

        </div>

        {/* Fondo completo naranja en mobile */}
        <div className="absolute inset-0 bg-ucr-naranja lg:hidden z-0" />



        {/* ===== PANEL CON TEXTO DESCRIPTIVO (se mueve opuesto a la imagen) ===== */}
        <div
          className={`absolute inset-y-0 left-0 w-1/2 z-10 hidden lg:flex flex-col justify-between px-12 pt-8 pb-12 text-white ${mounted ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" : ""} ${
            (isLogin && !goingToRegistro) || goingToLogin
              ? "translate-x-0"
              : "translate-x-full"
          }`}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-medium text-white drop-shadow-md leading-[1.2] uppercase">
              Fundación<br />Exalumnos
            </h1>
          </div>
          <div>
            <p className="text-lg text-sky-100 max-w-sm font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] leading-relaxed font-body">
              {t("auth.tagline")}
            </p>
          </div>
        </div>

        {/* ===== PANEL NARANJA CON FORMULARIO (se mueve opuesto a la imagen) ===== */}
        <div
          className={`absolute inset-y-0 left-0 w-full lg:w-1/2 z-20 flex items-center justify-center ${mounted ? "transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]" : ""} ${
            (isLogin && !goingToRegistro) || goingToLogin
              ? "translate-x-0 lg:translate-x-full"
              : "translate-x-0"
          }`}
        >
          <div className="absolute inset-0 bg-ucr-naranja" />
          
          {/* Isotipo decorativo */}
          <img
            src="/logo-isotipo.png"
            alt=""
            aria-hidden="true"
            className={`absolute w-[620px] h-[620px] object-contain opacity-25 pointer-events-none z-0 panel-slide ${
              (isLogin && !goingToRegistro) || goingToLogin
                ? "-bottom-24 -right-24"
                : "-bottom-24 -left-24"
            }`}
            style={{ 
              filter: "brightness(0) invert(1)", 
              transform: (isLogin && !goingToRegistro) || goingToLogin ? "rotate(-20deg)" : "rotate(20deg)"
            }}
          />

          <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-[0.08] bg-cover bg-bottom mix-blend-overlay pointer-events-none z-0" />

          {/* Volver al Dashboard + Toggle de tema */}
          <div className="absolute top-8 right-8 sm:top-10 sm:right-10 lg:right-16 z-50 flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{t("auth.backToDashboard")}</span>
            </Link>
          </div>

          {/* ===== CONTENIDO: LOGIN ===== */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              showLogin
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="w-full max-w-md py-12 px-8 sm:px-12">
              <div className="text-center mb-10">
                <div 
                  className="w-24 h-24 mx-auto mb-6 bg-sky-100" 
                  style={{ WebkitMaskImage: "url('/logo.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: "url('/logo.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
                  aria-label="Logo Alumni U"
                  role="img"
                />
                <h2 className="text-3xl font-medium tracking-tight text-white font-display mb-3 uppercase">
                  {t("auth.login.title")}
                </h2>
                <p className="text-orange-100 font-medium font-body">
                  {t("auth.login.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-white">{t("auth.login.emailLabel")}</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="juan.perez@ucr.ac.cr"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="pl-11 h-14 rounded-[10px] border-slate-200 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white text-base text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-bold text-white">{t("auth.login.passwordLabel")}</Label>
                    <Link href="/forgot-password" className="text-sm font-semibold text-white/80 hover:text-white hover:underline transition-colors font-body">
                      {t("auth.login.forgotPassword")}
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-11 pr-11 h-14 rounded-[10px] border-slate-200 focus:ring-ucr-celeste focus:border-ucr-celeste bg-white text-base text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-base rounded-[10px] bg-white hover:bg-orange-50 text-ucr-naranja font-bold shadow-lg transition-all border-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("auth.login.submitting")}
                    </>
                  ) : (
                    t("auth.login.submit")
                  )}
                </Button>
              </form>

              <div className="mt-10 text-center text-white/80 font-medium font-body">
                {t("auth.login.noAccount")}{" "}
                <button
                  onClick={switchToRegistro}
                  className="font-bold text-white hover:text-orange-100 hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  {t("auth.login.registerHere")}
                </button>
              </div>
            </div>
          </div>

          {/* ===== CONTENIDO: REGISTRO ===== */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              showRegistro
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="w-full max-w-xl py-8 px-8 sm:px-12">
              <div className="text-center mb-6">
                <div 
                  className="w-24 h-24 mx-auto mb-6 bg-sky-100" 
                  style={{ WebkitMaskImage: "url('/logo.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: "url('/logo.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }}
                  aria-label="Logo Alumni U"
                  role="img"
                />
                <h2 className="text-3xl font-medium tracking-tight text-white font-display mb-3 uppercase">
                  {t("auth.registroSelect.title")}
                </h2>
                <p className="text-orange-100 font-medium font-body">
                  {t("auth.registroSelect.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Estudiante Card */}
                <Link href="/registro/estudiante" className="group">
                  <div className="h-full bg-white/95 backdrop-blur-sm rounded-[2rem] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.03] transition-all duration-300 overflow-hidden flex flex-col relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-ucr-celeste transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="bg-ucr-celeste-tint w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                        <GraduationCap className="h-10 w-10 text-ucr-esmeralda" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 mb-2 font-display uppercase">{t("auth.registroSelect.studentTitle")}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
                        {t("auth.registroSelect.studentDesc")}
                      </p>
                      <div className="mt-auto inline-flex items-center text-sm font-bold text-ucr-esmeralda font-body">
                        {t("auth.registroSelect.cta")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Exalumno Card */}
                <Link href="/registro/exalumno" className="group">
                  <div className="h-full bg-white/95 backdrop-blur-sm rounded-[2rem] border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.03] transition-all duration-300 overflow-hidden flex flex-col relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-ucr-amarillo transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                      <div className="bg-ucr-beige-tint w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                        <Briefcase className="h-10 w-10 text-ucr-amarillo" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-800 mb-2 font-display uppercase">{t("auth.registroSelect.alumniTitle")}</h3>
                      <p className="text-xs sm:text-sm text-slate-500 mb-6 font-medium">
                        {t("auth.registroSelect.alumniDesc")}
                      </p>
                      <div className="mt-auto inline-flex items-center text-sm font-bold text-ucr-amarillo font-body">
                        {t("auth.registroSelect.cta")} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mt-6 text-center text-white/80 font-medium font-body">
                {t("auth.hasAccount")}{" "}
                <button
                  onClick={switchToLogin}
                  className="font-bold text-white hover:text-orange-100 hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  {t("auth.loginHere")}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
