"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  UserCheck, 
  UserX, 
  Send, 
  Users, 
  Loader2, 
  Clock, 
  ExternalLink, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

export default function MisConexionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [activeConnections, setActiveConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/mis-conexiones");
    }
  }, [status, router]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      // 1. Pending Received
      const resPending = await fetch(`/api/connections/pending`);
      if (resPending.ok) {
        setPendingReceived(await resPending.json());
      }

      // 2. Sent
      const resSent = await fetch(`/api/connections/sent`);
      if (resSent.ok) {
        // filter down to only pending sent to separate clearly from accepted connections
        const allSent = await resSent.json();
        setSentRequests(allSent.filter((c: any) => c.status === "pending"));
      }

      // 3. Active Connections
      const resActive = await fetch(`/api/connections/active`);
      if (resActive.ok) {
        setActiveConnections(await resActive.json());
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConnections();
    }
  }, [userId]);

  const handleAccept = async (id: string, senderName: string) => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/connections/${id}/accept`, {
        method: "PUT",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al aceptar solicitud");
      }

      Swal.fire({
        title: "¡Conexión Aceptada!",
        text: `Ahora estás conectado con ${senderName}.`,
        icon: "success",
        confirmButtonColor: "#006AD3"
      });
      
      // Refresh
      fetchConnections();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string, senderName: string) => {
    Swal.fire({
      title: "¿Rechazar solicitud?",
      text: `¿Estás seguro de que quieres rechazar la solicitud de ${senderName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#64748b"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoadingId(id);
        try {
          const res = await fetch(`/api/connections/${id}/reject`, {
            method: "PUT",
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al rechazar solicitud");
          }

          Swal.fire("Rechazada", "La solicitud ha sido rechazada.", "success");
          fetchConnections();
        } catch (error: any) {
          Swal.fire("Error", error.message, "error");
        } finally {
          setActionLoadingId(null);
        }
      }
    });
  };

  const handleCancel = async (id: string) => {
    Swal.fire({
      title: "¿Cancelar solicitud?",
      text: "¿Quieres cancelar esta solicitud de conexión enviada?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#64748b"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoadingId(id);
        try {
          const res = await fetch(`/api/connections/${id}/cancel`, {
            method: "PUT",
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al cancelar solicitud");
          }

          Swal.fire("Cancelada", "Tu solicitud ha sido cancelada.", "success");
          fetchConnections();
        } catch (error: any) {
          Swal.fire("Error", error.message, "error");
        } finally {
          setActionLoadingId(null);
        }
      }
    });
  };

  const handleDelete = async (id: string, contactName: string) => {
    Swal.fire({
      title: "¿Eliminar conexión?",
      text: `¿Estás seguro de que quieres desconectarte de ${contactName}? ya no aparecerán en tu red de contactos.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancelar",
      cancelButtonColor: "#64748b"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoadingId(id);
        try {
          const res = await fetch(`/api/connections/${id}`, {
            method: "DELETE",
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Error al eliminar conexión");
          }

          Swal.fire("Eliminado", "La conexión ha sido eliminada.", "success");
          fetchConnections();
        } catch (error: any) {
          Swal.fire("Error", error.message, "error");
        } finally {
          setActionLoadingId(null);
        }
      }
    });
  };

  if (status === "loading" || loading) {
    return (
      <ParallaxBackground className="min-h-screen">
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-ucr-celeste-medium dark:text-fu-blue-sky mb-4" />
          <p className="fu-text-2 font-medium text-sm">Cargando tus conexiones...</p>
        </div>
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl">Red de Networking</AnimatedHeading>
          <p className="fu-text-2 text-sm mt-1">Gestiona tus solicitudes de conexión y comunícate con otros profesionales de la UCR.</p>
        </motion.div>

        {/* Tab System */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl mb-6 max-w-md border border-slate-200/50">
            <TabsTrigger value="contacts" className="rounded-lg px-1.5 sm:px-3 py-2.5 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Contactos</span>
              {activeConnections.length > 0 && (
                <span className="bg-ucr-celeste-medium text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  {activeConnections.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="received" className="rounded-lg px-1.5 sm:px-3 py-2.5 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all">
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Recibidas</span>
              {pendingReceived.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  {pendingReceived.length}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="sent" className="rounded-lg px-1.5 sm:px-3 py-2.5 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all">
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Enviadas</span>
              {sentRequests.length > 0 && (
                <span className="bg-slate-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0">
                  {sentRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Contacts (Established Connections) */}
          <TabsContent value="contacts">
            {activeConnections.length === 0 ? (
              <Card className="p-6 sm:p-10 text-center border-slate-200/60 shadow-sm bg-white">
                <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg">Aún no tienes conexiones</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">Explora el directorio de exalumnos y envía solicitudes para expandir tu red profesional.</p>
                <Button onClick={() => router.push("/directorio/exalumnos")} className="mt-5 bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90">
                  Ver Directorio
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeConnections.map((conn, i) => {
                  // Figure out which user is the contact
                  const isSenderSelf = conn.sender_id === session?.user?.id;
                  const contactUser = isSenderSelf ? conn.Receiver : conn.Sender;
                  const alumniDetails = contactUser?.Exalumno || {};

                  return (
                    <motion.div
                      key={conn.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                    <Card className="p-4 border-slate-200 hover:border-ucr-celeste-medium/40 transition-all bg-white flex items-center gap-4 shadow-sm hover:shadow-fu-lg">
                      <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={contactUser.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contactUser.nombre || "Contacto")}&background=random`} 
                          alt={contactUser.nombre} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-base leading-tight truncate">{contactUser.nombre}</h4>
                        <p className="text-xs font-semibold text-ucr-celeste-medium truncate mt-0.5">
                          {alumniDetails.cargo_actual || "Profesional"} en {alumniDetails.empresa_actual || "Empresa"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{alumniDetails.carrera || "Exalumno"}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <LinkButton href={`/perfil/${contactUser.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </LinkButton>
                        <Button 
                          onClick={() => handleDelete(conn.id, contactUser.nombre)}
                          disabled={actionLoadingId === conn.id}
                          variant="outline" 
                          className="p-2 border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 text-slate-500 h-9"
                        >
                          {actionLoadingId === conn.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Received Pending Requests */}
          <TabsContent value="received">
            {pendingReceived.length === 0 ? (
              <Card className="p-6 sm:p-10 text-center border-slate-200/60 shadow-sm bg-white">
                <Clock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg">No tienes solicitudes pendientes</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">Cuando otros estudiantes o exalumnos soliciten conectar contigo, aparecerán aquí.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingReceived.map((req, i) => {
                  const senderUser = req.Sender || {};
                  const alumniDetails = senderUser.Exalumno || {};
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                    <Card className="p-4 border-slate-200 bg-white flex items-center gap-4 shadow-sm hover:shadow-fu-lg transition-shadow">
                      <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={senderUser.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderUser.nombre || "Remitente")}&background=random`} 
                          alt={senderUser.nombre} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-base leading-tight truncate">{senderUser.nombre}</h4>
                        <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                          {senderUser.tipo === "EXALUMNO" 
                            ? `${alumniDetails.cargo_actual || "Profesional"} en ${alumniDetails.empresa_actual || "Empresa"}`
                            : "Estudiante UCR"
                          }
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{alumniDetails.carrera || ""}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                        <Button 
                          onClick={() => handleAccept(req.id, senderUser.nombre)}
                          disabled={actionLoadingId === req.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 px-3 h-8 font-semibold"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Aceptar"
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleReject(req.id, senderUser.nombre)}
                          disabled={actionLoadingId === req.id}
                          variant="outline"
                          className="border-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs py-1.5 px-3 h-8 font-semibold"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Sent Pending Requests */}
          <TabsContent value="sent">
            {sentRequests.length === 0 ? (
              <Card className="p-6 sm:p-10 text-center border-slate-200/60 shadow-sm bg-white">
                <Send className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg">No has enviado solicitudes pendientes</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">Tus solicitudes enviadas que aún no han sido respondidas se listarán en esta pestaña.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests.map((req, i) => {
                  const receiverUser = req.Receiver || {};
                  const alumniDetails = receiverUser.Exalumno || {};
                  return (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                    <Card className="p-4 border-slate-200 bg-white flex items-center gap-4 shadow-sm hover:shadow-fu-lg transition-shadow">
                      <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={receiverUser.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverUser.nombre || "Destinatario")}&background=random`} 
                          alt={receiverUser.nombre} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-base leading-tight truncate">{receiverUser.nombre}</h4>
                        <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">
                          {receiverUser.tipo === "EXALUMNO" 
                            ? `${alumniDetails.cargo_actual || "Profesional"} en ${alumniDetails.empresa_actual || "Empresa"}`
                            : "Estudiante UCR"
                          }
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{alumniDetails.carrera || ""}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button 
                          onClick={() => handleCancel(req.id)}
                          disabled={actionLoadingId === req.id}
                          variant="outline"
                          className="border-slate-200 hover:bg-slate-50 text-slate-600 text-xs py-1.5 px-3 h-8 font-semibold"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Cancelar"
                          )}
                        </Button>
                      </div>
                    </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </ParallaxBackground>
  );
}

// Inline helper component for links using Button styling
function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Button 
      onClick={() => router.push(href)}
      variant="outline" 
      className="p-2 border-slate-200 hover:bg-slate-50 text-slate-500 h-9"
    >
      {children}
    </Button>
  );
}
