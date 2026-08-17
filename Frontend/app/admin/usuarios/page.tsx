"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, Search, Loader2, RefreshCw,
  UserCheck, UserX, ShieldAlert, CheckCircle2,
  Mail, Calendar, Briefcase, GraduationCap, Trash2, AlertTriangle,
  Award, FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { Input } from "@/components/ui/input";
import { useDialog } from "@/hooks/useDialog";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  tipo: "ESTUDIANTE" | "EXALUMNO" | "ADMIN";
  activo: boolean;
  status: string;
  email_verified: boolean;
  created_at: string;
  reportes_recibidos: number;
  carrera: string | null;
  carnet_ucr: string | null;
  empresa_actual: string | null;
  anio_ingreso: number | null;
  nivel_beca: string | null;
  comprobante_beca_url: string | null;
  coherencia_alerta: boolean;
}

const TIPO_CFG: Record<string, { label: string; cls: string }> = {
  ESTUDIANTE: { label: "Estudiante", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  EXALUMNO:   { label: "Exalumno",   cls: "bg-purple-50 text-purple-700 border-purple-200" },
  ADMIN:      { label: "Admin",      cls: "bg-red-50 text-red-700 border-red-200" },
};

function Avatar({ nombre }: { nombre: string }) {
  const initials = nombre.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#0f4c81]/10 flex items-center justify-center shrink-0">
      <span className="text-sm font-bold text-[#0f4c81]">{initials}</span>
    </div>
  );
}

