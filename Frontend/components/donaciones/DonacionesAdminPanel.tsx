"use client";

import { useEffect, useState } from "react";
import {
  DollarSign, FileText, ExternalLink, CheckCircle2,
  Clock, XCircle, ArrowUpRight, ArrowDownLeft, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

interface Props {
  userId: string;
  tipoUsuario: string; // "EXALUMNO" | "ESTUDIANTE"
}

export function DonacionesAdminPanel({ userId, tipoUsuario }: Props) {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalConfirmada, setTotalConfirmada] = useState(0);
  const [totalPendiente, setTotalPendiente] = useState(0);

  useEffect(() => {
    fetch(`/api/donaciones?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setDonaciones(d.data ?? []);
        setTotalConfirmada(d.totalConfirmada ?? 0);
        setTotalPendiente(d.totalPendiente ?? 0);
      })
      .catch(() => setError("No se pudieron cargar las donaciones."))
      .finally(() => setLoading(false));
  }, [userId]);

  const esExalumno = tipoUsuario === "EXALUMNO";

  return (
    <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-8">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-rose-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {esExalumno ? "Donaciones enviadas" : "Donaciones recibidas"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {esExalumno
              ? "Comprobantes de donaciones realizadas por este exalumno"
              : "Comprobantes de donaciones recibidas en proyectos de este estudiante"}
          </p>
        </div>
        <span className="ml-auto text-[10px] font-bold tracking-widest uppercase text-[#0f4c81] bg-[#0f4c81]/10 px-2 py-1 rounded-full">
          Solo admin
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-[#0f4c81] animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Resumen */}
      {!loading && !error && donaciones.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Confirmado
            </p>
            <p className="text-lg font-extrabold text-green-800 dark:text-green-200">{formatCRC(totalConfirmada)}</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-100 dark:border-yellow-800">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pendiente
            </p>
            <p className="text-lg font-extrabold text-yellow-800 dark:text-yellow-200">{formatCRC(totalPendiente)}</p>
          </div>
        </div>
      )}

      {/* Lista vacía */}
      {!loading && !error && donaciones.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center text-slate-400">
          <DollarSign className="w-8 h-8 mb-3 opacity-40" />
          <p className="text-sm">
            {esExalumno
              ? "Este exalumno no ha realizado donaciones."
              : "Este estudiante no ha recibido donaciones."}
          </p>
        </div>
      )}

      {/* Lista de donaciones */}
      {!loading && !error && donaciones.length > 0 && (
        <div className="space-y-3">
          {donaciones.map((d) => {
            const cfg = ESTADO_CONFIG[d.estado];
            const Icon = cfg.icon;
            return (
              <Card
                key={d.id}
                className="p-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Icono */}
                  <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                    <DollarSign className="h-4 w-4 text-rose-500" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {d.proyecto_titulo}
                      </span>
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs flex items-center gap-1 ${cfg.cls}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Participantes */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                      {d.exalumno_nombre && (
                        <span className="flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-blue-400" />
                          <span className="font-medium">Exalumno:</span> {d.exalumno_nombre}
                        </span>
                      )}
                      {d.estudiante_nombre && (
                        <span className="flex items-center gap-1">
                          <ArrowDownLeft className="w-3 h-3 text-green-400" />
                          <span className="font-medium">Estudiante:</span> {d.estudiante_nombre}
                        </span>
                      )}
                    </div>

                    {/* Fecha/hora y método */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 dark:text-slate-500">
                      <span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Enviado:</span>{" "}
                        {formatDateTime(d.created_at)}
                      </span>
                      {d.metodo_pago && (
                        <span>
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Método:</span>{" "}
                          {d.metodo_pago}
                        </span>
                      )}
                    </div>

                    {/* Comprobante */}
                    <div className="mt-2">
                      {d.comprobante_url ? (
                        <a
                          href={d.comprobante_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f4c81] hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Ver comprobante
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin comprobante adjunto</span>
                      )}
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {formatCRC(d.monto)}
                    </p>
                    <p className="text-xs text-slate-400">{d.moneda}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
