"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, FolderOpen, Pencil, Trash2, CheckCircle2,
  DollarSign, Lightbulb, Briefcase, Users, Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/hooks/useDialog";
import { ParallaxBackgroundVideo } from "@/components/fu/ParallaxBackgroundVideo";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { SunflowerImage } from "@/components/fu/SunflowerImage";
import { InfoModal } from "@/components/fu/InfoModal";

interface Proyecto {
  carnet_ucr?: string;
  carrera?: string;
  sede?: string;
  nivel_academico?: string;
  proyecto_titulo?: string;
  proyecto_tipo?: string;
  proyecto_descripcion?: string;
  proyecto_porcentaje_avance?: number;
  busca_financiamiento?: boolean;
  busca_mentoria?: boolean;
  busca_empleo?: boolean;
  busca_pasantia?: boolean;
  visible_en_directorio?: boolean;
  user?: { nombre?: string; foto_url?: string };
}

const UCR = {
  blue: "#005da4",
  sky: "#00c0f3",
  orange: "#f37021",
  yellow: "#fdb912",
};

function ApoyoBadge({ label, icon: Icon, active }: { label: string; icon: any; active: boolean }) {
  if (!active) return null;
  return (
    <motion.span
      whileHover={{ scale: 1.06, y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#005da4]/10 text-[#005da4] dark:text-fu-blue-sky border border-[#005da4]/20 cursor-default"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </motion.span>
  );
}

export default function MiProyectoVerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useDialog();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    const tipo = (session?.user as any)?.tipo;
    if (tipo !== "ESTUDIANTE") { router.replace("/"); return; }

    fetch("/api/proyectos")
      .then((r) => r.json())
      .then(setProyecto)
      .catch(() => setProyecto(null))
      .finally(() => setLoading(false));
  }, [status, session, router]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/proyectos", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleted(true);
      setProyecto(null);
      setConfirmDelete(false);
    } catch {
      await showAlert("Error al eliminar el proyecto.", { title: "Error", variant: "error" });
    } finally {
      setDeleting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <ParallaxBackgroundVideo className="flex-1">
        <div className="min-h-screen flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-fu-blue-sky" />
        </div>
      </ParallaxBackgroundVideo>
    );
  }

  if (deleted || !proyecto?.proyecto_titulo) {
    return (
      <ParallaxBackgroundVideo className="flex-1">
        <div className="min-h-screen flex flex-col items-center justify-center py-24 text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <SunflowerImage size={280} />
          </motion.div>
          <AnimatedHeading as="h2" reveal className="text-2xl md:text-3xl text-white mt-6 mb-3">
            {deleted ? "Proyecto eliminado" : "Aún no tienes un proyecto publicado"}
          </AnimatedHeading>
          <p className="text-slate-300 max-w-sm text-sm mb-6">
            {deleted
              ? "Tu proyecto ha sido eliminado exitosamente."
              : "Crea y publica tu proyecto académico para que exalumnos y donantes puedan conocerlo."}
          </p>
          <Link href="/proyectos/nuevo">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button className="text-white shadow-lg" style={{ background: UCR.blue }}>
                {deleted ? "Crear nuevo proyecto" : "Iniciar mi proyecto"}
              </Button>
            </motion.span>
          </Link>
        </div>
      </ParallaxBackgroundVideo>
    );
  }

  const avance = proyecto.proyecto_porcentaje_avance ?? 0;
  const nombre = proyecto.user?.nombre ?? "Estudiante";
  const initials = nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <ParallaxBackgroundVideo className="flex-1">
      <div className="min-h-screen p-4 sm:p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider uppercase mb-1 text-fu-blue-sky">Mi Proyecto</p>
              <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl md:text-3xl text-white">
                Vista Previa
              </AnimatedHeading>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setInfoOpen(true)}
                variant="outline"
                className="border-white/40 text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm text-sm"
              >
                <Info className="w-4 h-4 mr-1.5" /> ¿Cómo funciona?
              </Button>
              <Link href="/proyectos/nuevo">
                <Button variant="outline" className="border-white/40 text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm text-sm">
                  <Pencil className="w-4 h-4 mr-1.5" /> Editar
                </Button>
              </Link>
              <Button
                onClick={() => setConfirmDelete(true)}
                variant="outline"
                className="border-red-300/50 text-red-200 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Eliminar
              </Button>
            </div>
          </div>

          {/* Confirm delete */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="p-4 bg-red-500/15 border border-red-300/40 backdrop-blur-md rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
              >
                <p className="text-sm text-red-100 font-medium">
                  ¿Eliminar este proyecto permanentemente? No se puede deshacer.
                </p>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" onClick={() => setConfirmDelete(false)} className="text-xs border-white/40 text-white bg-white/5">Cancelar</Button>
                  <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sí, eliminar"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="fu-card overflow-hidden shadow-fu-lg"
          >
            {/* Color bar */}
            <div className="h-2 w-full fu-hero-gradient animate-fu-gradient" />

            <div className="p-4 sm:p-6">
              {/* Student info */}
              <div className="flex items-center flex-wrap gap-4 mb-6 pb-6 border-b fu-border">
                {proyecto.user?.foto_url ? (
                  <img src={proyecto.user.foto_url} alt={nombre} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shadow shrink-0" style={{ background: UCR.blue }}>
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold fu-text text-lg break-words">{nombre}</p>
                  <p className="text-sm fu-text-2">{proyecto.carrera ?? "Carrera no especificada"}</p>
                  {proyecto.sede && <p className="text-xs fu-muted">{proyecto.sede}</p>}
                </div>
                {proyecto.visible_en_directorio && (
                  <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 px-3 py-1 rounded-full shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Publicado
                  </div>
                )}
              </div>

              {/* Project title + type */}
              <div className="mb-5">
                <h2 className="text-xl font-bold fu-text mb-1 break-words">{proyecto.proyecto_titulo}</h2>
                {proyecto.proyecto_tipo && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ background: UCR.orange }}>
                    {proyecto.proyecto_tipo}
                  </span>
                )}
              </div>

              {/* Description */}
              {proyecto.proyecto_descripcion && (
                <p className="text-sm fu-text-2 leading-relaxed mb-5">
                  {proyecto.proyecto_descripcion}
                </p>
              )}

              {/* Progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="fu-text-2">Estado de avance</span>
                  <span style={{ color: UCR.blue }}>{avance}%</span>
                </div>
                <div className="h-2 rounded-full fu-surface-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${UCR.blue}, ${UCR.sky})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${avance}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>

              {/* Support needed */}
              <div className="flex flex-wrap gap-2">
                <ApoyoBadge label="Financiamiento" icon={DollarSign} active={!!proyecto.busca_financiamiento} />
                <ApoyoBadge label="Mentoría" icon={Lightbulb} active={!!proyecto.busca_mentoria} />
                <ApoyoBadge label="Empleo" icon={Users} active={!!proyecto.busca_empleo} />
                <ApoyoBadge label="Pasantía" icon={Briefcase} active={!!proyecto.busca_pasantia} />
              </div>
            </div>
          </motion.div>

          {!proyecto.visible_en_directorio && (
            <div className="mt-4 p-4 bg-amber-500/15 border border-amber-300/40 backdrop-blur-md rounded-xl text-sm text-amber-100">
              <strong>Borrador:</strong> Este proyecto no es visible para exalumnos aún. Ve a{" "}
              <Link href="/proyectos/nuevo" className="underline font-semibold">Editar proyecto</Link> y haz clic en "Publicar" para que aparezca en el directorio.
            </div>
          )}
        </div>
      </div>

      {/* Modal informativo: se abre sobre el fondo parallax, que sigue vivo detrás */}
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} title="Sobre tu proyecto">
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Desde aquí gestionas tu proyecto académico y su visibilidad ante la red de
            exalumnos, mentores y donantes de la Universidad.
          </p>
          <p>
            <strong className="fu-text">Publicado:</strong> tu proyecto aparece en el directorio y
            puede recibir apoyo (financiamiento, mentoría, empleo o pasantía).
          </p>
          <p>
            <strong className="fu-text">Borrador:</strong> solo tú lo ves. Edítalo y pulsa
            «Publicar» cuando esté listo.
          </p>
        </div>
      </InfoModal>
    </ParallaxBackgroundVideo>
  );
}
