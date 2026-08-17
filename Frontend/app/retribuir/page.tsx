"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Award, Users, Clock, Loader2, X,
  CheckCircle2, XCircle, HourglassIcon, MoreHorizontal, MapPin, Video, Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { CATALOGO_VOLUNTARIADO, VoluntariadoCatalogItem } from "@/lib/voluntariado-catalog";
import { ofrecerVoluntariado, getMisVoluntariados } from "@/actions/voluntariado.actions";
import { crearTaller, getMisTalleres } from "@/actions/taller.actions";

const ICONOS: Record<string, any> = {
  orientacion: GraduationCap,
  evaluacion: Award,
  apoyo_proyecto: Users,
};

const CATEGORIA_COLOR: Record<string, string> = {
  "Orientación": "bg-blue-50 text-blue-700 border-blue-200",
  "Evaluación": "bg-amber-50 text-amber-700 border-amber-200",
  "Proyecto universitario": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const ESTADO_CFG: Record<string, { label: string; className: string; icon: any }> = {
  PENDIENTE: { label: "Pendiente de revisión", className: "bg-amber-50 text-amber-700 border-amber-200", icon: HourglassIcon },
  ACEPTADA: { label: "Aceptada", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  RECHAZADA: { label: "No aceptada", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

interface MiOferta {
  id: string;
  tipo: string;
  titulo: string;
  categoria: string | null;
  mensaje: string | null;
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  motivo_rechazo: string | null;
  created_at: string;
}

interface MiTaller {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_hora: string | null;
  cupos_totales: number;
  cupos_ocupados: number;
  modalidad: "ONLINE" | "PRESENCIAL" | "HIBRIDO";
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivo_rechazo: string | null;
  created_at: string;
}

const TALLER_ESTADO_CFG: Record<string, { label: string; className: string; icon: any }> = {
  PENDIENTE: { label: "Pendiente de revisión", className: "bg-amber-50 text-amber-700 border-amber-200", icon: HourglassIcon },
  APROBADO: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  RECHAZADO: { label: "No aprobado", className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
};

const MODALIDAD_OPTS: { value: "ONLINE" | "PRESENCIAL" | "HIBRIDO"; label: string; icon: any }[] = [
  { value: "ONLINE", label: "Online", icon: Video },
  { value: "PRESENCIAL", label: "Presencial", icon: MapPin },
  { value: "HIBRIDO", label: "Híbrido", icon: Layers },
];

function CrearTallerForm({ onSuccess }: { onSuccess: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [cupos, setCupos] = useState("30");
  const [modalidad, setModalidad] = useState<"ONLINE" | "PRESENCIAL" | "HIBRIDO">("ONLINE");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearTaller({
        titulo,
        descripcion,
        fecha_hora: fechaHora ? new Date(fechaHora).toISOString() : null,
        cupos_totales: Number(cupos),
        modalidad,
      });
      toast({ title: "¡Taller enviado!", description: "Será revisado por un administrador antes de publicarse." });
      setTitulo("");
      setDescripcion("");
      setFechaHora("");
      setCupos("30");
      setModalidad("ONLINE");
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo enviar el taller.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-bold text-[#005da4] uppercase tracking-wide">Crear nuevo taller</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Será revisado por un administrador antes de publicarse.</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-300 shrink-0" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Título del taller</label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Cómo prepararte para tu primera entrevista de trabajo"
            required
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={600}
            required
            placeholder="Aprende técnicas de comunicación, preguntas frecuentes y cómo destacar tu experiencia, orientado a estudiantes que buscan su primera pasantía o empleo."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-[#005da4] focus:ring-2 focus:ring-[#005da4]/20 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Fecha y hora</label>
            <Input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="h-12"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cupos disponibles</label>
            <Input
              type="number"
              min={1}
              value={cupos}
              onChange={(e) => setCupos(e.target.value)}
              required
              className="h-12"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Modalidad</label>
          <div className="grid grid-cols-3 gap-2">
            {MODALIDAD_OPTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setModalidad(opt.value)}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 text-center leading-tight ${
                  modalidad === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#005da4]/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? "Enviando..." : "Enviar para aprobación"}
        </Button>
      </form>
    </Card>
  );
}

function OfrecerModal({ item, onClose, onSuccess }: { item: VoluntariadoCatalogItem; onClose: () => void; onSuccess: () => void }) {
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const Icon = ICONOS[item.tipo] ?? Users;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await ofrecerVoluntariado(item.tipo, mensaje);
      toast({ title: "¡Oferta enviada!", description: "El equipo de la Fundación UCR revisará tu propuesta pronto." });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo enviar tu oferta.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#005da4]/10 flex items-center justify-center text-[#005da4] shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{item.titulo}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.descripcion}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mensaje para la Fundación (opcional)
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ej. Disponibilidad de horario, experiencia relevante, fechas posibles..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:border-[#005da4] focus:ring-2 focus:ring-[#005da4]/20 resize-none"
            />
          </div>
          <p className="text-xs text-slate-400">
            Tu oferta quedará pendiente hasta que el equipo de la Fundación UCR la revise. Te notificaremos la decisión.
          </p>
        </div>
        <div className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? "Enviando..." : "Ofrecer mi apoyo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RetribuirPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [misOfertas, setMisOfertas] = useState<MiOferta[]>([]);
  const [misTalleres, setMisTalleres] = useState<MiTaller[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState<VoluntariadoCatalogItem | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([getMisVoluntariados(), getMisTalleres()])
      .then(([ofertas, talleres]) => {
        setMisOfertas(ofertas as MiOferta[]);
        setMisTalleres(talleres as MiTaller[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status !== "authenticated") return;
    if ((session?.user as any)?.tipo !== "EXALUMNO") { router.replace("/"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const pendientePorTipo = new Set(misOfertas.filter((o) => o.estado === "PENDIENTE").map((o) => o.tipo));

  if (status === "loading" || loading) {
    return (
      <ParallaxBackground className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#005da4] dark:text-fu-blue-sky" />
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground className="min-h-full p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <p className="text-xs font-bold text-[#005da4] dark:text-fu-blue-sky tracking-wider uppercase mb-1">Comunidad UCR</p>
          <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl md:text-3xl">Retribuye a la UCR</AnimatedHeading>
          <p className="fu-text-2 text-sm mt-1">Elige cómo quieres aportar tu tiempo y experiencia.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOGO_VOLUNTARIADO.map((item, i) => {
            const Icon = ICONOS[item.tipo] ?? Users;
            const yaPendiente = pendientePorTipo.has(item.tipo);
            return (
              <motion.div
                key={item.tipo}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(i, 6) * 0.06, ease: [0.25, 1, 0.5, 1] }}
                whileHover={{ y: -6 }}
                className="h-full"
              >
              <Card className="h-full p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-fu-lg transition-shadow flex flex-col">
                <div className="h-11 w-11 rounded-xl bg-[#005da4]/10 flex items-center justify-center text-[#005da4] mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant="outline" className={`w-fit text-[10px] font-bold mb-3 ${CATEGORIA_COLOR[item.categoria] ?? ""}`}>
                  {item.categoria}
                </Badge>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1.5">{item.titulo}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">{item.descripcion}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                  <Clock className="w-3.5 h-3.5" /> {item.duracion}
                </p>
                <Button
                  onClick={() => setModalItem(item)}
                  disabled={yaPendiente}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {yaPendiente ? "Oferta en revisión" : "Ofrecer mi apoyo"}
                </Button>
              </Card>
              </motion.div>
            );
          })}
        </div>

        {misOfertas.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Tus ofertas</h2>
            <div className="space-y-3">
              {misOfertas.map((o) => {
                const cfg = ESTADO_CFG[o.estado];
                const EstadoIcon = cfg.icon;
                return (
                  <Card key={o.id} className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{o.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ofrecido el {new Date(o.created_at).toLocaleDateString("es-CR")}
                      </p>
                      {o.estado === "RECHAZADA" && o.motivo_rechazo && (
                        <p className="text-xs text-red-600 mt-1">Motivo: {o.motivo_rechazo}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`w-fit text-xs font-semibold gap-1.5 ${cfg.className}`}>
                      <EstadoIcon className="w-3.5 h-3.5" /> {cfg.label}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">¿Prefieres dar un taller?</h2>
          <CrearTallerForm onSuccess={load} />
        </div>

        {misTalleres.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Tus talleres</h2>
            <div className="space-y-3">
              {misTalleres.map((t) => {
                const cfg = TALLER_ESTADO_CFG[t.estado];
                const EstadoIcon = cfg.icon;
                return (
                  <Card key={t.id} className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{t.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Propuesto el {new Date(t.created_at).toLocaleDateString("es-CR")}
                        {t.estado === "APROBADO" && ` · ${t.cupos_ocupados} de ${t.cupos_totales} cupos ocupados`}
                      </p>
                      {t.estado === "RECHAZADO" && t.motivo_rechazo && (
                        <p className="text-xs text-red-600 mt-1">Motivo: {t.motivo_rechazo}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={`w-fit text-xs font-semibold gap-1.5 ${cfg.className}`}>
                      <EstadoIcon className="w-3.5 h-3.5" /> {cfg.label}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {modalItem && (
        <OfrecerModal
          item={modalItem}
          onClose={() => setModalItem(null)}
          onSuccess={() => { setModalItem(null); load(); }}
        />
      )}
    </ParallaxBackground>
  );
}
