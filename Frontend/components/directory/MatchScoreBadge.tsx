"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, HelpCircle } from "lucide-react";

interface MatchBreakdown {
  carrera: number;
  intereses: number;
  sector: number;
  apoyo: number;
}

interface MatchScoreBadgeProps {
  score: number;
  breakdown?: MatchBreakdown;
  reasons?: string[];
  size?: "sm" | "md";
  className?: string;
}

const CRITERIOS: { key: keyof MatchBreakdown; label: string; max: number }[] = [
  { key: "carrera", label: "Misma carrera o área académica", max: 30 },
  { key: "intereses", label: "Áreas de interés en común", max: 30 },
  { key: "sector", label: "Sector profesional ↔ área del proyecto", max: 20 },
  { key: "apoyo", label: "Tipo de apoyo compatible", max: 20 },
];

function tone(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-ucr-celeste-medium";
  return "bg-slate-400";
}

export function MatchScoreBadge({ score, breakdown, reasons, size = "md", className = "" }: MatchScoreBadgeProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popoverWidth = 280;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popoverWidth - 12));
    setPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();

    function handleOutside(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function handleScrollResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleScrollResize, true);
    window.addEventListener("resize", handleScrollResize);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleScrollResize, true);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [open, updatePos]);

  const dims = size === "sm" ? "h-12 w-12" : "h-14 w-14";
  const pctSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title="Ver de qué se compone este porcentaje de afinidad"
        className={`${className} ${dims} flex flex-col items-center justify-center rounded-full text-white shadow-lg border-4 border-white dark:border-slate-900 cursor-pointer hover:scale-105 transition-transform ${tone(score)}`}
      >
        <span className={`${pctSize} font-extrabold leading-none`}>{score}%</span>
        <span className="text-[8px] font-bold uppercase leading-none mt-0.5">match</span>
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed z-[9999] w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4"
          style={{ top: pos.top, left: pos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-ucr-celeste-medium shrink-0" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">¿Cómo se calcula el {score}% de afinidad?</p>
          </div>

          <div className="space-y-2 mb-3">
            {CRITERIOS.map((c) => {
              const puntos = breakdown?.[c.key] ?? 0;
              const cumple = puntos > 0;
              return (
                <div key={c.key} className="flex items-start gap-2">
                  {cumple ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                  )}
                  <p className={`text-xs flex-1 ${cumple ? "text-slate-700 dark:text-slate-300 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
                    {c.label}
                  </p>
                  <span className={`text-xs font-bold shrink-0 ${cumple ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"}`}>
                    +{puntos}/{c.max}
                  </span>
                </div>
              );
            })}
          </div>

          {reasons && reasons.length > 0 && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Detalle</p>
              <ul className="space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="text-xs text-slate-500 dark:text-slate-400 leading-snug">• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
