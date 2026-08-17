"use client";

import { useEffect, useState, type ElementType } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Accessibility,
  CaseSensitive,
  Contrast,
  Droplet,
  Link2,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { useLanguage, type TranslationKeys } from "@/components/providers/LanguageContext";

const LOCALE_TAGS: Record<string, string> = { es: "es-ES", en: "en-US", pt: "pt-BR", fr: "fr-FR" };

type A11yPrefKey =
  | "a11y_largeText"
  | "a11y_highContrast"
  | "a11y_grayscale"
  | "a11y_highlightLinks"
  | "a11y_textToSpeech";

function readPref(key: A11yPrefKey): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "false");
  } catch {
    return false;
  }
}

const TTS_VALID_TAGS = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "A", "BUTTON",
  "SPAN", "LABEL", "LI", "STRONG", "B", "INPUT", "SELECT", "TEXTAREA",
]);

interface A11yOption {
  key: A11yPrefKey;
  labelKey: TranslationKeys;
  icon: ElementType;
}

const OPTIONS: A11yOption[] = [
  { key: "a11y_largeText", labelKey: "a11y.largeText", icon: CaseSensitive },
  { key: "a11y_highContrast", labelKey: "a11y.highContrast", icon: Contrast },
  { key: "a11y_grayscale", labelKey: "a11y.grayscale", icon: Droplet },
  { key: "a11y_highlightLinks", labelKey: "a11y.highlightLinks", icon: Link2 },
];

/**
 * Barra flotante de accesibilidad — se monta una única vez en `app/layout.tsx`
 * y aparece en todas las páginas. Persiste preferencias en localStorage y las
 * aplica como clases globales sobre <html>/#a11y-app-root/<body> (ver reglas
 * en globals.css) para no depender de temas claro/oscuro específicos.
 */
