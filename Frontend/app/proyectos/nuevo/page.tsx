"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2, Loader2, ChevronRight, ChevronLeft,
  Rocket, BookOpen, HeartHandshake, Eye,
  DollarSign, Briefcase, GraduationCap, Lightbulb,
  X, Save, Zap, Users, Plus, Trash2, Printer, CheckSquare,
  AlertTriangle, TrendingUp, Star, Award, BarChart3,
  ThumbsUp, ThumbsDown, RefreshCw, Target, Sparkles
} from "lucide-react";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { SunflowerImage } from "@/components/fu/SunflowerImage";
import { calculateProjectValue, type ProjectValueResult } from "@/actions/graduation-assistant.actions";

const UCR = { blue: "#005da4", sky: "#00c0f3", orange: "#f37021", yellow: "#fdb912", softYellow: "#ffe06a" };

const AREAS_TEMATICAS = [
  "Tecnologías de la Información","Inteligencia Artificial","Energías Renovables",
  "Biotecnología","Ciencias Sociales","Economía y Negocios","Educación","Salud Pública",
  "Derecho","Ingeniería Civil","Ingeniería Eléctrica","Arquitectura","Artes y Humanidades","Agronomía","Otro",
];
const AREAS_MENTORIA = [
  "Diseño Técnico","Plan de Negocios","Marco Legal","Investigación Académica",
  "Redacción Científica","Presentaciones","Gestión de Proyectos","Financiamiento",
  "Emprendimiento","Redes Profesionales","Metodología","Estadística",
];
const HORAS_MENTORIA = ["1-2 horas","3-5 horas","5-10 horas","Más de 10 horas"];
const DISPONIBILIDAD = ["Tiempo completo (40h)","Medio tiempo (20h)","Por horas (< 20h)"];
const MODALIDADES_TFG = [
  { value:"Tesis", label:"Tesis de Grado", desc:"Investigación científica original orientada a aportar nuevos conocimientos teóricos en la disciplina." },
  { value:"Seminario de Graduación", label:"Seminario de Graduación", desc:"Estudio exhaustivo de un problema de interés nacional, desarrollado en equipos de 2-3 estudiantes." },
  { value:"Proyecto de Graduación", label:"Proyecto de Graduación", desc:"Trabajo aplicado dirigido al desarrollo tecnológico o propuestas prácticas para el sector socioproductor." },
  { value:"Práctica Dirigida", label:"Práctica Dirigida", desc:"Inserción profesional supervisada dentro de una organización pública o privada." },
];
const RECURSOS_OPCIONES = [
  "Software / Licencias","Hardware / Equipos","Trabajo de Campo","Encuestas / Entrevistas",
  "Laboratorio","Servidores en la Nube","Materiales Físicos","Acceso a Bases de Datos",
  "Viáticos / Transporte","Colaboradores Externos",
];

const STEPS = [
  { label: "Información Académica", icon: GraduationCap },
  { label: "Detalles del Proyecto", icon: BookOpen },
  { label: "Apoyo y Calculadora", icon: TrendingUp },
  { label: "Vista Previa", icon: Eye },
];

// ── Interfaces ──
interface EstudianteInfo {
  carnet_ucr: string | null; carrera: string | null; escuela_facultad: string | null;
  sede: string | null; anio_ingreso: number | null; nivel_academico: string | null;
  user: { nombre: string; foto_url: string | null };
  proyecto_titulo: string | null; proyecto_tipo: string | null;
  proyecto_descripcion: string | null; proyecto_necesidades: any;
  proyecto_porcentaje_avance: number | null;
  busca_financiamiento: boolean; busca_mentoria: boolean;
  busca_empleo: boolean; busca_pasantia: boolean;
}

// ── Score Ring ──
function ScoreRing({ value, color, size = 80 }: { value: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 1s ease" }}/>
    </svg>
  );
}