const AUTO_REFRESH_MS = 8000;

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showConfirm } = useDialog();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filtros
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((session?.user as any)?.tipo !== "ADMIN") { router.replace("/"); return; }
    load();
  }, [status, session, tipo, statusFiltro, page]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const qs = new URLSearchParams();
    if (nombre) qs.set("nombre", nombre);
    if (tipo) qs.set("tipo", tipo);
    if (statusFiltro) qs.set("status", statusFiltro);
    qs.set("page", String(page));
    const res = await fetch(`/api/admin/usuarios?${qs}`);
    const d = await res.json();
    setUsuarios(d.data ?? []);
    setTotal(d.total ?? 0);
    setLastUpdated(new Date());
    if (!opts?.silent) setLoading(false);
  }, [nombre, tipo, statusFiltro, page]);

  // Auto-refresh: revisa cada pocos segundos si hay usuarios nuevos (registros
  // desde celulares u otras PCs) sin que el admin tenga que refrescar a mano.
  // Se pausa si la pestaña no está visible para no gastar requests de más.
  useEffect(() => {
    if (status !== "authenticated" || (session?.user as any)?.tipo !== "ADMIN") return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      load({ silent: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [status, session, load]);

  function buscar() { setPage(1); load(); }

  async function toggleStatus(u: Usuario) {
    const nuevoStatus = u.status === "SUSPENDIDO" ? "ACTIVO" : "SUSPENDIDO";
    setWorking(u.id);
    setMsg(null);
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nuevoStatus }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: `Usuario ${nuevoStatus === "SUSPENDIDO" ? "suspendido" : "reactivado"} correctamente.` });
      load();
    } else {
      setMsg({ type: "err", text: "Error al actualizar estado." });
    }
    setWorking(null);
  }

  async function cambiarRol(u: Usuario, nuevoTipo: string) {
    if (nuevoTipo === u.tipo) return;
    setWorking(u.id + "_rol");
    setMsg(null);
    const res = await fetch(`/api/admin/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: nuevoTipo }),
    });
    if (res.ok) {
      setMsg({ type: "ok", text: `Rol de ${u.nombre} cambiado a ${nuevoTipo}.` });
      load();
    } else {
      setMsg({ type: "err", text: "Error al cambiar el rol." });
    }
    setWorking(null);
  }

  async function eliminarUsuario(u: Usuario) {
    const ok = await showConfirm(
      `Vas a eliminar permanentemente la cuenta de ${u.nombre} (${u.email}). ` +
      "Se borrarán su perfil, matches, mensajes y demás datos asociados. Esta acción NO se puede deshacer.",
      { title: "Eliminar usuario permanentemente", confirmLabel: "Eliminar", variant: "error" }
    );
    if (!ok) return;

    setWorking(u.id + "_del");
    setMsg(null);
    const res = await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      setMsg({ type: "ok", text: `Usuario ${u.nombre} eliminado permanentemente.` });
      load();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg({ type: "err", text: d.message || "Error al eliminar el usuario." });
    }
    setWorking(null);
  }

  if (status === "loading") return (
    <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
    </ParallaxBackground>
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <ParallaxBackground className="min-h-full p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Administración</p>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Gestión de Usuarios</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Busca, filtra y gestiona el estado de los usuarios registrados.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              En vivo — se actualiza solo cada {AUTO_REFRESH_MS / 1000}s
            </div>
            <button onClick={() => load()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81]">
              <RefreshCw className="w-4 h-4" /> Actualizar ahora
              {lastUpdated && (
                <span className="text-xs text-slate-400 font-normal">
                  · {lastUpdated.toLocaleTimeString("es-CR")}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Buscar por nombre..."
                className="pl-9 h-10"
              />
            </div>
            <select
              value={tipo}
              onChange={(e) => { setTipo(e.target.value); setPage(1); }}
              className="h-10 border border-slate-200 rounded-lg text-sm px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">Todos los roles</option>
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="EXALUMNO">Exalumno</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              value={statusFiltro}
              onChange={(e) => { setStatusFiltro(e.target.value); setPage(1); }}
              className="h-10 border border-slate-200 rounded-lg text-sm px-3 outline-none focus:border-[#0f4c81] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="SUSPENDIDO">Suspendido</option>
            </select>
            <Button onClick={buscar} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10">
              <Search className="w-4 h-4 mr-2" /> Buscar
            </Button>
          </div>
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

        {/* Tabla / Lista */}
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando usuarios...
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center text-slate-400">
            <Users className="w-10 h-10 mb-3 opacity-30" />
            <p className="font-semibold text-slate-500">No se encontraron usuarios con estos filtros.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 font-medium mb-3">
              {total} usuario{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
            </p>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Usuario</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Rol</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Info</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Reportes</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Registro</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usuarios.map((u) => {
                      const tipoCfg = TIPO_CFG[u.tipo] ?? TIPO_CFG.ESTUDIANTE;
                      const isSuspended = u.status === "SUSPENDIDO";
                      const isMe = (session?.user as any)?.id === u.id;
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSuspended ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar nombre={u.nombre} />
                              <div className="min-w-0">
                                <Link href={`/perfil/${u.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-[#0f4c81] truncate block max-w-[180px]">
                                  {u.nombre}
                                </Link>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-[160px]">{u.email}</span>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${tipoCfg.cls}`}>
                              {tipoCfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                            {u.carrera && (
                              <p className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{u.carrera}</span>
                              </p>
                            )}
                            {u.empresa_actual && (
                              <p className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{u.empresa_actual}</span>
                              </p>
                            )}
                            {u.email_verified && (
                              <p className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" /> Email verificado
                              </p>
                            )}
                            {u.nivel_beca && (
                              <p className="flex items-center gap-1.5 text-[#005da4] font-semibold">
                                <Award className="w-3 h-3" />
                                <span className="truncate max-w-[110px]">{u.nivel_beca}</span>
                                {u.comprobante_beca_url && (
                                  <a
                                    href={u.comprobante_beca_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Ver comprobante de beca"
                                    className="text-[#005da4] hover:text-[#003b6d]"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </a>
                                )}
                              </p>
                            )}
                            {u.coherencia_alerta && (
                              <p
                                className="flex items-center gap-1 text-amber-600 font-semibold mt-0.5"
                                title={`Ingresó en ${u.anio_ingreso}: más de 8 años sin actualizar su nivel académico. Requiere revisión (RF-09.2).`}
                              >
                                <AlertTriangle className="w-3 h-3" /> Coherencia: +8 años
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isSuspended ? (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                Suspendido
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Activo
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {u.reportes_recibidos > 0 ? (
                              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                u.reportes_recibidos >= 3 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                <ShieldAlert className="w-3 h-3" />
                                {u.reportes_recibidos}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500">
                                {new Date(u.created_at).toLocaleDateString("es-CR")}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isMe ? (
                              <span className="text-xs text-slate-300 italic">Tú</span>
                            ) : u.tipo === "ADMIN" ? (
                              <span className="text-xs text-slate-300">—</span>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Cambiar rol */}
                                <select
                                  value={u.tipo}
                                  disabled={working === u.id + "_rol"}
                                  onChange={(e) => cambiarRol(u, e.target.value)}
                                  className="h-8 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 bg-white dark:bg-slate-800 dark:text-slate-200 outline-none focus:border-[#0f4c81] cursor-pointer"
                                  title="Cambiar rol"
                                >
                                  <option value="ESTUDIANTE">Estudiante</option>
                                  <option value="EXALUMNO">Exalumno</option>
                                </select>
                                {working === u.id + "_rol" && <Loader2 className="w-3 h-3 animate-spin text-[#0f4c81]" />}

                                {/* Suspender / Reactivar */}
                                <Button
                                  size="sm"
                                  disabled={!!working}
                                  onClick={() => toggleStatus(u)}
                                  variant="outline"
                                  className={`text-xs h-8 ${
                                    isSuspended
                                      ? "border-green-200 text-green-700 hover:bg-green-50"
                                      : "border-red-200 text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  {working === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : isSuspended ? (
                                    <UserCheck className="w-3 h-3" />
                                  ) : (
                                    <UserX className="w-3 h-3" />
                                  )}
                                  &nbsp;{isSuspended ? "Reactivar" : "Suspender"}
                                </Button>

                                {/* Eliminar permanentemente */}
                                <Button
                                  size="sm"
                                  disabled={!!working}
                                  onClick={() => eliminarUsuario(u)}
                                  variant="outline"
                                  className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                                  title="Eliminar permanentemente"
                                >
                                  {working === u.id + "_del" ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ParallaxBackground>
  );
}
