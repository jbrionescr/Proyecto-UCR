"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Briefcase, Building2, MapPin, Clock, Calendar,
  Users, CheckCircle2, Loader2, AlertCircle, Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useDialog } from "@/hooks/useDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface Posicion {
  id: string;
  titulo: string;
  tipo: string | null;
  modalidad: string | null;
  jornada: string | null;
  empresa: string | null;
  estado: string;
  fecha_limite: string | null;
  created_at: string;
  aplicantes: number;
  exalumno: {
    id: string | null;
    nombre: string | null;
    foto_url: string | null;
    cargo_actual: string | null;
    empresa_actual: string | null;
    pais_ciudad: string | null;
  };
  mi_aplicacion: { id: string; estado: string } | null;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" });
}

const ESTADO_CFG: Record<string, string> = {
  activa: "bg-green-100 text-green-700 border-green-200",
  cubierta: "bg-slate-100 text-slate-600",
  cancelada: "bg-red-100 text-red-600",
};

const APLICACION_ESTADO_CFG: Record<string, { label: string; cls: string }> = {
  ENVIADA: { label: "Aplicación enviada", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_REVISION: { label: "El exalumno está revisando tu perfil", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  SELECCIONADO: { label: "¡Fuiste seleccionado! Revisa tu correo", cls: "bg-green-50 text-green-700 border-green-200" },
  DESCARTADO: { label: "La posición fue cubierta por otro candidato", cls: "bg-red-50 text-red-600 border-red-200" },
};

export default function PosicionDetallePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const role   = (session?.user as any)?.tipo;
  const userId = (session?.user as any)?.id as string | undefined;
  const { showConfirm } = useDialog();

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated" || !id) return;
    fetch(`/api/posiciones/${id}`)
      .then((r) => r.json())
      .then((d) => setPosicion(d))
      .catch(() => setMsg({ type: "err", text: "No se pudo cargar la posición." }))
      .finally(() => setLoading(false));
  }, [status, id]);

  async function retirarAplicacion() {
    if (!posicion?.mi_aplicacion) return;
    const ok = await showConfirm("¿Retirar tu aplicación a esta posición? Esta acción no se puede deshacer.", {
      title: "Retirar aplicación",
      confirmLabel: "Retirar",
      variant: "warning",
    });
    if (!ok) return;
    setWithdrawing(true);
    const res = await fetch(`/api/aplicaciones/${posicion.mi_aplicacion.id}`, { method: "DELETE" });
    const d = await res.json();
    if (res.ok) {
      setPosicion((prev) => prev ? { ...prev, mi_aplicacion: null, aplicantes: Math.max(0, prev.aplicantes - 1) } : prev);
      setMsg({ type: "ok", text: "Aplicación retirada correctamente." });
    } else {
      setMsg({ type: "err", text: d.message || "Error al retirar la aplicación." });
    }
    setWithdrawing(false);
  }

  async function aplicar() {
    setApplying(true);
    setMsg(null);
    const res = await fetch("/api/aplicaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posicion_id: id }),
    });
    const d = await res.json();
    if (res.ok) {
      setMsg({ type: "ok", text: "Aplicación enviada correctamente." });
      setPosicion((prev) => prev ? { ...prev, mi_aplicacion: { id: d.id, estado: "ENVIADA" }, aplicantes: prev.aplicantes + 1 } : prev);
    } else {
      setMsg({ type: "err", text: d.message || "Error al aplicar." });
    }
    setApplying(false);
  }

  if (status === "loading" || loading) return (
    <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
    </ParallaxBackground>
  );

  if (!posicion) return (
    <ParallaxBackground className="min-h-full p-8">
      <div className="max-w-3xl mx-auto text-center py-24 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-3 mx-auto opacity-40" />
        <p>Posición no encontrada.</p>
        <Link href="/posiciones" className="text-[#0f4c81] text-sm mt-2 inline-block hover:underline">
          Volver al listado
        </Link>
      </div>
    </ParallaxBackground>
  );

  const estadoCls = ESTADO_CFG[posicion.estado?.toLowerCase()] ?? ESTADO_CFG.activa;
  const aplicCfg = posicion.mi_aplicacion ? APLICACION_ESTADO_CFG[posicion.mi_aplicacion.estado] : null;
  const puedeAplicar = role === "ESTUDIANTE" && posicion.estado === "activa" && !posicion.mi_aplicacion;
  const isOwner = role === "EXALUMNO" && posicion.exalumno.id === userId;

  return (
    <ParallaxBackground className="min-h-full">
      <div className="fu-hero-gradient animate-fu-gradient border-b border-white/10 text-white py-4 px-6 md:px-12 flex items-center shadow-md">
        <Link href="/posiciones" className="inline-flex items-center gap-2 text-sm text-slate-200 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a posiciones
        </Link>
      </div>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        {/* Encabezado */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm mb-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-14 w-14 rounded-xl bg-[#0f4c81]/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-7 w-7 text-[#0f4c81]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-2">
                <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl leading-tight">
                  {posicion.titulo}
                </AnimatedHeading>
                <Badge variant="outline" className={`text-xs shrink-0 ${estadoCls}`}>
                  {posicion.estado}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                {posicion.empresa && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> {posicion.empresa}
                  </span>
                )}
                {posicion.modalidad && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {posicion.modalidad}
                  </span>
                )}
                {posicion.jornada && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {posicion.jornada}
                  </span>
                )}
                {posicion.tipo && (
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" /> {posicion.tipo}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {posicion.aplicantes} aplicante{posicion.aplicantes !== 1 ? "s" : ""}
                </span>
                {posicion.fecha_limite && (
                  <span className="flex items-center gap-1 text-orange-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> Cierra: {formatDate(posicion.fecha_limite)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Publicado: {formatDate(posicion.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          {msg && (
            <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
              msg.type === "ok"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {msg.text}
            </div>
          )}

          {/* Estado de aplicación ya enviada */}
          {aplicCfg && (
            <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-semibold border flex items-center justify-between gap-2 ${aplicCfg.cls}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {aplicCfg.label}
              </div>
              {posicion.mi_aplicacion?.estado === "ENVIADA" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-current hover:bg-black/5 shrink-0"
                  disabled={withdrawing}
                  onClick={retirarAplicacion}
                >
                  {withdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Retirar"}
                </Button>
              )}
            </div>
          )}

          {/* Owner: gestionar aplicantes */}
          {isOwner && (
            <div className="mt-4 flex gap-3">
              <Link href={`/mis-posiciones/${posicion.id}/aplicantes`} className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar aplicantes ({posicion.aplicantes})
                </Button>
              </Link>
            </div>
          )}

          {/* Botón aplicar */}
          {puedeAplicar && (
            <div className="mt-5">
              <Button
                disabled={applying}
                onClick={aplicar}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base"
              >
                {applying ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando aplicación...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Aplicar a esta posición</>
                )}
              </Button>
              <p className="text-xs text-slate-400 text-center mt-2">
                Tu perfil y CV digital serán compartidos con el exalumno.
              </p>
            </div>
          )}

          {/* Adaptar CV con IA — disponible para estudiantes */}
          {role === "ESTUDIANTE" && (
            <div className="mt-3">
              <Link href={`/mi-curriculum/adaptar/${posicion.id}`} className="block">
                <Button
                  variant="outline"
                  className="w-full border-[#0f4c81]/30 text-[#0f4c81] hover:bg-[#0f4c81]/5 dark:text-sky-400 dark:border-sky-800"
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Adaptar mi CV a esta posición
                </Button>
              </Link>
            </div>
          )}

          {role === "EXALUMNO" && !isOwner && (
            <div className="mt-4 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 text-sm border border-blue-200">
              Solo los estudiantes pueden aplicar a posiciones.
            </div>
          )}
        </Card>

        {/* Publicado por */}
        {posicion.exalumno.nombre && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Publicado por</p>
            <div className="flex items-center gap-3 sm:gap-4">
              {posicion.exalumno.foto_url ? (
                <Image
                  src={posicion.exalumno.foto_url}
                  alt={posicion.exalumno.nombre}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0f4c81]/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#0f4c81]">
                    {posicion.exalumno.nombre.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                {posicion.exalumno.id ? (
                  <Link href={`/perfil/${posicion.exalumno.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-[#0f4c81] break-words">
                    {posicion.exalumno.nombre}
                  </Link>
                ) : (
                  <p className="font-semibold text-slate-800 dark:text-slate-100 break-words">{posicion.exalumno.nombre}</p>
                )}
                {posicion.exalumno.cargo_actual && (
                  <p className="text-sm text-slate-500">{posicion.exalumno.cargo_actual}</p>
                )}
                {posicion.exalumno.empresa_actual && (
                  <p className="text-sm text-slate-400">{posicion.exalumno.empresa_actual}</p>
                )}
                {posicion.exalumno.pais_ciudad && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {posicion.exalumno.pais_ciudad}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </ParallaxBackground>
  );
}
