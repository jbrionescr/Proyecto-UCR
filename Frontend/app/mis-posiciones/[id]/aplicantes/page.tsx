"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Loader2, CheckCircle2,
  XCircle, Clock, GraduationCap, MessageCircle, FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useDialog } from "@/hooks/useDialog";
import { CVDrawer } from "@/components/cv/CVDrawer";

interface Aplicante {
  id: string;
  estado: "ENVIADA" | "EN_REVISION" | "SELECCIONADO" | "DESCARTADO";
  created_at: string;
  estudiante_id: string | null;
  posicion: { id: string; titulo: string; empresa: string | null } | null;
  estudiante: {
    nombre: string | null;
    foto_url: string | null;
    email: string | null;
    carrera: string | null;
    nivel_academico: string | null;
  } | null;
}

const ESTADO_CFG = {
  ENVIADA:      { label: "Nueva",           cls: "bg-blue-50 text-blue-700 border-blue-200",       Icon: Clock },
  EN_REVISION:  { label: "En revisión",     cls: "bg-yellow-50 text-yellow-700 border-yellow-200", Icon: Clock },
  SELECCIONADO: { label: "Seleccionado",    cls: "bg-green-50 text-green-700 border-green-200",   Icon: CheckCircle2 },
  DESCARTADO:   { label: "No seleccionado", cls: "bg-slate-100 text-slate-500 border-slate-200",   Icon: XCircle },
};

