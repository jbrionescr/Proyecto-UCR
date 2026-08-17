"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { GraduationCap, UserPlus, Search, LayoutGrid, List, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { CATALOGO_AREAS } from "@/lib/constants";
import { MatchScoreBadge } from "@/components/directory/MatchScoreBadge";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface AlumniItem {
  user_id: string;
  carrera: string;
  escuela_facultad: string;
  sector: string | null;
  empresa_actual: string;
  cargo_actual: string;
  pais_ciudad: string | null;
  anio_graduacion: number | null;
  ofrece_mentoria: boolean;
  ofrece_empleo: boolean;
  ofrece_pasantia: boolean;
  ofrece_proyecto: boolean;
  ofrece_donacion_dinero: boolean;
  ofrece_guest_speaking: boolean;
  ofrece_volunteering: boolean;
  ofrece_career_advice: boolean;
  ofrece_networking: boolean;
  matchScore?: number;
  matchBreakdown?: { carrera: number; intereses: number; sector: number; apoyo: number };
  matchReasons?: string[];
  User: { id: string; nombre: string; foto_url: string | null; email: string | null };
}

const SUPPORT_CATEGORIES = [
  { key: "mentoria",       label: "Mentoría" },
  { key: "empleo",         label: "Empleo" },
  { key: "pasantia",       label: "Pasantía" },
  { key: "guest_speaking", label: "Charla / Conferencia" },
  { key: "career_advice",  label: "Orientación Profesional" },
  { key: "networking",     label: "Networking" },
  { key: "volunteering",   label: "Voluntariado" },
  { key: "proyecto",       label: "Proyecto Empresarial" },
  { key: "donacion",       label: "Donación Económica" },
];

const BG_COLORS = ["bg-ucr-celeste-medium", "bg-ucr-celeste", "bg-ucr-amarillo", "bg-ucr-naranja", "bg-slate-900"];

function getSupportTags(al: AlumniItem): string[] {
  const tags: string[] = [];
  if (al.ofrece_mentoria)        tags.push("MENTORÍA");
  if (al.ofrece_empleo)          tags.push("EMPLEO");
  if (al.ofrece_pasantia)        tags.push("PASANTÍA");
  if (al.ofrece_guest_speaking)  tags.push("CHARLA");
  if (al.ofrece_career_advice)   tags.push("ORIENTACIÓN");
  if (al.ofrece_networking)      tags.push("NETWORKING");
  if (al.ofrece_volunteering)    tags.push("VOLUNTARIADO");
  if (al.ofrece_proyecto)        tags.push("PROYECTO");
  if (al.ofrece_donacion_dinero) tags.push("DONACIÓN");
  if (tags.length === 0)         tags.push("NETWORKING");
  return tags;
}

