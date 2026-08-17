"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Briefcase, Loader2, CheckCircle2,
  Info, GraduationCap, Cpu, Languages, Users, BarChart3, X, Plus,
  Globe2, Code2, Star, Search,
} from "lucide-react";
import { SKILLS_BANK, SOFT_SKILLS_BANK, IDIOMAS_OPTS, NIVELES_IDIOMA, SKILL_LEVELS } from "@/lib/skills-bank";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

// ── Paleta UCR ────────────────────────────────────────────────────────────────
const UCR = {
  blue:   "#005da4",
  sky:    "#00c0f3",
  orange: "#f37021",
  gold:   "#fdb912",
  amber:  "#f99d1c",
  yellow: "#ffe06a",
  lime:   "#e9c31e",
  white:  "#ffffff",
};

const STEP_COLOR = [UCR.blue, UCR.orange, UCR.sky, UCR.gold];

// ── Constantes ────────────────────────────────────────────────────────────────
const TIPOS_POSICION = ["EMPLEO", "PASANTIA", "PRACTICA", "VOLUNTARIADO"];
const TIPOS_LABEL: Record<string, string> = {
  EMPLEO: "Empleo", PASANTIA: "Pasantía", PRACTICA: "Práctica profesional", VOLUNTARIADO: "Voluntariado",
};
const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];
const JORNADAS    = ["Tiempo completo", "Medio tiempo", "Por horas", "Flexible"];

const BENEFICIOS_OPTS = [
  { id: "beca_parcial",     label: "Beca parcial",            icon: "🎓" },
  { id: "creditos_univ",    label: "Créditos universitarios", icon: "📚" },
  { id: "mentoria_directa", label: "Mentoría directa",        icon: "👥" },
  { id: "trabajo_remoto",   label: "Trabajo remoto",          icon: "🏠" },
  { id: "networking",       label: "Networking eventos",      icon: "🤝" },
  { id: "acceso_lab",       label: "Acceso a laboratorios",   icon: "🔬" },
  { id: "remuneracion",     label: "Remuneración económica",  icon: "💰" },
  { id: "horario_flexible", label: "Horario flexible",        icon: "⏰" },
];

const NIVELES_GRADO = ["Bachillerato", "Licenciatura", "Maestría", "Doctorado", "Técnico", "Cualquier nivel"];
const AREAS_ESTUDIO = [
  "Ingeniería en Computación", "Ingeniería Eléctrica", "Ingeniería Civil",
  "Ingeniería Industrial", "Arquitectura", "Medicina", "Psicología",
  "Administración de Negocios", "Economía", "Derecho", "Biología",
  "Química", "Física", "Matemáticas", "Educación", "Comunicación",
  "Artes", "Ciencias Políticas", "Sociología", "Otra",
];

const STEPS = [
  { num: 1, label: "Información General",  icon: Info,          color: UCR.blue,   gradient: `linear-gradient(135deg, ${UCR.blue}, #0077cc)` },
  { num: 2, label: "Detalles del Puesto",  icon: Briefcase,     color: UCR.orange, gradient: `linear-gradient(135deg, ${UCR.orange}, ${UCR.amber})` },
  { num: 3, label: "Requisitos",           icon: GraduationCap, color: UCR.sky,    gradient: `linear-gradient(135deg, ${UCR.sky}, #00a8d8)` },
  { num: 4, label: "Matching Inteligente", icon: BarChart3,     color: UCR.gold,   gradient: `linear-gradient(135deg, ${UCR.gold}, ${UCR.amber})` },
];

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface HardSkill   { skill: string; level: string; }
interface Idioma      { idioma: string; nivel: string; }
interface MatchWeights { carrera: number; tecnico: number; intereses: number; blandas: number; }

