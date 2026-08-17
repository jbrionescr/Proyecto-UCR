"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Users, 
  Coffee, 
  ArrowRight, 
  Sparkles, 
  MessageSquare,
  Award,
  BookOpen,
  ArrowUpRight,
  Shield,
  Lightbulb,
  Sparkle,
  Phone,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IntroVideo } from "@/components/layout/IntroVideo";
import { ThemeToggle } from "@/components/fu/ThemeToggle";

const FAQS = [
  {
    pregunta: "¿Quiénes pueden registrarse en la plataforma?",
    respuesta: "Cualquier estudiante activo de la Universidad de Costa Rica (UCR) y cualquier exalumno graduado que desee colaborar, ofrecer mentorías, empleo o patrocinar becas."
  },
  {
    pregunta: "¿Cómo funciona el algoritmo de match de mentorías?",
    respuesta: "Nuestra plataforma analiza el perfil del estudiante, su carrera, el área de su proyecto de graduación y el tipo de apoyo que busca, y lo conecta con exalumnos mentores que tengan experiencia en esos mismos sectores o tecnologías."
  },
  {
    pregunta: "¿En qué consisten las becas de impulso?",
    respuesta: "Son apoyos económicos directos financiados por exalumnos para que los estudiantes puedan comprar materiales, software o insumos para concluir su proyecto de graduación."
  },
  {
    pregunta: "¿Cómo se programan los cafés virtuales?",
    respuesta: "Una vez emparejados (match), el estudiante puede ver la disponibilidad del exalumno y solicitar una videollamada informal de 30 minutos a través de la plataforma para recibir asesoría."
  }
];