// ── Sidebar ──
function StepSidebar({ current, completed }: { current: number; completed: boolean[] }) {
  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col gap-3 print:hidden">
      <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-900" style={{ boxShadow: "0 4px 24px rgba(0,93,164,0.1)" }}>
        {/* Gradient header */}
        <div className="px-5 py-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${UCR.blue} 0%, #0079cc 60%, ${UCR.sky} 100%)` }}>
          {/* decorative circles */}
          <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style={{ background: UCR.sky }}/>
          <div className="absolute bottom-1 -left-3 w-12 h-12 rounded-full opacity-10" style={{ background: UCR.yellow }}/>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest relative">Publicación de Proyecto</p>
          <p className="text-lg font-extrabold text-white mt-0.5 relative">Asistente UCR</p>
          <div className="flex gap-1 mt-3 relative">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
                style={{ background: i <= current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)" }}/>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-1.5">
          {STEPS.map((s, i) => {
            const done = completed[i]; const active = current === i; const Icon = s.icon;
            return (
              <div key={i}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-default ${active ? "text-white font-bold shadow-md step-glow-active" : done ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}`}
                style={active
                  ? { background: `linear-gradient(135deg, ${UCR.sky}, #0099d4)`, boxShadow: `0 4px 14px rgba(0,193,243,0.35)` }
                  : done ? { background: "rgba(34,197,94,0.08)", borderLeft: "3px solid #22c55e" } : {}}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
                  style={{
                    background: active ? "rgba(255,255,255,0.95)" : done ? "#22c55e" : "#e2e8f0",
                    color: active ? UCR.sky : done ? "#fff" : "#94a3b8",
                    boxShadow: active ? `0 2px 8px rgba(0,193,243,0.4)` : "none"
                  }}>
                  {done && !active ? <CheckCircle2 className="w-4 h-4"/> : <Icon className="w-4 h-4"/>}
                </div>
                <div className="min-w-0">
                  <span className="text-xs leading-tight font-semibold block">{s.label}</span>
                  {done && !active && <span className="text-[10px] text-emerald-500 font-bold">✓ Completado</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-4">
          <div className="w-full rounded-full h-2 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full modal-bar-fill"
              style={{ width: `${((current+1)/4)*100}%`, background: `linear-gradient(90deg,${UCR.blue},${UCR.sky})` }}/>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">Paso {current+1} de 4 · {Math.round(((current+1)/4)*100)}% completado</p>
        </div>
      </div>

      {/* Tip card */}
      <div className="rounded-xl p-4 border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-xs text-slate-500">
        <p className="font-bold mb-1" style={{ color: UCR.blue }}>💡 ¿Sabías que...</p>
        <p className="leading-relaxed">Los proyectos con descripción completa tienen un <strong>3× más</strong> probabilidad de encontrar mentor o financiamiento.</p>
      </div>
    </aside>
  );
}

function ChipTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border"
      style={{ background: UCR.softYellow, color: UCR.blue, borderColor: UCR.yellow }}>
      {label}
      <button type="button" onClick={onRemove} className="ml-1 hover:opacity-70"><X className="w-3 h-3"/></button>
    </span>
  );
}

// ── StepNav ──
function StepNav({ step, onPrev, onNext, onSave, saving, nextDisabled = false }: {
  step: number; onPrev: ()=>void; onNext: ()=>void; onSave: ()=>void; saving: boolean; nextDisabled?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden"
      style={{ boxShadow: "0 4px 20px rgba(0,93,164,0.07)" }}>
      {step > 0 ? (
        <button type="button" onClick={onPrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 group"
          style={{ borderColor: "#e2e8f0" }}>
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/> Anterior
        </button>
      ) : <div/>}
      <div className="flex gap-3">
        <button type="button" onClick={onSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          style={{ borderColor: UCR.sky, color: UCR.blue }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
          Guardar Borrador
        </button>
        <button type="button" onClick={onNext} disabled={nextDisabled || saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white disabled:opacity-50 transition-all group relative overflow-hidden"
          style={{ background: nextDisabled ? `linear-gradient(135deg,#94a3b8,#b0c0d0)` : `linear-gradient(135deg,${UCR.blue},${UCR.sky})`, boxShadow: nextDisabled ? "none" : "0 4px 14px rgba(0,193,243,0.35)" }}>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
          Siguiente Paso <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/>
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function PublicarProyectoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState([false,false,false,false]);
  const [info, setInfo] = useState<EstudianteInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic project fields
  const [titulo, setTitulo] = useState("");
  const [areaTematica, setAreaTematica] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [porcentajeAvance, setPorcentajeAvance] = useState(35);
  const [modalidadTFG, setModalidadTFG] = useState("");

  // Detail fields
  const [problema, setProblema] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [recursos, setRecursos] = useState<string[]>([]);
  const [duracion, setDuracion] = useState("6 meses");

  // Support flags
  const [buscaFinanciamiento, setBuscaFinanciamiento] = useState(false);
  const [buscaMentoria, setBuscaMentoria] = useState(false);
  const [buscaPasantia, setBuscaPasantia] = useState(false);
  const [buscaEmpleo, setBuscaEmpleo] = useState(false);

  // Financial fields
  const [montoRequerido, setMontoRequerido] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [desgloseGastos, setDesgloseGastos] = useState("");

  // AI Value Calculator states
  const [calculatingValor, setCalculatingValor] = useState(false);
  const [valorResult, setValorResult] = useState<ProjectValueResult | null>(null);
  const [valorError, setValorError] = useState<string | null>(null);
  const [valorAceptado, setValorAceptado] = useState(false);
  const [ajusteManual, setAjusteManual] = useState(0);

  // Mentoría fields
  const [areasSeleccionadas, setAreasSeleccionadas] = useState<string[]>([]);
  const [horasMentoria, setHorasMentoria] = useState("1-2 horas");
  const [perfilMentor, setPerfilMentor] = useState("");

  // Employment
  const [disponibilidad, setDisponibilidad] = useState("Medio tiempo (20h)");
  const [interesContratacion, setInteresContratacion] = useState("A discutir");

  // Checkbox reglamento
  const [checkReglamentoAprobado, setCheckReglamentoAprobado] = useState(false);

  const role = (session?.user as any)?.tipo;

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated" && role && role !== "ESTUDIANTE") router.replace("/");
  }, [status, role]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/proyectos")
      .then(r => r.json())
      .then((d: EstudianteInfo) => {
        setInfo(d);
        if (d.proyecto_titulo) setTitulo(d.proyecto_titulo);
        if (d.proyecto_tipo) setAreaTematica(d.proyecto_tipo);
        if (d.proyecto_descripcion) setDescripcion(d.proyecto_descripcion);
        if (d.proyecto_porcentaje_avance) setPorcentajeAvance(d.proyecto_porcentaje_avance);
        setBuscaFinanciamiento(d.busca_financiamiento);
        setBuscaMentoria(d.busca_mentoria);
        setBuscaPasantia(d.busca_pasantia);
        setBuscaEmpleo(d.busca_empleo);
        const nec = d.proyecto_necesidades as any;
        if (nec?.financiero) {
          setMontoRequerido(nec.financiero.monto || "");
          setFechaLimite(nec.financiero.fecha_limite || "");
          setDesgloseGastos(nec.financiero.desglose || "");
        }
        if (nec?.mentoria) {
          setAreasSeleccionadas(nec.mentoria.areas || []);
          setHorasMentoria(nec.mentoria.horas || "1-2 horas");
          setPerfilMentor(nec.mentoria.perfil_mentor || "");
        }
        if (nec?.empleabilidad) {
          setDisponibilidad(nec.empleabilidad.disponibilidad || "Medio tiempo (20h)");
          setInteresContratacion(nec.empleabilidad.interes_contratacion || "A discutir");
        }
        if (nec?.detalles) {
          setProblema(nec.detalles.problema || "");
          setObjetivo(nec.detalles.objetivo || "");
          setRecursos(nec.detalles.recursos || []);
          setDuracion(nec.detalles.duracion || "6 meses");
          setModalidadTFG(prev => nec.detalles.modalidad || prev);
        }
        if (nec?.formulacion) {
          setModalidadTFG(prev => nec.formulacion.modalidad || prev);
          setCheckReglamentoAprobado(nec.formulacion.checkReglamentoAprobado || false);
        }
      })
      .finally(() => setLoadingInfo(false));
  }, [status]);

  function buildNecesidades() {
    const nec: any = {};
    nec.detalles = { problema, objetivo, recursos, duracion, modalidad: modalidadTFG };
    if (buscaFinanciamiento) nec.financiero = { monto: montoRequerido, fecha_limite: fechaLimite, desglose: desgloseGastos };
    if (buscaMentoria) nec.mentoria = { areas: areasSeleccionadas, horas: horasMentoria, perfil_mentor: perfilMentor };
    if (buscaPasantia || buscaEmpleo) nec.empleabilidad = { disponibilidad, interes_contratacion: interesContratacion };
    nec.formulacion = { modalidad: modalidadTFG, checkReglamentoAprobado };
    if (valorResult) nec.valorIA = valorResult;
    return nec;
  }

  async function guardarBorrador() {
    setSaving(true); setError(null);
    const res = await fetch("/api/proyectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyecto_titulo: titulo, proyecto_tipo: areaTematica, proyecto_descripcion: descripcion,
        proyecto_porcentaje_avance: porcentajeAvance, proyecto_necesidades: buildNecesidades(),
        busca_financiamiento: buscaFinanciamiento, busca_mentoria: buscaMentoria,
        busca_empleo: buscaEmpleo, busca_pasantia: buscaPasantia,
      }),
    });
    if (!res.ok) setError("No se pudo guardar el borrador.");
    setSaving(false);
  }

  async function publicarProyecto() {
    setSaving(true); setError(null);
    const res = await fetch("/api/proyectos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyecto_titulo: titulo, proyecto_tipo: areaTematica, proyecto_descripcion: descripcion,
        proyecto_porcentaje_avance: porcentajeAvance, proyecto_necesidades: buildNecesidades(),
        busca_financiamiento: buscaFinanciamiento, busca_mentoria: buscaMentoria,
        busca_empleo: buscaEmpleo, busca_pasantia: buscaPasantia, publicar: true,
      }),
    });
    if (res.ok) setPublished(true);
    else setError("No se pudo publicar el proyecto.");
    setSaving(false);
  }

  function nextStep() {
    setCompleted(prev => { const c=[...prev]; c[step]=true; return c; });
    setStep(s => Math.min(s+1, 3));
  }
  function prevStep() { setStep(s => Math.max(s-1, 0)); }

  const isDetailsValid = titulo.trim().length > 5
    && areaTematica !== ""
    && descripcion.trim().length > 10
    && problema.trim().length > 10
    && objetivo.trim().length > 10
    && modalidadTFG !== "";

  // AI Calculator
  async function handleCalcularValor() {
    setCalculatingValor(true);
    setValorError(null);
    setValorResult(null);
    setValorAceptado(false);
    setAjusteManual(0);
    try {
      const res = await calculateProjectValue(
        titulo, descripcion, areaTematica, modalidadTFG, duracion,
        problema, objetivo, recursos
      );
      if (res.success && res.data) setValorResult(res.data);
      else setValorError(res.error || "Error al calcular.");
    } catch { setValorError("Error de conexión."); }
    setCalculatingValor(false);
  }

  function aceptarValorIA() {
    if (!valorResult) return;
    const base = valorResult.costoDesarrollo;
    setMontoRequerido(String(base + ajusteManual));
    setValorAceptado(true);
    setBuscaFinanciamiento(true);
    setDesgloseGastos(`Estimado por IA: Valor producto $${valorResult.valorDesarrollo.toLocaleString()} | Mercado $${valorResult.valorMercado.toLocaleString()} | Impacto social ${valorResult.impactoSocial}/100 | Valor académico ${valorResult.valorAcademico}/100`);
  }

  function ajustarMonto(delta: number) {
    const newAjuste = ajusteManual + delta;
    setAjusteManual(newAjuste);
    if (valorResult) {
      const newMonto = Math.max(0, valorResult.costoDesarrollo + newAjuste);
      setMontoRequerido(String(newMonto));
      setValorAceptado(true);
      setBuscaFinanciamiento(true);
    }
  }

  function toggleRecurso(r: string) {
    setRecursos(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  }

  const montoFinal = valorResult
    ? Math.max(0, valorResult.costoDesarrollo + ajusteManual)
    : Number(montoRequerido) || 0;

  const globalScore = valorResult?.puntuacionGlobal || 0;
  const globalColor = globalScore >= 85 ? "#22c55e" : globalScore >= 65 ? UCR.sky : UCR.orange;

  if (status === "loading" || loadingInfo) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: UCR.blue }}/>
    </div>
  );

  if (published) return (
    <ParallaxBackground className="min-h-screen flex items-center justify-center py-16">
      <div className="fu-card p-10 text-center max-w-md mx-4 animate-fu-fade-up">
        <div className="flex justify-center"><SunflowerImage size={220}/></div>
        <h2 className="text-2xl font-extrabold mt-4 mb-2 fu-text-gradient">¡Proyecto Publicado con Éxito!</h2>
        <p className="fu-text-2 mb-6 text-sm">Tu proyecto está publicado y visible para conectar con mentores y exalumnos.</p>
        <button onClick={() => router.push("/")}
          className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.03]"
          style={{ background: `linear-gradient(135deg,${UCR.blue},${UCR.sky})` }}>
          Ir al Tablero principal
        </button>
      </div>
    </ParallaxBackground>
  );

  const infoNombreCorto = info?.user?.nombre?.split(" ")[0] ?? "Estudiante";

  return (
    <ParallaxBackground className="min-h-screen">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; background: transparent !important; color: #000 !important; }
          #print-document-area, #print-document-area * { visibility: visible; }
          #print-document-area { position: absolute; left:0; top:0; width:100%; padding:2cm; font-family:'Times New Roman',serif; }
        }
        @keyframes wizardSlideUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes wizardFadeIn {
          from { opacity:0; transform:scale(0.97); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,93,164,0); }
          50%  { box-shadow: 0 0 14px 4px rgba(0,193,243,0.35); }
        }
        @keyframes floatBob {
          0%,100% { transform:translateY(0px) rotate(0deg); }
          50%      { transform:translateY(-10px) rotate(4deg); }
        }
        @keyframes shimmerSlide {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes scoreReveal {
          from { stroke-dashoffset: 999; }
          to   { /* handled inline */ }
        }
        @keyframes counterPing {
          0%   { transform: scale(1);   opacity:1; }
          70%  { transform: scale(1.8); opacity:0; }
          100% { transform: scale(1);   opacity:0; }
        }
        .wizard-card {
          animation: wizardSlideUp 0.4s cubic-bezier(.22,1,.36,1) both;
        }
        .wizard-card-delayed {
          animation: wizardSlideUp 0.45s 0.08s cubic-bezier(.22,1,.36,1) both;
        }
        .wizard-fade {
          animation: wizardFadeIn 0.35s ease both;
        }
        .step-glow-active {
          animation: pulseGlow 2.4s ease-in-out infinite;
        }
        .metric-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,93,164,0.12);
        }
        .support-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .support-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,93,164,0.1);
        }
        .support-card.selected {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .float-deco {
          animation: floatBob 5s ease-in-out infinite;
        }
        .float-deco-slow {
          animation: floatBob 7s 1.5s ease-in-out infinite;
        }
        .shimmer-bg {
          background: linear-gradient(90deg, #e8f0fe 25%, #c7d8f5 50%, #e8f0fe 75%);
          background-size: 400px 100%;
          animation: shimmerSlide 1.4s linear infinite;
        }
        .directory-card-hover {
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .directory-card-hover:hover {
          transform: translateY(-3px) scale(1.005);
          box-shadow: 0 12px 32px rgba(0,93,164,0.14);
        }
        .calc-btn-glow:not(:disabled):hover {
          box-shadow: 0 0 16px rgba(0,193,243,0.5);
        }
        .modal-bar-fill {
          transition: width 1.2s cubic-bezier(.22,1,.36,1);
        }
      `}</style>

      {/* Mobile progress */}
      <div className="md:hidden flex items-center gap-2 px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 print:hidden">
        {STEPS.map((_,i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
            style={{ background: i <= step ? UCR.blue : "#e2e8f0" }}/>
        ))}
        <span className="text-xs font-semibold text-slate-500 ml-2 shrink-0">{step+1}/4</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 flex gap-8">
        <StepSidebar current={step} completed={completed}/>

        <main className="flex-1 min-w-0 print:p-0">

          {/* ── STEP 1: Información Académica ── */}
          {step === 0 && (
            <div className="space-y-5 wizard-card print:hidden">
              {/* Reglamento banner */}
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1.5px solid #f59e0b" }}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
                  <AlertTriangle className="w-5 h-5 text-white shrink-0"/>
                  <p className="font-extrabold text-sm text-white uppercase tracking-wide">Reglamento UCR — Requisito de Admisibilidad</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 px-5 py-4">
                  <p className="text-amber-800 dark:text-amber-400 text-xs leading-relaxed">
                    Según el reglamento vigente de la UCR, debes tener aprobado al menos el <strong>75% de los créditos totales</strong> para inscribir formalmente tu TFG.
                  </p>
                  <label className="flex items-center gap-2.5 mt-3.5 cursor-pointer select-none group">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${ checkReglamentoAprobado ? "border-amber-600 bg-amber-600" : "border-amber-400"}`}>
                      {checkReglamentoAprobado && <CheckCircle2 className="w-3.5 h-3.5 text-white"/>}
                    </div>
                    <input type="checkbox" checked={checkReglamentoAprobado}
                      onChange={e => setCheckReglamentoAprobado(e.target.checked)}
                      className="sr-only"/>
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-300 group-hover:underline">
                      Confirmo bajo juramento que cumplo con el requisito del 75% o más de créditos aprobados.
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden wizard-card-delayed"
                style={{ boxShadow: "0 4px 24px rgba(0,93,164,0.07)" }}>
                {/* Card header */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800"
                  style={{ background: `linear-gradient(90deg, rgba(0,93,164,0.04) 0%, transparent 100%)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${UCR.blue},${UCR.sky})` }}>
                    <GraduationCap className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: UCR.blue }}>Información Académica</h2>
                    <p className="text-xs text-slate-400">Confirma tus detalles de perfil registrados en la plataforma.</p>
                  </div>
                </div>
                <div className="p-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-6 flex flex-col sm:flex-row gap-5"
                  style={{ background: "linear-gradient(135deg,rgba(0,93,164,0.02),rgba(0,193,243,0.02))" }}>
                  {info?.user?.foto_url ? (
                    <Image src={info.user.foto_url} alt={info.user.nombre} width={72} height={72} className="rounded-full object-cover shrink-0"/>
                  ) : (
                    <div className="shrink-0 rounded-full flex items-center justify-center text-2xl font-extrabold"
                      style={{ background: UCR.softYellow, color: UCR.blue, width:72, height:72 }}>
                      {info?.user?.nombre?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-lg" style={{ color: UCR.blue }}>{info?.user?.nombre}</p>
                    {info?.carnet_ucr && <p className="text-sm text-slate-500">Carné: {info.carnet_ucr}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {info?.carrera && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: UCR.softYellow, color: UCR.blue }}>{info.carrera}</span>}
                      {info?.nivel_academico && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#e0f2fe", color: "#0369a1" }}>{info.nivel_academico}</span>}
                      {info?.sede && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#f0fdf4", color: "#15803d" }}>{info.sede}</span>}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label:"Carné Universitario", value: info?.carnet_ucr ?? "—", icon: "🎓" },
                    { label:"Año de Ingreso", value: info?.anio_ingreso ? String(info.anio_ingreso) : "—", icon: "📅" },
                    { label:"Facultad / Escuela", value: info?.escuela_facultad ?? "—", icon: "🏛️" },
                    { label:"Sede de Estudios", value: info?.sede ?? "—", icon: "📍" },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl p-3 text-center border border-slate-100 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800/40 dark:border-slate-800 metric-card">
                      <p className="text-base mb-0.5">{item.icon}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-5 text-center">
                  ¿Datos incorrectos?{" "}
                  <a href="/perfil/editar" className="underline font-semibold hover:opacity-80" style={{ color: UCR.blue }}>Actualizar mi perfil académico</a>
                </p>
                </div>
              </div>
              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving} nextDisabled={!checkReglamentoAprobado}/>
            </div>
          )}

          {/* ── STEP 2: Detalles del Proyecto ── */}
          {step === 1 && (
            <div className="space-y-5 wizard-card print:hidden">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(0,93,164,0.07)" }}>
                {/* Card header */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800"
                  style={{ background: `linear-gradient(90deg, rgba(0,93,164,0.04) 0%, transparent 100%)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${UCR.blue},${UCR.sky})` }}>
                    <BookOpen className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: UCR.blue }}>Detalles del Proyecto</h2>
                    <p className="text-xs text-slate-400">Describe tu proyecto para que la IA pueda analizarlo con precisión.</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                <div/>

                {/* Modalidad */}
                <div>
                  <label className="block text-sm font-bold mb-3" style={{ color: UCR.blue }}>
                    Modalidad de Graduación <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MODALIDADES_TFG.map(m => (
                      <button key={m.value} type="button" onClick={() => setModalidadTFG(m.value)}
                        className={`text-left p-4 rounded-xl border-2 transition-all text-xs ${modalidadTFG === m.value ? "border-[#005da4] bg-[#005da4]/5" : "border-slate-200 dark:border-slate-800 hover:border-slate-400"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-sm" style={{ color: UCR.blue }}>{m.label}</span>
                          {modalidadTFG === m.value && <CheckCircle2 className="w-4 h-4 text-[#005da4]"/>}
                        </div>
                        <p className="text-slate-500 leading-relaxed">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title + Area */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Título del Proyecto <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                      placeholder="Ej: Sistema de monitoreo automatizado..."
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#005da4] transition-all"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Área Temática <span className="text-red-500">*</span></label>
                    <select value={areaTematica} onChange={e => setAreaTematica(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#005da4] transition-all">
                      <option value="">Seleccionar área...</option>
                      {AREAS_TEMATICAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Descripción General <span className="text-red-500">*</span>
                  </label>
                  <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                    placeholder="¿En qué consiste el proyecto? ¿A quién va dirigido y qué lo hace único?"
                    rows={3} className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#005da4] transition-all resize-none"/>
                </div>

                {/* Problema + Objetivo obligatorios */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Problema que Resuelve <span className="text-red-500">*</span>
                    </label>
                    <textarea value={problema} onChange={e => setProblema(e.target.value)}
                      placeholder="¿Cuál es el problema o necesidad concreta que el proyecto atiende?"
                      rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#005da4] transition-all resize-none"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                      Objetivo Principal <span className="text-red-500">*</span>
                    </label>
                    <textarea value={objetivo} onChange={e => setObjetivo(e.target.value)}
                      placeholder="¿Cuál es el resultado o entregable final que el proyecto buscará lograr?"
                      rows={4} className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-[#005da4] transition-all resize-none"/>
                  </div>
                </div>

                {/* Duracion */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Duración Estimada</label>
                  <div className="flex flex-wrap gap-2">
                    {["3 meses","6 meses","9 meses","12 meses","18 meses","Más de 18 meses"].map(d => (
                      <button key={d} type="button" onClick={() => setDuracion(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${duracion===d ? "text-white border-transparent" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}
                        style={duracion===d ? { background: UCR.blue } : {}}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recursos */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Recursos Necesarios</label>
                  <div className="flex flex-wrap gap-2">
                    {RECURSOS_OPCIONES.map(r => {
                      const sel = recursos.includes(r);
                      return (
                        <button key={r} type="button" onClick={() => toggleRecurso(r)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${sel ? "text-white border-transparent" : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400"}`}
                          style={sel ? { background: UCR.sky } : {}}>
                          {sel && <CheckCircle2 className="w-3 h-3"/>}
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avance slider */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
                    Porcentaje de Avance Actual: <span className="font-extrabold" style={{ color: UCR.blue }}>{porcentajeAvance}%</span>
                  </label>
                  <div className="relative">
                    <input type="range" min={0} max={100} value={porcentajeAvance}
                      onChange={e => setPorcentajeAvance(Number(e.target.value))}
                      className="w-full accent-[#005da4]"/>
                    {/* Progress track fill */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full pointer-events-none modal-bar-fill"
                      style={{ width: `${porcentajeAvance}%`, background: `linear-gradient(90deg,${UCR.blue},${UCR.sky})`, opacity: 0.3 }}/>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>

                {!isDetailsValid && (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0"/> Completa todos los campos obligatorios (*) para avanzar al siguiente paso.
                  </div>
                )}
                </div>
              </div>
              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving} nextDisabled={!isDetailsValid}/>
            </div>
          )}

          {/* ── STEP 3: Apoyo y Calculadora ── */}
          {step === 2 && (
            <div className="space-y-5 wizard-card print:hidden">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(0,93,164,0.07)" }}>
                {/* Card header */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800"
                  style={{ background: `linear-gradient(90deg, rgba(0,93,164,0.04) 0%, transparent 100%)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${UCR.sky},${UCR.blue})` }}>
                    <TrendingUp className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold" style={{ color: UCR.blue }}>Apoyo y Calculadora de Valor</h2>
                    <p className="text-xs text-slate-400">Calcula el valor con IA y selecciona el tipo de apoyo que necesitas.</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">

                {/* ── AI Value Calculator ── */}
                <section className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800" style={{ boxShadow: "0 2px 12px rgba(0,93,164,0.08)" }}>
                  <div className="px-5 py-5 flex flex-wrap items-center justify-between gap-3 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${UCR.blue} 0%, #003f72 60%, #001f40 100%)` }}>
                    {/* Decorative bg shapes */}
                    <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-10 float-deco" style={{ background: UCR.sky }}/>
                    <div className="absolute -left-4 bottom-0 w-16 h-16 rounded-full opacity-5 float-deco-slow" style={{ background: UCR.yellow }}/>
                    <div className="flex items-center gap-3 relative">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <Sparkles className="w-5 h-5 text-yellow-300"/>
                      </div>
                      <div>
                        <p className="font-extrabold text-white text-sm">Calculadora de Valor del Proyecto</p>
                        <p className="text-white/60 text-xs">Estimación con IA: valor de mercado, impacto y ROI en colones</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleCalcularValor} disabled={calculatingValor}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 relative calc-btn-glow"
                      style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(4px)" }}>
                      {calculatingValor ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4 text-yellow-300"/>}
                      {calculatingValor ? "Calculando..." : "🤖 Calcular Valor con IA"}
                    </button>
                  </div>

                  <div className="p-5 bg-white dark:bg-slate-900 space-y-5">
                    {valorError && <div className="p-3 rounded-lg text-xs text-red-700 bg-red-50 border border-red-200 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0"/>{valorError}</div>}

                    {calculatingValor && (
                      <div className="flex flex-col items-center gap-4 py-10 text-slate-400">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-[#005da4]/15 border-t-[#005da4] animate-spin"/>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-6 h-6" style={{ color: UCR.sky }}/>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold" style={{ color: UCR.blue }}>Analizando tu proyecto con IA...</p>
                          <p className="text-xs text-slate-400 mt-1">Evaluando valor de mercado, impacto social y ROI</p>
                        </div>
                        {/* Shimmer placeholder rows */}
                        <div className="w-full space-y-2">
                          <div className="h-8 rounded-lg shimmer-bg"/>
                          <div className="grid grid-cols-4 gap-2">
                            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl shimmer-bg"/>)}
                          </div>
                        </div>
                      </div>
                    )}

                    {valorResult && !calculatingValor && (
                      <div className="space-y-5 wizard-fade">
                        {/* Global score */}
                        <div className="rounded-2xl p-5 flex items-center gap-5 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${globalColor}12 0%, ${globalColor}06 100%)`, border: `1.5px solid ${globalColor}35` }}>
                          {/* Decorative glow blob */}
                          <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10" style={{ background: globalColor }}/>
                          <div className="relative shrink-0">
                            <ScoreRing value={globalScore} color={globalColor} size={80}/>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-extrabold" style={{ color: globalColor }}>{globalScore}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                              {globalScore >= 85 ? "🌟 Proyecto de Alto Valor" : globalScore >= 65 ? "⭐ Proyecto Sólido" : "📘 Proyecto en Desarrollo"}
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">{valorResult.resumenEjecutivo}</p>
                            {valorResult.isFallback && <p className="text-[11px] text-amber-600 mt-1.5 font-medium">💡 Estimación basada en proyectos similares en CR</p>}
                          </div>
                        </div>

                        {/* Financial metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label:"Valor del Producto", value: valorResult.valorDesarrollo, color: UCR.blue, prefix:"₡", icon:"📦" },
                            { label:"Precio de Mercado", value: valorResult.valorMercado, color:"#22c55e", prefix:"₡", icon:"🏪" },
                            { label:"Costo Desarrollo", value: valorResult.costoDesarrollo, color: UCR.orange, prefix:"₡", icon:"🔧" },
                            { label:"ROI Estimado", value: valorResult.roi, color: UCR.sky, suffix:"%", icon:"📈" },
                          ].map(item => (
                            <div key={item.label}
                              className="p-3 rounded-xl text-center metric-card relative overflow-hidden"
                              style={{ border: `1.5px solid ${item.color}25`, background: `linear-gradient(135deg,${item.color}08,transparent)` }}>
                              <p className="text-base mb-0.5">{item.icon}</p>
                              <p className="text-lg font-extrabold leading-none mb-1" style={{ color: item.color }}>
                                {item.prefix||""}{item.value.toLocaleString("es-CR")}{item.suffix||""}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-400">{item.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label:"Impacto Social", value: valorResult.impactoSocial, color:"#22c55e", desc:"Beneficio para comunidades" },
                            { label:"Valor Académico", value: valorResult.valorAcademico, color: UCR.blue, desc:"Relevancia científica" },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl metric-card"
                              style={{ border: `1.5px solid ${item.color}25`, background: `linear-gradient(135deg,${item.color}06,transparent)` }}>
                              <div className="relative shrink-0">
                                <ScoreRing value={item.value} color={item.color} size={60}/>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.label}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* ── Accept / Adjust ── */}
                        <div className="rounded-xl border-2 p-4 space-y-4"
                          style={{ borderColor: valorAceptado ? "#22c55e" : UCR.sky, background: valorAceptado ? "#f0fdf4" : "#f0faff" }}>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: valorAceptado ? "#22c55e" : UCR.blue }}/>
                            <p className="font-extrabold text-sm" style={{ color: valorAceptado ? "#15803d" : UCR.blue }}>
                              {valorAceptado ? "✅ Meta de financiamiento establecida" : "Establece tu meta de financiamiento"}
                            </p>
                          </div>

                          {/* Monto + buttons */}
                          <div className="flex flex-wrap items-start gap-4">
                            <div>
                              <p className="text-xs text-slate-500 mb-1 font-semibold">Meta actual</p>
                              <p className="text-2xl font-extrabold" style={{ color: UCR.blue }}>
                                ₡{montoFinal.toLocaleString("es-CR")} <span className="text-xs text-slate-400 font-semibold">CRC</span>
                              </p>
                              {ajusteManual !== 0 && (
                                <p className="text-[11px] mt-0.5" style={{ color: ajusteManual > 0 ? "#22c55e" : UCR.orange }}>
                                  {ajusteManual > 0 ? "+" : ""}₡{Math.abs(ajusteManual).toLocaleString("es-CR")} ajustado manualmente
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={aceptarValorIA}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 shadow-sm"
                                style={{ background: "#22c55e" }}>
                                <ThumbsUp className="w-3.5 h-3.5"/>
                                Aceptar valor IA (₡{valorResult.costoDesarrollo.toLocaleString("es-CR")})
                              </button>
                              <button type="button" onClick={() => ajustarMonto(25000)}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50"
                                style={{ borderColor:"#22c55e", color:"#22c55e" }}>
                                <Plus className="w-3 h-3"/> +₡25k
                              </button>
                              <button type="button" onClick={() => ajustarMonto(50000)}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50"
                                style={{ borderColor:"#22c55e", color:"#22c55e" }}>
                                <Plus className="w-3 h-3"/> +₡50k
                              </button>
                              <button type="button" onClick={() => ajustarMonto(-25000)} disabled={montoFinal <= 25000}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50 disabled:opacity-40"
                                style={{ borderColor: UCR.orange, color: UCR.orange }}>
                                <ThumbsDown className="w-3 h-3"/> -₡25k
                              </button>
                              <button type="button" onClick={() => ajustarMonto(-50000)} disabled={montoFinal <= 50000}
                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-slate-50 disabled:opacity-40"
                                style={{ borderColor: UCR.orange, color: UCR.orange }}>
                                <ThumbsDown className="w-3 h-3"/> -₡50k
                              </button>
                            </div>
                          </div>

                          {/* Manual input */}
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-400">O ingresa monto personalizado:</span>
                            <div className="relative flex items-center">
                              <span className="absolute left-3 text-slate-400 text-sm">₡</span>
                              <input type="number" value={montoFinal || ""}
                                onChange={e => {
                                  const v = Number(e.target.value) || 0;
                                  setMontoRequerido(String(v));
                                  if (valorResult) setAjusteManual(v - valorResult.costoDesarrollo);
                                  setValorAceptado(true);
                                  setBuscaFinanciamiento(true);
                                }}
                                className="border rounded-lg pl-7 pr-3 py-1.5 text-sm w-36 outline-none focus:border-[#005da4] bg-white dark:bg-slate-800"/>
                            </div>
                            <span className="text-xs text-slate-400">CRC</span>
                          </div>
                        </div>

                        {/* Fortalezas y oportunidades */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl border" style={{ borderColor: "#22c55e30", background: "linear-gradient(135deg,#f0fdf4,#f8fff8)" }}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "#22c55e" }}>
                                <CheckCircle2 className="w-3.5 h-3.5 text-white"/>
                              </div>
                              <p className="font-extrabold text-xs text-emerald-700">Fortalezas del Proyecto</p>
                            </div>
                            <ul className="space-y-2.5">
                              {valorResult.fortalezas.map((f,i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                  <span className="w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 text-white mt-px" style={{ background:"#22c55e" }}>{i+1}</span>
                                  <span className="leading-relaxed">{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-4 rounded-xl border" style={{ borderColor: `${UCR.orange}30`, background: `linear-gradient(135deg,#fff7ed,#fffaf5)` }}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: UCR.orange }}>
                                <Lightbulb className="w-3.5 h-3.5 text-white"/>
                              </div>
                              <p className="font-extrabold text-xs" style={{ color: UCR.orange }}>Oportunidades Detectadas</p>
                            </div>
                            <ul className="space-y-2.5">
                              {valorResult.oportunidades.map((o,i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                  <span className="w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 text-white mt-px" style={{ background: UCR.orange }}>{i+1}</span>
                                  <span className="leading-relaxed">{o}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {!valorResult && !calculatingValor && (
                      <div className="py-10 text-center">
                        <div className="relative inline-block">
                          <Sparkles className="w-14 h-14 mx-auto mb-3 float-deco" style={{ color: UCR.sky, opacity: 0.5 }}/>
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping" style={{ background: UCR.sky, opacity: 0.4 }}/>
                        </div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Presiona el botón para calcular el valor de tu proyecto</p>
                        <p className="text-xs mt-1 text-slate-400">Usaremos los datos del Paso 2 para el análisis con IA</p>
                        <div className="flex justify-center gap-2 mt-4">
                          {["Valor de mercado","Impacto social","ROI"].map(tag => (
                            <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full font-semibold" style={{ background: `${UCR.sky}15`, color: UCR.blue }}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── Tipo de apoyo ── */}
                <section className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartHandshake className="w-5 h-5" style={{ color: UCR.blue }}/>
                    <label className="block text-sm font-extrabold" style={{ color: UCR.blue }}>Tipo de Apoyo Adicional Solicitado</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key:"financiamiento", label:"Financiamiento", desc:"Recursos económicos para materiales, laboratorios o viáticos.", icon:DollarSign, val:buscaFinanciamiento, set:setBuscaFinanciamiento, color:"#22c55e" },
                      { key:"mentoria", label:"Mentoría", desc:"Guía de exalumnos profesionales con experiencia real.", icon:Lightbulb, val:buscaMentoria, set:setBuscaMentoria, color:UCR.yellow },
                      { key:"pasantia", label:"Pasantía", desc:"Validar tu solución directamente en una empresa.", icon:Briefcase, val:buscaPasantia, set:setBuscaPasantia, color:UCR.sky },
                      { key:"empleo", label:"Empleabilidad", desc:"Acompañamiento laboral post-proyecto.", icon:Users, val:buscaEmpleo, set:setBuscaEmpleo, color:UCR.orange },
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <button key={item.key} type="button" onClick={() => item.set(!item.val)}
                          className={`support-card relative text-left p-4 rounded-xl border-2 ${item.val ? "selected" : "border-slate-200 dark:border-slate-800"}`}
                          style={item.val ? { borderColor: item.color, background: `${item.color}08` } : {}}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ background: item.val ? item.color : "#f1f5f9" }}>
                              <Icon className="w-4 h-4" style={{ color: item.val ? "#fff" : "#64748b" }}/>
                            </div>
                            {item.val && <CheckCircle2 className="w-4 h-4" style={{ color: item.color }}/>}
                          </div>
                          <p className="font-extrabold text-sm" style={{ color: item.val ? item.color : UCR.blue }}>{item.label}</p>
                          <p className="text-xs text-slate-500 leading-snug mt-0.5">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Financiamiento details */}
                {buscaFinanciamiento && (
                  <section className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Meta de Financiamiento (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₡</span>
                          <input type="number" value={montoRequerido} onChange={e => setMontoRequerido(e.target.value)}
                            placeholder="0" className="w-full border rounded-xl pl-7 pr-4 py-3 text-sm outline-none bg-white dark:bg-slate-800"/>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Fecha Límite para Recaudación</label>
                        <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Desglose de Gastos</label>
                      <textarea value={desgloseGastos} onChange={e => setDesgloseGastos(e.target.value)}
                        placeholder="Describe en qué se usarán los fondos..." rows={3}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 resize-none"/>
                    </div>
                  </section>
                )}

                {/* Mentoría details */}
                {buscaMentoria && (
                  <section className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-extrabold text-base" style={{ color: UCR.blue }}>Mentoría Solicitada</h3>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-2">Áreas de Interés</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {areasSeleccionadas.map(a => <ChipTag key={a} label={a} onRemove={() => setAreasSeleccionadas(areasSeleccionadas.filter(x => x !== a))}/>)}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {AREAS_MENTORIA.filter(a => !areasSeleccionadas.includes(a)).map(a => (
                          <button key={a} type="button" onClick={() => setAreasSeleccionadas([...areasSeleccionadas, a])}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 hover:border-[#005da4] text-slate-500 transition-all">
                            + {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Horas al Mes</label>
                        <select value={horasMentoria} onChange={e => setHorasMentoria(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800">
                          {HORAS_MENTORIA.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Perfil de Mentor Ideal</label>
                      <textarea value={perfilMentor} onChange={e => setPerfilMentor(e.target.value)}
                        placeholder="Perfil profesional ideal..." rows={2}
                        className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800 resize-none"/>
                    </div>
                  </section>
                )}

                {/* Empleabilidad */}
                {(buscaPasantia || buscaEmpleo) && (
                  <section className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-extrabold text-base" style={{ color: UCR.blue }}>Empleabilidad e Inserción</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Disponibilidad</label>
                        <select value={disponibilidad} onChange={e => setDisponibilidad(e.target.value)}
                          className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-white dark:bg-slate-800">
                          {DISPONIBILIDAD.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Interés en Contratación Post-Proyecto</label>
                        <div className="flex flex-wrap gap-4 mt-2.5">
                          {["Sí","No","A discutir"].map(opt => (
                            <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                              <input type="radio" name="contratacion" value={opt} checked={interesContratacion===opt}
                                onChange={() => setInteresContratacion(opt)} className="accent-[#005da4]"/>
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
                </div>

              <StepNav step={step} onPrev={prevStep} onNext={nextStep} onSave={guardarBorrador} saving={saving}/>
            </div>
          )}

          {/* ── STEP 4: Vista Previa ── */}
          {step === 3 && (
            <div className="space-y-6 wizard-card">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden print:hidden"
                style={{ boxShadow: "0 4px 24px rgba(0,93,164,0.07)" }}>
                <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800"
                  style={{ background: `linear-gradient(90deg, rgba(0,93,164,0.04) 0%, transparent 100%)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${UCR.yellow},${UCR.orange})` }}>
                    <Eye className="w-5 h-5 text-white"/>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold" style={{ color: UCR.blue }}>Vista Previa del Proyecto</h2>
                    <p className="text-xs text-slate-400">Revisa cómo quedará publicado tu proyecto en el directorio.</p>
                  </div>
                  <button type="button" onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl font-bold text-xs hover:bg-slate-50 transition-all metric-card"
                    style={{ borderColor: UCR.sky, color: UCR.blue }}>
                    <Printer className="w-4 h-4"/> Imprimir / Exportar
                  </button>
                </div>
              </div>

              {/* Printable document */}
              <div id="print-document-area" className="bg-white dark:bg-slate-950 p-8 sm:p-12 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md text-slate-900 dark:text-slate-100">
                <div className="text-center space-y-2 mb-8 border-b-2 border-slate-900 pb-5">
                  <GraduationCap className="w-12 h-12 mx-auto text-[#005da4]"/>
                  <h1 className="text-xl font-extrabold uppercase tracking-wide">Universidad de Costa Rica</h1>
                  <h2 className="text-sm font-bold uppercase tracking-wide">{info?.escuela_facultad || "Escuela / Facultad UCR"}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Propuesta de Trabajo Final de Graduación ({modalidadTFG || "Tesis"})</p>
                </div>
                <div className="space-y-6 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-1.5 border print:border-none print:bg-transparent">
                    <p><span className="font-extrabold">Estudiante:</span> {info?.user?.nombre}</p>
                    <p><span className="font-extrabold">Carné:</span> {info?.carnet_ucr}</p>
                    <p><span className="font-extrabold">Carrera:</span> {info?.carrera} ({info?.sede || "Sede Central"})</p>
                    <p><span className="font-extrabold">Modalidad:</span> {modalidadTFG}</p>
                    <p><span className="font-extrabold">Área:</span> {areaTematica}</p>
                    <p><span className="font-extrabold">Duración Estimada:</span> {duracion}</p>
                    <p><span className="font-extrabold">% de Avance:</span> {porcentajeAvance}%</p>
                  </div>
                  <hr className="border-slate-200 dark:border-slate-800"/>
                  <div>
                    <h3 className="font-extrabold text-base uppercase text-[#005da4] mb-1.5">Título</h3>
                    <p className="font-bold text-lg italic">"{titulo || "Sin título"}"</p>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base uppercase text-[#005da4] mb-1.5">Descripción</h3>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{descripcion || "Sin descripción."}</p>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base uppercase text-[#005da4] mb-1.5">Problema que Resuelve</h3>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{problema || "No especificado."}</p>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base uppercase text-[#005da4] mb-1.5">Objetivo Principal</h3>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">{objetivo || "No especificado."}</p>
                  </div>
                  {recursos.length > 0 && (
                    <div>
                      <h3 className="font-extrabold text-base uppercase text-[#005da4] mb-2">Recursos</h3>
                      <div className="flex flex-wrap gap-2">
                        {recursos.map(r => <span key={r} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: UCR.softYellow, color: UCR.blue }}>{r}</span>)}
                      </div>
                    </div>
                  )}
                  {valorResult && (
                    <div className="pt-4 border-t border-dashed">
                      <h3 className="font-extrabold text-base uppercase text-emerald-600 mb-3">Valoración por IA</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        {[
                          { label:"Valor Producto", value:`₡${valorResult.valorDesarrollo.toLocaleString("es-CR")}`, color: UCR.blue },
                          { label:"Mercado", value:`₡${valorResult.valorMercado.toLocaleString("es-CR")}`, color:"#22c55e" },
                          { label:"Costo Dev.", value:`₡${valorResult.costoDesarrollo.toLocaleString("es-CR")}`, color: UCR.orange },
                          { label:"Puntuación", value:`${valorResult.puntuacionGlobal}/100`, color: globalColor },
                        ].map(item => (
                          <div key={item.label} className="p-3 rounded-xl border border-slate-200">
                            <p className="text-base font-extrabold" style={{ color: item.color }}>{item.value}</p>
                            <p className="text-[10px] font-semibold text-slate-400">{item.label}</p>
                          </div>
                        ))}
                      </div>
                      {montoRequerido && <p className="mt-3 font-bold text-sm">Meta de Financiamiento: <span style={{ color: UCR.blue }}>₡{Number(montoRequerido).toLocaleString("es-CR")} CRC</span></p>}
                    </div>
                  )}
                  <div className="pt-16 flex justify-around text-center text-xs">
                    <div className="border-t border-slate-400 w-48 pt-2">
                      <p className="font-bold">{info?.user?.nombre}</p>
                      <p className="text-slate-500">Estudiante Proponente</p>
                    </div>
                    <div className="border-t border-slate-400 w-48 pt-2">
                      <p className="text-slate-300">_________________________</p>
                      <p className="text-slate-500">Profesor Consejero / Tutor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Directory card preview */}
              <div className="space-y-3 print:hidden">
                <p className="text-sm font-bold flex items-center gap-2" style={{ color: UCR.blue }}>
                  <Eye className="w-4 h-4"/> Así lo verán los Exalumnos en el directorio
                </p>
                <div className="rounded-2xl border overflow-hidden shadow-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 directory-card-hover"
                  style={{ boxShadow: "0 4px 20px rgba(0,93,164,0.1)" }}>
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-3 h-3 sm:h-auto shrink-0"
                      style={{ background: `linear-gradient(180deg,${UCR.sky},${UCR.blue})` }}/>
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          {areaTematica && <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white" style={{ background: `linear-gradient(90deg,${UCR.sky},${UCR.blue})` }}>{areaTematica}</span>}
                          <h3 className="text-lg font-extrabold mt-1.5 leading-snug" style={{ color: UCR.blue }}>{titulo || "Título del Proyecto"}</h3>
                        </div>
                        {valorResult && (
                          <span className="text-xs font-extrabold px-3 py-1.5 rounded-full shrink-0 text-white" style={{ background: `linear-gradient(135deg,${globalColor},${globalColor}cc)`, boxShadow: `0 2px 8px ${globalColor}40` }}>
                            ⭐ {globalScore}/100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">{descripcion || "Descripción..."}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shadow-sm" style={{ background: `linear-gradient(135deg,${UCR.softYellow},${UCR.yellow})`, color: UCR.blue }}>
                            {info?.user?.nombre?.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{infoNombreCorto}</span>
                        </div>
                        {montoRequerido && (
                          <div className="ml-auto text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Meta</p>
                            <p className="text-sm font-extrabold" style={{ color: UCR.blue }}>₡{Number(montoRequerido).toLocaleString("es-CR")} <span className="text-[10px] text-slate-400 font-semibold">CRC</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && <div className="rounded-xl px-4 py-3 text-sm font-medium bg-red-50 text-red-700 border border-red-200 print:hidden flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0"/>{error}</div>}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 p-5 flex flex-col sm:flex-row gap-3 items-center justify-between print:hidden"
                style={{ boxShadow: "0 4px 20px rgba(0,93,164,0.07)" }}>
                <button type="button" onClick={prevStep}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all hover:bg-slate-50 group"
                  style={{ borderColor:"#e2e8f0", color:"#64748b" }}>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/> Anterior
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={guardarBorrador} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-sm transition-all hover:bg-slate-50"
                    style={{ borderColor: UCR.sky, color: UCR.blue }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                    Guardar Borrador
                  </button>
                  <button type="button" onClick={publicarProyecto} disabled={saving || !titulo.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white transition-all disabled:opacity-50 relative overflow-hidden group"
                    style={{ background: `linear-gradient(135deg,${UCR.blue},${UCR.sky})`, boxShadow: titulo.trim() ? "0 4px 16px rgba(0,193,243,0.4)" : "none" }}>
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Rocket className="w-4 h-4 group-hover:translate-y-[-1px] transition-transform"/>}
                    Publicar Proyecto
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </ParallaxBackground>
  );
}
