"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, GraduationCap, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface TallerAdmin {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_hora: string | null;
  cupos_totales: number;
  cupos_ocupados: number;
  modalidad: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivo_rechazo: string | null;
  created_at: string;
  exalumno_id: string | null;
  exalumno_nombre: string | null;
  exalumno_email: string | null;
}

const ESTADO_CFG = {
  PENDIENTE: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: Clock },
  APROBADO: { label: "Aprobado", cls: "bg-green-100 text-green-700 border-green-200", Icon: CheckCircle2 },
  RECHAZADO: { label: "Rechazado", cls: "bg-red-100 text-red-700 border-red-200", Icon: XCircle },
};

function fdt(iso: string | null) {
  if (!iso) return "Sin fecha definida";
  return new Date(iso).toLocaleString("es-CR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function RechazoModal({
  taller, working, onConfirm, onClose,
}: {
  taller: TallerAdmin;
  working: boolean;
  onConfirm: (motivo: string) => void;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const trimmed = motivo.trim();
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Rechazar taller</h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vas a rechazar el taller <span className="font-semibold">&quot;{taller.titulo}&quot;</span> de{" "}
            {taller.exalumno_nombre ?? "—"}. Indica el motivo (se enviará al exalumno).
          </p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Ej: El contenido se traslapa con otro taller ya aprobado este mes..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
          />
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={working} className="text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={working || !trimmed}
            onClick={() => onConfirm(trimmed)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs disabled:opacity-50"
          >
            {working ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            &nbsp;Confirmar rechazo
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTalleresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [talleres, setTalleres] = useState<TallerAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("PENDIENTE");
  const [working, setWorking] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [rechazando, setRechazando] = useState<TallerAdmin | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((session?.user as any)?.tipo !== "ADMIN") { router.replace("/"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, filtroEstado]);

  async function load() {
    setLoading(true);
    const qs = filtroEstado ? `?estado=${filtroEstado}` : "";
    const res = await fetch(`/api/admin/talleres${qs}`);
    const d = await res.json();
    setTalleres(d.data ?? []);
    setLoading(false);
  }

  async function accion(id: string, nuevoEstado: "APROBADO" | "RECHAZADO", motivo?: string) {
    setWorking(id);
    setMsg(null);
    const res = await fetch(`/api/admin/talleres/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, motivo_rechazo: motivo }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: `Taller ${nuevoEstado === "APROBADO" ? "aprobado" : "rechazado"} correctamente. Se notificó al exalumno.` });
      setRechazando(null);
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: d.message || "Error al actualizar. Intenta de nuevo." });
    }
    setWorking(null);
  }

  if (status === "loading") return (
    <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
    </ParallaxBackground>
  );

  return (
    <ParallaxBackground className="min-h-full p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] dark:hover:text-fu-blue-sky mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Administración</p>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Talleres</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Revisa y decide sobre los talleres propuestos por exalumnos.
            </p>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81]">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["PENDIENTE", "APROBADO", "RECHAZADO", ""] as const).map((e) => (
            <button
              key={e || "todos"}
              onClick={() => setFiltroEstado(e)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                filtroEstado === e
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0f4c81]"
              }`}
            >
              {e || "Todos"}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            msg.type === "ok"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {msg.text}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando talleres...
          </div>
        ) : talleres.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center text-slate-400">
            <GraduationCap className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">No hay talleres con este estado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-medium mb-2">
              {talleres.length} taller{talleres.length !== 1 ? "es" : ""} encontrado{talleres.length !== 1 ? "s" : ""}
            </p>
            {talleres.map((t, i) => {
              const cfg = ESTADO_CFG[t.estado];
              const { Icon } = cfg;
              const isWorking = working === t.id;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: [0.25, 1, 0.5, 1] }}
                >
                <Card className="p-5 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800 hover:shadow-fu-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-10 w-10 rounded-lg bg-[#005da4]/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-[#005da4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{t.titulo}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {t.modalidad}
                        </span>
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 flex items-center gap-1 ${cfg.cls}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>
                          <span className="font-semibold">Exalumno:</span> {t.exalumno_nombre ?? "—"}
                          {t.exalumno_email && ` (${t.exalumno_email})`}
                        </p>
                        <p><span className="font-semibold">Fecha:</span> {fdt(t.fecha_hora)}</p>
                        <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.cupos_ocupados} de {t.cupos_totales} cupos ocupados</p>
                        <p><span className="font-semibold">Enviado:</span> {fdt(t.created_at)}</p>
                        <p className="mt-1.5 text-slate-600 dark:text-slate-300">{t.descripcion}</p>
                        {t.estado === "RECHAZADO" && t.motivo_rechazo && (
                          <p className="text-red-600 mt-1"><span className="font-semibold">Motivo de rechazo:</span> {t.motivo_rechazo}</p>
                        )}
                      </div>
                    </div>
                    {t.estado === "PENDIENTE" && (
                      <div className="shrink-0 flex sm:flex-col gap-2 sm:items-end">
                        <Button
                          size="sm"
                          disabled={isWorking}
                          onClick={() => setRechazando(t)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs"
                        >
                          <XCircle className="w-3 h-3" />
                          &nbsp;Rechazar
                        </Button>
                        <Button
                          size="sm"
                          disabled={isWorking}
                          onClick={() => accion(t.id, "APROBADO")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs"
                        >
                          {isWorking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          &nbsp;Aprobar
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {rechazando && (
        <RechazoModal
          taller={rechazando}
          working={working === rechazando.id}
          onConfirm={(motivo) => accion(rechazando.id, "RECHAZADO", motivo)}
          onClose={() => setRechazando(null)}
        />
      )}
    </ParallaxBackground>
  );
}
