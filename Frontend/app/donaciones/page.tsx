"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getStudentProjects } from "@/actions/dashboard.actions";
import { StudentApplicationModal } from "@/components/donaciones/StudentApplicationModal";
import { MyApplicationsList } from "@/components/donaciones/MyApplicationsList";
import { FundingProgressBar } from "@/components/donaciones/FundingProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Upload,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Smartphone,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";
import { SunflowerImage } from "@/components/fu/SunflowerImage";
// ============================================================
// Constantes de pago (configurables)
// ============================================================
const SINPE_NUMERO = "8888-8888"; // Número SINPE destino
const IBAN_DESTINO = "CR21015200009003651111"; // IBAN UCR
const BANCO_DESTINO = "Banco Nacional de Costa Rica";

// ============================================================
// Tipos
// ============================================================
interface Donacion {
  id: string;
  monto: number;
  destino: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA" | "CONFIRMADA";
  comprobante_url: string | null;
  created_at: string;
  estudiante_nombre?: string | null;
  proyecto_titulo?: string | null;
}

interface ProyectoEstudiantil {
  id: string;
  nombre: string;
  carrera: string;
  descripcion: string;
  avance: number;
  montoObjetivo: number;
  montoObjetivoUsd?: number;
  montoRecaudado: number;
}

type MetodoPago = "SINPE" | "TRANSFERENCIA";