const ESTADOS_SIN_DECIDIR = ["ENVIADA", "EN_REVISION"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AplicantesPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const posicionId = params?.id as string;

  const [aplicantes, setAplicantes] = useState<Aplicante[]>([]);
  const [posicionTitulo, setPosicionTitulo] = useState<string>("");
  const [loading, setLoading]              = useState(true);
  const [error, setError]                  = useState<string | null>(null);
  const [actionLoading, setActionLoading]  = useState<string | null>(null);
  const [cvUserId, setCvUserId]            = useState<string | null>(null);
  const [cvStudentName, setCvStudentName]  = useState<string | undefined>();
  const { showAlert, showConfirm, showDialog } = useDialog();

  const role = (session?.user as any)?.tipo as string | undefined;

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if (role && role !== "EXALUMNO" && role !== "ADMIN") { router.replace("/"); return; }

    fetch(`/api/aplicaciones?posicion_id=${posicionId}`)
      .then((r) => r.json())
      .then((d) => {
        const data: Aplicante[] = d.data ?? [];
        setAplicantes(data);
        if (data[0]?.posicion?.titulo) setPosicionTitulo(data[0].posicion.titulo);
      })
      .catch(() => setError("No se pudieron cargar los aplicantes."))
      .finally(() => setLoading(false));
  }, [status, role, posicionId]);

  async function handleAction(
    aplicanteId: string,
    action: "seleccionar" | "descartar",
    cerrarPosicion = false
  ) {
    setActionLoading(aplicanteId + action);
    try {
      const res = await fetch(`/api/aplicaciones/${aplicanteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cerrarPosicion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al actualizar");

      if (action === "seleccionar") {
        setAplicantes((prev) =>
          prev.map((a) => {
            if (a.id === aplicanteId) return { ...a, estado: "SELECCIONADO" };
            if (cerrarPosicion && (ESTADOS_SIN_DECIDIR as readonly string[]).includes(a.estado)) return { ...a, estado: "DESCARTADO" };
            return a;
          })
        );
      } else {
        setAplicantes((prev) =>
          prev.map((a) => (a.id === aplicanteId ? { ...a, estado: "DESCARTADO" } : a))
        );
      }
    } catch (err: any) {
      await showAlert(err.message || "Error al procesar la acción.", { title: "Error", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  // T-14: al abrir el CV desde ENVIADA, pasa automáticamente a EN_REVISION.
  function handleVerCV(a: Aplicante) {
    setCvUserId(a.estudiante_id);
    setCvStudentName(a.estudiante?.nombre ?? undefined);
    if (a.estado === "ENVIADA") {
      fetch(`/api/aplicaciones/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "marcar_revision" }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.estado) {
            setAplicantes((prev) => prev.map((x) => (x.id === a.id ? { ...x, estado: data.estado } : x)));
          }
        })
        .catch(() => {});
    }
  }

  async function handleContactar(aplicanteId: string) {
    setActionLoading(aplicanteId + "contactar");
    try {
      const res = await fetch(`/api/aplicaciones/${aplicanteId}/contactar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear contacto");
      router.push(`/mensajes?matchId=${data.matchId}`);
    } catch (err: any) {
      await showAlert(err.message || "Error al iniciar conversación.", { title: "Error", variant: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function seleccionarConConfirmacion(aplicanteId: string, nombre: string) {
    const result = await showDialog({
      title: `Seleccionar a ${nombre}`,
      message: "¿Cómo deseas procesar esta selección?",
      variant: "info",
      actions: [
        { label: "Seleccionar y cerrar posición", value: "cerrar", variant: "danger" },
        { label: "Solo seleccionar", value: "solo", variant: "primary" },
      ],
      cancelLabel: "Cancelar",
    });
    if (!result) return;
    await handleAction(aplicanteId, "seleccionar", result === "cerrar");
  }

  async function handleDescartarConConfirmacion(aplicanteId: string) {
    const ok = await showConfirm("¿Descartar esta aplicación? Se notificará al estudiante.", {
      title: "Descartar aplicación",
      confirmLabel: "Descartar",
      variant: "error",
    });
    if (ok) handleAction(aplicanteId, "descartar");
  }

  const pendientes = aplicantes.filter((a) => (ESTADOS_SIN_DECIDIR as readonly string[]).includes(a.estado));
  const procesados = aplicantes.filter((a) => !(ESTADOS_SIN_DECIDIR as readonly string[]).includes(a.estado));

  if (status === "loading" || loading) {
    return (
      <div className="min-h-full bg-[#f8fafc] flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#005da4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-8">
      <CVDrawer
        userId={cvUserId}
        studentName={cvStudentName}
        onClose={() => { setCvUserId(null); setCvStudentName(undefined); }}
      />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href="/mis-posiciones"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#005da4] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Mis posiciones
        </Link>

        <div className="mb-8">
          <p className="text-xs font-bold text-[#005da4] tracking-wider uppercase mb-1">Gestión de aplicantes</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white break-words">
            {posicionTitulo || "Aplicantes"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {aplicantes.length} aplicante{aplicantes.length !== 1 ? "s" : ""} en total
            {pendientes.length > 0
              ? ` · ${pendientes.length} pendiente${pendientes.length !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {aplicantes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">📋</div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Sin aplicantes aún</h3>
            <p className="text-slate-500 text-sm max-w-xs">
              Cuando los estudiantes apliquen a esta posición, aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            {/* PENDIENTES */}
            {pendientes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  Pendientes de revisión ({pendientes.length})
                </h2>
                <div className="space-y-3">
                  {pendientes.map((a) => (
                    <AplicanteCard
                      key={a.id}
                      a={a}
                      actionLoading={actionLoading}
                      onSeleccionar={(nombre) => seleccionarConConfirmacion(a.id, nombre)}
                      onDescartar={() => handleDescartarConConfirmacion(a.id)}
                      onContactar={() => handleContactar(a.id)}
                      onVerCV={a.estudiante_id ? () => handleVerCV(a) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* PROCESADOS */}
            {procesados.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-3">
                  <span className="flex-1 h-px bg-slate-200" />
                  Procesados ({procesados.length})
                  <span className="flex-1 h-px bg-slate-200" />
                </h2>
                <div className="space-y-3 opacity-70">
                  {procesados.map((a) => (
                    <AplicanteCard
                      key={a.id}
                      a={a}
                      actionLoading={actionLoading}
                      onContactar={() => handleContactar(a.id)}
                      onVerCV={a.estudiante_id ? () => handleVerCV(a) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AplicanteCard({
  a,
  actionLoading,
  onSeleccionar,
  onDescartar,
  onContactar,
  onVerCV,
}: {
  a: Aplicante;
  actionLoading: string | null;
  onSeleccionar?: (nombre: string) => void;
  onDescartar?: () => void;
  onContactar?: () => void;
  onVerCV?: () => void;
}) {
  const cfg    = ESTADO_CFG[a.estado];
  const { Icon } = cfg;
  const nombre    = a.estudiante?.nombre ?? "Estudiante";
  const isPending = (ESTADOS_SIN_DECIDIR as readonly string[]).includes(a.estado);
  const anyLoading = !!actionLoading?.startsWith(a.id);

  return (
    <Card className="p-4 border-slate-200 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-start gap-4 flex-wrap">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-[#005da4]/10 flex items-center justify-center shrink-0 overflow-hidden">
          {a.estudiante?.foto_url ? (
            <img src={a.estudiante.foto_url} alt={nombre} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-[#005da4]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm break-words">{nombre}</p>
            <Badge variant="outline" className={`text-xs px-2 py-0.5 flex items-center gap-1 ${cfg.cls}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {a.estudiante?.carrera && (
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> {a.estudiante.carrera}
              </span>
            )}
            {a.estudiante?.nivel_academico && (
              <span className="capitalize">{a.estudiante.nivel_academico}</span>
            )}
            <span>Aplicó el {formatDate(a.created_at)}</span>
          </div>

          {/* Email only visible for SELECCIONADO */}
          {a.estado === "SELECCIONADO" && a.estudiante?.email && (
            <div className="mt-2 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2.5 py-1.5 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <a
                href={`mailto:${a.estudiante.email}`}
                className="text-green-700 font-medium hover:underline truncate"
              >
                {a.estudiante.email}
              </a>
            </div>
          )}

          {/* Ver CV + Enviar mensaje */}
          {a.estudiante_id && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {onVerCV && (
                <button
                  onClick={onVerCV}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#005da4] hover:text-[#003d6e] border border-[#005da4]/30 hover:border-[#005da4] bg-white rounded-md px-2.5 py-1 transition-colors"
                >
                  <FileText className="w-3 h-3" /> Ver CV
                </button>
              )}

              {/* Enviar mensaje — solo si fue SELECCIONADO */}
              {a.estado === "SELECCIONADO" && onContactar && (
                <button
                  onClick={onContactar}
                  disabled={anyLoading}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-2.5 py-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {actionLoading === a.id + "contactar" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <MessageCircle className="w-3 h-3" />
                  )}
                  Enviar mensaje
                </button>
              )}
            </div>
          )}
        </div>

        {/* Actions (solo para ENVIADA/EN_REVISION) */}
        {isPending && onSeleccionar && onDescartar && (
          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
              disabled={anyLoading}
              onClick={() => onSeleccionar(nombre)}
            >
              {actionLoading === a.id + "seleccionar" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <><CheckCircle2 className="w-3 h-3 mr-1" />Seleccionar</>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs"
              disabled={anyLoading}
              onClick={onDescartar}
            >
              {actionLoading === a.id + "descartar" ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <><XCircle className="w-3 h-3 mr-1" />Descartar</>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
