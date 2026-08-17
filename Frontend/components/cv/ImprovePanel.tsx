"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Wand2, CheckCircle2, AlertCircle, TrendingUp, RotateCcw } from "lucide-react";
import type { CVData } from "@/components/cv/CVTypes";

interface ImproveResult {
  improvedCV: CVData;
  atsScore: number;
  explanation: string;
  changedSections: string[];
}

const SECTION_LABEL: Record<string, string> = {
  summary: "Resumen",
  experience: "Experiencia",
  skills: "Habilidades",
  title: "Título",
};

// Panel de mejora GENERAL del CV (sin vacante específica): reescribe y, si el
// usuario acepta, aplica los cambios al editor. Flujo B general.
export function ImprovePanel({ cv, onApply }: { cv: CVData; onApply: (cv: CVData) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImproveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const res = await fetch("/api/cv/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No se pudo optimizar el CV.");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la IA.");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    if (!result) return;
    onApply(result.improvedCV);
    setApplied(true);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-white" />
        <span className="text-white font-bold text-sm tracking-wide">OPTIMIZAR Y APLICAR — MEJORA GENERAL</span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          La IA reescribe tu resumen y experiencia con verbos de acción y logros, y prioriza tus habilidades.
          No inventa datos: solo mejora lo que ya tienes. Revisa el resultado antes de aplicarlo.
        </p>

        {!result && (
          <Button
            onClick={run}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold"
          >
            {loading ? (
              <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Optimizando con IA...</>
            ) : (
              <><Wand2 className="mr-2 w-4 h-4" /> Optimizar mi CV con IA</>
            )}
          </Button>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Puntaje ATS estimado tras la mejora</p>
                <p className="text-2xl font-extrabold text-emerald-600 leading-none">{result.atsScore}<span className="text-sm text-slate-400"> / 100</span></p>
              </div>
            </div>

            {result.explanation && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                {result.explanation}
              </p>
            )}

            {result.changedSections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {result.changedSections.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wide">
                    {SECTION_LABEL[s] ?? s}
                  </span>
                ))}
              </div>
            )}

            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Cambios aplicados a tu CV. Recuerda pulsar <strong>“Guardar CV”</strong> arriba.
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setResult(null); }} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Descartar
                </Button>
                <Button onClick={apply} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aplicar mejoras
                </Button>
              </div>
            )}

            {applied && (
              <Button variant="outline" onClick={run} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Volver a optimizar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
