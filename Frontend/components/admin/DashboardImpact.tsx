"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/hooks/useDialog";
import {
  Users,
  Briefcase,
  GraduationCap,
  Building,
  HeartHandshake,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Loader2,
} from "lucide-react";
interface DashboardMetrics {
  students: number;
  graduates: number;
  companies: number;
  jobs: number;
  applications: number;
  donations: number;
  events: number;
  acceptedRequests: number;
  rejectedRequests: number;
  activeUsers: number;
}

export function DashboardImpact() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const { showAlert } = useDialog();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/dashboard/metrics");
        if (!res.ok) throw new Error("Error al obtener métricas del servidor");
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    try {
      setExporting(true);
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.text("Reporte de Impacto - Alumni UCR", 10, 10);
      pdf.setFontSize(10);
      pdf.text(`Fecha de generación: ${new Date().toLocaleString("es-CR")}`, 10, 15);
      
      pdf.addImage(imgData, "PNG", 10, 20, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`dashboard_impacto_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      await showAlert("Hubo un error al generar el PDF.", { title: "Error al exportar", variant: "error" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span className="font-medium">Cargando métricas de impacto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center justify-center">
        <XCircle className="w-6 h-6 mr-2" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }

  if (!metrics) return null;

  const kpis = [
    { label: "Estudiantes", value: metrics.students, icon: GraduationCap, color: "bg-blue-500" },
    { label: "Exalumnos", value: metrics.graduates, icon: Users, color: "bg-indigo-500" },
    { label: "Empresas", value: metrics.companies, icon: Building, color: "bg-slate-700" },
    { label: "Ofertas Laborales", value: metrics.jobs, icon: Briefcase, color: "bg-teal-500" },
    { label: "Postulaciones", value: metrics.applications, icon: Activity, color: "bg-orange-500" },
    { label: "Donaciones", value: metrics.donations, icon: HeartHandshake, color: "bg-green-500" },
    { label: "Eventos", value: metrics.events, icon: Calendar, color: "bg-purple-500" },
    { label: "Solicitudes Aceptadas", value: metrics.acceptedRequests, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Solicitudes Rechazadas", value: metrics.rejectedRequests, icon: XCircle, color: "bg-red-500" },
    { label: "Usuarios Activos", value: metrics.activeUsers, icon: Users, color: "bg-[#0f4c81]" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard de Impacto</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Métricas principales de la plataforma en tiempo real.</p>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Exportar PDF
        </Button>
      </div>

      <div ref={printRef} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Resumen de Métricas - Alumni UCR</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generado: {new Date().toLocaleString("es-CR")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {kpi.label}
                  </CardTitle>
                  <div className={`p-1.5 rounded-md ${kpi.color}`}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{kpi.value.toLocaleString()}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
