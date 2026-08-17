"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, Check, X, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { aceptarMatch, rechazarMatch } from "@/actions/matching.actions";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  url?: string;
  isMockRoute?: boolean;
  type?: string;
  matchId?: string | null;
  actionable?: boolean;
  rejectedBy?: "estudiante" | "exalumno";
}

export function NotificationsDropdown() {
  const { status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  const [notificationsState, setNotificationsState] = useState<Notification[]>([]);
  const [actioningIds, setActioningIds] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    if (status === "unauthenticated") return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotificationsState(data);
      } else if (res.status === 401) {
        // Ignorar si no está autorizado
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (status === "authenticated") {
      fetchNotifications();
    }
    const interval = setInterval(() => {
      if (status === "authenticated") fetchNotifications();
    }, 10000);

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isOpen && status === "authenticated") fetchNotifications();
  }, [isOpen, status]);

  useEffect(() => {
    if (showAllModal || infoModalMessage !== "") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showAllModal, infoModalMessage]);

  const unreadCount = notificationsState.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotificationsState(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    setNotificationsState(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const removeNotification = (id: string) => {
    setNotificationsState(prev => prev.filter(n => n.id !== id));
  };

  const isActioning = (id: string) => actioningIds.indexOf(id) !== -1;

  const addActioning = (id: string) => {
    setActioningIds(prev => prev.concat(id));
  };

  const removeActioning = (id: string) => {
    setActioningIds(prev => prev.filter(x => x !== id));
  };

  const handleAccept = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!notification.matchId || isActioning(notification.id)) return;

    addActioning(notification.id);
    try {
      await aceptarMatch(notification.matchId);
      await markAsRead(notification.id);
      removeNotification(notification.id);
      setIsOpen(false);
      setShowAllModal(false);
      router.push(`/mensajes?matchId=${notification.matchId}`);
    } catch (err) {
      console.error("Error al aceptar match:", err);
    } finally {
      removeActioning(notification.id);
    }
  };

  const handleReject = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    if (!notification.matchId || !notification.rejectedBy || isActioning(notification.id)) return;

    addActioning(notification.id);
    try {
      await rechazarMatch(notification.matchId, notification.rejectedBy);
      await markAsRead(notification.id);
      removeNotification(notification.id);
    } catch (err) {
      console.error("Error al rechazar match:", err);
    } finally {
      removeActioning(notification.id);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id);

    if (notification.url) {
      if (notification.isMockRoute) {
        setInfoModalMessage("Esta notificación es un ejemplo de prueba. La navegación estará disponible cuando exista información real.");
        setIsOpen(false);
      } else {
        router.push(notification.url);
        setIsOpen(false);
        setShowAllModal(false);
      }
    } else {
      setInfoModalMessage("El contenido asociado a esta notificación ya no está disponible.");
      setIsOpen(false);
    }
  };

  const renderActionButtons = (notification: Notification, compact = false) => {
    if (!notification.actionable || !notification.matchId) return null;
    const acting = isActioning(notification.id);
    return (
      <div
        className={`flex gap-2 ${compact ? "mt-2 pt-2" : "mt-3 pt-3"} border-t border-slate-100`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={e => handleAccept(e, notification)}
          disabled={acting}
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-blue-800 disabled:opacity-50 transition-colors font-medium"
        >
          {acting ? (
            <span className="inline-block h-3 w-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <MessageCircle className="h-3 w-3" />
              Aceptar y chatear
            </>
          )}
        </button>
        <button
          onClick={e => handleReject(e, notification)}
          disabled={acting}
          className="flex-1 text-xs py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors font-medium"
        >
          Rechazar
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          className="text-muted-foreground hover:text-foreground relative p-1 rounded-full hover:bg-slate-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {isClient && unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-[9999]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-sm">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#0f4c81] hover:text-blue-800 font-medium transition-colors"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificationsState.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No tienes notificaciones pendientes.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {notificationsState.map(notification => (
                    <div
                      key={notification.id}
                      className={`relative p-4 flex flex-col gap-1 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-50/30 hover:bg-blue-50/50" : "bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => !notification.actionable && handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <p className={`text-sm truncate ${!notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                                {notification.title}
                              </p>
                              {notification.isMockRoute && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 border border-slate-200 shrink-0">
                                  Datos de prueba
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                              {notification.time}
                            </span>
                          </div>
                          <p className={`text-xs line-clamp-2 ${!notification.read ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && !notification.actionable && (
                          <button
                            onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="mt-1 h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-blue-100/50 text-[#0f4c81] hover:bg-primary hover:text-primary-foreground transition-all z-10 relative"
                            title="Marcar como leída"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {renderActionButtons(notification, true)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notificationsState.length > 0 && (
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <button
                  onClick={() => { setIsOpen(false); setShowAllModal(true); }}
                  className="text-xs text-[#0f4c81] hover:text-blue-800 font-semibold transition-colors"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Ver Todas Las Notificaciones */}
      {isClient && showAllModal && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative z-[100000]">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50/50">
              <h2 className="text-xl font-bold text-[#0f4c81]">Todas las notificaciones</h2>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-[#0f4c81] hover:text-blue-800 font-medium transition-colors"
                  >
                    Marcar todas leídas
                  </button>
                )}
                <button
                  onClick={() => setShowAllModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                  aria-label="Cerrar modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
              {notificationsState.length === 0 ? (
                <div className="text-center text-slate-500 py-12 bg-white rounded-lg border border-slate-100 shadow-sm">
                  No hay notificaciones en tu historial.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {notificationsState.map(notification => (
                    <div
                      key={`modal-${notification.id}`}
                      className={`relative p-5 rounded-lg border flex flex-col gap-1 transition-all cursor-pointer ${
                        !notification.read
                          ? "bg-blue-50/40 border-blue-100 hover:bg-blue-50/60 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                      onClick={() => !notification.actionable && handleNotificationClick(notification)}
                    >
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <div className="flex items-center gap-3 truncate">
                              <p className={`text-base truncate ${!notification.read ? "font-bold text-[#0f4c81]" : "font-semibold text-slate-700"}`}>
                                {notification.title}
                              </p>
                              {notification.isMockRoute && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 shrink-0">
                                  Datos de prueba
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-1">
                              {notification.time}
                            </span>
                          </div>
                          <p className={`text-sm ${!notification.read ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && !notification.actionable && (
                          <button
                            onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="mt-1 h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-blue-100 text-[#0f4c81] hover:bg-primary hover:text-primary-foreground transition-all z-10 relative"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {renderActionButtons(notification, false)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Informativo para Rutas Mock */}
      {isClient && infoModalMessage !== "" && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative z-[100000]">
            <div className="flex items-center justify-between p-5 border-b bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#0f4c81]">Aviso</h2>
              <button
                onClick={() => setInfoModalMessage("")}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
                aria-label="Cerrar aviso"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 text-center text-slate-600 text-sm font-medium">
              <p>{infoModalMessage}</p>
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setInfoModalMessage("")}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
