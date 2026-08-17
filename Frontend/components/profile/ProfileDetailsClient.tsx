"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Linkedin,
  Github,
  Globe,
  UserPlus,
  Check,
  X,
  Loader2,
  ArrowLeft,
  Calendar,
  Award,
  Flag,
  FolderOpen,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

interface ProfileDetailsClientProps {
  exalumno: any;
  currentUser: any;
  accessToken?: string;
  apiUrl: string;
}

export function ProfileDetailsClient({ exalumno, currentUser, accessToken, apiUrl }: ProfileDetailsClientProps) {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<string>(exalumno.connectionStatus || "none");
  const [connectionId, setConnectionId] = useState<string | null>(exalumno.connectionId || null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  const user = exalumno.User || {};
  const isOwnProfile = currentUser?.id === user.id;
  const isEstudianteProfile = exalumno.tipo === "ESTUDIANTE";

  // ── Reportar perfil (RF-09 / T-53) ──────────────────────────────────────────
  const MOTIVOS_REPORTE = [
    "Perfil falso o suplantación de identidad",
    "Información engañosa o incoherente",
    "Contenido inapropiado u ofensivo",
    "Spam o publicidad no solicitada",
    "Acoso o comportamiento abusivo",
    "Otro",
  ];
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState(MOTIVOS_REPORTE[0]);
  const [reportDesc, setReportDesc] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const submitReport = async () => {
    if (reportSubmitting) return;
    setReportSubmitting(true);
    try {
      const motivo = reportDesc.trim()
        ? `${reportReason} — ${reportDesc.trim()}`
        : reportReason;
      const res = await fetch(`${apiUrl}/reportes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportadoId: user.id, motivo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setShowReport(false);
          Swal.fire({ title: "Ya reportaste este perfil", text: "Tu reporte anterior sigue registrado.", icon: "info", confirmButtonColor: "#006AD3" });
          return;
        }
        throw new Error(data.message || "No se pudo enviar el reporte.");
      }
      setShowReport(false);
      setReportDesc("");
      setReportReason(MOTIVOS_REPORTE[0]);
      Swal.fire({
        title: "Reporte enviado",
        text: "Gracias. El equipo de la Fundación revisará este perfil. Tu identidad se mantiene anónima.",
        icon: "success",
        confirmButtonColor: "#006AD3",
      });
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err.message || "Ocurrió un error.", icon: "error", confirmButtonColor: "#006AD3" });
    } finally {
      setReportSubmitting(false);
    }
  };

// Define the type for support tags
interface SupportType {
  label: string;
  color: string;
}

// Map offers of support to tags
const supportTypes: SupportType[] = [];
if (exalumno.ofrece_mentoria)       supportTypes.push({ label: "Mentoría",          color: "bg-blue-50 text-blue-700 border-blue-200" });
if (exalumno.ofrece_empleo)         supportTypes.push({ label: "Empleo",             color: "bg-emerald-50 text-emerald-700 border-emerald-200" });
if (exalumno.ofrece_pasantia)       supportTypes.push({ label: "Pasantía",           color: "bg-sky-50 text-sky-700 border-sky-200" });
if (exalumno.ofrece_proyecto)       supportTypes.push({ label: "Proyecto Empresarial", color: "bg-teal-50 text-teal-700 border-teal-200" });
if (exalumno.ofrece_donacion_dinero) supportTypes.push({ label: "Donación Económica", color: "bg-green-50 text-green-700 border-green-200" });
if (exalumno.ofrece_guest_speaking) supportTypes.push({ label: "Charla / Conferencia", color: "bg-purple-50 text-purple-700 border-purple-200" });
if (exalumno.ofrece_volunteering)   supportTypes.push({ label: "Voluntariado",       color: "bg-amber-50 text-amber-700 border-amber-200" });
if (exalumno.ofrece_career_advice)  supportTypes.push({ label: "Orientación Profesional", color: "bg-indigo-50 text-indigo-700 border-indigo-200" });
if (exalumno.ofrece_networking)     supportTypes.push({ label: "Networking",         color: "bg-rose-50 text-rose-700 border-rose-200" });

  // Parse structured data safely
  const parseJsonData = (data: any) => {
    if (!data) return [];
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  };

  const experiences = parseJsonData(exalumno.experiencia_laboral);
  const skills = parseJsonData(exalumno.habilidades);
  const certifications = parseJsonData(exalumno.certificaciones);

  // Manage Connection Request Flow
  const handleConnectAction = async () => {
    if (!currentUser) {
      // User is not authenticated: Show sweet alert warning and redirect
      Swal.fire({
        title: "¡Autenticación requerida!",
        text: "Debes iniciar sesión para conectar con otros exalumnos.",
        icon: "warning",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#006AD3",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#64748b"
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/login?callbackUrl=/perfil/${user.id}`);
        }
      });
      return;
    }

    if (isActionLoading) return;
    setIsActionLoading(true);

    try {
      if (connectionStatus === "none" || connectionStatus === "cancelled" || connectionStatus === "rejected") {
        // Send a request
        const res = await fetch(`${apiUrl}/connections`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ receiver_id: user.id })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Error al enviar la solicitud.");
        }

        setConnectionStatus("pending");
        setConnectionId(data.id);

        Swal.fire({
          title: "¡Solicitud Enviada!",
          text: `Se ha enviado tu solicitud de contacto a ${user.nombre}.`,
          icon: "success",
          confirmButtonColor: "#006AD3"
        });
      } else if (connectionStatus === "pending") {
        // If pending, we can cancel it
        if (!connectionId) return;

        // Verify if we are the sender
        const isSender = exalumno.connectionSenderId ? exalumno.connectionSenderId === currentUser.id : true;

        if (isSender) {
          const res = await fetch(`${apiUrl}/connections/${connectionId}/cancel`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al cancelar la solicitud.");
          }

          setConnectionStatus("cancelled");
          Swal.fire({
            title: "Solicitud Cancelada",
            text: "La solicitud de conexión ha sido cancelada.",
            icon: "info",
            confirmButtonColor: "#006AD3"
          });
        } else {
          // We are the receiver: Accept it directly!
          const res = await fetch(`${apiUrl}/connections/${connectionId}/accept`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al aceptar la solicitud.");
          }

          setConnectionStatus("accepted");
          Swal.fire({
            title: "¡Conexión Aceptada!",
            text: `Ahora estás conectado con ${user.nombre}.`,
            icon: "success",
            confirmButtonColor: "#006AD3"
          });
        }
      } else if (connectionStatus === "accepted") {
        // Delete/Disconnect
        if (!connectionId) return;

        Swal.fire({
          title: "¿Eliminar conexión?",
          text: `¿Estás seguro de que quieres eliminar a ${user.nombre} de tus conexiones?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          confirmButtonColor: "#dc2626",
          cancelButtonText: "Cancelar",
          cancelButtonColor: "#64748b"
        }).then(async (result) => {
          if (result.isConfirmed) {
            setIsActionLoading(true);
            try {
              const res = await fetch(`${apiUrl}/connections/${connectionId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });

              if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al eliminar la conexión.");
              }

              setConnectionStatus("none");
              setConnectionId(null);
              Swal.fire({
                title: "Conexión Eliminada",
                text: "Has eliminado esta conexión.",
                icon: "success",
                confirmButtonColor: "#006AD3"
              });
            } catch (err: any) {
              Swal.fire({
                title: "Error",
                text: err.message,
                icon: "error",
                confirmButtonColor: "#006AD3"
              });
            } finally {
              setIsActionLoading(false);
            }
          }
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message || "Ocurrió un error al procesar tu solicitud.",
        icon: "error",
        confirmButtonColor: "#006AD3"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Render the connect button states
  const renderConnectButton = () => {
    if (isOwnProfile) {
      return (
        <Button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200">
          Tu Perfil
        </Button>
      );
    }

    if (isActionLoading) {
      return (
        <Button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-ucr-celeste-medium" />
          Procesando...
        </Button>
      );
    }

    const isSender = exalumno.connectionSenderId ? exalumno.connectionSenderId === currentUser?.id : true;

    switch (connectionStatus) {
      case "accepted":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all">
            <Check className="mr-2 h-4 w-4" />
            Conectado
          </Button>
        );
      case "pending":
        return (
          <Button onClick={handleConnectAction} variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold transition-all">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSender ? "Pendiente (Cancelar)" : "Aceptar Conexión"}
          </Button>
        );
      case "rejected":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold transition-all">
            <X className="mr-2 h-4 w-4" />
            Solicitud Rechazada (Reintentar)
          </Button>
        );
      case "cancelled":
        return (
          <Button onClick={handleConnectAction} className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white font-semibold transition-all">
            <UserPlus className="mr-2 h-4 w-4" />
            Conectar
          </Button>
        );
      default:
        return (
          <Button onClick={handleConnectAction} className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white font-semibold transition-all">
            <UserPlus className="mr-2 h-4 w-4" />
            Connect
          </Button>
        );
    }
  };

  return (
    <ParallaxBackground className="min-h-screen pb-12">
      {/* Top Banner and Back button */}
      <div className="fu-hero-gradient animate-fu-gradient border-b border-white/10 text-white py-4 px-4 md:px-12 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-200 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al directorio
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{isEstudianteProfile ? "Perfil de Estudiante" : "Perfil de Exalumno"}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Card: Main Details */}
        <motion.div
          className="w-full lg:w-1/3 shrink-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        >
          <div className="fu-card p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 fu-hero-gradient animate-fu-gradient"></div>

            <motion.div
              className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-md mt-8 z-10 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <img
                src={user.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre || "Exalumno")}&background=random`}
                alt={user.nombre}
                className="h-full w-full object-cover"
              />
            </motion.div>

            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-2xl mt-4 leading-tight">{user.nombre}</AnimatedHeading>
            <p className="text-sm font-semibold text-ucr-celeste-medium mt-1">{exalumno.cargo_actual || "Profesional"} en {exalumno.empresa_actual || "Empresa"}</p>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 pb-4 border-b border-slate-100 w-full justify-center">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <span>{exalumno.carrera} ({exalumno.anio_graduacion})</span>
            </div>

            <div className="w-full space-y-3 mt-4 text-left text-sm text-slate-600">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span>{exalumno.pais_ciudad || "Costa Rica"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full mt-6 space-y-3">
              {renderConnectButton()}

              {/* Reportar perfil — visible para usuarios autenticados que no sean el dueño */}
              {currentUser && !isOwnProfile && (
                <Button
                  variant="outline"
                  onClick={() => setShowReport(true)}
                  className="w-full border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium transition-all"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Reportar perfil
                </Button>
              )}

              <div className="flex gap-3 justify-center pt-2">
                {exalumno.linkedin_url && (
                  <a href={exalumno.linkedin_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#0077b5] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {exalumno.github_url && (
                  <a href={exalumno.github_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#24292e] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {exalumno.website_url && (
                  <a href={exalumno.website_url} target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-ucr-celeste-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Supports Card */}
          {supportTypes.length > 0 && (
            <div className="fu-card p-6 mt-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm tracking-wide mb-4 uppercase">Tipos de apoyo que ofrece</h3>
              <div className="flex flex-wrap gap-2.5">
                {supportTypes.map((sup, idx) => (
                  <span key={idx} className={`px-3 py-1.5 border rounded-full text-xs font-semibold ${sup.color}`}>
                    {sup.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right Section: Detailed professional info */}
        <div className="flex-1 space-y-6 animate-fu-fade-up">

          {/* Proyecto de Graduación — solo para perfiles de estudiante */}
          {isEstudianteProfile && (
            <div className="fu-card p-6 md:p-8 transition-colors duration-300">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-ucr-celeste-medium" />
                Proyecto de Graduación
              </h2>

              {exalumno.proyecto_titulo ? (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-snug">{exalumno.proyecto_titulo}</h3>
                    {exalumno.proyecto_tipo && (
                      <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-ucr-celeste-tint dark:bg-sky-900/40 text-ucr-celeste-medium dark:text-sky-400">
                        {exalumno.proyecto_tipo}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4">
                    {exalumno.proyecto_descripcion || "El estudiante aún no ha agregado una descripción de su proyecto."}
                  </p>
                  {typeof exalumno.proyecto_porcentaje_avance === "number" && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-slate-500 dark:text-slate-400">Avance del proyecto</span>
                        <span className="text-ucr-celeste-medium font-bold">{exalumno.proyecto_porcentaje_avance}%</span>
                      </div>
                      <Progress value={exalumno.proyecto_porcentaje_avance} tone="#005da4" />
                    </div>
                  )}
                  <Link href={`/proyectos/${user.id}`}>
                    <Button className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white font-semibold">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Abrir proyecto completo
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-slate-500 text-sm italic">Este estudiante aún no ha registrado su proyecto de graduación.</p>
              )}
            </div>
          )}

          {/* Biography */}
          <div className="fu-card p-6 md:p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3 mb-4">Biografía Profesional</h2>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">
              {exalumno.biografia || "El exalumno no ha registrado una biografía profesional todavía."}
            </p>
          </div>

          {/* Work Experience */}
          <div className="fu-card p-6 md:p-8 transition-colors duration-300">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-ucr-celeste-medium" />
              Experiencia Laboral
            </h2>
            
            {experiences.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Sin experiencia laboral registrada.</p>
            ) : (
              <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
                {experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[5.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-ucr-celeste-medium"></div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">{exp.cargo || exp.titulo}</h4>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{exp.empresa || exp.organizacion}</p>
                      </div>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-semibold self-start md:self-auto flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {exp.anio_inicio || exp.periodo || "N/A"} {exp.anio_fin ? `- ${exp.anio_fin}` : ""}
                      </span>
                    </div>
                    {exp.descripcion && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 leading-relaxed">{exp.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Skills */}
            <div className="fu-card p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg border-b dark:border-slate-800 pb-2 mb-4">Habilidades</h3>
              {skills.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Sin habilidades registradas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, idx: number) => {
                    // Los estudiantes guardan habilidades como { skill, level }; los
                    // exalumnos, como texto simple. Se soportan ambos formatos.
                    const label = typeof skill === "string" ? skill : skill?.skill ?? String(skill ?? "");
                    const level = typeof skill === "object" ? skill?.level : null;
                    return (
                      <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-0 py-1.5 px-3 rounded-lg text-xs font-semibold">
                        {label}{level ? ` · ${level}` : ""}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="fu-card p-6 transition-colors duration-300">
              <h3 className="font-bold text-slate-800 dark:text-white text-lg border-b dark:border-slate-800 pb-2 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-ucr-celeste-medium" />
                Certificaciones
              </h3>
              {certifications.length === 0 ? (
                <p className="text-slate-500 text-sm italic">Sin certificaciones registradas.</p>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="p-1.5 bg-ucr-celeste-tint rounded-lg text-ucr-celeste-medium shrink-0 mt-0.5">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cert.nombre}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{cert.institucion} {cert.anio ? `(${cert.anio})` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── Modal: Reportar perfil ─────────────────────────────────────────── */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => !reportSubmitting && setShowReport(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Flag className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Reportar perfil</h3>
                <p className="text-xs text-slate-500">{user.nombre}</p>
              </div>
              <button onClick={() => !reportSubmitting && setShowReport(false)} className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" aria-label="Cerrar">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Motivo</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                >
                  {MOTIVOS_REPORTE.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción (opcional)</label>
                <textarea
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Cuéntanos más detalles del problema..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none"
                />
              </div>
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                Tu reporte es anónimo. La persona reportada no sabrá quién la reportó.
              </p>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReport(false)} disabled={reportSubmitting} className="text-sm">
                Cancelar
              </Button>
              <Button onClick={submitReport} disabled={reportSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-sm">
                {reportSubmitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Flag className="w-4 h-4 mr-1.5" />}
                {reportSubmitting ? "Enviando..." : "Enviar reporte"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ParallaxBackground>
  );
}
