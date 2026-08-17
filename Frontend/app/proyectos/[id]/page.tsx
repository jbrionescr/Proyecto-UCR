"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ArrowLeft, DollarSign, Lightbulb, Briefcase,
  Users, GraduationCap, MapPin, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FundingProgressBar } from "@/components/donaciones/FundingProgressBar";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface ProyectoPublico {
  studentId: string;
  nombre: string;
  foto_url?: string;
  carrera?: string;
  escuela_facultad?: string;
  sede?: string;
  nivel_academico?: string;
  proyecto_titulo: string;
  proyecto_tipo?: string;
  proyecto_descripcion?: string;
  proyecto_porcentaje_avance: number;
  busca_financiamiento: boolean;
  busca_mentoria: boolean;
  busca_empleo: boolean;
  busca_pasantia: boolean;
  montoObjetivo?: number;
  montoObjetivoUsd?: number;
  montoRecaudado?: number;
}

const UCR = {
  blue: "#005da4",
  sky: "#00c0f3",
  orange: "#f37021",
  yellow: "#fdb912",
};

function ApoyoBadge({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#005da4]/20 text-[#005da4] shadow-sm">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

export default function ProyectoPublicoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [proyecto, setProyecto] = useState<ProyectoPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;

    fetch(`/api/proyectos/${studentId}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setProyecto(d); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [status, studentId, router]);

  if (status === "loading" || loading) {
    return (
      <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: UCR.blue }} />
      </ParallaxBackground>
    );
  }

  if (notFound || !proyecto) {
    return (
      <ParallaxBackground className="min-h-full flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: `${UCR.blue}15` }}>
          <GraduationCap className="w-10 h-10" style={{ color: UCR.blue }} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Proyecto no disponible</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">
          Este proyecto no está publicado o no existe.
        </p>
        <Link href="/directorio/estudiantes">
          <Button variant="outline" className="border-[#005da4] text-[#005da4]">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Ver directorio de estudiantes
          </Button>
        </Link>
      </ParallaxBackground>
    );
  }

  const avance = proyecto.proyecto_porcentaje_avance ?? 0;
  const initials = proyecto.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isExalumno = (session?.user as any)?.tipo === "EXALUMNO";
  const isOwnProject = (session?.user as any)?.id === proyecto.studentId;

  return (
    <ParallaxBackground className="min-h-full">
      <div className="fu-hero-gradient animate-fu-gradient border-b border-white/10 text-white py-4 px-6 md:px-12 flex items-center shadow-md">
        <Link href="/directorio/estudiantes" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al directorio
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-10">
        {/* Project card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
          {/* Gradient bar */}
          <div className="h-3 w-full fu-hero-gradient animate-fu-gradient" />

          {/* Student header */}
          <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              {proyecto.foto_url ? (
                <img src={proyecto.foto_url} alt={proyecto.nombre} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0" style={{ background: UCR.blue }}>
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white break-words">{proyecto.nombre}</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {proyecto.carrera && (
                    <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{proyecto.carrera}</span>
                  )}
                  {proyecto.sede && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{proyecto.sede}</span>
                  )}
                </div>
                {proyecto.nivel_academico && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block" style={{ background: `${UCR.sky}20`, color: UCR.sky }}>
                    {proyecto.nivel_academico}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="px-5 sm:px-7 py-5 sm:py-6">
            <div className="mb-4">
              <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl mb-2 break-words">{proyecto.proyecto_titulo}</AnimatedHeading>
              {proyecto.proyecto_tipo && (
                <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: UCR.orange }}>
                  {proyecto.proyecto_tipo}
                </span>
              )}
            </div>

            {proyecto.proyecto_descripcion && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {proyecto.proyecto_descripcion}
              </p>
            )}

            {/* Progress */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: `${UCR.blue}08` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" style={{ color: UCR.blue }} /> Estado de avance
                </span>
                <span className="text-lg font-extrabold" style={{ color: UCR.blue }}>{avance}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${avance}%`, background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky})` }} />
              </div>
            </div>

            {/* Recaudación */}
            {proyecto.busca_financiamiento && !!proyecto.montoObjetivo && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Recaudación del proyecto</p>
                <FundingProgressBar
                  objetivo={proyecto.montoObjetivo}
                  objetivoUsd={proyecto.montoObjetivoUsd}
                  recaudado={proyecto.montoRecaudado ?? 0}
                  variant={isOwnProject ? "self" : "donor"}
                />
              </div>
            )}

            {/* Support */}
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Apoyo buscado</p>
              <div className="flex flex-wrap gap-2">
                <ApoyoBadge label="Financiamiento" icon={DollarSign} active={proyecto.busca_financiamiento} />
                <ApoyoBadge label="Mentoría" icon={Lightbulb} active={proyecto.busca_mentoria} />
                <ApoyoBadge label="Empleo" icon={Users} active={proyecto.busca_empleo} />
                <ApoyoBadge label="Pasantía" icon={Briefcase} active={proyecto.busca_pasantia} />
              </div>
            </div>

            {/* CTA for exalumno */}
            {isExalumno && proyecto.busca_financiamiento && (
              <Link href="/donaciones">
                <Button className="w-full text-white font-bold py-3 rounded-xl text-sm" style={{ background: UCR.blue }}>
                  <DollarSign className="w-4 h-4 mr-2" /> Donar a este proyecto
                </Button>
              </Link>
            )}

            {isExalumno && !proyecto.busca_financiamiento && (
              <Link href={`/perfil/${studentId}`}>
                <Button variant="outline" className="w-full font-semibold py-3 rounded-xl text-sm border-[#005da4] text-[#005da4] hover:bg-[#005da4]/5">
                  Ver perfil del estudiante
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </ParallaxBackground>
  );
}
