"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Heart, Loader2, CheckCircle2, Clock, XCircle,
  DollarSign, FileText, ExternalLink, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";

interface Donacion {
  id: string;
  monto: number;
  destino: string | null;
  moneda: string;
  metodo_pago: string | null;
  estado: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA";
  comprobante_url: string | null;
  created_at: string;
  updated_at: string;
  proyecto_titulo: string;
  estudiante_nombre: string | null;
  exalumno_nombre: string | null;
  exalumno_foto: string | null;
}

const ESTADO_CONFIG = {
  CONFIRMADA: { label: "Confirmada", icon: CheckCircle2, cls: "bg-green-100 text-green-700 border-green-200" },
  PENDIENTE:  { label: "Pendiente",  icon: Clock,         cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  RECHAZADA:  { label: "Rechazada",  icon: XCircle,       cls: "bg-red-100 text-red-700 border-red-200" },
};

function formatCRC(amount: number) {
  return `₡${amount.toLocaleString("es-CR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-CR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function ComprobanteLink({ url }: { url: string | null }) {
  if (!url) {
    return <span className="text-xs text-slate-400 italic">Sin comprobante</span>;
  }
  const isPDF = url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f4c81] hover:text-[#0b3a63] hover:underline transition-colors"
    >
      <FileText className="w-3.5 h-3.5" />
      {isPDF ? "Ver PDF" : "Ver comprobante"}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// ─── Vista: EXALUMNO — donaciones enviadas ────────────────────────────────────

function VistaExalumno({
  donaciones, totalConfirmada, totalPendiente,
}: {
  donaciones: Donacion[]; totalConfirmada: number; totalPendiente: number;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">Exalumno</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mis Donaciones</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Historial y comprobantes de las donaciones que has realizado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Confirmado</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCRC(totalConfirmada)}</p>
        </Card>
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pendiente</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCRC(totalPendiente)}</p>
        </Card>
      </div>

      {donaciones.length === 0 ? (
        <EmptyState tipo="exalumno" />
      ) : (
        <ListaDonaciones donaciones={donaciones} mostrarExalumno={false} mostrarEstudiante={true} />
      )}
    </div>
  );
}

// ─── Vista: ESTUDIANTE — donaciones recibidas ─────────────────────────────────

function VistaEstudiante({
  donaciones, totalConfirmada,
}: {
  donaciones: Donacion[]; totalConfirmada: number;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">Estudiante</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Donaciones Recibidas</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Comprobantes de donaciones recibidas de exalumnos para tu proyecto.
        </p>
      </div>

      <div className="mb-8">
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Recibido (Confirmado)</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCRC(totalConfirmada)}</p>
        </Card>
      </div>

      {donaciones.length === 0 ? (
        <EmptyState tipo="estudiante" />
      ) : (
        <ListaDonaciones donaciones={donaciones} mostrarExalumno={true} mostrarEstudiante={false} />
      )}
    </div>
  );
}

// ─── Vista: ADMIN — todas las donaciones ──────────────────────────────────────

function VistaAdmin({
  donaciones, totalConfirmada, totalPendiente,
}: {
  donaciones: Donacion[]; totalConfirmada: number; totalPendiente: number;
}) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">Administrador</p>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Todas las Donaciones</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Vista global de todos los comprobantes registrados en la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Confirmado</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCRC(totalConfirmada)}</p>
        </Card>
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Total Pendiente</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatCRC(totalPendiente)}</p>
        </Card>
      </div>

      {donaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="w-10 h-10 text-rose-300 mb-4" />
          <p className="text-slate-500">No hay donaciones registradas aún.</p>
        </div>
      ) : (
        <ListaDonaciones donaciones={donaciones} mostrarExalumno={true} mostrarEstudiante={true} />
      )}
    </div>
  );
}

// ─── Componente compartido: lista de donaciones ───────────────────────────────

function ListaDonaciones({
  donaciones, mostrarExalumno, mostrarEstudiante,
}: {
  donaciones: Donacion[];
  mostrarExalumno: boolean;
  mostrarEstudiante: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
        <span className="font-bold text-slate-700 dark:text-slate-300">{donaciones.length}</span>{" "}
        donaci{donaciones.length !== 1 ? "ones" : "ón"} registrada{donaciones.length !== 1 ? "s" : ""}
      </p>
      {donaciones.map((d) => {
        const cfg = ESTADO_CONFIG[d.estado];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -3 }}
          >
          <Card
            className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-fu-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Icono */}
              <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-rose-500" />
              </div>

              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {d.proyecto_titulo}
                  </h3>
                  <Badge variant="outline" className={`px-2 py-0.5 text-xs font-semibold flex items-center gap-1 ${cfg.cls}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>

                {/* Quién donó / quién recibió */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {mostrarExalumno && d.exalumno_nombre && (
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-blue-400" />
                      <span className="font-medium text-slate-600 dark:text-slate-300">Donante:</span>{" "}
                      {d.exalumno_nombre}
                    </span>
                  )}
                  {mostrarEstudiante && d.estudiante_nombre && (
                    <span className="flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3 text-green-400" />
                      <span className="font-medium text-slate-600 dark:text-slate-300">Receptor:</span>{" "}
                      {d.estudiante_nombre}
                    </span>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  {d.metodo_pago && <span>Método: {d.metodo_pago}</span>}
                  <span>Enviado: {formatDateTime(d.created_at)}</span>
                  {d.updated_at !== d.created_at && (
                    <span>Actualizado: {formatDateTime(d.updated_at)}</span>
                  )}
                </div>

                {/* Comprobante */}
                <div className="mt-2">
                  <ComprobanteLink url={d.comprobante_url} />
                </div>
              </div>

              {/* Monto */}
              <div className="shrink-0 text-right">
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCRC(d.monto)}
                </p>
                <p className="text-xs text-slate-400">{d.moneda}</p>
              </div>
            </div>
          </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState({ tipo }: { tipo: "exalumno" | "estudiante" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-10 h-10 text-rose-400" />
      </div>
      {tipo === "exalumno" ? (
        <>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Sin donaciones aún</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
            Cuando realices donaciones a proyectos estudiantiles o fondos, aparecerán aquí con su comprobante.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Sin donaciones recibidas</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
            Cuando un exalumno done a tu proyecto, verás los comprobantes aquí.
          </p>
        </>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function DonacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalConfirmada, setTotalConfirmada] = useState(0);
  const [totalPendiente, setTotalPendiente] = useState(0);

  const tipo = (session?.user as any)?.tipo as string | undefined;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status !== "authenticated") return;

    if (!tipo || (tipo !== "EXALUMNO" && tipo !== "ADMIN" && tipo !== "ESTUDIANTE")) {
      router.replace("/");
      return;
    }

    fetch("/api/donaciones")
      .then((r) => r.json())
      .then((d) => {
        setDonaciones(d.data ?? []);
        setTotalConfirmada(d.totalConfirmada ?? 0);
        setTotalPendiente(d.totalPendiente ?? 0);
      })
      .catch(() => setError("No se pudieron cargar las donaciones."))
      .finally(() => setLoading(false));
  }, [status, tipo, router]);

  if (status === "loading" || loading) {
    return (
      <ParallaxBackground className="min-h-screen flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {tipo === "EXALUMNO" && (
          <VistaExalumno
            donaciones={donaciones}
            totalConfirmada={totalConfirmada}
            totalPendiente={totalPendiente}
          />
        )}

        {tipo === "ESTUDIANTE" && (
          <VistaEstudiante
            donaciones={donaciones}
            totalConfirmada={totalConfirmada}
          />
        )}

        {tipo === "ADMIN" && (
          <VistaAdmin
            donaciones={donaciones}
            totalConfirmada={totalConfirmada}
            totalPendiente={totalPendiente}
          />
        )}
      </div>
    </ParallaxBackground>
  );
}
