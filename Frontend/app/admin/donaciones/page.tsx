"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, DollarSign, CheckCircle2, XCircle, Clock,
  FileText, ExternalLink, Loader2, RefreshCw, Eye, AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface ValidacionCheck {
  campo: string;
  esperado: any;
  detectado: any;
  estado: "ok" | "fail" | "indeterminado" | "no_aplica";
}
interface Donacion {
  id: string;
  monto: number;
  destino: string | null;
  moneda: string;
  metodo_pago: string | null;
  estado: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";
  comprobante_url: string | null;
  motivo_rechazo: string | null;
  created_at: string;
  updated_at: string;
  fecha_transferencia: string | null;
  numero_referencia: string | null;
  validacion_estado: "pre_validada" | "discrepancia" | "revision_manual" | null;
  validacion_confianza: number | null;
  validacion_detalle: { checks?: ValidacionCheck[]; motivos?: string[] } | null;
  validacion_at: string | null;
  exalumno_nombre: string | null;
  exalumno_email: string | null;
  proyecto_titulo: string;
  estudiante_nombre: string | null;
}

// Semáforo de verificación OCR (n8n). El OCR pre-valida; el admin confirma.
const VALIDACION_CFG = {
  pre_validada:    { label: "Pre-validada por OCR", cls: "bg-green-100 text-green-700 border-green-200",  Icon: CheckCircle2 },
  discrepancia:    { label: "Discrepancia OCR",     cls: "bg-red-100 text-red-700 border-red-200",        Icon: AlertTriangle },
  revision_manual: { label: "Revisión manual",      cls: "bg-amber-100 text-amber-700 border-amber-200",  Icon: Eye },
};
const CAMPO_LABEL: Record<string, string> = { monto: "Monto", moneda: "Moneda", fecha: "Fecha", referencia: "Referencia" };
const CHECK_ICON: Record<string, string> = { ok: "✅", fail: "❌", indeterminado: "❔", no_aplica: "➖" };

const ESTADO_CFG = {
  PENDIENTE:  { label: "Pendiente",  cls: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: Clock },
  CONFIRMADA: { label: "Confirmada", cls: "bg-green-100 text-green-700 border-green-200",   Icon: CheckCircle2 },
  RECHAZADA:  { label: "Rechazada",  cls: "bg-red-100 text-red-700 border-red-200",         Icon: XCircle },
};