// ── Componente principal ───────────────────────────────────────────────────────
export default function NuevaPosicionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Step 1
  const [titulo,     setTitulo]     = useState("");
  const [tipo,       setTipo]       = useState("");
  const [modalidad,  setModalidad]  = useState("");
  const [jornada,    setJornada]    = useState("");
  const [empresa,    setEmpresa]    = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  // Step 2
  const [descripcion,       setDescripcion]       = useState("");
  const [responsabilidades, setResponsabilidades] = useState("");
  const [horario,           setHorario]           = useState("");
  const [beneficios,        setBeneficios]        = useState<string[]>([]);

  // Step 3
  const [nivelGrado,       setNivelGrado]       = useState("");
  const [areaEstudio,      setAreaEstudio]      = useState("");
  const [hardSkills,       setHardSkills]       = useState<HardSkill[]>([]);
  const [skillInput,       setSkillInput]       = useState("");
  const [skillFilter,      setSkillFilter]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState(SKILLS_BANK[0].categoria);
  const [idiomas,          setIdiomas]          = useState<Idioma[]>([]);
  const [idiomaInput,      setIdiomaInput]      = useState("Inglés");
  const [nivelIdiomaInput, setNivelIdiomaInput] = useState("B1 – Intermedio");
  const [softSkills,       setSoftSkills]       = useState<string[]>([]);

  // Step 4
  const [weights, setWeights] = useState<MatchWeights>({ carrera: 30, tecnico: 30, intereses: 20, blandas: 20 });

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const role = (session?.user as any)?.tipo;
  if (status === "authenticated" && role !== "EXALUMNO" && role !== "ADMIN") {
    router.replace("/posiciones"); return null;
  }
  if (status === "loading") return (
    <div className="min-h-[80vh] flex items-center justify-center" style={{ background: "#f0f7ff" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: UCR.blue }} />
    </div>
  );

  const currentStep   = STEPS[step - 1];
  const totalWeights  = weights.carrera + weights.tecnico + weights.intereses + weights.blandas;

  // ── Helpers ────────────────────────────────────────────────────────────────
  function toggleBeneficio(id: string) {
    setBeneficios((p) => p.includes(id) ? p.filter((b) => b !== id) : [...p, id]);
  }
  function addHardSkill(skillName?: string) {
    const name = (skillName ?? skillInput).trim();
    if (!name || hardSkills.find((s) => s.skill.toLowerCase() === name.toLowerCase())) return;
    setHardSkills((p) => [...p, { skill: name, level: "Intermedio" }]);
    setSkillInput("");
  }
  const filteredSkills = SKILLS_BANK.find((c) => c.categoria === selectedCategory)?.skills.filter(
    (s) => !skillFilter || s.toLowerCase().includes(skillFilter.toLowerCase())
  ) ?? [];
  function updateSkillLevel(i: number, level: string) {
    setHardSkills((p) => p.map((s, idx) => idx === i ? { ...s, level } : s));
  }
  function removeHardSkill(i: number) {
    setHardSkills((p) => p.filter((_, idx) => idx !== i));
  }
  function addIdioma() {
    if (idiomas.find((id) => id.idioma === idiomaInput)) return;
    setIdiomas((p) => [...p, { idioma: idiomaInput, nivel: nivelIdiomaInput }]);
  }
  function toggleSoftSkill(s: string) {
    setSoftSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }
  function adjustWeight(changedKey: keyof MatchWeights, newVal: number) {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(100, newVal));
      const others = (Object.keys(prev) as (keyof MatchWeights)[]).filter((k) => k !== changedKey);
      const othersTotal = others.reduce((sum, k) => sum + prev[k], 0);
      const remaining = 100 - clamped;

      // Si todos los otros son 0, distribuir equitativamente
      if (othersTotal === 0) {
        const per = Math.floor(remaining / others.length);
        const leftover = remaining - per * others.length;
        const next: MatchWeights = { ...prev, [changedKey]: clamped };
        others.forEach((k, i) => { next[k] = per + (i === 0 ? leftover : 0); });
        return next;
      }

      // Distribuir proporcionalmente entre los otros tres
      const next: MatchWeights = { ...prev, [changedKey]: clamped };
      let assigned = 0;
      others.forEach((k, i) => {
        if (i < others.length - 1) {
          next[k] = Math.max(0, Math.round((prev[k] / othersTotal) * remaining));
          assigned += next[k];
        } else {
          next[k] = Math.max(0, remaining - assigned);
        }
      });
      return next;
    });
  }
  function validateStep() {
    if (step === 1 && !titulo.trim()) return "El título del puesto es obligatorio.";
    // totalWeights siempre es 100 por el ajuste proporcional automático
    return null;
  }
  function nextStep() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null); setStep((s) => Math.min(s + 1, 4));
  }
  async function publish() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/posiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo, tipo: tipo || null, modalidad: modalidad || null,
          jornada: jornada || null, empresa: empresa || null,
          fecha_limite: fechaLimite || null,
          descripcion: descripcion || null,
          responsabilidades: responsabilidades || null,
          horario: horario || null,
          beneficios: beneficios.length ? beneficios : null,
          nivel_grado_minimo: nivelGrado || null,
          area_estudio: areaEstudio || null,
          hard_skills: hardSkills.length ? hardSkills : null,
          idiomas_requeridos: idiomas.length ? idiomas : null,
          soft_skills: softSkills.length ? softSkills : null,
          matching_weights: weights,
        }),
      });
      const data = await res.json();
      if (res.ok) router.push("/mis-posiciones");
      else setError(data.message || "Error al publicar la posición.");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally { setLoading(false); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full dark:bg-slate-950" style={{ background: "linear-gradient(160deg,#eef5ff 0%,#fffdf0 50%,#e8f9ff 100%)" }}>

      {/* Barra UCR superior */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${UCR.blue} 0%, ${UCR.sky} 35%, ${UCR.gold} 65%, ${UCR.orange} 100%)` }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">

        {/* Back */}
        <Link href="/mis-posiciones"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-70"
          style={{ color: UCR.blue }}>
          <ArrowLeft className="w-4 h-4" /> Volver a Mis Posiciones
        </Link>

        {/* Encabezado */}
        <div className="mb-8">
          <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl">Publicar Nueva Posición</AnimatedHeading>
          <p className="text-sm text-slate-500 mt-1">Completa los 4 pasos para encontrar al estudiante UCR ideal.</p>
        </div>

        {/* ── Stepper ── */}
        <div className="mb-8">
          <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const Icon   = s.icon;
              const done   = step > s.num;
              const active = step === s.num;
              return (
                <div key={s.num} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                      style={{
                        background: done ? "#22c55e" : active ? s.gradient : "#e2e8f0",
                        color:      done || active ? "#fff" : "#94a3b8",
                        boxShadow:  active ? `0 4px 16px ${s.color}55` : undefined,
                      }}
                    >
                      {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-extrabold mt-1.5 whitespace-nowrap tracking-wide"
                      style={{ color: done ? "#22c55e" : active ? s.color : "#94a3b8" }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 rounded-full transition-all duration-500"
                      style={{ background: done ? "#22c55e" : "#e2e8f0" }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progreso multicolor */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((step - 1) / 3) * 100}%`,
                background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky}, ${UCR.orange}, ${UCR.gold})`,
              }} />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">Paso {step} de 4</p>
        </div>

        {/* ── Grid principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* ══ PASO 1: Información General ══════════════════════════ */}
            {step === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `3px solid ${UCR.blue}`, background: `linear-gradient(135deg, ${UCR.blue}12, ${UCR.sky}08)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: currentStep.gradient }}>
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-800 dark:text-slate-100">Información General</h2>
                    <p className="text-xs text-slate-500">Datos básicos de la posición que publicarás.</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
                      Título del puesto <span style={{ color: UCR.orange }}>*</span>
                    </label>
                    <input
                      value={titulo} onChange={(e) => setTitulo(e.target.value)}
                      placeholder="ej. Desarrollador Full-Stack, Pasante de IA..."
                      className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                      onFocus={(e) => { e.target.style.borderColor = UCR.blue; e.target.style.boxShadow = `0 0 0 3px ${UCR.blue}20`; }}
                      onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Tipo de posición", val: tipo,      set: setTipo,      opts: TIPOS_POSICION.map((t) => ({ v: t, l: TIPOS_LABEL[t] })) },
                      { label: "Modalidad",         val: modalidad, set: setModalidad, opts: MODALIDADES.map((m) => ({ v: m, l: m })) },
                      { label: "Jornada",           val: jornada,   set: setJornada,   opts: JORNADAS.map((j) => ({ v: j, l: j })) },
                    ].map(({ label, val, set, opts }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                        <select value={val} onChange={(e) => set(e.target.value)}
                          className="w-full h-11 border border-slate-200 dark:border-slate-700 rounded-xl text-sm px-3 bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                          onFocus={(e) => { e.target.style.borderColor = UCR.blue; e.target.style.boxShadow = `0 0 0 3px ${UCR.blue}20`; }}
                          onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}>
                          <option value="">Seleccionar...</option>
                          {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Empresa / Organización</label>
                      <input value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                        placeholder="Nombre de la empresa..."
                        className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                        onFocus={(e) => { e.target.style.borderColor = UCR.blue; e.target.style.boxShadow = `0 0 0 3px ${UCR.blue}20`; }}
                        onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fecha límite de aplicación</label>
                    <input type="date" value={fechaLimite} onChange={(e) => setFechaLimite(e.target.value)}
                      className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                      onFocus={(e) => { e.target.style.borderColor = UCR.blue; e.target.style.boxShadow = `0 0 0 3px ${UCR.blue}20`; }}
                      onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                  </div>
                </div>
              </div>
            )}

            {/* ══ PASO 2: Detalles ══════════════════════════════════════ */}
            {step === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `3px solid ${UCR.orange}`, background: `linear-gradient(135deg, ${UCR.orange}12, ${UCR.amber}08)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: currentStep.gradient }}>
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-800 dark:text-slate-100">Detalles del Puesto</h2>
                    <p className="text-xs text-slate-500">Define el alcance, responsabilidades y beneficios del rol.</p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {[
                    { label: "Descripción de la Posición", val: descripcion, set: setDescripcion, rows: 4, placeholder: "Describe el rol, el equipo y el impacto que tendrá el candidato...", mono: false },
                    { label: "Responsabilidades Clave",    val: responsabilidades, set: setResponsabilidades, rows: 4, placeholder: "- Responsabilidad 1\n- Responsabilidad 2", mono: true },
                  ].map(({ label, val, set, rows, placeholder, mono }) => (
                    <div key={label}>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                      <textarea value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} rows={rows}
                        className={`w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none resize-none transition-all ${mono ? "font-mono" : ""}`}
                        onFocus={(e) => { e.target.style.borderColor = UCR.orange; e.target.style.boxShadow = `0 0 0 3px ${UCR.orange}20`; }}
                        onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Horario / Horas semanales</label>
                    <input value={horario} onChange={(e) => setHorario(e.target.value)}
                      placeholder="ej. Lunes a Viernes, 20 horas semanales"
                      className="w-full h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                      onFocus={(e) => { e.target.style.borderColor = UCR.orange; e.target.style.boxShadow = `0 0 0 3px ${UCR.orange}20`; }}
                      onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }} />
                  </div>

                  {/* Beneficios */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Beneficios e Incentivos</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BENEFICIOS_OPTS.map((b) => {
                        const checked = beneficios.includes(b.id);
                        return (
                          <button key={b.id} type="button" onClick={() => toggleBeneficio(b.id)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all text-left"
                            style={{
                              borderColor: checked ? UCR.orange : "#e2e8f0",
                              background:  checked ? `${UCR.orange}10` : "#fff",
                              color:       checked ? UCR.orange : "#64748b",
                            }}>
                            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                              style={{ borderColor: checked ? UCR.orange : "#cbd5e1", background: checked ? UCR.orange : "transparent" }}>
                              {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            {b.icon} {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PASO 3: Requisitos ════════════════════════════════════ */}
            {step === 3 && (
              <div className="space-y-5">

                {/* Formación académica */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: `3px solid ${UCR.sky}`, background: `${UCR.sky}12` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: currentStep.gradient }}>
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Formación Académica</h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Nivel de Grado Mínimo", val: nivelGrado, set: setNivelGrado, opts: NIVELES_GRADO },
                      { label: "Área de Estudio Principal", val: areaEstudio, set: setAreaEstudio, opts: AREAS_ESTUDIO },
                    ].map(({ label, val, set, opts }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                        <select value={val} onChange={(e) => set(e.target.value)}
                          className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                          onFocus={(e) => { e.target.style.borderColor = UCR.sky; e.target.style.boxShadow = `0 0 0 3px ${UCR.sky}25`; }}
                          onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}>
                          <option value="">Seleccionar...</option>
                          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hard Skills */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: `3px solid ${UCR.sky}`, background: `${UCR.sky}12` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: currentStep.gradient }}>
                      <Code2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Competencias Técnicas (Hard Skills)</h3>
                      <p className="text-xs text-slate-500">Selecciona del banco predefinido o escribe una propia. Indica el nivel esperado.</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">

                    {/* Banco de habilidades */}
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banco de habilidades</p>

                      {/* Categorías */}
                      <div className="flex flex-wrap gap-1.5">
                        {SKILLS_BANK.map((cat) => (
                          <button
                            key={cat.categoria}
                            type="button"
                            onClick={() => { setSelectedCategory(cat.categoria); setSkillFilter(""); }}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                              selectedCategory === cat.categoria
                                ? "text-white border-transparent shadow"
                                : "bg-white text-slate-600 border-slate-200 hover:text-white hover:border-transparent"
                            }`}
                            style={selectedCategory === cat.categoria
                              ? { background: UCR.sky }
                              : undefined}
                            onMouseEnter={(e) => {
                              if (selectedCategory !== cat.categoria) {
                                (e.currentTarget as HTMLElement).style.background = UCR.sky;
                                (e.currentTarget as HTMLElement).style.color = "#fff";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedCategory !== cat.categoria) {
                                (e.currentTarget as HTMLElement).style.background = "";
                                (e.currentTarget as HTMLElement).style.color = "";
                              }
                            }}
                          >
                            {cat.icon} {cat.categoria}
                          </button>
                        ))}
                      </div>

                      {/* Filtro */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Filtrar en esta categoría..."
                          value={skillFilter}
                          onChange={(e) => setSkillFilter(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white border border-slate-200 outline-none"
                          onFocus={(e) => { e.target.style.borderColor = UCR.sky; e.target.style.boxShadow = `0 0 0 2px ${UCR.sky}30`; }}
                          onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                        />
                      </div>

                      {/* Grilla de skills */}
                      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                        {filteredSkills.map((skill) => {
                          const already = hardSkills.some((s) => s.skill.toLowerCase() === skill.toLowerCase());
                          return (
                            <button
                              key={skill}
                              type="button"
                              disabled={already}
                              onClick={() => addHardSkill(skill)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                already
                                  ? "text-white border-transparent cursor-default"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-transparent hover:text-white"
                              }`}
                              style={already ? { background: UCR.sky, borderColor: UCR.sky } : undefined}
                              onMouseEnter={(e) => {
                                if (!already) {
                                  (e.currentTarget as HTMLElement).style.background = UCR.sky;
                                  (e.currentTarget as HTMLElement).style.color = "#fff";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!already) {
                                  (e.currentTarget as HTMLElement).style.background = "";
                                  (e.currentTarget as HTMLElement).style.color = "";
                                }
                              }}
                            >
                              {already ? "✓ " : "+ "}{skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Input manual */}
                    <div className="flex gap-2">
                      <input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHardSkill(); } }}
                        placeholder="O escribe una habilidad propia..."
                        className="flex-1 h-11 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 dark:text-slate-200 outline-none transition-all"
                        onFocus={(e) => { e.target.style.borderColor = UCR.sky; e.target.style.boxShadow = `0 0 0 3px ${UCR.sky}25`; }}
                        onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
                      />
                      <button type="button" onClick={() => addHardSkill()}
                        className="h-11 px-5 rounded-xl text-white font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-85"
                        style={{ background: currentStep.gradient }}>
                        <Plus className="w-4 h-4" /> Agregar
                      </button>
                    </div>

                    {/* Habilidades seleccionadas + nivel */}
                    {hardSkills.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habilidades requeridas ({hardSkills.length})</p>
                        <div className="space-y-2">
                          {hardSkills.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                              <span className="flex-1 text-sm font-semibold text-slate-800 min-w-0 truncate">{s.skill}</span>
                              <div className="flex gap-1 shrink-0">
                                {SKILL_LEVELS.map((lv) => (
                                  <button
                                    key={lv}
                                    type="button"
                                    onClick={() => updateSkillLevel(i, lv)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all"
                                    style={{
                                      borderColor: s.level === lv ? UCR.sky : "#e2e8f0",
                                      background:  s.level === lv ? UCR.sky : "transparent",
                                      color:       s.level === lv ? "#fff" : "#64748b",
                                    }}>
                                    {lv}
                                  </button>
                                ))}
                              </div>
                              <button type="button" onClick={() => removeHardSkill(i)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Selecciona del banco o escribe las competencias técnicas requeridas.</p>
                    )}
                  </div>
                </div>

                {/* Idiomas */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: `3px solid ${UCR.sky}`, background: `${UCR.sky}12` }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: currentStep.gradient }}>
                      <Globe2 className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Idiomas</h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Idioma</label>
                        <select value={idiomaInput} onChange={(e) => setIdiomaInput(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-transparent text-sm text-slate-700 outline-none transition-all"
                          onFocus={(e) => { e.target.style.borderColor = UCR.sky; e.target.style.boxShadow = `0 0 0 2px ${UCR.sky}30`; }}
                          onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}>
                          {IDIOMAS_OPTS.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel</label>
                        <select value={nivelIdiomaInput} onChange={(e) => setNivelIdiomaInput(e.target.value)}
                          className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-transparent text-sm text-slate-700 outline-none transition-all"
                          onFocus={(e) => { e.target.style.borderColor = UCR.sky; e.target.style.boxShadow = `0 0 0 2px ${UCR.sky}30`; }}
                          onBlur={(e)  => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}>
                          {NIVELES_IDIOMA.map((n) => <option key={n}>{n}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={addIdioma}
                        className="h-11 px-5 rounded-xl text-white font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-85"
                        style={{ background: currentStep.gradient }}>
                        <Plus className="w-4 h-4" /> Agregar
                      </button>
                    </div>
                    {idiomas.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {idiomas.map((id, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-sm font-medium text-sky-800">
                            <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                            {id.idioma}
                            <span className="text-sky-500 text-xs ml-1">{id.nivel}</span>
                            <button onClick={() => setIdiomas((p) => p.filter((_, idx) => idx !== i))} className="ml-1 text-sky-400 hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aún no has agregado idiomas requeridos.</p>
                    )}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `3px solid ${UCR.gold}`, background: `${UCR.gold}12` }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${UCR.gold}, ${UCR.amber})` }}>
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100">Habilidades Blandas</h3>
                        <p className="text-xs text-slate-500">Selecciona las competencias interpersonales requeridas.</p>
                      </div>
                    </div>
                    {softSkills.length > 0 && (
                      <span className="text-xs font-semibold hidden sm:block" style={{ color: UCR.amber }}>
                        {softSkills.length} seleccionada{softSkills.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SOFT_SKILLS_BANK.map((s) => {
                        const active = softSkills.includes(s);
                        return (
                          <button key={s} type="button" onClick={() => toggleSoftSkill(s)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                              active
                                ? "text-white border-transparent shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                            style={active ? { background: UCR.amber, borderColor: UCR.amber } : undefined}
                            onMouseEnter={(e) => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = `${UCR.gold}20`;
                                (e.currentTarget as HTMLElement).style.borderColor = `${UCR.gold}80`;
                                (e.currentTarget as HTMLElement).style.color = "#92400e";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = "";
                                (e.currentTarget as HTMLElement).style.borderColor = "";
                                (e.currentTarget as HTMLElement).style.color = "";
                              }
                            }}
                          >
                            {active ? "✓ " : ""}{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PASO 4: Matching ══════════════════════════════════════ */}
            {step === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `3px solid ${UCR.gold}`, background: `linear-gradient(135deg, ${UCR.gold}15, ${UCR.amber}08)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: currentStep.gradient }}>
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-800 dark:text-slate-100">Configuración del Matching</h2>
                    <p className="text-xs text-slate-500">Define la importancia de cada criterio. Deben sumar exactamente 100%.</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {[
                    { key: "carrera"   as const, label: "Misma Carrera / Facultad",  desc: "Prioriza estudiantes de áreas académicas específicas.", icon: GraduationCap, color: UCR.blue },
                    { key: "tecnico"   as const, label: "Competencias Técnicas",      desc: "Certificaciones y Hard Skills requeridas.", icon: Cpu,            color: UCR.sky },
                    { key: "intereses" as const, label: "Intereses y Áreas",          desc: "Proyectos extracurriculares y afinidades.", icon: Briefcase,      color: UCR.orange },
                    { key: "blandas"   as const, label: "Habilidades Blandas",        desc: "Idiomas y comunicación.", icon: Users,          color: UCR.gold },
                  ].map(({ key, label, desc, icon: Icon, color }) => (
                    <div key={key} className="rounded-xl p-4 border border-slate-100 dark:border-slate-800"
                      style={{ background: `${color}08` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
                        </div>
                        <span className="text-2xl font-extrabold tabular-nums" style={{ color }}>{weights[key]}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={5} value={weights[key]}
                        onChange={(e) => adjustWeight(key, Number(e.target.value))}
                        className="w-full h-2 rounded-full cursor-pointer mb-2"
                        style={{ accentColor: color }} />
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  ))}

                  {/* Total — siempre 100% por distribución automática */}
                  <div className="flex items-center justify-between px-5 py-4 rounded-xl border-2 font-bold"
                    style={{ borderColor: "#22c55e", background: "#f0fdf4", color: "#15803d" }}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Total de pesos:</span>
                    </div>
                    <span className="text-2xl">{totalWeights}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm font-semibold border"
                style={{ background: "#fef2f2", borderColor: "#fca5a5", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <div>
                {step > 1 ? (
                  <button type="button" onClick={() => { setError(null); setStep((s) => s - 1); }}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all hover:opacity-80"
                    style={{ borderColor: STEP_COLOR[step - 2], color: STEP_COLOR[step - 2] }}>
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                ) : (
                  <Link href="/mis-posiciones">
                    <button className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-400 hover:opacity-80 transition-all">
                      Cancelar
                    </button>
                  </Link>
                )}
              </div>

              <div>
                {step < 4 ? (
                  <button type="button" onClick={nextStep}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${currentStep.color}, ${STEP_COLOR[step] || UCR.gold})` }}>
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" onClick={publish} disabled={loading || totalWeights !== 100}
                    className="flex items-center gap-2 px-5 sm:px-8 py-2.5 rounded-xl text-sm font-extrabold text-white shadow-md transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${UCR.blue}, ${UCR.sky}, ${UCR.orange})` }}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
                      : <><CheckCircle2 className="w-4 h-4" /> Finalizar y Publicar</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Panel lateral ─────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Resumen */}
            <div className="rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="px-5 py-3" style={{ background: `linear-gradient(135deg, ${UCR.blue}, ${UCR.sky})` }}>
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wide">Resumen</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 space-y-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 shrink-0 mt-0.5" style={{ color: UCR.blue }} />
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-snug">
                      {titulo || <span className="text-slate-400 font-normal italic text-xs">Sin título aún</span>}
                    </p>
                    {tipo && <p className="text-xs mt-0.5 font-semibold" style={{ color: UCR.orange }}>{TIPOS_LABEL[tipo]}</p>}
                  </div>
                </div>
                {(modalidad || jornada) && (
                  <p className="text-xs text-slate-500 pl-6">{[modalidad, jornada].filter(Boolean).join(" · ")}</p>
                )}
                {empresa && <p className="text-xs text-slate-500 pl-6">{empresa}</p>}
                {fechaLimite && (
                  <p className="text-xs pl-6 font-semibold" style={{ color: UCR.orange }}>
                    Cierra: {new Date(fechaLimite).toLocaleDateString("es-CR")}
                  </p>
                )}

                {/* Badges */}
                {(beneficios.length + hardSkills.length + softSkills.length + idiomas.length) > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {beneficios.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${UCR.orange}15`, color: UCR.orange }}>
                        {beneficios.length} beneficio{beneficios.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {hardSkills.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${UCR.sky}15`, color: UCR.sky }}>
                        {hardSkills.length} hard skill{hardSkills.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {softSkills.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${UCR.gold}25`, color: "#92400e" }}>
                        {softSkills.length} soft skill{softSkills.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {idiomas.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${UCR.blue}15`, color: UCR.blue }}>
                        {idiomas.length} idioma{idiomas.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tip contextual por paso */}
            {step === 2 && (
              <div className="rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${UCR.orange}, ${UCR.amber})` }} />
                <div className="p-4 bg-white dark:bg-slate-900" style={{ background: `${UCR.orange}06` }}>
                  <h4 className="text-sm font-extrabold mb-1.5" style={{ color: UCR.orange }}>✍️ Redacción</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Una descripción clara y honesta atrae mejores candidatos. Sé específico sobre el impacto que tendrá el estudiante en tu proyecto.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${UCR.sky}, ${UCR.blue})` }} />
                <div className="p-4 bg-white dark:bg-slate-900">
                  <h4 className="text-sm font-extrabold mb-1.5" style={{ color: UCR.sky }}>💡 Tip</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Ser específico en los requisitos mejora la calidad del matching. El algoritmo usa estos datos para filtrar y puntuar perfiles.
                  </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="rounded-2xl shadow-md overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${UCR.gold}, ${UCR.amber})` }} />
                <div className="p-4 bg-white dark:bg-slate-900">
                  <h4 className="text-sm font-extrabold mb-1.5" style={{ color: UCR.gold }}>⚙️ Matching</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    El algoritmo compara perfiles de estudiantes UCR contra estos criterios y genera un score de afinidad. Los pesos deben sumar exactamente 100%.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra UCR inferior */}
      <div className="h-1.5 w-full mt-8" style={{ background: `linear-gradient(90deg, ${UCR.gold}, ${UCR.orange}, ${UCR.sky}, ${UCR.blue})` }} />
    </div>
  );
}