export function AlumniDirectoryClient() {
  const { data: session } = useSession();
  const isEstudiante = (session?.user as any)?.tipo === "ESTUDIANTE";
  const [alumni, setAlumni] = useState<AlumniItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters — alineados con columnas reales de BD EXALUMNOS
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCarrera, setSelectedCarrera] = useState("");   // → escuela_facultad
  const [selectedEmpresa, setSelectedEmpresa] = useState("");   // → empresa_actual
  const [selectedSupport, setSelectedSupport] = useState("");   // → ofrece_*
  const [locationQuery, setLocationQuery] = useState("");       // → pais_ciudad

  const fetchAlumni = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery)      params.set("nombre",      searchQuery);
      if (selectedCarrera)  params.set("carrera",     selectedCarrera);
      if (selectedEmpresa)  params.set("empresa",     selectedEmpresa);
      if (selectedSupport)  params.set("tipo_apoyo",  selectedSupport);
      if (locationQuery)    params.set("pais_ciudad", locationQuery);
      params.set("page", String(currentPage));

      const res = await fetch(`/api/exalumnos?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar el directorio");
      const json = await res.json();
      setAlumni(json.data ?? []);
      setTotal(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCarrera, selectedEmpresa, selectedSupport, locationQuery]);

  // Debounce: re-fetch when filters change, reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => { fetchAlumni(1); }, 400);
    return () => clearTimeout(timer);
  }, [fetchAlumni]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCarrera("");
    setSelectedEmpresa("");
    setSelectedSupport("");
    setLocationQuery("");
  };

  const hasFilters = searchQuery || selectedCarrera || selectedEmpresa || selectedSupport || locationQuery;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">

      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 tracking-wide text-sm uppercase">Filtros</h3>
            {hasFilters && (
              <button onClick={handleClearFilters} className="text-xs text-ucr-celeste-medium dark:text-sky-400 hover:underline font-semibold">
                Limpiar
              </button>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Área de Especialidad</label>
              <select
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
                className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md px-3 text-sm focus:outline-none focus:border-ucr-celeste-medium"
              >
                <option value="">Todas las áreas</option>
                {CATALOGO_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Empresa Actual</label>
              <Input
                value={selectedEmpresa}
                onChange={(e) => setSelectedEmpresa(e.target.value)}
                placeholder="Ej. Google, Caja"
                className="h-9 text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Tipo de Apoyo</label>
              <div className="flex flex-wrap gap-2">
                {SUPPORT_CATEGORIES.map((sup) => (
                  <span
                    key={sup.key}
                    onClick={() => setSelectedSupport(selectedSupport === sup.key ? "" : sup.key)}
                    className={`px-3 py-1 rounded-full text-xs cursor-pointer font-semibold border transition-colors ${
                      selectedSupport === sup.key
                        ? "bg-ucr-celeste-medium text-white border-ucr-celeste-medium"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {sup.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">País / Ubicación</label>
              <Input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Ej. Costa Rica, USA"
                className="h-9 text-sm bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-ucr-celeste-medium dark:bg-slate-800/80 text-white p-5 rounded-xl shadow-sm border border-transparent dark:border-slate-700">
          <h4 className="font-bold mb-2">Sé un Mentor</h4>
          <p className="text-sm text-blue-100 mb-4">Comparte tu experiencia con las nuevas generaciones.</p>
          <Link href="/perfil/editar">
            <Button className="w-full bg-white dark:bg-slate-900 text-ucr-celeste-medium dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-0">Actualizar Perfil</Button>
          </Link>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Directorio de Exalumnos</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {loading ? "Cargando..." : <><span className="font-bold text-slate-700 dark:text-slate-300">{total}</span> profesionales conectados{isEstudiante && " · ordenados por mayor afinidad"}</>}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-1 shadow-sm">
            <button aria-label="Vista de cuadrícula" onClick={() => setViewMode("grid")} className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-ucr-celeste-medium text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button aria-label="Vista de lista" onClick={() => setViewMode("list")} className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-ucr-celeste-medium text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, carrera, cargo o empresa..."
            className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-sm"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error} — <button onClick={() => fetchAlumni(page)} className="underline font-medium">Reintentar</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-ucr-celeste-medium animate-spin" />
          </div>
        ) : alumni.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
            <p className="text-slate-500 text-lg">No se encontraron exalumnos con los filtros seleccionados.</p>
            {hasFilters && (
              <Button onClick={handleClearFilters} className="mt-4 bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white">
                Limpiar Filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {alumni.map((al) => {
                const u = al.User;
                const name = u.nombre || "Exalumno";
                const tags = getSupportTags(al);
                const bgCover = BG_COLORS[name.charCodeAt(0) % BG_COLORS.length];
                const grad = al.carrera ? `${al.carrera}${al.anio_graduacion ? `, ${al.anio_graduacion}` : ""}` : "Exalumno UCR";

                if (viewMode === "list") {
                  return (
                    <motion.div
                      key={al.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                      whileHover={{ x: 4 }}
                    >
                    <Card className="relative p-4 border-slate-200 dark:border-slate-800 hover:border-ucr-celeste-medium/30 transition-all shadow-sm hover:shadow-fu-lg bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-4">
                      {al.matchScore !== undefined && (
                        <MatchScoreBadge score={al.matchScore} breakdown={al.matchBreakdown} reasons={al.matchReasons} className="absolute -top-3 -right-3 z-10" />
                      )}
                      <div className="h-16 w-16 rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border dark:border-slate-700 shadow-sm">
                        <img src={u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} alt={name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{al.cargo_actual} {al.empresa_actual && `en ${al.empresa_actual}`}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{grad}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-bold tracking-wide">{tag}</span>
                        ))}
                      </div>
                      <Link href={`/perfil/${al.user_id}`}>
                        <Button className="bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white text-xs h-9 px-4">
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Ver perfil
                        </Button>
                      </Link>
                    </Card>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={al.user_id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                    whileHover={{ y: -6 }}
                    className="h-full"
                  >
                  <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800 hover:border-ucr-celeste-medium/30 transition-all shadow-sm hover:shadow-fu-lg flex flex-col bg-white dark:bg-slate-900 h-full">
                    {al.matchScore !== undefined && (
                      <MatchScoreBadge score={al.matchScore} breakdown={al.matchBreakdown} reasons={al.matchReasons} className="absolute top-3 right-3 z-10" />
                    )}
                    <div className={`h-20 ${bgCover} w-full`} />
                    <div className="px-5 pb-5 flex-1 flex flex-col relative pt-10">
                      <div className="absolute -top-8 left-5 h-16 w-16 rounded-md border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-sm">
                        <img src={u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} alt={name} className="h-full w-full object-cover" />
                      </div>
                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-1 truncate">{name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{al.cargo_actual} {al.empresa_actual && `· ${al.empresa_actual}`}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2 mb-3">
                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{grad}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                        {tags.slice(0, 3).map((tag, j) => (
                          <span key={tag} className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide ${j === 0 ? "bg-ucr-celeste-tint dark:bg-green-900/40 text-ucr-celeste-medium dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/perfil/${al.user_id}`}>
                        <Button className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white text-xs h-9">
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Ver perfil
                        </Button>
                      </Link>
                    </div>
                  </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button variant="outline" onClick={() => fetchAlumni(page - 1)} disabled={page <= 1 || loading} className="h-9 px-3">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Página {page} de {totalPages}
                </span>
                <Button variant="outline" onClick={() => fetchAlumni(page + 1)} disabled={page >= totalPages || loading} className="h-9 px-3">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
