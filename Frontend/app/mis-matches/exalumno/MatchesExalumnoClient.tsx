"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { aceptarMatch, cerrarMatch, rechazarMatch } from "@/actions/matching.actions";
import { Loader2, CheckCircle2, Clock, Handshake, XCircle, Sparkles, BookOpen, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { MatchScoreBadge } from "@/components/directory/MatchScoreBadge";

type MatchStatus = "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "CERRADO";

type Desglose = { C: number; I: number; A: number; S: number };

interface Match {
  id: string;
  afinidad: number;
  desglose: Desglose | null;
  status: MatchStatus;
  initiated_by?: string;
  estudiante: {
    user: { name?: string | null };
    carrera: string;
    avanceProyecto: number;
    apoyoBuscado: string[];
  };
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; Icon: any }> = {
  SUGERIDO:   { label: "Sugerido",     color: "bg-blue-100 text-blue-700 border-blue-200",     Icon: Sparkles   },
  CONTACTADO: { label: "Te contactó",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: Clock      },
  ACTIVO:     { label: "Activo",       color: "bg-green-100 text-green-700 border-green-200",   Icon: Handshake  },
  CERRADO:    { label: "Cerrado",      color: "bg-gray-100 text-gray-500 border-gray-200",      Icon: XCircle    },
};

const FILTER_TABS: { key: MatchStatus | "TODOS"; label: string }[] = [
  { key: "TODOS",      label: "Todos"       },
  { key: "CONTACTADO", label: "Pendientes"  },
  { key: "ACTIVO",     label: "Activos"     },
  { key: "SUGERIDO",   label: "Sugeridos"   },
  { key: "CERRADO",    label: "Cerrados"    },
];

// El desglose de matches usa {C,I,A,S}; MatchScoreBadge (el mismo componente
// del Directorio de Exalumnos) usa {carrera,intereses,sector,apoyo}.
function toBreakdown(d: Desglose | null) {
  if (!d) return undefined;
  return { carrera: d.C, intereses: d.I, sector: d.A, apoyo: d.S };
}

export default function MatchesExalumnoClient({ matches: initial, currentUserId }: { matches: Match[], currentUserId: string }) {
  const router = useRouter();
  const [matches, setMatches]   = useState<Match[]>(initial);
  const [filter, setFilter]     = useState<MatchStatus | "TODOS">("TODOS");
  const [loadingId, setLoading] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const visible = (filter === "TODOS" ? matches : matches.filter(m => m.status === filter))
    .slice()
    .sort((a, b) => b.afinidad - a.afinidad);
  const counts  = FILTER_TABS.reduce((acc, t) => {
    acc[t.key] = t.key === "TODOS" ? matches.length : matches.filter(m => m.status === t.key).length;
    return acc;
  }, {} as Record<string, number>);

  const pendientes = matches.filter(m => m.status === "CONTACTADO" && m.initiated_by !== "exalumno").length;

  async function handleAction(matchId: string, action: "aceptar" | "rechazar" | "cerrar") {
    setLoading(matchId);
    setError(null);
    try {
      if (matchId.startsWith("m")) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const statusMap: Record<string, MatchStatus> = {
          aceptar: "ACTIVO", rechazar: "CERRADO", cerrar: "CERRADO",
        };
        setMatches(prev => prev.map(m =>
          m.id === matchId ? { ...m, status: statusMap[action] } : m
        ));
        if (action === "aceptar") router.push(`/mensajes?matchId=${matchId}`);
        setLoading(null);
        return;
      }

      let updated: any;
      if (action === "aceptar")  updated = await aceptarMatch(matchId);
      else if (action === "cerrar")  updated = await cerrarMatch(matchId);
      else                           updated = await rechazarMatch(matchId, "exalumno");

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
          Estudiantes que la plataforma sugirió como compatibles con tu perfil.
        </p>
        {pendientes > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-2 text-sm font-medium dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300">
            <Clock size={14} />
            {pendientes} estudiante{pendientes > 1 ? "s" : ""} esperando tu respuesta
          </div>
        )}
      </motion.div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

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
            const cfg       = STATUS_CONFIG[match.status];
            const isLoading = loadingId === match.id;
            const isClosed  = match.status === "CERRADO";
            // El exalumno ofreció → está esperando respuesta del estudiante
            const esperandoEstudiante =
              match.status === "CONTACTADO" && match.initiated_by === currentUserId;
            // El estudiante contactó → exalumno debe aceptar/rechazar
            const estudianteContacto =
              match.status === "CONTACTADO" && match.initiated_by !== currentUserId;

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
                  ${estudianteContacto ? "ring-2 ring-yellow-300/60" : ""}
                `}
              >
                {/* Score con desglose — mismo componente que el Directorio de Exalumnos */}
                <MatchScoreBadge
                  score={match.afinidad}
                  breakdown={toBreakdown(match.desglose)}
                  className="absolute top-4 right-4 z-20"
                />

                <CardHeader className="pr-16">
                  <CardTitle className="text-xl break-words">{match.estudiante.user.name ?? "Estudiante"}</CardTitle>
                  <CardDescription className="text-sm break-words">{match.estudiante.carrera}</CardDescription>
                </CardHeader>

                <CardContent>
                  <Badge variant="outline" className={`px-3 py-1 flex w-fit items-center gap-1.5 mb-4 ${cfg.color}`}>
                    <cfg.Icon size={12} />
                    {estudianteContacto ? "Solicitud de apoyo" : cfg.label}
                  </Badge>

                  {/* Progreso proyecto */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <BookOpen size={11} /> Avance proyecto
                      </span>
                      <span className="text-xs font-bold">{match.estudiante.avanceProyecto}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                        style={{ width: `${match.estudiante.avanceProyecto}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Busca:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.estudiante.apoyoBuscado.map(apoyo => (
                        <Badge key={apoyo} variant="secondary" className="bg-muted text-xs">{apoyo}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/30 pt-4 border-t border-border/50">
                  {/* Esperando que el algoritmo / estudiante contacte */}
                  {match.status === "SUGERIDO" && (
                    <p className="w-full text-center text-sm text-muted-foreground">Esperando que el estudiante contacte</p>
                  )}

                  {/* Exalumno ofreció, espera al estudiante */}
                  {esperandoEstudiante && (
                    <Button disabled variant="outline" className="w-full text-yellow-600 border-yellow-300">
                      <Clock size={16} className="mr-2" /> Esperando respuesta del estudiante...
                    </Button>
                  )}

                  {/* Estudiante solicitó → exalumno acepta o rechaza */}
                  {estudianteContacto && (
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
