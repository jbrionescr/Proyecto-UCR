"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useDialog } from "@/hooks/useDialog";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Users,
  HeartHandshake,
  DollarSign,
  Link2,
  Search,
  Download,
  FileCheck,
  XCircle,
  ChevronDown,
  Loader2,
  TrendingUp,
  RefreshCw,
  Eye,
  UserX,
  UserCheck,
  Filter,
  Printer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardImpact } from "@/components/admin/DashboardImpact";
import { motion } from "framer-motion";

// ============================================================
// Tipos
// ============================================================
interface Stats {
  kpis: {
    totalDonado: number;
    donacionesAprobadas: number;
    matchesActivos: number;
    estudiantesActivos: number;
    exalumnosActivos: number;
  };
  graficoDonaciones: { mes: string; total: number }[];
  donacionesPendientes: DonacionAdmin[];
}

interface DonacionAdmin {
  id: string;
  monto: number;
  destino: string;
  status: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  comprobanteUrl: string;
  createdAt: string;
  exalumno: {
    user: { id: string; name: string | null; email: string | null };
  };
}

interface MatchAdmin {
  id: string;
  afinidad: number;
  status: "SUGERIDO" | "CONTACTADO" | "ACTIVO" | "RECHAZADO" | "CERRADO";
  createdAt: string;
  matchReasons: string[];
  estudiante: { user: { name: string | null; email: string | null } };
  exalumno: { user: { name: string | null; email: string | null } };
}

interface ReporteAdmin {
  usuario: { id: string; name: string | null; email: string | null; status: string; role: string } | null;
  totalReportes: number;
  motivos: string[];
}

// ============================================================
// Sub-componentes
// ============================================================

