"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, RefreshCw, AlertTriangle, CheckCircle, Clock, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface MatchData {
  id: string;
  score_match: number;
  estado: string;
  created_at: string;
  accepted_at: string | null;
  mesesActivo: number | null;
  requiereSeguimiento: boolean;
  tipo_apoyo: string;
  estudiante: {
    user: { name: string; email: string };
    carrera: string;
  } | null;
  exalumno: {
    user: { name: string; email: string };
    carrera: string;
  } | null;
}

const ESTADO_BADGE: Record<string, { cls: string; icon: any }> = {
  SUGERIDO: { cls: "bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400", icon: Clock },
  CONTACTADO: { cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: Clock },
  ACTIVO: { cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle },
  CERRADO: { cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: CheckCircle },
  RECHAZADO: { cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: XCircle }
};

export default function AdminMatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("");
  const [search, setSearch] = useState("");
  const [filterCarrera, setFilterCarrera] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      if ((session?.user as any)?.tipo !== "ADMIN") router.replace("/");
      else loadMatches();
    }
  }, [status, session]);

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/matches");
      const data = await res.json();
      if (Array.isArray(data)) setMatches(data);
    } catch (error) {
      console.error("Error loading matches:", error);
    }
    setLoading(false);
  }

  // T-20: el admin puede cerrar un match activo con seguimiento y marcarlo como completado.
  async function marcarCompletado(id: string) {
    setClosingId(id);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CERRAR" }),
      });
      if (res.ok) {
        setActionMsg("Match marcado como completado.");
        await loadMatches();
      } else {
        const d = await res.json().catch(() => ({}));
        setActionMsg(d.message || "Error al cerrar el match.");
      }
    } catch {
      setActionMsg("Error al cerrar el match.");
    }
    setClosingId(null);
  }

  // Escapa un valor según RFC 4180: entrecomilla si contiene coma, comilla o salto de línea.
  const csvCell = (val: unknown) => {
    const s = String(val ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const exportCSV = () => {
    const headers = ["ID", "Exalumno", "Estudiante", "Tipo de Apoyo", "Afinidad (%)", "Estado", "Fecha Creación", "Meses Activo", "Requiere Seguimiento"];
    const rows = filteredMatches.map(m => {
      return [
        m.id,
        m.exalumno?.user?.name || "N/A",
        m.estudiante?.user?.name || "N/A",
        m.tipo_apoyo || "General",
        m.score_match || 0,
        m.estado,
        new Date(m.created_at).toLocaleDateString("es-CR"),
        m.mesesActivo ?? "",
        m.requiereSeguimiento ? "SI" : "NO"
      ];
    });

    // CSV con celdas escapadas; BOM (﻿) para que Excel interprete UTF-8 correctamente.
    const csv = "﻿" + [headers, ...rows]
      .map(fila => fila.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `matches_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lista única de carreras presentes en los matches (para el selector)
  const carreras = Array.from(
    new Set(
      matches.flatMap(m => [m.estudiante?.carrera, m.exalumno?.carrera].filter(Boolean) as string[])
    )
  ).sort();

  const filteredMatches = matches.filter(m => {
    if (filterEstado && m.estado !== filterEstado) return false;
    if (search) {
      const query = search.toLowerCase();
      const stName = m.estudiante?.user?.name?.toLowerCase() || "";
      const exName = m.exalumno?.user?.name?.toLowerCase() || "";
      if (!stName.includes(query) && !exName.includes(query)) return false;
    }
    if (filterCarrera) {
      const stCarrera = m.estudiante?.carrera || "";
      const exCarrera = m.exalumno?.carrera || "";
      if (stCarrera !== filterCarrera && exCarrera !== filterCarrera) return false;
    }
    if (fechaDesde || fechaHasta) {
      const created = new Date(m.created_at);
      if (fechaDesde && created < new Date(fechaDesde + "T00:00:00")) return false;
      if (fechaHasta && created > new Date(fechaHasta + "T23:59:59")) return false;
    }
    return true;
  });

  const hayFiltros = !!(filterEstado || search || filterCarrera || fechaDesde || fechaHasta);
  function limpiarFiltros() {
    setFilterEstado(""); setSearch(""); setFilterCarrera(""); setFechaDesde(""); setFechaHasta("");
  }

  if (status === "loading" || loading) {
    return <div className="flex h-screen items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-[#0f4c81]" /></div>;
  }

  return (
    <ParallaxBackground className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#0f4c81]">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Gestión de Matches</AnimatedHeading>
            <p className="fu-text-2">Administra y da seguimiento a las conexiones activas.</p>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors font-medium text-sm">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <select
              value={filterCarrera}
              onChange={e => setFilterCarrera(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 max-w-[220px]"
            >
              <option value="">Todas las Carreras</option>
              {carreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">Todos los Estados</option>
              <option value="SUGERIDO">Sugerido</option>
              <option value="CONTACTADO">Contactado</option>
              <option value="ACTIVO">Activo</option>
              <option value="CERRADO">Cerrado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
              />
            </div>
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="ml-auto text-sm text-slate-500 dark:text-slate-400 hover:text-[#0f4c81] font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {actionMsg && (
          <div className="px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {actionMsg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Exalumno</th>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Tipo Apoyo</th>
                  <th className="px-6 py-4">Afinidad</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMatches.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No se encontraron matches.</td></tr>
                ) : (
                  filteredMatches.map(m => {
                    const cfg = ESTADO_BADGE[m.estado] || { cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: Clock };
                    const Icon = cfg.icon;
                    const alert = m.requiereSeguimiento;

                    return (
                      <tr key={m.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 ${alert ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{m.exalumno?.user?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{m.exalumno?.carrera}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{m.estudiante?.user?.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{m.estudiante?.carrera}</p>
                        </td>
                        <td className="px-6 py-4 font-medium">{m.tipo_apoyo || "General"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${m.score_match || 0}%` }} />
                            </div>
                            <span className="font-medium">{m.score_match || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={`${cfg.cls} border-0 flex items-center gap-1.5 w-fit`}>
                              <Icon className="w-3 h-3" />
                              {m.estado}
                            </Badge>
                            {alert && (
                              <Badge variant="destructive" className="flex items-center gap-1 text-xs font-bold w-fit">
                                <AlertTriangle className="w-3.5 h-3.5" /> Activo hace {m.mesesActivo} meses
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(m.created_at).toLocaleDateString("es-CR")}
                        </td>
                        <td className="px-6 py-4">
                          {m.estado === "ACTIVO" && (
                            <button
                              onClick={() => marcarCompletado(m.id)}
                              disabled={closingId === m.id}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 whitespace-nowrap"
                            >
                              {closingId === m.id ? "Guardando..." : "Marcado como completado"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ParallaxBackground>
  );
}