const BADGE_STATUS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDIENTE: {
    label: "En revisión",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  APROBADA: {
    label: "Aprobada",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  CONFIRMADA: {
    label: "Confirmada",
    className: "bg-green-100 text-green-700 border-green-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  RECHAZADA: {
    label: "Rechazada",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

// ============================================================
// Modal de donación
// ============================================================
function DonacionModal({
  proyecto,
  exalumnoId,
  onClose,
  onSuccess,
}: {
  proyecto: ProyectoEstudiantil;
  exalumnoId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [monto, setMonto] = useState("");
  const [moneda, setMoneda] = useState<"CRC" | "USD">("CRC");
  const [motivo, setMotivo] = useState("");
  const [frecuencia, setFrecuencia] = useState("Única");
  const [contacto, setContacto] = useState("");
  const [condiciones, setCondiciones] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("SINPE");
  const [fechaTransferencia, setFechaTransferencia] = useState("");
  const [numeroReferencia, setNumeroReferencia] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5MB.");
      return;
    }
    setError(null);
    setArchivo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto.replace(/,/g, ""));
    if (!montoNum || montoNum <= 0) {
      setError("Ingresa un monto válido mayor a 0.");
      return;
    }
    if (!fechaTransferencia) {
      setError("Indica la fecha y hora en que realizaste la transferencia.");
      return;
    }
    if (!archivo) {
      setError("Adjunta el comprobante de la transferencia (imagen o PDF).");
      return;
    }
    setUploading(true);
    try {
      // 1. Subir el comprobante a Cloudinary (imagen o PDF).
      const formData = new FormData();
      formData.append("file", archivo);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "imagenes");
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dd69q4ba3";
      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      if (!upRes.ok) throw new Error("No se pudo subir el comprobante. Intenta de nuevo.");
      const upData = await upRes.json();
      const comprobanteUrl = upData.secure_url as string;

      const destinoFormat = `Proyecto: ${proyecto.nombre}
Frecuencia: ${frecuencia}
Contacto preferido: ${contacto || 'No especificado'}
Motivo: ${motivo.trim() || 'No especificado'}
Condiciones: ${condiciones.trim() || 'Ninguna'}`;

      // 2. Registrar la donación con los datos de la transferencia. El backend
      //    dispara la verificación OCR en n8n (si está configurado).
      const res = await fetch("/api/donaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exalumnoId,
          monto: montoNum,
          moneda,
          comprobanteUrl,
          destino: destinoFormat,
          metodoPago: metodo === "SINPE" ? "sinpe" : "transferencia_bancaria",
          fechaTransferencia: new Date(fechaTransferencia).toISOString(),
          numeroReferencia: numeroReferencia.trim() || null,
          proyectoEstudianteId: proyecto.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al registrar la donación");
      }

      setEnviado(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error inesperado");
    } finally {
      setUploading(false);
    }
  };

  if (enviado) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">¡Comprobante recibido!</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Tu donación y comprobante fueron enviados. El sistema verificará automáticamente los datos y el administrador confirmará la donación.
          </p>
          <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50 text-sm px-4 py-2">
            <Clock className="w-4 h-4 mr-1.5" />
            Estado: En revisión
          </Badge>
          <Button onClick={onClose} className="w-full mt-6 bg-primary dark:bg-sky-600 hover:bg-primary/90 dark:hover:bg-sky-700 text-primary-foreground">
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Solicitar Donación</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">Proyecto: {proyecto.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Monto + Moneda */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Monto donado <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-slate-400 dark:text-slate-500 font-semibold text-sm">{moneda === "CRC" ? "₡" : "$"}</span>
                <Input
                  type="number"
                  min="1"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                  className="pl-8 h-11 text-lg font-semibold bg-white dark:bg-slate-950 dark:border-slate-800"
                  required
                />
              </div>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as "CRC" | "USD")}
                className="h-11 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-[#0f4c81]"
              >
                <option value="CRC">CRC ₡</option>
                <option value="USD">USD $</option>
              </select>
            </div>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de donación
            </label>
            <div className="flex gap-4">
              {["Única", "Mensual", "Anual"].map((tipo) => (
                <label key={tipo} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frecuencia"
                    value={tipo}
                    checked={frecuencia === tipo}
                    onChange={(e) => setFrecuencia(e.target.value)}
                    className="text-ucr-celeste focus:ring-ucr-celeste"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Mensaje para el estudiante <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={300}
              placeholder="Ej. Me parece una excelente iniciativa de impacto social..."
              className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800"
              rows={2}
            />
          </div>

          {/* Contacto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Medio de contacto preferido (Opcional)
            </label>
            <Input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Ej. mi.correo@ejemplo.com o +506 8888-8888"
              className="h-11 bg-white dark:bg-slate-950 dark:border-slate-800"
            />
            <p className="text-xs text-slate-500 mt-1">Para que el estudiante o administrador te contacte y finalice la transacción.</p>
          </div>

          {/* Condiciones */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Condiciones o comentarios adicionales (Opcional)
            </label>
            <textarea
              value={condiciones}
              onChange={(e) => setCondiciones(e.target.value)}
              placeholder="Ej. Quiero donar equipo en lugar de dinero, solicito anonimato, etc."
              className="w-full flex min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:border-slate-800"
              rows={2}
            />
          </div>

          {/* ── Datos de la transferencia (RF-07) + comprobante ────────────── */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Datos de tu transferencia</p>

            {/* Método de pago */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Método de pago <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([["SINPE", "SINPE Móvil", Smartphone], ["TRANSFERENCIA", "Transferencia (IBAN)", CreditCard]] as const).map(([val, label, Icon]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMetodo(val)}
                    className={`min-h-[44px] py-2 px-2 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all ${
                      metodo === val
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-[#0f4c81]/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instrucciones de pago */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transfiere el monto a la Fundación y luego adjunta el comprobante:</p>
              {metodo === "SINPE" ? (
                <p className="font-mono font-semibold text-[#0f4c81] dark:text-sky-400">SINPE Móvil: {SINPE_NUMERO}</p>
              ) : (
                <p className="font-mono font-semibold text-[#0f4c81] dark:text-sky-400">{BANCO_DESTINO} · IBAN: {IBAN_DESTINO}</p>
              )}
            </div>

            {/* Fecha y referencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fecha y hora de la transferencia <span className="text-red-500">*</span></label>
                <Input
                  type="datetime-local"
                  value={fechaTransferencia}
                  onChange={(e) => setFechaTransferencia(e.target.value)}
                  className="h-11 bg-white dark:bg-slate-950 dark:border-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Número de referencia <span className="font-normal text-slate-400">(opcional)</span></label>
                <Input
                  value={numeroReferencia}
                  onChange={(e) => setNumeroReferencia(e.target.value)}
                  placeholder="Ej. 88123456"
                  className="h-11 bg-white dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Comprobante */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Comprobante (imagen o PDF, máx. 5MB) <span className="text-red-500">*</span></label>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              />
              {archivo && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {archivo.name}
                </p>
              )}
              <p className="text-xs text-slate-500 mt-1">El sistema leerá tu comprobante y verificará que coincida con estos datos.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={uploading}
            className="w-full h-12 bg-primary dark:bg-sky-600 hover:bg-primary/90 dark:hover:bg-sky-700 text-primary-foreground font-semibold text-base"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Subiendo comprobante...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Enviar donación y comprobante
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Página principal
// ============================================================


export default function DonacionesPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  const userName = session?.user?.name || "Usuario";

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ProyectoEstudiantil | null>(null);
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [proyectos, setProyectos] = useState<ProyectoEstudiantil[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const fetchDonaciones = async () => {
    if (!userId || (role !== "EXALUMNO" && role !== "ADMIN")) return;
    setLoadingDonaciones(true);
    try {
      const res = await fetch("/api/donaciones/mis-donaciones");
      if (res.ok) {
        const data: Donacion[] = await res.json();
        setDonaciones(data);
      }
    } catch (err) {
      console.error("Error al cargar donaciones:", err);
    } finally {
      setLoadingDonaciones(false);
    }
  };

  useEffect(() => {
    fetchDonaciones();
    async function loadProyectos() {
      try {
        const data = await getStudentProjects();
        setProyectos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProyectos(false);
      }
    }
    loadProyectos();
  }, [userId, role]);

  if (status === "loading") {
    return (
      <ParallaxBackground className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0f4c81] dark:text-fu-blue-sky animate-spin" />
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground className="min-h-screen">

      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* ====== VISTA PARA ESTUDIANTES ====== */}
        {(!session || role === "ESTUDIANTE") && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl shadow-sm mb-2">
              🎓
            </div>
            <h1 className="text-4xl font-extrabold text-[#0f4c81]">
              Impulsa tu Proyecto de Graduación
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Hola {userName}, los exalumnos están dispuestos a apoyar el talento de la UCR.
              Postula tu proyecto para recibir apoyo financiero.
            </p>
            <div className="pt-4">
              <StudentApplicationModal />
            </div>
            <MyApplicationsList />
          </div>
        )}

        {/* ====== VISTA PARA EXALUMNOS ====== */}
        {(role === "EXALUMNO" || role === "ADMIN") && (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <p className="text-xs font-bold text-[#0f4c81] dark:text-fu-blue-sky tracking-wider uppercase mb-1">
                Comunidad UCR · Donaciones
              </p>
              <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">
                Apoya Proyectos Estudiantiles
              </AnimatedHeading>
              <p className="fu-text-2 mt-1">
                Tu donación impulsa el talento y la investigación de la UCR.
              </p>
            </motion.div>

            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProyectos ? (
                <div className="col-span-full text-center py-10 fu-muted">Cargando proyectos...</div>
              ) : proyectos.length === 0 ? (
                <div className="col-span-full flex flex-col items-center py-10 text-center">
                  <SunflowerImage size={220} />
                  <p className="fu-text-2 mt-4">No hay proyectos buscando financiamiento en este momento.</p>
                </div>
              ) : proyectos.map((proyecto, i) => (
                <motion.div
                  key={proyecto.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.06, ease: [0.25, 1, 0.5, 1] }}
                  whileHover={{ y: -6 }}
                  className="h-full"
                >
                  <Card className="h-full flex flex-col bg-white dark:bg-slate-900 border-border dark:border-slate-800 shadow-sm hover:shadow-fu-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                            {proyecto.nombre}
                          </CardTitle>
                          <p className="text-xs text-[#0f4c81] dark:text-sky-400 font-semibold mt-1">{proyecto.carrera}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex flex-col flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{proyecto.descripcion}</p>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-400 dark:text-slate-500">Avance del proyecto</span>
                          <span className="font-bold text-[#0f4c81] dark:text-sky-400">{proyecto.avance}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-[#005da4] to-[#00c0f3] h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${proyecto.avance}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {proyecto.montoObjetivo > 0 && (
                        <FundingProgressBar
                          objetivo={proyecto.montoObjetivo}
                          objetivoUsd={proyecto.montoObjetivoUsd}
                          recaudado={proyecto.montoRecaudado}
                          variant="donor"
                        />
                      )}

                      <Button
                        onClick={() => setProyectoSeleccionado(proyecto)}
                        className="w-full mt-auto text-white shiny-button bg-gradient-to-r from-[#0f4c81] to-[#00c0f3] hover:opacity-95"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Solicitar donar a este proyecto
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Historial de donaciones */}
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0f4c81] dark:text-sky-400" />
                Historial de donaciones del exalumno
              </h2>

              {loadingDonaciones ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-6">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Cargando historial...
                </div>
              ) : donaciones.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    📋
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Aún no has realizado donaciones. ¡Apoya un proyecto estudiantil!
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Monto</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Proyecto/Estudiante</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Fecha</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Comprobante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {donaciones.map((d) => {
                          const statusInfo = BADGE_STATUS[d.estado] || BADGE_STATUS["PENDIENTE"];
                          return (
                            <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                                ₡{d.monto.toLocaleString("es-CR")}
                              </td>
                              <td className="px-4 py-3">
                                <div className="max-w-[220px] truncate">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.proyecto_titulo || d.destino}</p>
                                  {d.estudiante_nombre && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Estudiante: {d.estudiante_nombre}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {d.created_at ? new Date(d.created_at).toLocaleDateString("es-CR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }) : "-"}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={`inline-flex items-center gap-1 ${statusInfo.className}`}
                                >
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                {d.comprobante_url ? (
                                  <a
                                    href={d.comprobante_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#0f4c81] dark:text-sky-400 hover:underline text-xs font-medium"
                                  >
                                    Ver →
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400">Pendiente</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de donación */}
      {proyectoSeleccionado && userId && (
        <DonacionModal
          proyecto={proyectoSeleccionado}
          exalumnoId={userId}
          onClose={() => setProyectoSeleccionado(null)}
          onSuccess={() => {
            setProyectoSeleccionado(null);
            fetchDonaciones();
          }}
        />
      )}
    </ParallaxBackground>
  );
}