function fdt(iso: string) {
  return new Date(iso).toLocaleString("es-CR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// Horas transcurridas desde una fecha ISO
function horasDesde(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function RechazoModal({
  donacion, working, onConfirm, onClose,
}: {
  donacion: Donacion;
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
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Rechazar donación</h3>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vas a rechazar la donación de <span className="font-semibold">₡{donacion.monto.toLocaleString("es-CR")}</span> de{" "}
            {donacion.exalumno_nombre ?? "—"}. Indica el motivo (se enviará al donante).
          </p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Ej: El comprobante no es legible / el monto no coincide con la transferencia..."
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

function ComprobanteModal({ url, onClose }: { url: string; onClose: () => void }) {
  const isPdf = url.toLowerCase().includes(".pdf");
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Comprobante de Pago</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isPdf
            ? <iframe src={url} className="w-full h-[65vh]" title="Comprobante PDF" />
            : <img src={url} alt="Comprobante" className="max-w-full h-auto rounded-lg mx-auto" />
          }
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#0f4c81] text-sm font-medium hover:underline">
            <ExternalLink className="w-4 h-4" /> Abrir en nueva pestaña
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminDonacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("PENDIENTE");
  const [working, setWorking] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [visorUrl, setVisorUrl] = useState<string | null>(null);
  const [rechazando, setRechazando] = useState<Donacion | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((session?.user as any)?.tipo !== "ADMIN") { router.replace("/"); return; }
    load();
  }, [status, session, filtroEstado]);

  async function load() {
    setLoading(true);
    const qs = filtroEstado ? `?estado=${filtroEstado}` : "";
    const res = await fetch(`/api/admin/donaciones${qs}`);
    const d = await res.json();
    setDonaciones(d.data ?? []);
    setLoading(false);
  }

  async function accion(id: string, nuevoEstado: "CONFIRMADA" | "RECHAZADA", motivo?: string) {
    setWorking(id);
    setMsg(null);
    const res = await fetch(`/api/admin/donaciones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoEstado, motivo_rechazo: motivo }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: `Donación ${nuevoEstado === "CONFIRMADA" ? "confirmada" : "rechazada"} correctamente.` });
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
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Administración</p>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Gestión de Donaciones</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Revisa comprobantes y aprueba o rechaza donaciones pendientes.
            </p>
          </div>
          <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81]">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["PENDIENTE", "CONFIRMADA", "RECHAZADA", ""] as const).map((e) => (
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
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando donaciones...
          </div>
        ) : donaciones.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center text-slate-400">
            <DollarSign className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">No hay donaciones con este estado.</p>
            {filtroEstado === "PENDIENTE" && (
              <p className="text-sm mt-1">Todas las donaciones han sido procesadas.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-medium mb-2">
              {donaciones.length} donaci{donaciones.length !== 1 ? "ones" : "ón"} encontrada{donaciones.length !== 1 ? "s" : ""}
            </p>
            {donaciones.map((d) => {
              const cfg = ESTADO_CFG[d.estado];
              const { Icon } = cfg;
              const isWorking = working === d.id;
              const vencida = d.estado === "PENDIENTE" && horasDesde(d.created_at) > 24;
              return (
                <Card key={d.id} className={`p-5 bg-white dark:bg-slate-900 shadow-sm ${vencida ? "border-red-300 dark:border-red-800 ring-1 ring-red-200 dark:ring-red-900/40" : "border-slate-200 dark:border-slate-800"}`}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {d.proyecto_titulo}
                        </span>
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 flex items-center gap-1 ${cfg.cls}`}>
                          <Icon className="h-3 w-3" /> {cfg.label}
                        </Badge>
                        {vencida && (
                          <span title="Pendiente por más de 24 horas. Requiere atención (SLA)." className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> +24h pendiente
                          </span>
                        )}
                        {d.validacion_estado && (() => {
                          const v = VALIDACION_CFG[d.validacion_estado];
                          const VIcon = v.Icon;
                          return (
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 flex items-center gap-1 ${v.cls}`}>
                              <VIcon className="h-3 w-3" /> {v.label}
                              {typeof d.validacion_confianza === "number" && ` · ${d.validacion_confianza}%`}
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>
                          <span className="font-semibold">Exalumno:</span>{" "}
                          {d.exalumno_nombre ?? "—"}
                          {d.exalumno_email && ` (${d.exalumno_email})`}
                        </p>
                        {d.estudiante_nombre && (
                          <p><span className="font-semibold">Estudiante:</span> {d.estudiante_nombre}</p>
                        )}
                        {d.metodo_pago && (
                          <p><span className="font-semibold">Método:</span> {d.metodo_pago}</p>
                        )}
                        <p><span className="font-semibold">Enviado:</span> {fdt(d.created_at)}</p>
                        {d.estado !== "PENDIENTE" && (
                          <p><span className="font-semibold">Procesado:</span> {fdt(d.updated_at)}</p>
                        )}
                        {d.estado === "RECHAZADA" && d.motivo_rechazo && (
                          <p className="text-red-600"><span className="font-semibold">Motivo de rechazo:</span> {d.motivo_rechazo}</p>
                        )}
                      </div>
                      <div className="mt-2">
                        {d.comprobante_url ? (
                          <button
                            onClick={() => setVisorUrl(d.comprobante_url!)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f4c81] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <Eye className="w-3.5 h-3.5" /> Ver comprobante
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin comprobante adjunto</span>
                        )}
                      </div>

                      {/* Detalle de la verificación OCR (n8n) — el admin decide igual */}
                      {d.validacion_detalle?.checks && d.validacion_detalle.checks.length > 0 && (
                        <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Comprobante vs. formulario (OCR)</p>
                          <div className="space-y-1">
                            {d.validacion_detalle.checks.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span>{CHECK_ICON[c.estado] ?? "•"}</span>
                                <span className="font-semibold text-slate-600 dark:text-slate-300 w-20 shrink-0">{CAMPO_LABEL[c.campo] ?? c.campo}</span>
                                <span className="text-slate-500 dark:text-slate-400 truncate">
                                  form: <span className="font-mono">{String(c.esperado ?? "—")}</span>
                                  {" · "}OCR: <span className="font-mono">{String(c.detectado ?? "—")}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                          {d.validacion_detalle.motivos && d.validacion_detalle.motivos.length > 0 && (
                            <ul className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
                              {d.validacion_detalle.motivos.map((m, i) => (
                                <li key={i} className="text-[11px] text-amber-700 dark:text-amber-400">⚠ {m}</li>
                              ))}
                            </ul>
                          )}
                          <p className="text-[10px] text-slate-400 mt-2 italic">La verificación es automática y referencial. La confirmación final es tuya.</p>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right flex flex-col items-end gap-3">
                      <div>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                          ₡{d.monto.toLocaleString("es-CR")}
                        </p>
                        <p className="text-xs text-slate-400">{d.moneda}</p>
                      </div>
                      {d.estado === "PENDIENTE" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={isWorking}
                            onClick={() => setRechazando(d)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs"
                          >
                            <XCircle className="w-3 h-3" />
                            &nbsp;Rechazar
                          </Button>
                          <Button
                            size="sm"
                            disabled={isWorking}
                            onClick={() => accion(d.id, "CONFIRMADA")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs"
                          >
                            {isWorking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            &nbsp;Confirmar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {visorUrl && <ComprobanteModal url={visorUrl} onClose={() => setVisorUrl(null)} />}
      {rechazando && (
        <RechazoModal
          donacion={rechazando}
          working={working === rechazando.id}
          onConfirm={(motivo) => accion(rechazando.id, "RECHAZADA", motivo)}
          onClose={() => setRechazando(null)}
        />
      )}
    </ParallaxBackground>
  );
}
