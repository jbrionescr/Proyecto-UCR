"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardList, Loader2, Briefcase, Building2, MapPin,
  Clock, Calendar, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { useDialog } from "@/hooks/useDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { SunflowerImage } from "@/components/fu/SunflowerImage";

interface Aplicacion {
  id: string;
  estado: "ENVIADA" | "EN_REVISION" | "SELECCIONADO" | "DESCARTADO";
  created_at: string;
  posicion: {
    id: string;
    titulo: string;
    tipo: string | null;
    modalidad: string | null;
    empresa: string | null;
    estado: string | null;
    fecha_limite: string | null;
    exalumno_nombre: string | null;
    exalumno_foto: string | null;
  } | null;
}

const ESTADO_CFG = {
  ENVIADA:      { label: "Enviada",         mensaje: "Tu aplicación fue enviada",                       cls: "bg-blue-50 text-blue-700 border-blue-200",     Icon: Clock },
  EN_REVISION:  { label: "En revisión",     mensaje: "El exalumno está revisando tu perfil",            cls: "bg-yellow-50 text-yellow-700 border-yellow-200", Icon: Clock },
  SELECCIONADO: { label: "Seleccionado",    mensaje: "¡Fuiste seleccionado! Revisa tu correo",          cls: "bg-green-50 text-green-700 border-green-200",  Icon: CheckCircle2 },
  DESCARTADO:   { label: "No seleccionado", mensaje: "La posición fue cubierta por otro candidato",     cls: "bg-red-50 text-red-600 border-red-200",        Icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MisAplicacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const { showAlert, showConfirm } = useDialog();

  const role = (session?.user as any)?.tipo;

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if (role && role !== "ESTUDIANTE") { router.replace("/"); return; }
    fetch("/api/aplicaciones")
      .then((r) => r.json())
      .then((d) => setAplicaciones(d.data ?? []))
      .catch(() => setError("No se pudieron cargar las aplicaciones."))
      .finally(() => setLoading(false));
  }, [status, role]);

  async function retirarAplicacion(id: string) {
    const ok = await showConfirm("¿Retirar esta aplicación? Esta acción no se puede deshacer.", {
      title: "Retirar aplicación",
      confirmLabel: "Retirar",
      variant: "warning",
    });
    if (!ok) return;
    setWithdrawingId(id);
    try {
      const res = await fetch(`/api/aplicaciones/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setAplicaciones((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      await showAlert(err.message || "Error al retirar la aplicación.", {
        title: "Error", variant: "error",
      });
    } finally {
      setWithdrawingId(null);
    }
  }

  if (status === "loading" || loading) return (
    <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
    </ParallaxBackground>
  );

  const contadores = {
    total: aplicaciones.length,
    enviada: aplicaciones.filter((a) => a.estado === "ENVIADA").length,
    enRevision: aplicaciones.filter((a) => a.estado === "EN_REVISION").length,
    seleccionado: aplicaciones.filter((a) => a.estado === "SELECCIONADO").length,
    descartado: aplicaciones.filter((a) => a.estado === "DESCARTADO").length,
  };

  return (
    <ParallaxBackground className="min-h-full p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Estudiante</p>
          <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Mis Aplicaciones</AnimatedHeading>
          <p className="fu-text-2 mt-2 text-sm">
            Seguimiento de todas tus postulaciones a posiciones laborales y pasantías.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Resumen */}
        {aplicaciones.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Total", value: contadores.total, cls: "text-slate-700" },
              { label: "Enviadas", value: contadores.enviada, cls: "text-blue-700" },
              { label: "En revisión", value: contadores.enRevision, cls: "text-yellow-700" },
              { label: "Seleccionado", value: contadores.seleccionado, cls: "text-green-700" },
              { label: "No seleccionado", value: contadores.descartado, cls: "text-red-600" },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm text-center">
                <p className={`text-2xl font-extrabold ${item.cls}`}>{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {aplicaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SunflowerImage size={220} />
            <h2 className="text-xl font-bold fu-text mt-4 mb-3">Sin aplicaciones aún</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">
              Explora la bolsa de empleo y aplica a posiciones que encajen con tu perfil.
            </p>
            <Link href="/posiciones"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              <Briefcase className="w-4 h-4" /> Ver posiciones disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {aplicaciones.map((a, i) => {
              const cfg = ESTADO_CFG[a.estado] ?? ESTADO_CFG.ENVIADA;
              const { Icon } = cfg;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-fu-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[#0f4c81]/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-[#0f4c81]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {a.posicion ? (
                          <Link href={`/posiciones/${a.posicion.id}`}
                            className="font-semibold text-slate-800 dark:text-slate-100 hover:text-[#0f4c81] transition-colors break-words">
                            {a.posicion.titulo}
                          </Link>
                        ) : (
                          <span className="font-semibold text-slate-500">Posición eliminada</span>
                        )}
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 flex items-center gap-1 ${cfg.cls}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </Badge>
                      </div>
                      <div className="mb-1">
                        <p className="text-xs font-medium text-slate-500">{cfg.mensaje}</p>
                      </div>

                      {a.posicion && (
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {a.posicion.empresa && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {a.posicion.empresa}
                            </span>
                          )}
                          {a.posicion.modalidad && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {a.posicion.modalidad}
                            </span>
                          )}
                          {a.posicion.tipo && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" /> {a.posicion.tipo}
                            </span>
                          )}
                          {a.posicion.exalumno_nombre && (
                            <span className="flex items-center gap-1">
                              Publicado por: <span className="font-medium">{a.posicion.exalumno_nombre}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {a.posicion?.fecha_limite && (
                        <p className="text-xs text-orange-500 font-semibold mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Cierra: {formatDate(a.posicion.fecha_limite)}
                        </p>
                      )}

                      {a.posicion?.estado && a.posicion.estado !== "activa" && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Esta posición ya no está activa ({a.posicion.estado})
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-2">
                      <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" /> Aplicado el {formatDate(a.created_at)}
                      </p>
                      {a.estado === "ENVIADA" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                          disabled={withdrawingId === a.id}
                          onClick={() => retirarAplicacion(a.id)}
                        >
                          {withdrawingId === a.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Retirar"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
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
