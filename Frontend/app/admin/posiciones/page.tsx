"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Briefcase, Loader2, RefreshCw, PauseCircle,
  PlayCircle, Trash2, Users, Download,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/hooks/useDialog";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface Posicion {
  id: string;
  titulo: string | null;
  tipo: string | null;
  modalidad: string | null;
  jornada: string | null;
  empresa: string | null;
  estado: string | null;
  fecha_limite: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  aplicantes: number;
  exalumno_id: string;
  exalumno_nombre: string | null;
  exalumno_email: string | null;
}

const ESTADO_CFG: Record<string, { label: string; cls: string }> = {
  activa:    { label: "Activa",    cls: "bg-green-100 text-green-700 border-green-200" },
  pausada:   { label: "Pausada",   cls: "bg-amber-100 text-amber-700 border-amber-200" },
  cubierta:  { label: "Cubierta",  cls: "bg-blue-100 text-blue-700 border-blue-200" },
  vencida:   { label: "Vencida",   cls: "bg-slate-200 text-slate-600 border-slate-300" },
  eliminada: { label: "Eliminada", cls: "bg-red-100 text-red-700 border-red-200" },
};

function estadoCfg(estado: string | null) {
  const key = (estado ?? "").toLowerCase();
  return ESTADO_CFG[key] ?? { label: estado ?? "—", cls: "bg-slate-100 text-slate-600 border-slate-200" };
}

function fdt(iso: string) {
  return new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

function toCsv(rows: Posicion[]): string {
  const headers = ["Título", "Empresa", "Tipo", "Estado", "Exalumno", "Email", "Aplicantes", "Creada"];
  const lines = rows.map((p) => [
    p.titulo ?? "", p.empresa ?? "", p.tipo ?? "", p.estado ?? "",
    p.exalumno_nombre ?? "", p.exalumno_email ?? "", String(p.aplicantes), fdt(p.created_at),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...lines].join("\n");
}

export default function AdminPosicionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showConfirm } = useDialog();

  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((session?.user as any)?.tipo !== "ADMIN") { router.replace("/"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, filtroEstado]);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (filtroEstado) qs.set("estado", filtroEstado);
    if (filtroTipo) qs.set("tipo", filtroTipo);
    const res = await fetch(`/api/admin/posiciones?${qs}`);
    const d = await res.json();
    setPosiciones(d.data ?? []);
    setLoading(false);
  }

  async function pausarReactivar(p: Posicion) {
    const nuevoEstado = p.estado === "activa" ? "pausada" : "activa";
    setWorking(p.id);
    setMsg(null);
    const res = await fetch(`/api/admin/posiciones/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: `Posición ${nuevoEstado === "pausada" ? "pausada" : "reactivada"} correctamente.` });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: d.message || "Error al actualizar la posición." });
    }
    setWorking(null);
  }

  async function eliminar(p: Posicion) {
    const ok = await showConfirm(
      `¿Eliminar "${p.titulo ?? "esta posición"}"? Las aplicaciones ya recibidas se conservan, pero la posición dejará de estar disponible.`,
      { title: "Eliminar posición", confirmLabel: "Sí, eliminar", variant: "warning" }
    );
    if (!ok) return;

    setWorking(p.id);
    setMsg(null);
    const res = await fetch(`/api/admin/posiciones/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg({ type: "ok", text: "Posición eliminada. Las aplicaciones asociadas se conservaron." });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: d.message || "Error al eliminar la posición." });
    }
    setWorking(null);
  }

  function exportarCsv() {
    const csv = toCsv(posiciones);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `posiciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (status === "loading") return (
    <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
    </ParallaxBackground>
  );

  const ESTADOS_FILTRO = ["", "activa", "pausada", "cubierta", "vencida", "eliminada"];

  return (
    <ParallaxBackground className="min-h-full p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Administración</p>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Gestión de Vacantes</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Todas las posiciones publicadas por exalumnos, sin importar quién las creó.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportarCsv} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81]">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button onClick={load} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81]">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 flex-wrap items-center">
          {ESTADOS_FILTRO.map((e) => (
            <button
              key={e || "todos"}
              onClick={() => setFiltroEstado(e)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                filtroEstado === e
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0f4c81]"
              }`}
            >
              {e ? estadoCfg(e).label : "Todas"}
            </button>
          ))}
          <input
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            onBlur={load}
            placeholder="Filtrar por tipo (Empleo, Pasantía...)"
            className="ml-2 px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-[#0f4c81]"
          />
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
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando posiciones...
          </div>
        ) : posiciones.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center text-slate-400">
            <Briefcase className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">No hay posiciones con este filtro.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Posición</th>
                  <th className="px-4 py-3 font-semibold">Exalumno</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-center">Aplicantes</th>
                  <th className="px-4 py-3 font-semibold">Creada</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posiciones.map((p) => {
                  const cfg = estadoCfg(p.estado);
                  const isWorking = working === p.id;
                  const eliminada = !!p.deleted_at;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{p.titulo ?? "Sin título"}</p>
                        <p className="text-xs text-slate-400">{p.empresa ?? "—"} · {p.tipo ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        <p className="font-medium text-slate-700 dark:text-slate-200">{p.exalumno_nombre ?? "—"}</p>
                        <p>{p.exalumno_email ?? ""}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${cfg.cls}`}>{cfg.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Users className="w-3.5 h-3.5" /> {p.aplicantes}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{fdt(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link href={`/mis-posiciones/${p.id}/aplicantes`}>
                            <Button size="sm" variant="outline" className="text-xs px-2.5 py-1 h-auto">
                              <Users className="w-3.5 h-3.5 mr-1" /> Aplicantes
                            </Button>
                          </Link>
                          {!eliminada && (p.estado === "activa" || p.estado === "pausada") && (
                            <Button
                              size="sm" variant="outline" disabled={isWorking}
                              onClick={() => pausarReactivar(p)}
                              className="text-xs px-2.5 py-1 h-auto border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                              {isWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : p.estado === "activa" ? <PauseCircle className="w-3.5 h-3.5 mr-1" /> : <PlayCircle className="w-3.5 h-3.5 mr-1" />}
                              {p.estado === "activa" ? "Pausar" : "Reactivar"}
                            </Button>
                          )}
                          {!eliminada && (
                            <Button
                              size="sm" variant="outline" disabled={isWorking}
                              onClick={() => eliminar(p)}
                              className="text-xs px-2.5 py-1 h-auto border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar
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
        )}
      </div>
    </ParallaxBackground>
  );
}
