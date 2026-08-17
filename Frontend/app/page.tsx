"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { CheckCircle2, Circle, Sparkles, Building2, Users, UserCircle, Coffee, Calendar, Clock, Send, Briefcase, Heart, DollarSign } from "lucide-react";
import Image from "next/image";
import { IntroVideo } from "@/components/layout/IntroVideo";
import Link from "next/link";
import { WelcomeCarousel } from "@/components/layout/WelcomeCarousel";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import LandingPage from "@/components/landing/LandingPage";
import { BecasInfoDialog } from "@/components/becas/BecasInfoDialog";
import { FundingProgressBar } from "@/components/donaciones/FundingProgressBar";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { useLanguage } from "@/components/providers/LanguageContext";

export default function RootPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-t-[#00C0F3] border-r-transparent border-b-transparent border-l-transparent animate-spin border-[#00C0F3]/20" />
          <p className="text-white dark:text-slate-300 text-sm font-semibold tracking-wide animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard />;
}

function Dashboard() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { t } = useLanguage();

  const role = (session?.user as any)?.tipo?.toUpperCase() || "ESTUDIANTE";
  const isEstudiante = role === "ESTUDIANTE";
  const userName = session?.user?.name || "Usuario";

  // Profile data from API
  const [profile, setProfile] = useState<any>(null);
  const [mentorCount, setMentorCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch own profile for real data
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => { if (d?.id) setProfile(d); })
      .catch(() => {});

    // Fetch mentor count
    fetch("/api/exalumnos")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setMentorCount(d.length); })
      .catch(() => {});
  }, []);

  // Student profile fields (with sensible fallbacks)
  const proyectoTitulo  = profile?.estudiante?.proyecto_titulo  || "Proyecto de Graduación";
  const carrera         = profile?.estudiante?.carrera          || "Carrera UCR";
  const matchesActivos  = profile?.matchesActivos  ?? 0;
  const matchesPendientes = profile?.matchesPendientes ?? 0;

  // Beca Modal States
  const [isBecaOpen, setIsBecaOpen] = useState(false);
  const [becaJustification, setBecaJustification] = useState("");

  // Coffee Modal States
  const [isCoffeeOpen, setIsCoffeeOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<{ name: string; role: string } | null>(null);
  const [coffeeDate, setCoffeeDate] = useState("");
  const [coffeeTime, setCoffeeTime] = useState("");
  const [coffeeMessage, setCoffeeMessage] = useState("");

  const handleApplyBeca = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBecaOpen(false);
    setBecaJustification("");
    toast({
      title: "Solicitud de Beca Enviada",
      description: "Tu postulación al fondo de Excelencia de Exalumnos ha sido recibida con éxito y está en revisión."
    });
  };

  const handleScheduleCoffee = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCoffeeOpen(false);
    setCoffeeDate("");
    setCoffeeTime("");
    setCoffeeMessage("");
    toast({
      title: "Café Virtual Solicitado",
      description: `Se ha enviado la solicitud a ${selectedMentor?.name} para el día ${coffeeDate} a las ${coffeeTime}. Recibirás un correo de confirmación.`
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 relative flex flex-col">
      {/* Portada Superior (Hero con Carrusel) */}
      <div className="relative overflow-hidden bg-slate-950 h-[320px] sm:h-[400px] md:h-[480px] w-full border-b border-white/10 flex flex-col justify-between">
        <WelcomeCarousel className="absolute inset-0 w-full h-full z-0 bg-slate-950" />
        <IntroVideo />
        <div id="dashboard-main-content" className="relative z-10 h-full flex flex-col justify-between">
          <div className="px-5 sm:px-8 pb-6 mt-auto">
            <h1 className="text-2xl font-bold text-white drop-shadow-md">
              {isEstudiante ? t("dashboard.title.student") : t("dashboard.title.exalumno")}
            </h1>
            <p className="text-xs text-white/80 drop-shadow-sm font-medium">
              {isEstudiante ? t("dashboard.subtitle.student") : t("dashboard.subtitle.exalumno")}
            </p>
          </div>
        </div>
      </div>

      {/* Sección Inferior (Contenido con Fondo Sólido) */}
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 w-full flex-1">
        
        {isEstudiante ? (
          <>
            {/* VISTA ESTUDIANTE */}
            {/* Top Section - Tarjetas Principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              
              {/* Main Welcome Card */}
              <Card className="lg:col-span-2 p-5 sm:p-6 md:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex relative overflow-hidden">
                <div className="w-full relative z-10 text-foreground flex flex-col justify-center min-h-[200px]">
                  <p className="text-sm font-semibold tracking-wider text-[#0f4c81] dark:text-sky-400 mb-2 uppercase">Bienvenido de nuevo, {userName}</p>
                  <AnimatedHeading as="h1" className="text-3xl sm:text-4xl mb-4 leading-tight">
                    {proyectoTitulo !== "Proyecto de Graduación" ? (
                      <>{proyectoTitulo}<br/><span className="text-[#22c55e]">{carrera}</span></>
                    ) : (
                      <>Tu comunidad de Exalumnos UCR<br/><span className="text-[#22c55e]">te espera.</span></>
                    )}
                  </AnimatedHeading>
                  <p className="text-muted-foreground mb-6 text-sm md:text-base leading-relaxed max-w-md">
                    {matchesActivos > 0
                      ? `Tienes ${matchesActivos} match${matchesActivos > 1 ? "es" : ""} activo${matchesActivos > 1 ? "s" : ""}. Continúa conectando con la red de exalumnos.`
                      : matchesPendientes > 0
                        ? `Tienes ${matchesPendientes} match${matchesPendientes > 1 ? "es" : ""} sugerido${matchesPendientes > 1 ? "s" : ""}. ¡Revísalos y conecta con exalumnos!`
                        : "Explora el directorio de exalumnos y conecta con mentores que te ayudarán a avanzar en tu carrera."}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Link href="/proyecto/hitos">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">{t("dashboard.welcome.btn.milestones")}</Button>
                    </Link>
                    <Link href="/proyecto/bitacora">
                      <Button variant="outline" className="border-slate-300 dark:border-slate-700">{t("dashboard.welcome.btn.logbook")}</Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Project Status */}
              <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <AnimatedHeading as="h3" className="text-lg">{t("dashboard.status.title")}</AnimatedHeading>
                  <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">{t("dashboard.status.ontrack")}</Badge>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{proyectoTitulo}</span>
                    <span className="text-[#0f4c81] dark:text-sky-400 text-sm font-semibold">{carrera}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {matchesActivos > 0 ? `${matchesActivos} mentor${matchesActivos > 1 ? "es" : ""} activo${matchesActivos > 1 ? "s" : ""}` : "Sin matches activos aún"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-400 line-through">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Revisión de Literatura</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 line-through">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Fase de Recolección de Datos</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                    <span className="text-sm">Análisis Final y Reporte</span>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              

              {/* Support & Resources */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground">{t("dashboard.support.title")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <BecasInfoDialog
                    trigger={
                      <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm cursor-pointer hover:shadow-md hover:border-[#00c0f3]/40 transition-all">
                        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground mb-4">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">{t("dashboard.support.funds")}</p>
                        <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">Disponible</h4>
                        <p className="text-xs font-semibold text-slate-400">Fondo de Excelencia Exalumnos</p>
                        <p className="text-xs font-bold text-[#005da4] mt-2 hover:underline">Ver categorías de becas →</p>
                      </Card>
                    }
                  />
                  <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-green-700 flex items-center justify-center text-white mb-4">
                      <Users className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">{t("dashboard.support.mentorships")}</p>
                    <h4 className="text-2xl font-bold text-[#0f4c81] dark:text-sky-400 mb-2">
                      {mentorCount === null ? "..." : `${mentorCount} Mentor${mentorCount !== 1 ? "es" : ""}`}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">Exalumnos en la plataforma</p>
                  </Card>
                </div>
                <Card className="p-5 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#0f4c81] dark:text-sky-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground">{t("dashboard.support.available")}</h5>
                      <p className="text-sm text-slate-500">{t("dashboard.support.available.desc")}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsBecaOpen(true)}
                    variant="outline"
                    className="w-full sm:w-auto border-[#0f4c81] text-[#0f4c81] dark:border-sky-400 dark:text-sky-400"
                  >
                    {t("dashboard.support.apply")}
                  </Button>
                </Card>

                {profile?.financiamiento?.busca && (
                  <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Recaudación de tu Proyecto</p>
                        <p className="text-xs text-slate-400">Fondos recibidos de exalumnos donantes</p>
                      </div>
                    </div>
                    <FundingProgressBar
                      objetivo={profile.financiamiento.objetivo}
                      objetivoUsd={profile.financiamiento.objetivoUsd}
                      recaudado={profile.financiamiento.recaudado}
                      variant="self"
                    />
                  </Card>
                )}
              </div>

              {/* Recommended Opportunities / Next Steps */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-foreground">Oportunidades Recomendadas</h3>
                  <Link href="/posiciones" className="text-xs text-[#0f4c81] dark:text-sky-400 font-bold hover:underline">Ver todas</Link>
                </div>
                
                <div className="space-y-4">
                  {/* Opportunity 1 */}
                  <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        <Briefcase className="h-6 w-6 text-[#0f4c81] dark:text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#0f4c81] dark:group-hover:text-sky-400 transition-colors break-words">Pasantía en Análisis de Datos</h4>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0 border-0 shrink-0">NUEVO</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Ofrecida por <span className="font-semibold text-slate-700 dark:text-slate-300">Intel Costa Rica</span> (Red de Exalumnos)</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 dark:border-slate-700">Medio Tiempo</Badge>
                          <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 dark:border-slate-700">Remoto</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Opportunity 2 */}
                  <Card className="p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/30">
                        <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-words">Mentoría: Preparación para Entrevistas</h4>
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] px-2 py-0 border-0 shrink-0">SUGERIDO</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Mentor: <span className="font-semibold text-slate-700 dark:text-slate-300">Carlos Méndez</span> (Ingeniería UCR)</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-[10px] px-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20" onClick={() => setIsCoffeeOpen(true)}>
                            Agendar Café
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>


          </>
        ) : (
          <>
            {/* VISTA EXALUMNO */}
            {/* Top Section - Tarjetas Exalumno */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              
              {/* Welcome Exalumno Card - Premium Redesign */}
              <Card className="lg:col-span-2 p-5 sm:p-6 md:p-8 border-0 bg-gradient-to-br from-[#0f4c81] to-[#003b6d] dark:from-slate-900 dark:to-slate-950 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out group flex relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                  <Sparkles className="w-48 h-48 text-white" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute top-10 right-20 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl"></div>

                <div className="w-full relative z-10 text-white flex flex-col justify-center min-h-[200px]">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 backdrop-blur-md">
                      {t("dashboard.welcome.exalumno")}
                    </Badge>
                  </div>
                  <AnimatedHeading as="h1" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white mb-4 leading-tight tracking-tight">
                    Hola de nuevo, {session?.user?.name || "Graduado"}. <br/>
                    <span className="text-sky-300 drop-shadow-[0_0_15px_rgba(125,211,252,0.3)]">{t("dashboard.welcome.title.exalumno")}</span>
                  </AnimatedHeading>
                  <p className="text-sky-100/90 mb-8 text-sm md:text-base leading-relaxed max-w-lg font-medium">
                    Gracias por apoyar al talento de la UCR.{" "}
                    {profile?.matchesContactados > 0
                      ? `Tienes ${profile.matchesContactados} solicitud${profile.matchesContactados !== 1 ? "es" : ""} de estudiantes esperando tu respuesta.`
                      : "Sigue conectando con estudiantes de la red UCR y deja tu legado."}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <Link href="/directorio/estudiantes">
                      <Button className="bg-white text-[#0f4c81] hover:bg-slate-100 font-bold border-0 shadow-[0_4px_14px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-0.5">
                        {t("dashboard.welcome.btn.students")}
                      </Button>
                    </Link>
                    <Link href="/mis-posiciones">
                      <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md transition-all hover:-translate-y-0.5">
                        Mis Posiciones
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Impact Card - Premium Redesign */}
              <Card className="p-5 sm:p-7 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full blur-3xl group-hover:bg-emerald-400/10 transition-colors duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Heart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <AnimatedHeading as="h3" className="text-xl">{t("dashboard.impact.title")}</AnimatedHeading>
                    </div>
                    <Badge className="bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold px-3 py-1">
                      {t("dashboard.impact.badge")}
                    </Badge>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 block mb-2">{t("dashboard.impact.total")}</span>
                      <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#005da4] to-[#00a3e0] dark:from-sky-400 dark:to-emerald-400 drop-shadow-sm">
                        {profile?.donacionTotalConfirmada != null
                          ? `₡${Number(profile.donacionTotalConfirmada).toLocaleString("es-CR")}`
                          : "₡0"}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("dashboard.impact.sponsored")}</span>
                      </div>
                      {Array.isArray(profile?.proyectosPatrocinados) && profile.proyectosPatrocinados.length > 0 ? (
                        <div className="space-y-4">
                          {profile.proyectosPatrocinados.map((p: any, i: number) => (
                            <div key={i} className="group/item">
                              <div className="flex justify-between text-sm mb-1.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px] group-hover/item:text-[#005da4] dark:group-hover/item:text-sky-400 transition-colors">
                                  {p.proyecto_titulo} <span className="text-xs text-slate-400 font-normal">({p.nombre_estudiante})</span>
                                </span>
                                <span className="font-extrabold text-[#005da4] dark:text-sky-400 ml-1">{p.avance ?? 0}%</span>
                              </div>
                              <Progress value={p.avance ?? 0} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-gradient-to-r [&>div]:from-[#005da4] [&>div]:to-[#00a3e0]" />
                              {p.montoObjetivo > 0 && (
                                <FundingProgressBar
                                  objetivo={p.montoObjetivo}
                                  objetivoUsd={p.montoObjetivoUsd}
                                  recaudado={p.montoRecaudado ?? 0}
                                  variant="donor"
                                  className="mt-3"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                          <p className="text-sm text-slate-500 font-medium mb-1">Sin proyectos patrocinados aún.</p>
                          <Link href="/donaciones" className="text-xs text-[#0f4c81] dark:text-sky-400 font-bold hover:underline">Explorar proyectos para donar</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Section - Exalumno */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
              
              {/* Quick Actions Card */}
              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-[#005da4]/10 dark:bg-sky-900/30 rounded-lg">
                    <Sparkles className="h-5 w-5 text-[#005da4] dark:text-sky-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Oportunidades y Acción</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/directorio/estudiantes" className="block">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-[#005da4]/5 dark:hover:bg-sky-900/20 hover:border-[#005da4]/30 dark:hover:border-sky-700 transition-all cursor-pointer h-full flex flex-col items-center text-center gap-3 group/btn">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm group-hover/btn:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-[#005da4] dark:text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-1">Buscar Talento</h4>
                        <p className="text-xs text-slate-500">Mentorea a estudiantes de la UCR o recluta perfiles.</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/mis-posiciones" className="block">
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-[#005da4]/5 dark:hover:bg-sky-900/20 hover:border-[#005da4]/30 dark:hover:border-sky-700 transition-all cursor-pointer h-full flex flex-col items-center text-center gap-3 group/btn">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm group-hover/btn:scale-110 transition-transform">
                        <Briefcase className="h-6 w-6 text-[#005da4] dark:text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-200 mb-1">Publicar Vacante</h4>
                        <p className="text-xs text-slate-500">Ofrece empleos o pasantías a la comunidad.</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Network Status Card */}
              <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Estado de tu Red</h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Perfil de Mentor Activo</h4>
                      <p className="text-xs text-slate-500 mt-1">Los estudiantes pueden encontrarte en el directorio y solicitar mentorías.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {profile?.matchesContactados > 0 ? `${profile.matchesContactados} Solicitudes Pendientes` : "Sin solicitudes nuevas"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {profile?.matchesContactados > 0 
                          ? "Tienes estudiantes esperando conectar contigo. ¡Revisa tus matches!" 
                          : "Tu bandeja de solicitudes de mentoría está al día."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href="/mis-matches/exalumno" className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                      Ir a Mis Matches <Send className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Card>

            </div>


          </>
        )}
      </div>

    {/* Modal Beca */}
    <Dialog open={isBecaOpen} onOpenChange={setIsBecaOpen}>
      <DialogContent className="max-w-md w-[92vw] sm:w-full bg-white border border-slate-200 shadow-xl rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0f4c81] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
            Aplicar a Beca de Excelencia
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Estás postulando al fondo especial de Excelencia de Exalumnos de la UCR.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleApplyBeca} className="space-y-4 my-2">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Nombre del Solicitante</Label>
            <Input value={userName} disabled className="text-xs bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700">Proyecto de Graduación</Label>
            <Input value={proyectoTitulo} disabled className="text-xs bg-slate-50 text-slate-500" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="beca-justificacion" className="text-xs font-bold text-slate-700">Justificación de la Solicitud</Label>
            <Textarea 
              id="beca-justificacion" 
              placeholder="Explica brevemente en qué se utilizarán los fondos de beca y cómo beneficiará el desarrollo de tu proyecto..." 
              className="text-xs min-h-[90px]"
              value={becaJustification}
              onChange={(e) => setBecaJustification(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
              Enviar Postulación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Modal Café Virtual */}
    <Dialog open={isCoffeeOpen} onOpenChange={setIsCoffeeOpen}>
      <DialogContent className="max-w-md w-[92vw] sm:w-full bg-white border border-slate-200 shadow-xl rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0f4c81] flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-700" />
            Agendar Café Virtual
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Solicita una sesión informal de mentoría de 30 minutos con <span className="font-semibold text-slate-700">{selectedMentor?.name}</span> ({selectedMentor?.role}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleScheduleCoffee} className="space-y-4 my-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="coffee-date" className="text-xs font-bold text-slate-700">Fecha Propuesta</Label>
              <Input 
                id="coffee-date" 
                type="date" 
                className="text-xs"
                value={coffeeDate}
                onChange={(e) => setCoffeeDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="coffee-time" className="text-xs font-bold text-slate-700">Hora Propuesta</Label>
              <Input 
                id="coffee-time" 
                type="time" 
                className="text-xs"
                value={coffeeTime}
                onChange={(e) => setCoffeeTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="coffee-msg" className="text-xs font-bold text-slate-700">Mensaje para el Mentor</Label>
            <Textarea 
              id="coffee-msg" 
              placeholder="Hola, me gustaría conversar sobre..." 
              className="text-xs min-h-[90px]"
              value={coffeeMessage}
              onChange={(e) => setCoffeeMessage(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-xs font-semibold">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold gap-2">
              <Send className="h-3 w-3" />
              Confirmar Solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </div>
  );
}