// --- KPI Card ---
function KpiCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
  index = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card className="bg-white dark:bg-slate-900 border-border shadow-sm transition-shadow hover:shadow-fu-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
          {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// --- Visor de comprobante ---
function ComprobanteViewer({ url, onClose }: { url: string; onClose: () => void }) {
  const isPdf = url.toLowerCase().includes(".pdf");
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Comprobante de Pago</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <XCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isPdf ? (
            <iframe src={url} className="w-full h-[70vh]" title="Comprobante PDF" />
          ) : (
            <img src={url} alt="Comprobante" className="max-w-full h-auto rounded-lg mx-auto" />
          )}
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0f4c81] text-sm font-medium hover:underline"
          >
            Abrir en nueva pestaña →
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Página principal
// ============================================================
export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  // Redirigir si no es ADMIN
  useEffect(() => {
    if (status === "authenticated" && role !== "ADMIN") {
      router.push("/");
    }
  }, [status, role, router]);

  if (status === "loading") return null;
  if (status === "authenticated" && role !== "ADMIN") return null;

  // ---- Estado general ----
  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<MatchAdmin[]>([]);
  const [reportes, setReportes] = useState<ReporteAdmin[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [activeSection, setActiveSection] = useState<"dashboard" | "impacto" | "matches" | "donaciones" | "reportes">("dashboard");

  // ---- Filtros matches ----
  const [matchStatus, setMatchStatus] = useState("");
  const [matchNombre, setMatchNombre] = useState("");

  // ---- Acciones en vuelo ----
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showAlert } = useDialog();
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);

  // ---- Generación de matches ----
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [generationResult, setGenerationResult] = useState<string | null>(null);

  // ============================================================
  // Fetch de datos
  // ============================================================
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoadingMatches(true);
    try {
      const params = new URLSearchParams();
      if (matchStatus) params.set("status", matchStatus);
      if (matchNombre) params.set("nombre", matchNombre);
      const res = await fetch(`/api/admin/matches?${params}`);
      if (res.ok) setMatches(await res.json());
    } finally {
      setLoadingMatches(false);
    }
  }, [matchStatus, matchNombre]);

  const fetchReportes = useCallback(async () => {
    setLoadingReportes(true);
    try {
      const res = await fetch("/api/reportes");
      if (res.ok) setReportes(await res.json());
    } finally {
      setLoadingReportes(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchMatches(); }, [fetchMatches]);
  useEffect(() => { fetchReportes(); }, [fetchReportes]);

  // ============================================================
  // Acciones
  // ============================================================
  const handleDonacion = async (id: string, newStatus: "APROBADA" | "RECHAZADA") => {
    setActionLoading(id + newStatus);
    try {
      const res = await fetch(`/api/admin/donaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStats(); // Refrescar donaciones pendientes y KPIs
      } else {
        const d = await res.json();
        await showAlert(d.message || "Error al actualizar", { title: "Error", variant: "error" });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserStatus = async (userId: string, newStatus: "ACTIVO" | "SUSPENDIDO") => {
    setActionLoading(userId + newStatus);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchReportes();
        fetchStats();
      } else {
        const d = await res.json();
        await showAlert(d.message || "Error al actualizar usuario", { title: "Error", variant: "error" });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerarMatches = async () => {
    setGeneratingMatches(true);
    setGenerationResult(null);
    try {
      const res = await fetch("/api/matches/generar", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setGenerationResult(`✅ ${data.creados} matches creados, ${data.actualizados} actualizados.`);
        fetchMatches();
        fetchStats();
      } else {
        setGenerationResult(`❌ ${data.message}`);
      }
    } finally {
      setGeneratingMatches(false);
    }
  };

  // ============================================================
  // Export CSV de matches
  // ============================================================
  const exportCSV = () => {
    const headers = ["Estudiante", "Email Estudiante", "Exalumno", "Email Exalumno", "Afinidad", "Status", "Fecha"];
    const rows = matches.map((m) => [
      m.estudiante.user.name || "",
      m.estudiante.user.email || "",
      m.exalumno.user.name || "",
      m.exalumno.user.email || "",
      m.afinidad,
      m.status,
      new Date(m.createdAt).toLocaleDateString("es-CR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matches_alumni_ucr_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // Export PDF
  // ============================================================
  const adminRef = useRef<HTMLDivElement>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const exportPDF = async () => {
    if (!adminRef.current) return;
    try {
      setDownloadingPDF(true);
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(adminRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Admin_Report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      await showAlert("Hubo un error al generar el PDF.", { title: "Error al exportar", variant: "error" });
    } finally {
      setDownloadingPDF(false);
    }
  };

  // ============================================================
  // Colores de status
  // ============================================================
  const MATCH_STATUS_COLORS: Record<string, string> = {
    SUGERIDO: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    CONTACTADO: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
    ACTIVO: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
    RECHAZADO: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400",
    CERRADO: "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
  };

  if ((status as string) === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={adminRef} className="min-h-full bg-[#f8fafc] dark:bg-slate-950 print:bg-white">

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ---- Header ---- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Panel de Administración
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Métricas en tiempo real, gestión de matches, donaciones y moderación.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleGenerarMatches}
              disabled={generatingMatches}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              {generatingMatches ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Generar Matches
            </Button>
            <Button onClick={exportPDF} disabled={downloadingPDF} variant="outline" className="gap-2 print:hidden">
              {downloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              {downloadingPDF ? "Generando..." : "Exportar PDF"}
            </Button>
          </div>
        </div>

        {generationResult && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${generationResult.startsWith("✅") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
            {generationResult}
          </div>
        )}

        {/* ---- Navegación de secciones ---- */}
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm w-full sm:w-fit overflow-x-auto">
          {(["dashboard", "impacto", "matches", "donaciones", "reportes"] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize whitespace-nowrap shrink-0 ${
                activeSection === sec
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {sec === "donaciones" ? "Cola Donaciones" : sec === "reportes" ? "Perfiles Reportados" : sec === "matches" ? "Gestión Matches" : sec === "impacto" ? "Impacto" : "Dashboard"}
            </button>
          ))}
        </div>

        {/* =========================================== */}
        {/* SECCIÓN: DASHBOARD DE IMPACTO             */}
        {/* =========================================== */}
        {activeSection === "dashboard" && (
          <div className="space-y-6 print:block" id="dashboard-print">
            {/* KPI Cards */}
            {loadingStats ? (
              <div className="flex items-center gap-2 py-6 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando métricas...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KpiCard
                  index={0}
                  title="Total Donado (Aprobadas)"
                  value={`₡${(stats?.kpis.totalDonado || 0).toLocaleString("es-CR")}`}
                  icon={DollarSign}
                  color="bg-green-500"
                  sub={`${stats?.kpis.donacionesAprobadas || 0} donaciones aprobadas`}
                />
                <KpiCard
                  index={1}
                  title="Matches Activos"
                  value={stats?.kpis.matchesActivos || 0}
                  icon={Link2}
                  color="bg-[#0f4c81]"
                />
                <KpiCard
                  index={2}
                  title="Estudiantes Activos"
                  value={stats?.kpis.estudiantesActivos || 0}
                  icon={Users}
                  color="bg-indigo-500"
                />
                <KpiCard
                  index={3}
                  title="Exalumnos Activos"
                  value={stats?.kpis.exalumnosActivos || 0}
                  icon={HeartHandshake}
                  color="bg-purple-500"
                />
              </div>
            )}

            {/* Gráfico de barras */}
            <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-[#0f4c81]" />
                  Donaciones Aprobadas por Mes (últimos 12 meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!stats?.graficoDonaciones?.length ? (
                  <div className="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm">
                    Sin datos de donaciones aún.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.graficoDonaciones} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis
                        tickFormatter={(v) => `₡${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`₡${value.toLocaleString("es-CR")}`, "Total donado"]}
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      />
                      <Bar dataKey="total" fill="#0f4c81" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================== */}
        {/* SECCIÓN: IMPACTO                          */}
        {/* =========================================== */}
        {activeSection === "impacto" && (
          <DashboardImpact />
        )}

        {/* =========================================== */}
        {/* SECCIÓN: GESTIÓN DE MATCHES                */}
        {/* =========================================== */}
        {activeSection === "matches" && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <Input
                  value={matchNombre}
                  onChange={(e) => setMatchNombre(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="pl-9 h-10"
                />
              </div>
              <select
                value={matchStatus}
                onChange={(e) => setMatchStatus(e.target.value)}
                className="h-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-100 px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800"
              >
                <option value="">Todos los estados</option>
                <option value="SUGERIDO">Sugerido</option>
                <option value="CONTACTADO">Contactado</option>
                <option value="ACTIVO">Activo</option>
                <option value="RECHAZADO">Rechazado</option>
                <option value="CERRADO">Cerrado</option>
              </select>
              <Button onClick={exportCSV} variant="outline" className="gap-2 h-10">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>

            {/* Tabla */}
            <Card className="bg-white dark:bg-slate-900 border-border shadow-sm overflow-hidden">
              {loadingMatches ? (
                <div className="flex items-center gap-2 p-8 text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" /> Cargando matches...
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                  No se encontraron matches con los filtros seleccionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estudiante</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Exalumno</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Afinidad</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Fecha</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Razones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {matches.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">{m.estudiante.user.name || "—"}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{m.estudiante.user.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 dark:text-slate-100">{m.exalumno.user.name || "—"}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{m.exalumno.user.email}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${m.afinidad >= 70 ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400" : m.afinidad >= 40 ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
                              {m.afinidad}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className={`${MATCH_STATUS_COLORS[m.status]} text-xs`}>
                              {m.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                            {new Date(m.createdAt).toLocaleDateString("es-CR")}
                          </td>
                          <td className="px-4 py-3">
                            {m.matchReasons && m.matchReasons.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {m.matchReasons.map((r, i) => (
                                  <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                                    {r}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-right">{matches.length} matches encontrados</p>
          </div>
        )}

        {/* =========================================== */}
        {/* SECCIÓN: COLA DE DONACIONES               */}
        {/* =========================================== */}
        {activeSection === "donaciones" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Cola de Donaciones Pendientes
                {stats?.donacionesPendientes?.length ? (
                  <Badge className="ml-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                    {stats.donacionesPendientes.length}
                  </Badge>
                ) : null}
              </h2>
              <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Refrescar
              </Button>
            </div>

            {loadingStats ? (
              <div className="flex items-center gap-2 py-6 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando...
              </div>
            ) : !stats?.donacionesPendientes?.length ? (
              <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-2xl mb-3">✅</div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Bandeja limpia</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Todas las donaciones han sido procesadas.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-slate-900 border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Exalumno</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Monto</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Destino</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Fecha</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Comprobante</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {stats.donacionesPendientes.map((d) => {
                        const isLoading = actionLoading?.startsWith(d.id);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800 dark:text-slate-100">{d.exalumno.user.name || "—"}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{d.exalumno.user.email}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                              ₡{d.monto.toLocaleString("es-CR")}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[160px] truncate">{d.destino}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                              {new Date(d.createdAt).toLocaleDateString("es-CR")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setComprobanteUrl(d.comprobanteUrl)}
                                className="inline-flex items-center gap-1 text-[#0f4c81] dark:text-sky-400 hover:underline text-xs font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Ver
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                                  disabled={!!isLoading}
                                  onClick={() => handleDonacion(d.id, "APROBADA")}
                                >
                                  {actionLoading === d.id + "APROBADA" ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCheck className="w-3 h-3" />}
                                  <span className="ml-1">Aprobar</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8"
                                  disabled={!!isLoading}
                                  onClick={() => handleDonacion(d.id, "RECHAZADA")}
                                >
                                  {actionLoading === d.id + "RECHAZADA" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                  <span className="ml-1">Rechazar</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* =========================================== */}
        {/* SECCIÓN: PERFILES REPORTADOS              */}
        {/* =========================================== */}
        {activeSection === "reportes" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Perfiles Reportados</h2>
              <Button onClick={fetchReportes} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-3.5 h-3.5" />
                Refrescar
              </Button>
            </div>

            {loadingReportes ? (
              <div className="flex items-center gap-2 py-6 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <Card className="bg-white dark:bg-slate-900 border-border shadow-sm">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-2xl mb-3">🛡️</div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Sin reportes pendientes</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">La comunidad está en orden.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-slate-900 border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Usuario Reportado</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Rol</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Reportes</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Motivos</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                        <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {reportes.map((r, i) => {
                        if (!r.usuario) return null;
                        const isSuspended = r.usuario.status === "SUSPENDIDO";
                        const isLoading = actionLoading?.startsWith(r.usuario.id);
                        return (
                          <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800 ${isSuspended ? "bg-red-50/40 dark:bg-red-900/10" : ""}`}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-800 dark:text-slate-100">{r.usuario.name || "—"}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{r.usuario.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs">
                                {r.usuario.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${r.totalReportes >= 3 ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400" : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"}`}>
                                {r.totalReportes}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {r.motivos.slice(0, 2).map((m, j) => (
                                  <span key={j} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                                    {m}
                                  </span>
                                ))}
                                {r.motivos.length > 2 && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">+{r.motivos.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isSuspended ? (
                                <Badge variant="destructive" className="text-xs">SUSPENDIDO</Badge>
                              ) : r.totalReportes >= 3 ? (
                                <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 text-xs">Auto-suspendido</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 text-xs">En revisión</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {isSuspended ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs h-8"
                                    disabled={!!isLoading}
                                    onClick={() => handleUserStatus(r.usuario!.id, "ACTIVO")}
                                  >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                    <span className="ml-1">Rehabilitar</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs h-8"
                                    disabled={!!isLoading}
                                    onClick={() => handleUserStatus(r.usuario!.id, "SUSPENDIDO")}
                                  >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                                    <span className="ml-1">Suspender</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Visor de comprobante */}
      {comprobanteUrl && (
        <ComprobanteViewer url={comprobanteUrl} onClose={() => setComprobanteUrl(null)} />
      )}
    </div>
  );
}
