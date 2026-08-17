"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, Loader2, Plus, Calendar, MapPin, Clock,
  Pencil, Trash2, X, Check, ChevronDown, Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/hooks/useDialog";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { SunflowerImage } from "@/components/fu/SunflowerImage";

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
  _count: { aplicaciones: number };
}

const ESTADO_COLORS: Record<string, string> = {
  activa: "bg-green-100 text-green-700 border-green-200",
  cubierta: "bg-slate-100 text-slate-600 border-slate-200",
  cancelada: "bg-red-100 text-red-600 border-red-200",
  vencida: "bg-amber-100 text-amber-700 border-amber-200",
};

const TIPOS = ["EMPLEO", "PASANTIA", "PRACTICA", "VOLUNTARIADO"];
const MODALIDADES = ["Presencial", "Remoto", "Híbrido"];
const JORNADAS = ["Tiempo completo", "Medio tiempo", "Por horas", "Flexible"];
const ESTADOS = ["activa", "cubierta", "cancelada"];

function toInputDate(iso: string | null) {
  if (!iso) return "";
  return iso.split("T")[0];
}
function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });
}

interface EditForm {
  titulo: string;
  tipo: string;
  modalidad: string;
  jornada: string;
  empresa: string;
  estado: string;
  fecha_limite: string;
}

export default function MisPosicionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ titulo: "", tipo: "", modalidad: "", jornada: "", empresa: "", estado: "", fecha_limite: "" });
  const [saving, setSaving] = useState(false);
  const { showAlert } = useDialog();

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    const tipo = (session?.user as any)?.tipo;
    if (tipo !== "EXALUMNO" && tipo !== "ADMIN") { router.replace("/"); return; }

    fetch("/api/posiciones/mis-posiciones")
      .then((r) => r.json())
      .then((d) => setPosiciones(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => setError("No se pudieron cargar las posiciones."))
      .finally(() => setLoading(false));
  }, [status, session, router]);

  function startEdit(p: Posicion) {
    setEditingId(p.id);
    setEditForm({
      titulo: p.titulo ?? "",
      tipo: p.tipo ?? "",
      modalidad: p.modalidad ?? "",
      jornada: p.jornada ?? "",
      empresa: p.empresa ?? "",
      estado: p.estado ?? "activa",
      fecha_limite: toInputDate(p.fecha_limite),
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/posiciones/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, fecha_limite: editForm.fecha_limite || null }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPosiciones((prev) => prev.map((p) => p.id === editingId ? {
        ...p,
        titulo: updated.titulo,
        tipo: updated.tipo,
        modalidad: updated.modalidad,
        jornada: updated.jornada,
        empresa: updated.empresa,
        estado: updated.estado,
        fecha_limite: updated.fecha_limite,
      } : p));
      setEditingId(null);
    } catch {
      await showAlert("Error al guardar cambios.", { title: "Error", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posiciones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosiciones((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch {
      await showAlert("Error al eliminar la posición.", { title: "Error", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading" || loading) {
    return (
      <ParallaxBackground className="min-h-screen flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Exalumno</p>
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl sm:text-3xl">Mis Posiciones</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Gestiona las posiciones laborales y de pasantía que has publicado.
            </p>
          </div>
          <Link href="/posiciones/nueva">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Nueva posición
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
        )}

        {posiciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <SunflowerImage size={220} />
            <h2 className="text-xl font-bold fu-text mt-4 mb-3">Sin posiciones publicadas</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">
              Publica oportunidades laborales y de pasantía para conectar con el talento estudiantil de la UCR.
            </p>
            <Link href="/posiciones/nueva">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Publicar mi primera posición
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-2 font-medium">
              <span className="font-bold text-slate-700 dark:text-slate-300">{posiciones.length}</span> posici{posiciones.length !== 1 ? "ones" : "ón"} publicada{posiciones.length !== 1 ? "s" : ""}
            </p>

            {posiciones.map((p, i) => {
              const estadoLower = (p.estado ?? "activa").toLowerCase();
              const estadoCls = ESTADO_COLORS[estadoLower] ?? ESTADO_COLORS.activa;
              const isEditing = editingId === p.id;
              const isConfirmingDelete = confirmDeleteId === p.id;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                >
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-fu-lg transition-shadow overflow-hidden">
                  {/* Main row */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#0f4c81]/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-[#0f4c81]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 break-words">{p.titulo ?? "Posición sin título"}</h3>
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${estadoCls}`}>
                            {p.estado ?? "Activa"}
                          </Badge>
                          {p.tipo && <Badge variant="secondary" className="text-xs">{p.tipo}</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {p.empresa && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{p.empresa}</span>}
                          {p.modalidad && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.modalidad}</span>}
                          {p.jornada && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.jornada}</span>}
                          {p.fecha_limite && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Cierra: {formatDate(p.fecha_limite)}</span>}
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <Link href={`/mis-posiciones/${p.id}/aplicantes`}>
                          <div className="text-right mr-2 hover:opacity-75 transition-opacity cursor-pointer" title="Ver aplicantes">
                            <p className="text-2xl font-extrabold text-[#0f4c81] dark:text-sky-400">{p._count?.aplicaciones ?? 0}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-0.5 justify-end">
                              <Users className="w-3 h-3" /> aplicante{p._count?.aplicaciones !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </Link>
                        <button
                          onClick={() => isEditing ? setEditingId(null) : startEdit(p)}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#0f4c81] dark:text-sky-400 transition-colors"
                          title="Editar"
                        >
                          {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : p.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Edit form */}
                  {isEditing && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5">
                      <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-4">Editar posición</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Título *</label>
                          <input
                            value={editForm.titulo}
                            onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tipo</label>
                          <select value={editForm.tipo} onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]">
                            <option value="">Seleccionar</option>
                            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Modalidad</label>
                          <select value={editForm.modalidad} onChange={(e) => setEditForm((f) => ({ ...f, modalidad: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]">
                            <option value="">Seleccionar</option>
                            {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jornada</label>
                          <select value={editForm.jornada} onChange={(e) => setEditForm((f) => ({ ...f, jornada: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]">
                            <option value="">Seleccionar</option>
                            {JORNADAS.map((j) => <option key={j} value={j}>{j}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Empresa</label>
                          <input
                            value={editForm.empresa}
                            onChange={(e) => setEditForm((f) => ({ ...f, empresa: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Estado</label>
                          <select value={editForm.estado} onChange={(e) => setEditForm((f) => ({ ...f, estado: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]">
                            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fecha límite</label>
                          <input
                            type="date"
                            value={editForm.fecha_limite}
                            onChange={(e) => setEditForm((f) => ({ ...f, fecha_limite: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f4c81]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setEditingId(null)} className="text-sm">Cancelar</Button>
                        <Button onClick={saveEdit} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Delete confirm */}
                  {isConfirmingDelete && (
                    <div className="border-t border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        ¿Eliminar esta posición permanentemente? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="text-xs border-red-200 text-red-600 hover:bg-red-50">
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => confirmDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        >
                          {deletingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sí, eliminar"}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ParallaxBackground>
  );
}
