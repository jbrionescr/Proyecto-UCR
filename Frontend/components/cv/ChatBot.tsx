"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Send, Bot, User, MessageSquare, RotateCcw } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MSG: Message = {
  role: "assistant",
  content: "👋 ¡Hola! Soy **CareerBot**, tu asistente de CV con IA. Puedo ayudarte a mejorar cada sección de tu CV.\n\n¿Por dónde quieres empezar?\n• 📝 Mejorar tu resumen profesional\n• 💼 Optimizar tu experiencia laboral\n• 🎯 Sugerir habilidades relevantes\n• 📋 Revisar cualquier sección",
};

export function ChatBot({ cv, onUpdateCV }: { cv: any; onUpdateCV: (newCV: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // suggestions returned by AI
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>("");

  // Helper to apply a suggestion to the CV
  const applySuggestion = (currentCV: any, suggestion: any) => {
    const { section, changes } = suggestion;
    const newCV = { ...currentCV };
    if (section === "all" || section === "profile") {
      Object.assign(newCV, changes);
    }
    if (section === "experience" || section === "all") {
      if (changes.add) {
        newCV.experience = [...(newCV.experience || []), ...changes.add];
      }
      if (changes.update) {
        newCV.experience = (newCV.experience || []).map((exp: any) =>
          changes.update[exp.id] ? { ...exp, ...changes.update[exp.id] } : exp
        );
      }
      if (changes.remove) {
        newCV.experience = (newCV.experience || []).filter((exp: any) => !changes.remove.includes(exp.id));
      }
    }
    if (section === "skills" || section === "all") {
      if (changes.add) {
        newCV.skills = Array.from(new Set([...(newCV.skills || []), ...changes.add]));
      }
      if (changes.remove) {
        newCV.skills = (newCV.skills || []).filter((s: string) => !changes.remove.includes(s));
      }
    }
    // other sections can be added similarly
    return newCV;
  };
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/cv/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          cv,
        }),
      });
      const data = await res.json();
      // data may contain {suggestions: [...], explanation: "..."}
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setExplanation(data.explanation || "");
      }
      const replyText = data.reply || (data.suggestions ? "He generado sugerencias de mejora. Revisa abajo." : "No pude generar una respuesta.");
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Error al conectar con la IA. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => setMessages([WELCOME_MSG]);

  // Render markdown-like bold text
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 rounded-xl shadow-sm overflow-hidden">
      {/* Header — clickable to collapse */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 flex items-center gap-2 text-left"
      >
        <MessageSquare className="w-4 h-4 text-white" />
        <span className="text-white font-bold text-sm tracking-wide flex-1">ASISTENTE INTERACTIVO — CareerBot</span>
        <span className="text-white/70 text-xs">{isOpen ? "▲ Cerrar" : "▼ Abrir"}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col h-[420px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "assistant"
                    ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                    : "bg-gradient-to-br from-[#0f4c81] to-blue-500"
                }`}>
                  {m.role === "assistant"
                    ? <Bot className="w-3.5 h-3.5 text-white" />
                    : <User className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                  m.role === "assistant"
                    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                }`}>
                  {formatText(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
            {["Mejora mi resumen", "Optimiza mi experiencia", "¿Mis habilidades son suficientes?", "¿Qué le falta a mi CV?"].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); inputRef.current?.focus(); }}
                className="shrink-0 text-[10px] px-2.5 py-1 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>
          {/* Suggestions UI */}
          {suggestions.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {explanation && <p className="text-sm text-slate-600 dark:text-slate-300">{explanation}</p>}
              {suggestions.map((s, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Sección: <span className="font-medium">{s.section}</span></p>
                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-x-auto mb-2">{JSON.stringify(s.changes, null, 2)}</pre>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Discard suggestion
                        setSuggestions((prev) => prev.filter((_, i) => i !== idx));
                      }}
                    >Descartar</Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Apply changes to CV
                        const newCV = applySuggestion(cv, s);
                        onUpdateCV(newCV);
                        setSuggestions((prev) => prev.filter((_, i) => i !== idx));
                      }}
                    >Aplicar</Button>
                  </div>
                </div>
              ))}
              {suggestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Apply all remaining suggestions
                    let updatedCV = { ...cv };
                    suggestions.forEach((s) => {
                      updatedCV = applySuggestion(updatedCV, s);
                    });
                    onUpdateCV(updatedCV);
                    setSuggestions([]);
                  }}
                >Aplicar todo</Button>
              )}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
            <button onClick={reset} className="p-2 text-slate-400 hover:text-teal-600 transition-colors" title="Reiniciar chat">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <input
              ref={inputRef}
              className="flex-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-300 dark:text-slate-200 placeholder-slate-400"
              placeholder="Escribe tu pregunta sobre tu CV..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-full w-8 h-8 p-0 shrink-0"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