// Componentes de las Figuras Oficiales de la Marca
const UCRUElement = ({ className = "" }: { className?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {/* Red-orange U-shape */}
      <path d="M 30 15 H 85 V 50 A 27.5 27.5 0 0 1 30 50 Z" fill="#F34B26" />
      {/* Orange circle */}
      <circle cx="28" cy="48" r="14" fill="#FF9B18" />
    </svg>
  </div>
);

const UCRFlowerElement = ({ className = "" }: { className?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
      {/* 12 Petals rotated around center (50, 50) */}
      <circle cx="50" cy="50" r="12" fill="#FF9B18" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <rect
          key={deg}
          x="46.5"
          y="12"
          width="7"
          height="28"
          rx="3.5"
          fill="#FF9B18"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
    </svg>
  </div>
);

const UCRSlantedBarElement = ({ className = "", color = "#006AD3" }: { className?: string; color?: string }) => (
  <div className={`select-none pointer-events-none ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.1)]" preserveAspectRatio="none">
      {/* Parallelogram slanted to the left */}
      <polygon points="40,0 100,0 60,100 0,100" fill={color} />
    </svg>
  </div>
);

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);



  // Datos mockeados de testimonios
  const testimonios = [
    {
      nombre: "Gabriel Solano",
      rol: "Estudiante de Ing. Eléctrica",
      texto: "Gracias a la beca del fondo de Exalumnos pude adquirir los componentes necesarios para finalizar mi proyecto de investigación de energía renovable, y hoy realizo una pasantía gestionada a través de la bolsa de la plataforma.",
      iniciales: "GS",
      color: "bg-ucr-esmeralda",
    },
    {
      nombre: "Ing. María Valverde",
      rol: "Ingeniera Principal en Intel CR (Exalumna)",
      texto: "Poder guiar a muchachos talentosos que están en la misma posición en la que yo estuve hace años es sumamente gratificante. Compartir un café virtual de 30 minutos puede marcar la diferencia en sus carreras.",
      iniciales: "MV",
      color: "bg-ucr-amarillo text-ucr-negro",
    },
    {
      nombre: "Andrea Gómez",
      rol: "Graduada de Computación",
      texto: "La plataforma me conectó con un mentor excepcional que me aconsejó durante todo mi último año. Hoy trabajo en el equipo que él lidera. ¡Una red de apoyo real y activa!",
      iniciales: "AG",
      color: "bg-[#006AD3]",
    }
  ];

  return (
    <div className="min-h-screen bg-ucr-gris-fondo dark:bg-ucr-negro font-body transition-colors duration-300 relative overflow-hidden flex flex-col">
      {/* Intro Video (plays once per session) */}
      <IntroVideo />
      {/* Background Decorative Glows — FWD brand colors */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00AEEF]/10 dark:bg-[#00AEEF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#6B2D8B]/10 dark:bg-[#6B2D8B]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] bg-[#00A651]/6 dark:bg-[#00A651]/4 rounded-full blur-[100px] pointer-events-none" />

      {/* Header/Navbar (Absolute overlay) */}
      <header className="absolute top-0 left-0 w-full z-50 transition-all duration-300 bg-transparent border-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 sm:h-28 flex items-center justify-between relative">

          {/* Mobile Left: Theme Toggle + Login Link */}
          <div className="md:hidden flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login">
              <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:text-slate-200">
                Ingresar
              </span>
            </Link>
          </div>

          {/* Left Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-end pr-10">
            <div className="flex items-center gap-4 border-r border-white/20 pr-8 mr-2">
              <ThemeToggle />
              <Link href="/login">
                <Button className="bg-[#006AD3] hover:bg-[#0056ab] text-white font-extrabold text-sm uppercase tracking-wider rounded-[8px] h-10 px-5 border-none transition-all shadow-md">
                  Ingresar
                </Button>
              </Link>
            </div>
            <a href="#" className="text-white hover:text-ucr-celeste text-sm font-bold uppercase tracking-widest transition-colors">
              Inicio
            </a>
            <a href="#pilares" className="text-white hover:text-ucr-celeste text-sm font-bold uppercase tracking-widest transition-colors">
              Pilares
            </a>
          </nav>

          {/* Center Logo (Desktop & Mobile) */}
          <div className="flex flex-col items-center justify-center z-10 shrink-0 mx-auto md:mx-0">
            <Link href="/" className="flex flex-col items-center gap-1 group">
              <img
                src="/logo.png"
                alt="Logo U"
                className="h-12 sm:h-16 w-auto object-contain dark:brightness-110 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="text-center">
                <span className="text-sm sm:text-base font-bold tracking-widest text-white font-display block leading-none">EXALUMNOS U</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block mt-0.5">Impacto y Legado</span>
              </div>
            </Link>
          </div>

          {/* Right Navigation Links and CTAs (Desktop) */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-start pl-10">
            <a href="#como-funciona" className="text-white hover:text-ucr-celeste text-sm font-bold uppercase tracking-widest transition-colors">
              Proceso
            </a>
            <a href="#faq" className="text-white hover:text-ucr-celeste text-sm font-bold uppercase tracking-widest transition-colors">
              FAQ
            </a>
            <div className="flex items-center gap-4 border-l border-white/20 pl-8">
              <Link href="/registro">
                <Button className="bg-[#006AD3] hover:bg-[#0056ab] text-white font-extrabold text-sm uppercase tracking-wider rounded-[8px] h-10 px-5 border-none transition-all shadow-md">
                  Inscribirse
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Right: Register Link */}
          <div className="md:hidden flex items-center">
            <Link href="/registro">
              <Button className="bg-[#006AD3] hover:bg-[#0056ab] text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-[8px] h-8 px-3 sm:h-9 sm:px-4 border-none shadow-sm">
                Registro
              </Button>
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen min-h-[680px] flex items-center pb-24 sm:pb-32 md:pb-44 text-white overflow-hidden bg-ucr-negro w-full">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-video-landing.mp4" type="video/mp4" />
        </video>
        
        {/* Overlays: solid mask for readability */}
        <div className="absolute inset-0 bg-ucr-negro/70 z-10 pointer-events-none" />
        


        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-6 relative z-20 w-full flex flex-col items-center text-center pt-28 sm:pt-36 md:pt-48 pb-12">
          {/* Centered Content */}
          <div className="space-y-6 flex flex-col items-center relative w-full">
            {/* Very subtle background star watermark behind text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 text-white/[0.025] pointer-events-none z-0 select-none animate-[spin_180s_linear_infinite] hidden lg:block">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                <path d="M50 0 L55 35 L85 15 L65 45 L100 50 L65 55 L85 85 L55 65 L50 100 L45 65 L15 85 L35 55 L0 50 L35 45 L15 15 L45 35 Z" />
              </svg>
            </div>

            {/* Overline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ucr-celeste/15 border border-ucr-celeste/30 text-ucr-celeste text-xs font-bold uppercase tracking-widest font-body">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              COMUNIDAD OFICIAL ALUMNI U
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight font-display leading-[1.2] text-white max-w-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] text-center uppercase">
              Fundación <br/>
              <span className="text-ucr-celeste">Exalumnos de la U</span>
            </h1>
            
            {/* Sub-info details */}
            <div className="text-xs sm:text-sm font-semibold tracking-widest text-slate-200/90 font-body uppercase text-center">
              LA UNIVERSIDAD • PORTAL DE VINCULACIÓN PROFESIONAL
            </div>

            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-3xl font-medium font-body text-center">
              El punto de encuentro donde graduados consolidados de la Universidad guían, patrocinan y abren oportunidades profesionales a estudiantes que construyen su futuro.
            </p>


          </div>
        </div>


      </section>



      {/* Roles Selection Section (Floating entry points moved below Hero to maintain design cleanliness) */}
      <section id="roles" className="py-20 bg-[#006AD3] dark:bg-slate-950 relative z-20 border-none overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 space-y-3 relative">
            {/* Centered background watermark */}
            <UCRUElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-80 dark:opacity-60 pointer-events-none z-0 rotate-12" />
            <div className="relative z-10 space-y-3">
              <h2 className="text-xs font-bold text-sky-200 dark:text-sky-300 uppercase tracking-widest font-body">¿CÓMO DESEAS PARTICIPAR?</h2>
              <h3 className="text-3xl font-medium font-display text-white dark:text-white uppercase leading-tight">SELECCIONA TU ROL DE INGRESO</h3>
              <p className="text-sm text-blue-100 dark:text-slate-300 font-medium max-w-xl mx-auto">
                Únete a la plataforma oficial de vinculación de la Universidad según tu perfil.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Card */}
            <Link href="/registro/estudiante" className="group">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-ucr-celeste/60 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-ucr-celeste transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="flex items-start gap-5">
                  <div className="bg-ucr-celeste-tint dark:bg-ucr-celeste/20 text-ucr-esmeralda dark:text-ucr-celeste p-4 rounded-2xl group-hover:scale-110 group-hover:bg-ucr-celeste/30 transition-all duration-300">
                    <GraduationCap className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-white font-display flex items-center gap-2 uppercase">
                      Soy Estudiante
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                      Accede a mentoría profesional, agenda cafés virtuales, solicita becas de graduación y postulate a pasantías exclusivas.
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Alumni Card */}
            <Link href="/registro/exalumno" className="group">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-ucr-amarillo/60 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-ucr-amarillo transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="flex items-start gap-5">
                  <div className="bg-ucr-beige-tint dark:bg-ucr-amarillo/20 text-ucr-amarillo p-4 rounded-2xl group-hover:scale-110 group-hover:bg-ucr-beige-tint/30 transition-all duration-300">
                    <Briefcase className="h-9 w-9" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-white font-display flex items-center gap-2 uppercase">
                      Soy Exalumno
                      <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                      Comparte tu trayectoria, ofrece mentoría a futuros colegas, publica ofertas de empleo y patrocina proyectos e iniciativas estudiantiles.
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </section>

      {/* Pillars Section */}
      <section id="pilares" className="py-20 lg:py-28 w-full bg-white dark:bg-ucr-negro border-none relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative">
          {/* Centered background watermark */}
          <UCRFlowerElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-80 dark:opacity-50 pointer-events-none z-0 animate-[spin_180s_linear_infinite]" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">¿CÓMO FUNCIONA LA RED?</h2>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              LOS TRES PILARES DE NUESTRO IMPACTO
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Conectamos el conocimiento académico de las aulas de la U con el liderazgo práctico de los sectores profesionales.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <Card className="border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-celeste transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20"></div>
            <div className="h-48 w-full overflow-hidden relative">
              <Image src="/mentor_landing.png" alt="Mentoría" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-4 left-4 bg-ucr-celeste-tint dark:bg-ucr-celeste/20 text-ucr-esmeralda dark:text-sky-400 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm">
                <Coffee className="h-5 w-5" />
              </div>
            </div>
            <div className="p-8 pt-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                  MENTORÍAS Y CAFÉS VIRTUALES
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Conéctate directamente para conversar informalmente. Recibe guía sobre tu proyecto final, revisiones de currículum y recomendaciones clave para dar tus primeros pasos profesionales.
                </p>
              </div>
              <div className="pt-8 flex items-center text-xs font-bold text-ucr-celeste gap-1.5 group-hover:gap-2.5 transition-all">
                SABER MÁS <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card className="border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-esmeralda transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20"></div>
            <div className="h-48 w-full overflow-hidden relative">
              <Image src="/jobs_landing.png" alt="Empleo" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-4 left-4 bg-ucr-turquesa-tint dark:bg-ucr-esmeralda/20 text-[#004C63] dark:text-sky-300 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="p-8 pt-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                  OPORTUNIDADES LABORALES
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Accede a una bolsa de empleo diseñada específicamente para estudiantes y graduados recientes de la U. Encuentra vacantes publicadas y recomendadas de primera mano por los mismos exalumnos.
                </p>
              </div>
              <div className="pt-8 flex items-center text-xs font-bold text-ucr-esmeralda gap-1.5 group-hover:gap-2.5 transition-all">
                EXPLORAR VACANTES <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card className="border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 relative overflow-hidden group backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-ucr-naranja transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-20"></div>
            <div className="h-48 w-full overflow-hidden relative">
              <Image src="/scholarship_landing.png" alt="Becas" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-4 left-4 bg-ucr-rosa-tint dark:bg-ucr-naranja/20 text-ucr-naranja w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
            </div>
            <div className="p-8 pt-6 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-semibold text-ucr-texto-oscuro dark:text-white mb-3 font-display uppercase">
                  FILANTROPÍA Y BECAS DE IMPULSO
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Apoya o postula a fondos especiales para financiar proyectos de graduación. El fondo solidario de exalumnos busca que ningún estudiante talentoso detenga su carrera por limitaciones económicas.
                </p>
              </div>
              <div className="pt-8 flex items-center text-xs font-bold text-ucr-naranja gap-1.5 group-hover:gap-2.5 transition-all">
                VER PROYECTOS <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </div>
        </div>
      </section>

      {/* Sección "¿Cómo Funciona?" */}
      <section id="como-funciona" className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-850 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">EL PROCESO</h2>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              ¿CÓMO FUNCIONA LA PLATAFORMA?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Conectarte con el éxito profesional en la U es un proceso sencillo diseñado en cuatro etapas clave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Línea conectora horizontal (solo en pantallas md y mayores) */}
            <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-slate-800 -translate-y-12 z-0" />

            {/* Paso 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#006AD3] flex items-center justify-center text-[#006AD3] shadow-md group-hover:scale-110 group-hover:bg-[#006AD3] group-hover:text-white transition-all duration-300 mb-6">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-[#006AD3] uppercase tracking-wider">Paso 01</span>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mt-2 mb-2 font-display uppercase">Registro de Perfil</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed font-medium">
                Crea tu cuenta oficial como estudiante o exalumno y define tus intereses, carrera y metas.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-ucr-esmeralda flex items-center justify-center text-ucr-esmeralda shadow-md group-hover:scale-110 group-hover:bg-ucr-esmeralda group-hover:text-white transition-all duration-300 mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-ucr-esmeralda uppercase tracking-wider">Paso 02</span>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mt-2 mb-2 font-display uppercase">Match Inteligente</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed font-medium">
                El sistema sugiere conexiones ideales según perfiles académicos, laborales y de especialidad.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#F34B26] flex items-center justify-center text-[#F34B26] shadow-md group-hover:scale-110 group-hover:bg-[#F34B26] group-hover:text-white transition-all duration-300 mb-6">
                <Coffee className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-[#F34B26] uppercase tracking-wider">Paso 03</span>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mt-2 mb-2 font-display uppercase">Café y Mentoría</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed font-medium">
                Coordina una sesión virtual corta de 30 minutos para mentoría, consejos prácticos o guía de tesis.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-ucr-amarillo flex items-center justify-center text-ucr-amarillo shadow-md group-hover:scale-110 group-hover:bg-ucr-amarillo group-hover:text-white dark:group-hover:text-slate-950 transition-all duration-300 mb-6">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-ucr-amarillo uppercase tracking-wider">Paso 04</span>
              <h4 className="text-lg font-semibold text-slate-800 dark:text-white mt-2 mb-2 font-display uppercase">Impulso y Logro</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] leading-relaxed font-medium">
                Postula a becas financiadas, accede a la bolsa de trabajo y alcanza tu graduación y éxito laboral.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impacto" className="bg-[#F34B26] text-white py-20 relative overflow-hidden border-none shadow-inner">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text left */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-bold text-white/90 uppercase tracking-widest font-body">CIFRAS QUE INSPIRAN</h2>
              <h3 className="text-3xl sm:text-4xl font-medium font-display leading-tight uppercase text-white">
                EL IMPACTO DE NUESTRA RED DE EXALUMNOS DE LA U
              </h3>
              <p className="text-sm text-white/85 leading-relaxed font-medium font-body">
                La Fundación trabaja incansablemente para promover la inserción laboral y el desarrollo académico. Cada aporte, cada hora de mentoría compartida y cada donación construye un camino más sólido para las próximas generaciones.
              </p>
              <div className="border-t border-white/20 pt-6">
                <p className="text-xs text-white/90 font-bold flex items-center gap-2 font-body">
                  <Sparkle className="h-4 w-4 text-white fill-white animate-spin" />
                  MÉTRICAS ACTUALIZADAS AUTOMÁTICAMENTE EN TIEMPO REAL
                </p>
              </div>
            </div>

            {/* Grid right */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[15px] text-center space-y-2 hover:border-white/40 transition-all duration-300 shadow-lg">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">5,000+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Exalumnos Activos</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[15px] text-center space-y-2 hover:border-white/40 transition-all duration-300 shadow-lg">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Coffee className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">12,000+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Horas de Mentoría</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[15px] text-center space-y-2 hover:border-white/40 transition-all duration-300 shadow-lg">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Award className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">₡15M+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Fondos Recaudados</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-[15px] text-center space-y-2 hover:border-white/40 transition-all duration-300 shadow-lg">
                <div className="bg-white/15 text-white w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h4 className="text-3xl sm:text-4xl font-semibold font-display text-white">350+</h4>
                <p className="text-xs text-white/80 font-semibold uppercase tracking-wider font-body">Becas Concedidas</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 lg:py-28 w-full bg-ucr-gris-fondo dark:bg-ucr-negro border-none relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 relative">
          {/* Centered background watermark */}
          <UCRSlantedBarElement color="#006AD3" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-28 opacity-80 dark:opacity-50 pointer-events-none z-0" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">TESTIMONIOS</h2>
            <h3 className="text-3xl sm:text-4xl font-medium tracking-tight font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              NUESTRA RED EN LA VOZ DE SUS PROTAGONISTAS
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Conoce cómo la plataforma está transformando el desarrollo profesional en la comunidad de la U.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonios.map((t, idx) => (
            <Card key={idx} className="p-8 border-slate-200/60 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-md flex flex-col justify-between hover:shadow-lg transition-all backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-ucr-amarillo">
                  <Sparkles className="h-4 w-4 fill-ucr-amarillo" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-body">Historia Recomendada</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic font-body">
                  "{t.texto}"
                </p>
              </div>

              <div className="pt-8 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${t.color} text-white font-extrabold text-sm flex items-center justify-center font-body`}>
                  {t.iniciales}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white font-display leading-tight">{t.nombre}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-0.5 font-body">{t.rol}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-white dark:bg-ucr-negro border-t border-slate-100 dark:border-slate-800 relative z-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-bold text-ucr-esmeralda dark:text-ucr-celeste uppercase tracking-widest font-body">PREGUNTAS FRECUENTES</h2>
            <h3 className="text-3xl font-medium font-display text-ucr-texto-oscuro dark:text-white leading-tight uppercase">
              RESOLVEMOS TUS DUDAS
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Todo lo que necesitas saber sobre el funcionamiento de la red Alumni U.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{faq.pregunta}</span>
                    <span className="text-xl ml-4 text-[#006AD3]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-850/50 bg-white dark:bg-slate-900/30">
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-[#004C63] text-white py-16 text-center relative overflow-hidden">

        <div className="absolute inset-0 bg-[url('/login-pattern-gemini.png')] opacity-10 bg-cover bg-bottom mix-blend-overlay pointer-events-none"></div>
        
        {/* Centered background watermark */}
        <UCRFlowerElement className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 opacity-80 pointer-events-none z-0 animate-[spin_240s_linear_infinite]" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-medium font-display leading-tight text-white uppercase">
            ¿LISTO PARA FORMAR PARTE DE LA RED DE IMPACTO DE LA U?
          </h2>
          <p className="text-sm sm:text-base text-slate-200/80 max-w-xl mx-auto leading-relaxed font-medium font-body">
            Ya seas estudiante en busca de impulso o exalumno con el deseo de guiar a nuevos talentos, tu lugar está aquí.
          </p>
          <div className="pt-4 flex justify-center gap-4 flex-wrap">
            <Link href="/registro">
              <Button size="lg" className="h-14 px-8 rounded-[10px] bg-[#006AD3] hover:bg-[#0056ab] text-white font-bold shadow-md transition-all border-none">
                CREAR CUENTA
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 rounded-[10px] bg-[#F34B26] hover:bg-[#d73b1d] text-white font-bold shadow-md transition-all border-none">
                INICIAR SESIÓN
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
