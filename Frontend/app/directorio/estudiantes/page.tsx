"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/hooks/useDialog";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/input";
import {
  Search, SlidersHorizontal, X, Loader2, CheckCircle2,
  GraduationCap, Briefcase, FlaskConical, Cpu, Leaf, Heart,
  BookOpen, Lightbulb, Globe, ExternalLink, ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { CATALOGO_AREAS, TIPOS_APOYO, CATALOGO_CARRERAS } from "@/lib/constants";
import { ofrecerApoyo, getMatchesForExalumno, rechazarMatch } from "@/actions/matching.actions";
import { MatchScoreBadge } from "@/components/directory/MatchScoreBadge";

interface EstudianteItem {
  id: string;
  carrera: string;
  avanceProyecto: number;
  areaProyecto: string | null;
  proyectoTipo: string | null;
  proyectoTitulo: string | null;
  proyectoDescripcion: string | null;
  sede: string | null;
  nivelAcademico: string | null;
  apoyoBuscado: string[];
  matchScore?: number;
  matchBreakdown?: { carrera: number; intereses: number; sector: number; apoyo: number };
  matchReasons?: string[];
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
    proyectoFinalizado: boolean;
  };
}

// Colores/íconos por tipo de proyecto
const PROYECTO_THEME: Record<string, { bg: string; icon: React.ElementType; accent: string }> = {
  "Ingeniería":         { bg: "from-blue-600 to-blue-800",   icon: Cpu,          accent: "#2563eb" },
  "Tecnología":         { bg: "from-indigo-600 to-indigo-800", icon: Cpu,         accent: "#4f46e5" },
  "Ciencias":           { bg: "from-teal-600 to-teal-800",   icon: FlaskConical, accent: "#0d9488" },
  "Salud":              { bg: "from-rose-600 to-rose-800",   icon: Heart,         accent: "#e11d48" },
  "Ambiente":           { bg: "from-green-600 to-green-800", icon: Leaf,          accent: "#16a34a" },
  "Sostenibilidad":     { bg: "from-green-600 to-green-800", icon: Leaf,          accent: "#16a34a" },
  "Arquitectura":       { bg: "from-amber-600 to-amber-800", icon: Briefcase,     accent: "#d97706" },
  "Educación":          { bg: "from-purple-600 to-purple-800", icon: BookOpen,    accent: "#9333ea" },
  "Innovación":         { bg: "from-orange-600 to-orange-800", icon: Lightbulb,   accent: "#ea580c" },
  "default":            { bg: "from-[#005da4] to-[#003f7a]", icon: GraduationCap, accent: "#005da4" },
};

function getTheme(area: string | null) {
  if (!area) return PROYECTO_THEME.default;
  const key = Object.keys(PROYECTO_THEME).find((k) =>
    area.toLowerCase().includes(k.toLowerCase())
  );
  return key ? PROYECTO_THEME[key] : PROYECTO_THEME.default;
}

function getFaseLabel(p: number) {
  if (p < 25) return "Fase Inicial";
  if (p < 60) return "En Desarrollo";
  if (p < 90) return "Avanzado";
  return "Fase Final";
}

// ── Modal de Proyecto ────────────────────────────────────────────────────────

