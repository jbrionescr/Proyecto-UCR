"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { contactarMatch, cerrarMatch, aceptarMatch, rechazarMatch } from "@/actions/matching.actions";
import { Loader2, UserCheck, Clock, Handshake, XCircle, Sparkles, CheckCircle2, MessageCircle, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { MatchScoreBadge } from "@/components/directory/MatchScoreBadge";

interface PosicionSugerida {
  id: string;
  titulo: string | null;
  empresa: string | null;
  tipo: string | null;
  modalidad: string | null;
  jornada: string | null;
  fecha_limite: string | null;
  score: number;
  reasons: string[];
}

type MatchStatus = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

type Desglose = { C: number; I: number; A: number; S: number };

interface Match {
  id: string;
  afinidad: number;
  desglose: Desglose | null;
  status: MatchStatus;
  initiated_by?: string;
  exalumno: {
    user: { name?: string | null };
    carrera: string;
    sector: string;
    apoyoOfrecido: string[];
  };
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; Icon: any }> = {
  SUGERIDO:   { label: "Sugerido",    color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",      Icon: Sparkles   },
  CONTACTADO: { label: "Contactado",  color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300", Icon: Clock      },
  ACTIVO:     { label: "Activo",      color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300",   Icon: Handshake  },
  CERRADO:    { label: "Cerrado",     color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800/40 dark:text-gray-400",        Icon: XCircle    },
};

const FILTER_TABS: { key: MatchStatus | "TODOS"; label: string }[] = [
  { key: "TODOS",      label: "Todos"      },
  { key: "SUGERIDO",   label: "Sugeridos"  },
  { key: "CONTACTADO", label: "Contactados"},
  { key: "ACTIVO",     label: "Activos"    },
  { key: "CERRADO",    label: "Cerrados"   },
];

// El desglose de matches usa {C,I,A,S}; MatchScoreBadge (el mismo componente
// del Directorio de Exalumnos) usa {carrera,intereses,sector,apoyo}.
function toBreakdown(d: Desglose | null) {
  if (!d) return undefined;
  return { carrera: d.C, intereses: d.I, sector: d.A, apoyo: d.S };
}

export default function MisMatchesClient({
  matches: initial,
  posiciones = [],
  currentUserId
}: {
  matches: Match[];
  posiciones?: PosicionSugerida[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [matches, setMatches]   = useState<Match[]>(initial);
  const [filter, setFilter]     = useState<MatchStatus | "TODOS">("TODOS");
  const [loadingId, setLoading] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [, startTransition]     = useTransition();

  const visible = (filter === "TODOS" ? matches : matches.filter(m => m.status === filter))
    .slice()
    .sort((a, b) => b.afinidad - a.afinidad);

  const counts = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "TODOS" ? matches.length : matches.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  async function handleAction(
    matchId: string,
    action: "contactar" | "cerrar" | "aceptar" | "rechazar"
  ) {
    setLoading(matchId);
    setError(null);
    try {
      if (matchId.startsWith("m")) {
        // Datos mock: simular localmente
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusMap: Record<string, MatchStatus> = {
          contactar: "CONTACTADO",
          cerrar: "CERRADO",
          aceptar: "ACTIVO",
          rechazar: "CERRADO",
        };
        setMatches(prev => prev.map(m =>
          m.id === matchId ? { ...m, status: statusMap[action] } : m
        ));
        setLoading(null);
        return;
      }

      let updated: any;
      if (action === "contactar") updated = await contactarMatch(matchId);
      else if (action === "cerrar")   updated = await cerrarMatch(matchId);
      else if (action === "aceptar")  updated = await aceptarMatch(matchId);
      else                            updated = await rechazarMatch(matchId, "estudiante");

      setMatches(prev => prev.map(m =>
        m.id === matchId ? { ...m, status: updated.estado as MatchStatus } : m
      ));

      if (action === "aceptar") {
        router.push(`/mensajes?matchId=${matchId}`);
      }
    } catch (e: any) {
      setError(e.message ?? "Error al actualizar el match");
    } finally {
      setLoading(null);
    }
  }

  return (
    <ParallaxBackground className="min-h-screen">
      <div className="container mx-auto py-8 sm:py-12 px-4">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight fu-text-gradient">
          Mis Matches
        </h1>
        <p className="mt-2 fu-text-2 text-lg">
          Exalumnos sugeridos por la plataforma según tu perfil y necesidades.
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Posiciones para ti */}
      {posiciones.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1">Posiciones para ti</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Vacantes de empleo y pasantía que mejor calzan con tu perfil.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posiciones.map((p) => (
              <Card key={p.id} className="relative overflow-hidden hover:shadow-lg transition-all border-primary/10">
                <div className="absolute top-4 right-4 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-bold text-base shadow-md">
                  {p.score}
                </div>
                <CardHeader className="pr-16">
                  <CardTitle className="text-lg break-words">{p.titulo ?? "Posición"}</CardTitle>
                  <CardDescription className="text-sm break-words">
                    {p.empresa ?? "Empresa no especificada"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.tipo && <Badge variant="outline" className="text-xs">{p.tipo}</Badge>}
                    {p.modalidad && <Badge variant="secondary" className="text-xs bg-muted">{p.modalidad}</Badge>}
                  </div>
                  {p.reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground">{p.reasons.join(" · ")}</p>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white">
                    <Link href={`/posiciones/${p.id}`}>
                      <Briefcase size={16} className="mr-2" /> Ver posición
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Mentorías sugeridas</h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === tab.key
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-muted-foreground border-border hover:border-primary/50 dark:bg-muted dark:text-muted-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === tab.key ? "bg-white/20" : "bg-muted"}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No hay matches en este estado aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((match, i) => {
            const cfg       = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.SUGERIDO;
            const isLoading = loadingId === match.id;
            const isClosed  = match.status === "CERRADO";
            // El exalumno ofreció ayuda: el estudiante debe aceptar/rechazar
            const exalumnoOfrece =
              match.status === "CONTACTADO" && match.initiated_by === currentUserId;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: [0.25, 1, 0.5, 1] }}
                className="h-full"
              >
              <Card
                className={`relative h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-primary/10
                  ${isClosed ? "opacity-60" : ""}
                  ${exalumnoOfrece ? "ring-2 ring-yellow-300/60" : ""}
                `}
              >
                {/* Score con desglose — mismo componente que el Directorio de Exalumnos */}
                <MatchScoreBadge
                  score={match.afinidad}
                  breakdown={toBreakdown(match.desglose)}
                  className="absolute top-4 right-4 z-20"
                />

                <CardHeader className="pr-16">
                  <CardTitle className="text-xl break-words">{match.exalumno.user.name ?? "Exalumno"}</CardTitle>
                  <CardDescription className="text-sm break-words">
                    {match.exalumno.carrera} • {match.exalumno.sector}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <Badge variant="outline" className={`px-3 py-1 flex w-fit items-center gap-1.5 ${cfg.color}`}>
                      <cfg.Icon size={12} />
                      {exalumnoOfrece ? "Te ofrece apoyo" : cfg.label}
                    </Badge>
                  </div>

                  {/* Flujo de estados */}
                  <div className="flex items-center gap-1 mb-4">
                    {(["SUGERIDO", "CONTACTADO", "ACTIVO", "CERRADO"] as MatchStatus[]).map((s, i) => {
                      const steps = ["SUGERIDO", "CONTACTADO", "ACTIVO", "CERRADO"] as MatchStatus[];
                      const currentIdx = steps.indexOf(match.status);
                      const stepIdx    = steps.indexOf(s);
                      const done       = stepIdx <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${done ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          {i < 3 && <div className={`h-px flex-1 ${stepIdx < currentIdx ? "bg-primary" : "bg-muted-foreground/20"}`} />}
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Ofrece:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.exalumno.apoyoOfrecido.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-muted text-xs">{apoyo}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  {/* SUGERIDO: estudiante contacta al exalumno */}
                  {match.status === "SUGERIDO" && (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white shadow-md"
                      disabled={isLoading}
                      onClick={() => handleAction(match.id, "contactar")}
                    >
                      {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserCheck size={16} className="mr-2" />}
                      Contactar
                    </Button>
                  )}

                  {/* CONTACTADO: estudiante inició → espera respuesta del exalumno */}
                  {match.status === "CONTACTADO" && !exalumnoOfrece && (
                    <Button disabled variant="outline" className="w-full text-yellow-600 border-yellow-300">
                      <Clock size={16} className="mr-2" /> Esperando respuesta...
                    </Button>
                  )}

                  {/* CONTACTADO: exalumno ofreció → estudiante acepta o rechaza */}
                  {exalumnoOfrece && (
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "aceptar")}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-gray-500 hover:text-red-600 hover:border-red-300"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "rechazar")}
                      >
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                        Rechazar
                      </Button>
                    </div>
                  )}

                  {/* ACTIVO: chat disponible */}
                  {match.status === "ACTIVO" && (
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => router.push(`/mensajes?matchId=${match.id}`)}
                      >
                        <MessageCircle size={16} className="mr-2" /> Ver conversación
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-500 hover:text-red-600 hover:border-red-300"
                        disabled={isLoading}
                        onClick={() => handleAction(match.id, "cerrar")}
                        title="Cerrar match"
                      >
                        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                      </Button>
                    </div>
                  )}

                  {match.status === "CERRADO" && (
                    <p className="w-full text-center text-sm text-muted-foreground">Match cerrado</p>
                  )}
                </CardFooter>
              </Card>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>
    </ParallaxBackground>
  );
}
