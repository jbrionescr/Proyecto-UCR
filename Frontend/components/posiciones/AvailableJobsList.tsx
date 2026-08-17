"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Building2, CalendarDays, CheckCircle2, Loader2, Users, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { CATALOGO_AREAS } from "@/lib/constants";

export function AvailableJobsList() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const role = (session?.user as any)?.tipo as string | undefined;
  const isStudent = role === "ESTUDIANTE";

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [appIdMap, setAppIdMap] = useState<Record<string, string>>({});
  const [loadingApplied, setLoadingApplied] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>("");

  // Cargar lista de posiciones activas
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const url = selectedArea ? `/api/posiciones?area_estudio=${encodeURIComponent(selectedArea)}` : "/api/posiciones";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setJobs(data.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [selectedArea]);

  // Cargar aplicaciones existentes del estudiante
  useEffect(() => {
    if (!isStudent) {
      setLoadingApplied(false);
      return;
    }
    async function loadApplied() {
      try {
        const res = await fetch("/api/aplicaciones");
        if (res.ok) {
          const json = await res.json();
          const ids = new Set<string>();
          const map: Record<string, string> = {};
          for (const a of (json.data || [])) {
            if (a.posicion?.id) {
              ids.add(a.posicion.id);
              map[a.posicion.id] = a.id;
            }
          }
          setAppliedIds(ids);
          setAppIdMap(map);
        }
      } catch {
        // ignore
      } finally {
        setLoadingApplied(false);
      }
    }
    loadApplied();
  }, [isStudent]);

  const handleApply = async (jobId: string) => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      const res = await fetch("/api/aplicaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posicion_id: jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedIds((prev) => new Set(Array.from(prev).concat(jobId)));
        setAppIdMap((prev) => ({ ...prev, [jobId]: data.id }));
        setSelectedJobId(null);
        toast({
          title: "Aplicación enviada",
          description: "Tu perfil UCR ha sido enviado al exalumno. Te notificaremos cuando haya respuesta.",
        });
      } else {
        // Si ya aplicó antes (race condition), actualizar estado local
        if (res.status === 409) {
          setAppliedIds((prev) => new Set(Array.from(prev).concat(jobId)));
        }
        toast({
          title: "Error",
          description: data.message || "No se pudo enviar la aplicación.",
          variant: "destructive",
        });
        setSelectedJobId(null);
      }
    } catch {
      toast({
        title: "Error de conexión",
        description: "Revisa tu conexión e intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const isLoadingAll = loading || (isStudent && loadingApplied);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-primary mb-2">Bolsa de Empleo</h2>
        <p className="text-lg text-muted-foreground mb-6">
          Explora oportunidades laborales y de pasantía publicadas por la red de exalumnos UCR.
        </p>

        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <div className="flex-1">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-transparent border-none text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-0 text-sm"
            >
              <option value="">Todas las Áreas de Estudio</option>
              {CATALOGO_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {isLoadingAll ? (
          <div className="text-center py-10 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando empleos...
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No hay vacantes disponibles en este momento.
          </div>
        ) : (
          jobs.map((job) => {
            const alreadyApplied = appliedIds.has(job.id);
            const isExpanded = selectedJobId === job.id;

            return (
              <Card
                key={job.id}
                className="w-full glass shadow-md border-primary/10 overflow-hidden transition-all hover:shadow-lg dark:bg-slate-900/40 dark:border-slate-800"
              >
                <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-primary dark:text-sky-400 font-bold">
                        {job.titulo}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {job.empresa || "Empresa Confidencial"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {alreadyApplied && (
                        <Badge className="bg-green-100 text-green-700 border-0 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aplicado
                        </Badge>
                      )}
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                        {job.tipo === "EMPLEO" ? "Tiempo Completo" : "Pasantía"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <div>
                      <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        Modalidad / Jornada
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">
                          {job.modalidad || "No especificada"}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">
                          {job.jornada || "No especificada"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                          Cierra:{" "}
                          {job.fecha_limite
                            ? new Date(job.fecha_limite).toLocaleDateString("es-CR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })
                            : "Sin fecha límite"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Formulario de confirmación expandible */}
                  {isExpanded && !alreadyApplied && (
                    <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 text-base">
                        Confirmar tu aplicación
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                        Al confirmar, tu perfil UCR y currículum digital serán compartidos con el exalumno
                        encargado de esta vacante.
                      </p>

                      <div className="bg-[#005da4]/5 dark:bg-[#005da4]/20 border border-[#005da4]/20 dark:border-[#005da4]/40 rounded-lg p-4 mb-5 text-sm space-y-1.5">
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Posición: </span>
                          <span className="text-slate-600 dark:text-slate-400">{job.titulo}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Empresa: </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {job.empresa || "Empresa Confidencial"}
                          </span>
                        </p>
                        {job.modalidad && (
                          <p>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Modalidad: </span>
                            <span className="text-slate-600 dark:text-slate-400">{job.modalidad}</span>
                          </p>
                        )}
                        {job.jornada && (
                          <p>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Jornada: </span>
                            <span className="text-slate-600 dark:text-slate-400">{job.jornada}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedJobId(null)}
                          disabled={isApplying}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleApply(job.id)}
                          disabled={isApplying}
                          className="bg-primary hover:bg-primary/90 dark:bg-sky-600 dark:hover:bg-sky-700 text-primary-foreground"
                        >
                          {isApplying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar Aplicación
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Estado: ya aplicó */}
                  {alreadyApplied && (
                    <div className="mt-5 flex items-center gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm font-semibold text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Tu aplicación está en revisión. El exalumno se pondrá en contacto si hay interés.
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-white dark:bg-slate-900/40 pt-0 pb-4 justify-end">
                  {isStudent && !alreadyApplied && !isExpanded && (
                    <Button
                      onClick={() => setSelectedJobId(job.id)}
                      variant="default"
                      className="bg-primary hover:bg-primary/90 dark:bg-sky-600 dark:hover:bg-sky-700 text-primary-foreground"
                    >
                      Aplicar Ahora
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
