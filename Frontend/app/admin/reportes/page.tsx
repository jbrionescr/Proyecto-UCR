"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, RefreshCw, BarChart, Users, DollarSign, HeartHandshake,
  Printer, FolderHeart, UserPlus, Calendar, TrendingUp, PieChart as PieIcon
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS_DONA = ["#005da4", "#00c0f3", "#f37021", "#fdb912", "#22c55e", "#a855f7"];
const COLORS_DONA2 = ["#f37021", "#005da4"];

// Custom legend renderer — avoids long label overflow
const renderCustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 px-2">
      {(payload || []).map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="truncate max-w-[140px]" title={entry.value}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// Custom tooltips
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-base font-extrabold text-[#005da4]">
          ₡{Number(payload[0].value).toLocaleString("es-CR")}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl px-4 py-2.5 border border-slate-100 dark:border-slate-700">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-200 mb-0.5">{payload[0].name}</p>
        <p className="text-sm font-extrabold" style={{ color: payload[0].payload.fill }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

// Empty state component
const EmptyChart = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-2">
    <Icon className="w-10 h-10" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default function AdminReportesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      if ((session?.user as any)?.tipo !== "ADMIN") router.replace("/");
      else loadStats();
    }
  }, [status, session]);

  async function loadStats() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (desde) qs.set("desde", desde);
      if (hasta) qs.set("hasta", hasta);
      const res = await fetch(`/api/admin/stats${qs.toString() ? `?${qs}` : ""}`);
      const d = await res.json();
      setData(d);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
    setLoading(false);
  }

  function limpiarRango() {
    setDesde(""); setHasta("");
    setTimeout(loadStats, 0);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#005da4]" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-red-500">Error cargando dashboard</div>;

  // Pad donation chart: if < 4 data points, add blank placeholders on both sides
  // This prevents a single bar from filling the entire chart width.
  const rawDonaciones: any[] = data.graficoDonaciones || [];
  let donacionesData = rawDonaciones;
  if (rawDonaciones.length > 0 && rawDonaciones.length < 4) {
    const blanks = Array(Math.ceil((4 - rawDonaciones.length) / 2)).fill(null).map(() => ({
      mes: "", total: 0,
    }));
    donacionesData = [...blanks, ...rawDonaciones, ...blanks];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="print:hidden">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#005da4] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al panel
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl text-slate-900 dark:text-white">
                Dashboard de Impacto
              </AnimatedHeading>
              <p className="text-slate-500 dark:text-slate-400">Métricas y estadísticas globales de la plataforma.</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors font-medium text-sm"
            >
              <Printer className="w-4 h-4" /> Exportar a PDF
            </button>
          </div>

          {/* Date filter */}
          <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Periodo</span>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Desde</label>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005da4]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hasta</label>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#005da4]/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm" />
            </div>
            <button onClick={loadStats}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors font-medium text-sm">
              Aplicar
            </button>
            {(desde || hasta) && (
              <button onClick={limpiarRango}
                className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-[#005da4] font-medium transition-colors">
                Limpiar
              </button>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 sm:ml-auto sm:self-center">
              Sin filtro: últimos 12 meses.
            </p>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block text-center border-b border-slate-200 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Reporte de Impacto — Fundación Exalumnos UCR</h1>
          <p className="text-slate-500">Generado el {new Date().toLocaleDateString("es-CR")}</p>
        </div>

        {/* KPIs row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Donado", value: `₡${(data.kpis?.totalDonado || 0).toLocaleString("es-CR")}`, icon: DollarSign, color: "blue" },
            { label: "Matches Activos", value: data.kpis?.matchesActivos ?? 0, icon: HeartHandshake, color: "emerald" },
            { label: "Estudiantes Activos", value: data.kpis?.estudiantesActivos ?? 0, icon: Users, color: "purple" },
            { label: "Exalumnos Activos", value: data.kpis?.exalumnosActivos ?? 0, icon: Users, color: "indigo" },
          ].map((item) => {
            const Icon = item.icon;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
              emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
              purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
              indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
            };
            return (
              <Card key={item.label} className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[item.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* KPIs row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Donado (periodo)", value: `₡${(data.kpis?.totalDonadoPeriodo || 0).toLocaleString("es-CR")}`, icon: DollarSign, color: "blue" },
            { label: "Proyectos Apoyados", value: data.kpis?.proyectosApoyados ?? 0, icon: FolderHeart, color: "rose" },
            { label: "Matches Cerrados", value: data.kpis?.matchesCerrados ?? 0, icon: HeartHandshake, color: "slate" },
            {
              label: "Donantes (nuevos / recurr.)",
              value: <span>{data.kpis?.donantesNuevos ?? 0} <span className="text-slate-300 dark:text-slate-600">/</span> {data.kpis?.donantesRecurrentes ?? 0}</span>,
              icon: UserPlus, color: "amber"
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
              rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
              slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
              amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
            };
            return (
              <Card key={idx} className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[item.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">

          {/* ── Evolución de Donaciones ── */}
          <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 print:break-inside-avoid">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#005da4]" /> Evolución de Donaciones
            </h3>
            <p className="text-xs text-slate-400 mb-5">Donaciones acumuladas por mes (últimos 12 meses)</p>
            <div className="h-[260px] w-full">
              {rawDonaciones.length === 0 ? (
                <EmptyChart icon={BarChart} label="Sin datos de donaciones aún" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={donacionesData}
                    margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
                    barCategoryGap="45%"
                  >
                    <defs>
                      <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00c0f3" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#005da4" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(v) =>
                        v === 0 ? "₡0" : `₡${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                      }
                      width={50}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,93,164,0.05)", radius: 6 }} />
                    <Bar
                      dataKey="total"
                      fill="url(#gradBar)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={52}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Distribución de Matches por Carrera ── */}
          <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 print:break-inside-avoid">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#005da4]" /> Distribución de Matches por Carrera
            </h3>
            <p className="text-xs text-slate-400 mb-4">Porcentaje de matches activos según área académica</p>
            <div className="h-[220px] w-full">
              {(data.graficoMatchesCarrera || []).length === 0 ? (
                <EmptyChart icon={PieIcon} label="Sin datos de matches aún" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.graficoMatchesCarrera || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(data.graficoMatchesCarrera || []).map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS_DONA[index % COLORS_DONA.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend content={renderCustomLegend} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Donantes: Nuevos vs. Recurrentes ── */}
          <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 print:break-inside-avoid">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#f37021]" /> Donantes: Nuevos vs. Recurrentes
            </h3>
            <p className="text-xs text-slate-400 mb-4">Composición de la base de donantes en el periodo</p>
            <div className="h-[220px] w-full">
              {(data.graficoDonantes || []).length === 0 ? (
                <EmptyChart icon={UserPlus} label="Sin datos de donantes aún" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.graficoDonantes || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(data.graficoDonantes || []).map((_: any, index: number) => (
                        <Cell
                          key={`cell-don-${index}`}
                          fill={COLORS_DONA2[index % COLORS_DONA2.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend content={renderCustomLegend} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Estudiantes por Sede UCR ── */}
          <Card className="p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 print:break-inside-avoid">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-0.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#005da4]" /> Estudiantes por Sede UCR
            </h3>
            <p className="text-xs text-slate-400 mb-4">Distribución geográfica de estudiantes registrados</p>
            <div className="h-[260px] w-full">
              {(data.graficoSedes || []).length === 0 ? (
                <EmptyChart icon={Users} label="Sin datos de sedes aún" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={data.graficoSedes || []}
                    layout="vertical"
                    margin={{ top: 4, right: 28, left: 4, bottom: 4 }}
                    barCategoryGap="38%"
                  >
                    <defs>
                      <linearGradient id="gradBar2" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00c0f3" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#005da4" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#334155", fontSize: 12 }}
                      width={112}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,93,164,0.04)", radius: 4 }}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 12px -2px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Bar dataKey="value" fill="url(#gradBar2)" radius={[0, 6, 6, 0]} maxBarSize={34} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