function ProyectoModal({
  student,
  onClose,
  role,
  offered,
  pending,
  countdown,
  onOfrecer,
  onCancelarPendiente,
  onCancelarOferta,
}: {
  student: EstudianteItem;
  onClose: () => void;
  role: string | undefined;
  offered: boolean;
  pending: boolean;
  countdown: number;
  onOfrecer: () => void;
  onCancelarPendiente: () => void;
  onCancelarOferta: () => void;
}) {
  const theme = getTheme(student.areaProyecto);
  const Icon = theme.icon;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header con gradiente */}
        <div className={`bg-gradient-to-br ${theme.bg} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {student.matchScore !== undefined && (
            <MatchScoreBadge score={student.matchScore} breakdown={student.matchBreakdown} reasons={student.matchReasons} size="sm" className="absolute top-3 right-14" />
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            {student.areaProyecto && (
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {student.areaProyecto}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white leading-snug">
            {student.proyectoTitulo || "Proyecto de Graduación"}
          </h2>
          <p className="text-white/70 text-sm mt-1">{student.carrera}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Estudiante */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
              {student.user.image ? (
                <img src={student.user.image} alt={student.user.name || ""} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                {student.user.name || "Estudiante UCR"}
              </p>
              {student.sede && (
                <p className="text-xs text-slate-500">{student.sede}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          {student.proyectoDescripcion ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {student.proyectoDescripcion}
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">Sin descripción disponible.</p>
          )}

          {/* Avance */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-500">{getFaseLabel(student.avanceProyecto)}</span>
              <span className="text-green-600 font-bold">{student.avanceProyecto}%</span>
            </div>
            <Progress value={student.avanceProyecto} className="h-2 bg-slate-100" />
          </div>

          {/* Apoyo buscado */}
          {student.apoyoBuscado.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {student.apoyoBuscado.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#005da4] dark:text-blue-300 rounded-full text-xs font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <Link href={`/perfil/${student.id}`} className="flex-1">
              <Button variant="outline" className="w-full text-sm border-slate-200 gap-2">
                <ExternalLink className="w-4 h-4" /> Ver Perfil
              </Button>
            </Link>

            {role === "EXALUMNO" && (
              offered ? (
                <Button
                  onClick={onCancelarOferta}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-sm"
                >
                  <X className="w-4 h-4 mr-1" /> Cancelar Oferta
                </Button>
              ) : pending ? (
                <Button
                  onClick={onCancelarPendiente}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold"
                >
                  <X className="w-4 h-4 mr-1" /> Cancelar ({countdown}s)
                </Button>
              ) : (
                <Button
                  onClick={onOfrecer}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold"
                >
                  <HeartIcon className="w-4 h-4 mr-1" /> Ofrecer Apoyo
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DirectorioEstudiantes() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.tipo as string | undefined;

  const [estudiantes, setEstudiantes] = useState<EstudianteItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const { showAlert } = useDialog();
  const [error, setError]       = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [modalStudent, setModalStudent] = useState<EstudianteItem | null>(null);

  const [offeredMatches, setOfferedMatches] = useState<Record<string, string>>({});
  const [pendingIds, setPendingIds]         = useState<Set<string>>(new Set());
  const [countdowns, setCountdowns]         = useState<Record<string, number>>({});
  const timeoutsRef  = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const intervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const [nombre, setNombre]           = useState("");
  const [carrera, setCarrera]         = useState("");
  const [areaProyecto, setAreaProyecto] = useState("");
  const [apoyoBuscado, setApoyoBuscado] = useState("");

  const fetchEstudiantes = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nombre) params.set("nombre", nombre);
      if (carrera) params.set("carrera", carrera);
      if (areaProyecto) params.set("area_tematica", areaProyecto);
      if (apoyoBuscado) params.set("tipo_apoyo", apoyoBuscado);
      params.set("page", String(currentPage));
      const res = await fetch(`/api/estudiantes?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar el directorio");
      const json = await res.json();
      setEstudiantes(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [nombre, carrera, areaProyecto, apoyoBuscado]);

  useEffect(() => {
    const t = setTimeout(() => fetchEstudiantes(1), 400);
    return () => clearTimeout(t);
  }, [fetchEstudiantes]);

  useEffect(() => {
    if (!session?.user?.id || role !== "EXALUMNO") return;
    getMatchesForExalumno().then((matches: any[]) => {
      const offered: Record<string, string> = {};
      for (const m of matches) {
        if (m.estado === "CONTACTADO" && m.initiated_by === session?.user?.id) {
          offered[m.estudiante_id] = m.id;
        }
      }
      setOfferedMatches(offered);
    }).catch(() => {});
  }, [session?.user?.id, role]);

  useEffect(() => () => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    Object.values(intervalsRef.current).forEach(clearInterval);
  }, []);

  const handleOfrecerApoyo = (studentId: string) => {
    if (pendingIds.has(studentId) || offeredMatches[studentId]) return;
    setPendingIds(prev => new Set(Array.from(prev).concat(studentId)));
    setCountdowns(prev => ({ ...prev, [studentId]: 5 }));

    intervalsRef.current[studentId] = setInterval(() => {
      setCountdowns(prev => {
        const remaining = (prev[studentId] ?? 1) - 1;
        if (remaining <= 0) { clearInterval(intervalsRef.current[studentId]); delete intervalsRef.current[studentId]; }
        return { ...prev, [studentId]: remaining };
      });
    }, 1000);

    timeoutsRef.current[studentId] = setTimeout(async () => {
      delete timeoutsRef.current[studentId];
      try {
        const result = await ofrecerApoyo(studentId);
        if (result.success) setOfferedMatches(prev => ({ ...prev, [studentId]: result.matchId }));
      } catch (err: any) { showAlert(err.message || "Error al ofrecer apoyo", { title: "Error", variant: "error" }); }
      finally {
        setPendingIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
        setCountdowns(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
      }
    }, 5000);
  };

  const handleCancelarPendiente = (studentId: string) => {
    clearTimeout(timeoutsRef.current[studentId]);
    clearInterval(intervalsRef.current[studentId]);
    delete timeoutsRef.current[studentId];
    delete intervalsRef.current[studentId];
    setPendingIds(prev => { const s = new Set(prev); s.delete(studentId); return s; });
    setCountdowns(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
  };

  const handleCancelarOferta = async (studentId: string) => {
    const matchId = offeredMatches[studentId];
    if (!matchId) return;
    try {
      await rechazarMatch(matchId, "exalumno");
      setOfferedMatches(prev => { const { [studentId]: _, ...rest } = prev; return rest; });
    } catch (err: any) { showAlert(err.message || "Error al cancelar oferta", { title: "Error", variant: "error" }); }
  };

  const hasFilters = nombre || carrera || areaProyecto || apoyoBuscado;

  return (
    <ParallaxBackground className="min-h-screen">
      {/* Modal */}
      {modalStudent && (
        <ProyectoModal
          student={modalStudent}
          onClose={() => setModalStudent(null)}
          role={role}
          offered={!!offeredMatches[modalStudent.id]}
          pending={pendingIds.has(modalStudent.id)}
          countdown={countdowns[modalStudent.id] ?? 5}
          onOfrecer={() => handleOfrecerApoyo(modalStudent.id)}
          onCancelarPendiente={() => handleCancelarPendiente(modalStudent.id)}
          onCancelarOferta={() => handleCancelarOferta(modalStudent.id)}
        />
      )}

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[#005da4] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Directorio</p>
          <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl mb-2">
            Directorio de Estudiantes
          </AnimatedHeading>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl">
            Conoce a los estudiantes y futuros profesionales de la UCR. Encuentra talento, ofrece mentoría y conecta con perfiles prometedores.
          </p>
        </div>

        {/* Búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Buscar por nombre de estudiante..."
              className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-base"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              className={`h-12 px-5 flex-1 sm:flex-none ${showFilters ? "bg-primary text-primary-foreground border-none" : "border-slate-300 text-slate-700 dark:text-slate-300"}`}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros {hasFilters && "(activos)"}
            </Button>
            {hasFilters && (
              <Button aria-label="Limpiar filtros" variant="outline" onClick={() => { setNombre(""); setCarrera(""); setAreaProyecto(""); setApoyoBuscado(""); }} className="h-12 px-4 border-slate-300 text-slate-500 shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Carrera</label>
                <select value={carrera} onChange={(e) => setCarrera(e.target.value)}
                  className="w-full h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 px-3 outline-none focus:border-[#005da4]">
                  <option value="">Todas las carreras</option>
                  {CATALOGO_CARRERAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Área de proyecto</label>
                <select value={areaProyecto} onChange={(e) => setAreaProyecto(e.target.value)}
                  className="w-full h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 px-3 outline-none focus:border-[#005da4]">
                  <option value="">Todas las áreas</option>
                  {CATALOGO_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Apoyo buscado</label>
                <select value={apoyoBuscado} onChange={(e) => setApoyoBuscado(e.target.value)}
                  className="w-full h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-300 px-3 outline-none focus:border-[#005da4]">
                  <option value="">Todos los tipos</option>
                  <option value="financiamiento">Financiamiento / Apoyo Económico</option>
                  <option value="mentoria">Mentoría Profesional / Guía</option>
                  <option value="empleo">Oportunidades de Empleo</option>
                  <option value="pasantia">Pasantías / Prácticas</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error} — <button onClick={() => fetchEstudiantes(page)} className="underline font-medium">Reintentar</button>
          </div>
        )}

        {/* Grid de proyectos */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#005da4] animate-spin" />
          </div>
        ) : estudiantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl">🎓</div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No se encontraron estudiantes</h3>
            <p className="text-slate-500 text-sm">Intenta cambiar los filtros.</p>
            {hasFilters && (
              <button onClick={() => { setNombre(""); setCarrera(""); setAreaProyecto(""); setApoyoBuscado(""); }}
                className="mt-4 text-[#005da4] hover:underline text-sm font-semibold">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 font-medium">
              <span className="font-bold text-slate-700 dark:text-slate-300">{total}</span> estudiante{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}{role === "EXALUMNO" && " · ordenados por mayor afinidad"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estudiantes.map((student) => {
                const theme = getTheme(student.areaProyecto);
                const Icon = theme.icon;
                const isOffered = !!offeredMatches[student.id];
                const isPending = pendingIds.has(student.id);
                const countdown = countdowns[student.id] ?? 5;
                const hasProject = !!student.proyectoTitulo;

                return (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    whileHover={{ y: -6 }}
                    className="h-full"
                  >
                  <Card className="h-full overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-fu-lg transition-shadow group flex flex-col">
                    {/* Imagen / cabecera del proyecto */}
                    <div className={`bg-gradient-to-br ${theme.bg} h-36 flex items-center justify-center relative overflow-hidden`}>
                      {/* Patrón decorativo */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-4 border-white" />
                        <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-full border-4 border-white" />
                      </div>
                      <Icon className="w-14 h-14 text-white/40 absolute" />

                      {/* Badge área o tipo */}
                      {(student.areaProyecto || student.proyectoTipo) && (
                        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {student.areaProyecto || student.proyectoTipo}
                        </span>
                      )}

                      {/* Badge verificado si tiene proyecto */}
                      {hasProject && (
                        <span className={`absolute right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${student.matchScore !== undefined ? "top-16" : "top-3"}`}>
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      )}

                      {student.matchScore !== undefined && (
                        <MatchScoreBadge score={student.matchScore} breakdown={student.matchBreakdown} reasons={student.matchReasons} size="sm" className="absolute top-3 right-3 z-10" />
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Título: Nombre del Estudiante */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                          {student.user.image ? (
                            <img src={student.user.image} alt={student.user.name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold" style={{ background: theme.accent + "20", color: theme.accent }}>
                              {(student.user.name || "E").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug truncate">
                            {student.user.name || "Estudiante UCR"}
                          </h3>
                          <p className="text-[11px] text-[#005da4] dark:text-sky-400 font-semibold truncate">{student.carrera}</p>
                        </div>
                      </div>

                      {/* Título del proyecto (secundario) */}
                      {hasProject && (
                        <div className="mt-2 mb-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Proyecto</p>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                            {student.proyectoTitulo}
                          </p>
                        </div>
                      )}

                      {/* Área explícita */}
                      <p className="text-xs text-[#005da4] dark:text-sky-400 font-semibold mb-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {student.areaProyecto || "Área no especificada"}
                      </p>

                      {/* Descripción */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                        {student.proyectoDescripcion || "El estudiante aún no ha agregado una descripción de su proyecto."}
                      </p>

                      {/* Detalles del Estudiante */}
                      <div className="mb-4 space-y-1.5 mt-auto">
                        <div className="flex items-center text-xs text-slate-500">
                          <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Nivel:</span> {student.nivelAcademico || "No especificado"}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                          <Globe className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Sede:</span> {student.sede || "No especificada"}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {student.apoyoBuscado.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {student.apoyoBuscado.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                              style={{ background: theme.accent + "15", color: theme.accent }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Botones */}
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs border-slate-200 hover:border-slate-300 gap-1"
                          onClick={() => setModalStudent(student)}
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Ver Perfil
                        </Button>

                        {role === "EXALUMNO" && (
                          isOffered ? (
                            <Button size="sm" variant="outline"
                              className="flex-1 text-xs border-red-200 text-red-500 hover:bg-red-50"
                              onClick={() => handleCancelarOferta(student.id)}>
                              <X className="w-3.5 h-3.5 mr-1" /> Cancelar
                            </Button>
                          ) : isPending ? (
                            <Button size="sm"
                              className="flex-1 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold"
                              onClick={() => handleCancelarPendiente(student.id)}>
                              <X className="w-3.5 h-3.5 mr-1" /> ({countdown}s)
                            </Button>
                          ) : (
                            <Button size="sm"
                              className="flex-1 text-xs text-white font-bold"
                              style={{ background: theme.accent }}
                              onClick={() => handleOfrecerApoyo(student.id)}>
                              <HeartIcon className="w-3.5 h-3.5 mr-1" /> Apoyar
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                <Button variant="outline" onClick={() => fetchEstudiantes(page - 1)} disabled={page <= 1 || loading}
                  className="h-9 px-3 border-slate-300 gap-1">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium px-2">
                  Página {page} de {totalPages}
                </span>
                <Button variant="outline" onClick={() => fetchEstudiantes(page + 1)} disabled={page >= totalPages || loading}
                  className="h-9 px-3 border-slate-300 gap-1">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ParallaxBackground>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