export function A11yToolbar() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLargeText(readPref("a11y_largeText"));
    setHighContrast(readPref("a11y_highContrast"));
    setGrayscale(readPref("a11y_grayscale"));
    setHighlightLinks(readPref("a11y_highlightLinks"));
    setTextToSpeech(readPref("a11y_textToSpeech"));
  }, []);

  // Persistir cada preferencia (solo tras el montaje, para no pisar el valor guardado con el default)
  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem("a11y_largeText", JSON.stringify(largeText));
    window.localStorage.setItem("a11y_highContrast", JSON.stringify(highContrast));
    window.localStorage.setItem("a11y_grayscale", JSON.stringify(grayscale));
    window.localStorage.setItem("a11y_highlightLinks", JSON.stringify(highlightLinks));
    window.localStorage.setItem("a11y_textToSpeech", JSON.stringify(textToSpeech));
  }, [mounted, largeText, highContrast, grayscale, highlightLinks, textToSpeech]);

  // Aplicar clases globales al DOM
  useEffect(() => {
    if (!mounted) return;
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const appRoot = document.getElementById("a11y-app-root");

    htmlEl.classList.toggle("a11y-large-text", largeText);
    appRoot?.classList.toggle("a11y-high-contrast", highContrast);
    appRoot?.classList.toggle("a11y-grayscale", grayscale);
    bodyEl.classList.toggle("a11y-highlight-links", highlightLinks);
  }, [mounted, largeText, highContrast, grayscale, highlightLinks]);

  // Lectura por voz al pasar el mouse
  useEffect(() => {
    if (!mounted || !textToSpeech) return;

    let speakTimeout: ReturnType<typeof setTimeout>;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isValid =
        TTS_VALID_TAGS.has(target.tagName) ||
        target.getAttribute("role") === "button" ||
        target.getAttribute("role") === "link";
      if (!isValid) return;

      const text =
        target.getAttribute("aria-label") ||
        (target as HTMLInputElement).placeholder ||
        target.title ||
        target.innerText;

      if (text && text.trim().length > 0 && text.length < 300) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LOCALE_TAGS[language] ?? "es-ES";
        utterance.rate = 1.0;
        speakTimeout = setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 400);
      }
    };

    const handleMouseOut = () => clearTimeout(speakTimeout);

    document.body.addEventListener("mouseover", handleMouseOver);
    document.body.addEventListener("mouseout", handleMouseOut);

    return () => {
      clearTimeout(speakTimeout);
      document.body.removeEventListener("mouseover", handleMouseOver);
      document.body.removeEventListener("mouseout", handleMouseOut);
      window.speechSynthesis.cancel();
    };
  }, [mounted, textToSpeech, language]);

  const toggleTextToSpeech = () => {
    const next = !textToSpeech;
    setTextToSpeech(next);
    if (next) {
      const utterance = new SpeechSynthesisUtterance(t("a11y.ttsEnabled"));
      utterance.lang = LOCALE_TAGS[language] ?? "es-ES";
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const prefs: Record<A11yPrefKey, boolean> = {
    a11y_largeText: largeText,
    a11y_highContrast: highContrast,
    a11y_grayscale: grayscale,
    a11y_highlightLinks: highlightLinks,
    a11y_textToSpeech: textToSpeech,
  };

  const setters: Record<A11yPrefKey, () => void> = {
    a11y_largeText: () => setLargeText((v) => !v),
    a11y_highContrast: () => setHighContrast((v) => !v),
    a11y_grayscale: () => setGrayscale((v) => !v),
    a11y_highlightLinks: () => setHighlightLinks((v) => !v),
    a11y_textToSpeech: toggleTextToSpeech,
  };

  const resetAll = () => {
    setLargeText(false);
    setHighContrast(false);
    setGrayscale(false);
    setHighlightLinks(false);
    setTextToSpeech(false);
    window.speechSynthesis.cancel();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-1/2 right-0 z-[9999] flex -translate-y-1/2 items-center">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title={t("a11y.title")}
        aria-label={t("a11y.openPanel")}
        aria-expanded={isOpen}
        className="flex h-12 w-12 items-center justify-center rounded-l-xl bg-fu-blue-sky text-white shadow-[-2px_0_10px_rgba(0,0,0,0.25)] transition-colors hover:bg-fu-blue-dark"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fu-surface fu-border flex w-64 flex-col gap-3 rounded-l-2xl border p-5 shadow-fu-lg"
          >
            <div className="fu-border flex items-center justify-between border-b pb-2.5">
              <h3 className="fu-text text-base font-bold">{t("a11y.title")}</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("a11y.closePanel")}
                className="fu-muted flex h-6 w-6 items-center justify-center rounded-md hover:bg-fu-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {OPTIONS.map(({ key, labelKey, icon: Icon }) => {
              const active = prefs[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={setters[key]}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-fu-blue-sky bg-fu-blue-sky/15 text-fu-blue-dark"
                      : "fu-border fu-text-2 hover:bg-fu-surface-2"
                  }`}
                >
                  <Icon className="h-[1.1rem] w-5 shrink-0" />
                  {t(labelKey)}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setters.a11y_textToSpeech()}
              aria-pressed={textToSpeech}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                textToSpeech
                  ? "border-fu-blue-sky bg-fu-blue-sky/15 text-fu-blue-dark"
                  : "fu-border fu-text-2 hover:bg-fu-surface-2"
              }`}
            >
              <Volume2 className="h-[1.1rem] w-5 shrink-0" />
              {t("a11y.textToSpeech")}
            </button>

            <button
              type="button"
              onClick={resetAll}
              className="fu-border fu-muted mt-1 flex items-center justify-center gap-2.5 rounded-lg border border-dashed px-3 py-2.5 text-sm font-medium transition-colors hover:bg-fu-surface-2"
            >
              <RotateCcw className="h-[1.1rem] w-5 shrink-0" />
              {t("a11y.reset")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

export default A11yToolbar;
