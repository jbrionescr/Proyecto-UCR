"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, User, MessageCircle, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedHeading } from "@/components/fu/AnimatedHeading";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  createdAt?: string;
  created_at?: string;
  sender?: { id: string; nombre: string; foto_url?: string };
};

type Conversation = {
  matchId: string;
  contactName: string;
  contactRole: string;
  avatarLetter: string;
};

const WA_PREFIX = "__whatsapp__:";

function WhatsAppIcon({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function formatPhone(digits: string) {
  if (digits.startsWith("506") && digits.length === 11) {
    return `+506 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length > 4) {
    return `+${digits.slice(0, digits.length - 8)} ${digits.slice(-8, -4)}-${digits.slice(-4)}`;
  }
  return `+${digits}`;
}

function renderContent(content: string, isMe: boolean) {
  if (content.startsWith(WA_PREFIX)) {
    const digits = content.slice(WA_PREFIX.length);
    const waUrl  = `https://wa.me/${digits}`;
    const label  = formatPhone(digits);
    return (
      <div className="flex flex-col gap-2.5 min-w-[160px]">
        <div className="flex items-center gap-2">
          <WhatsAppIcon className="h-5 w-5 shrink-0" fill="#25D366" />
          <span className={`text-sm font-semibold ${isMe ? "text-white" : "text-slate-800"}`}>
            {label}
          </span>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-3 py-2 text-sm font-medium hover:bg-[#1ebe5d] active:bg-[#17a84f] transition-colors shadow-sm"
        >
          <WhatsAppIcon className="h-4 w-4" fill="white" />
          Abrir en WhatsApp
        </a>
      </div>
    );
  }
  return <p className="leading-relaxed text-sm whitespace-pre-wrap">{content}</p>;
}

export default function MensajesPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const urlMatchId   = searchParams?.get("matchId");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(urlMatchId ?? null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [inputText, setInputText]         = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [sending, setSending]             = useState(false);

  const [showWAModal, setShowWAModal] = useState(false);
  const [waPhone, setWaPhone]         = useState("");
  const waInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    async function load() {
      try {
        const sessionRes  = await fetch("/api/auth/session");
        const session     = sessionRes.ok ? await sessionRes.json() : null;
        const userId      = session?.user?.id;
        const userTipo    = session?.user?.tipo;
        setCurrentUserId(userId || null);

        if (!userId) { setLoadingConvs(false); return; }

        const matchesRes = await fetch("/api/matches/mis-matches", { cache: "no-store" });
        const allMatches = matchesRes.ok ? await matchesRes.json() : [];
        const active     = allMatches.filter((m: any) => m.estado === "ACTIVO" || m.status === "ACTIVO");

        const convs: Conversation[] = active.map((m: any) => {
          const isExalumno = userTipo === "EXALUMNO";
          const otherUser  = isExalumno ? m.estudiante?.user : m.exalumno?.user;
          const otherRole  = isExalumno ? "Estudiante" : "Exalumno";
          const name       = otherUser?.name || otherUser?.nombre || "Usuario";
          return {
            matchId:      m.id,
            contactName:  name,
            contactRole:  otherRole,
            avatarLetter: name[0].toUpperCase(),
          };
        });

        setConversations(convs);

        if (urlMatchId && convs.find(c => c.matchId === urlMatchId)) {
          setActiveMatchId(urlMatchId);
        } else if (!activeMatchId && convs.length > 0) {
          setActiveMatchId(convs[0].matchId);
        }
      } catch (err) {
        console.error("Error cargando conversaciones:", err);
      } finally {
        setLoadingConvs(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = useCallback(async (matchId: string) => {
    try {
      const res  = await fetch(`/api/messages/${matchId}`, { cache: "no-store" });
      const data = res.ok ? await res.json() : [];
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!activeMatchId) return;
    loadMessages(activeMatchId);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeMatchId), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeMatchId, loadMessages]);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (showWAModal) {
      setTimeout(() => waInputRef.current?.focus(), 50);
    }
  }, [showWAModal]);

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!inputText.trim() || !activeMatchId || sending) return;
    setSending(true);
    const text = inputText.trim();
    setInputText("");
    try {
      const res = await fetch(`/api/messages/${activeMatchId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setInputText(text);
    } finally {
      setSending(false);
    }
  }

  async function handleSendWhatsApp() {
    const digits = waPhone.replace(/\D/g, "");
    if (!digits || !activeMatchId || sending) return;
    setShowWAModal(false);
    setWaPhone("");
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeMatchId}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: `${WA_PREFIX}${digits}` }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
      }
    } catch (err) {
      console.error("Error enviando número WhatsApp:", err);
    } finally {
      setSending(false);
    }
  }

  function selectConv(matchId: string) {
    setActiveMatchId(matchId);
    router.replace(`/mensajes?matchId=${matchId}`, { scroll: false });
  }

  function isToday(date: Date) {
    const now = new Date();
    return date.getFullYear() === now.getFullYear() &&
           date.getMonth()    === now.getMonth()    &&
           date.getDate()     === now.getDate();
  }

  function isSameDay(a: string, b: string) {
    const da = new Date(a), db = new Date(b);
    return da.getFullYear() === db.getFullYear() &&
           da.getMonth()    === db.getMonth()    &&
           da.getDate()     === db.getDate();
  }

  function formatDay(isoStr: string) {
    const date      = new Date(isoStr);
    const now       = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isToday(date)) return "Hoy";
    if (date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth()    === yesterday.getMonth()    &&
        date.getDate()     === yesterday.getDate()) return "Ayer";
    return date.toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function formatTime(isoStr: string) {
    if (!isoStr) return "";
    const date   = new Date(isoStr);
    const time24 = date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
    if (!isToday(date)) return time24;
    const diffMs = Date.now() - date.getTime();
    const secs   = Math.floor(diffMs / 1000);
    const mins   = Math.floor(diffMs / 60000);
    if (secs < 60)  return "Hace unos segundos";
    if (mins < 60)  return mins === 1 ? "Hace 1 minuto" : `Hace ${mins} minutos`;
    return time24;
  }

  const activeConv = conversations.find(c => c.matchId === activeMatchId);

  return (
    <>
      <style>{`
        .chat-custom-bg {
          background-image: url('/Gemini_Generated_Image_3swc4f3swc4f3swc.png');
          background-repeat: repeat;
          background-size: 340px;
          background-color: #e0f2fe; /* Celeste claro */
          background-blend-mode: multiply;
        }
        .dark .chat-custom-bg {
          background-color: #0c4a6e; /* Celeste oscuro / azul profundo */
          background-blend-mode: multiply;
        }
      `}</style>
      {/* WhatsApp Modal */}
      {showWAModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowWAModal(false); setWaPhone(""); } }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#25D366] flex items-center justify-center shadow">
                  <WhatsAppIcon className="h-5 w-5" fill="white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Compartir WhatsApp</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Se enviará como mensaje al chat</p>
                </div>
              </div>
              <button
                aria-label="Cerrar"
                onClick={() => { setShowWAModal(false); setWaPhone(""); }}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Número de teléfono
              </label>
              <input
                ref={waInputRef}
                type="tel"
                value={waPhone}
                onChange={e => setWaPhone(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSendWhatsApp(); }}
                placeholder="+506 8888-8888"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                Incluye el código de país (ej: <strong>+506</strong> para Costa Rica)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowWAModal(false); setWaPhone(""); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendWhatsApp}
                disabled={!waPhone.replace(/\D/g, "").length}
                className="flex-1 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5d] active:bg-[#17a84f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow"
              >
                <WhatsAppIcon className="h-4 w-4" fill="white" />
                Enviar al chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col p-4 md:p-8">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <AnimatedHeading as="h1" hoverColor="#F37021" className="text-3xl text-[#0f4c81] dark:text-sky-400">Mensajes</AnimatedHeading>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Chat con tus matches activos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 min-h-[600px] max-h-[800px] transition-colors duration-300"
          >

            {/* Sidebar */}
            <div className="w-full md:w-80 h-56 md:h-auto shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-800/50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Conversaciones activas</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingConvs ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">Cargando...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-3">
                    <MessageCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p>No tienes conversaciones activas.</p>
                    <p className="text-xs">Acepta un match para chatear.</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const isSelected = conv.matchId === activeMatchId;
                    return (
                      <div
                        key={conv.matchId}
                        onClick={() => selectConv(conv.matchId)}
                        className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer transition-colors flex gap-3 items-center
                          ${isSelected
                            ? "bg-blue-50/60 dark:bg-sky-900/30 border-l-4 border-l-[#0f4c81] dark:border-l-sky-500"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-l-transparent bg-white dark:bg-slate-900"}
                        `}
                      >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold border shadow-sm shrink-0
                          ${isSelected ? "bg-primary dark:bg-sky-600 text-primary-foreground border-primary dark:border-sky-600" : "bg-blue-50 dark:bg-slate-800 text-[#0f4c81] dark:text-sky-400 border-blue-100 dark:border-slate-700"}
                        `}>
                          {conv.avatarLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm truncate ${isSelected ? "font-bold text-[#0f4c81] dark:text-sky-400" : "font-semibold text-slate-800 dark:text-slate-100"}`}>
                            {conv.contactName}
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{conv.contactRole}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="flex-1 flex flex-col chat-custom-bg relative">
              {activeConv ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shadow-sm z-10 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-[#0f4c81] dark:text-sky-400 font-bold border dark:border-slate-700 shadow-sm shrink-0">
                      {activeConv.avatarLetter}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{activeConv.contactName}</h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{activeConv.contactRole}</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {messages.length === 0 && (
                      <div className="text-center text-slate-400 dark:text-slate-500 text-sm mt-12">
                        ¡Saluda a {activeConv.contactName}!
                      </div>
                    )}
                    {messages.map((msg, idx) => {
                      const isMe  = msg.sender_id === currentUserId;
                      const isWA  = msg.content.startsWith(WA_PREFIX);
                      const ts    = msg.createdAt ?? msg.created_at ?? "";
                      const prev  = idx > 0 ? (messages[idx - 1].createdAt ?? messages[idx - 1].created_at ?? "") : null;
                      const showDivider = ts && (!prev || !isSameDay(prev, ts));
                      return (
                        <React.Fragment key={msg.id}>
                          {showDivider && ts && (
                            <div className="flex items-center gap-3 my-1">
                              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-1 capitalize">
                                {formatDay(ts)}
                              </span>
                              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                            </div>
                          )}
                          <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm
                              ${isMe
                                ? "bg-primary dark:bg-sky-600 text-primary-foreground rounded-tr-sm"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm"}
                              ${isWA ? "min-w-[200px]" : ""}
                            `}>
                              {!isMe && msg.sender && (
                                <p className="text-[10px] font-semibold text-[#0f4c81] dark:text-sky-400 mb-1">{msg.sender.nombre}</p>
                              )}
                              {renderContent(msg.content, isMe)}
                              <div className={`text-[10px] mt-2 font-medium text-right ${isMe ? "text-blue-200 dark:text-sky-200" : "text-slate-400 dark:text-slate-500"}`}>
                                {formatTime(ts)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 rounded-full border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c81] dark:focus:ring-sky-500 focus:border-transparent transition-all bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 shadow-inner"
                      />
                      {/* WhatsApp button */}
                      <button
                        type="button"
                        onClick={() => setShowWAModal(true)}
                        className="h-11 w-11 flex items-center justify-center rounded-full bg-[#25D366] hover:bg-[#1ebe5d] active:bg-[#17a84f] transition-all shadow-md shrink-0"
                        aria-label="Compartir número de WhatsApp"
                        title="Compartir WhatsApp"
                      >
                        <WhatsAppIcon className="h-5 w-5" fill="white" />
                      </button>
                      {/* Send button */}
                      <button
                        type="submit"
                        disabled={!inputText.trim() || sending}
                        className="bg-primary dark:bg-sky-600 text-primary-foreground h-11 w-11 flex items-center justify-center rounded-full hover:bg-blue-800 dark:hover:bg-sky-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        aria-label="Enviar"
                      >
                        <Send className="h-5 w-5 ml-0.5" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 flex-col gap-4">
                  <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors">
                    <User className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p>Selecciona una conversación para chatear</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
