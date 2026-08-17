"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, TrendingUp, Zap } from "lucide-react";

interface OptimizeResult {
  atsScore: number;
  formatSuggestions: string[];
  impactWords: string[];
  missingCriteria: string[];
  error?: string;
}

export function OptimizePanel({ cv }: { cv: any }) {
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/cv/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ atsScore: 0, formatSuggestions: [], impactWords: [], missingCriteria: [], error: "Error al conectar con la IA." });
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    !result ? "" :
    result.atsScore >= 80 ? "text-green-600" :
    result.atsScore >= 60 ? "text-amber-500" : "text-red-500";

  const scoreRing =
    !result ? "" :
    result.atsScore >= 80 ? "bg-green-50 border-green-200" :
    result.atsScore >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-white" />
        <span className="text-white font-bold text-sm tracking-wide">OPTIMIZACIÓN IA — ANÁLISIS ATS</span>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          La IA analizará tu CV completo y calculará tu puntaje ATS, sugiriendo mejoras concretas para cada sección.
        </p>

        <Button
          onClick={runOptimization}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
        >
          {loading ? (
            <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Analizando con Grok...</>
          ) : (
            <><Sparkles className="mr-2 w-4 h-4" /> Analizar mi CV con IA</>
          )}
        </Button>

        {result?.error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {result.error}
          </div>
        )}

        {result && !result.error && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* ATS Score */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${scoreRing}`}>
              <div className="text-center">
                <div className={`text-3xl font-extrabold ${scoreColor}`}>{result.atsScore}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">/ 100</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className={`w-4 h-4 ${scoreColor}`} />
                  <span className={`font-bold text-sm ${scoreColor}`}>
                    {result.atsScore >= 80 ? "¡CV Optimizado!" : result.atsScore >= 60 ? "CV Aceptable" : "Necesita Mejoras"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      result.atsScore >= 80 ? "bg-green-500" :
                      result.atsScore >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${result.atsScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sugerencias de formato */}
            {result.formatSuggestions?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">📋 Mejoras de Formato</h4>
                <ul className="space-y-1.5">
                  {result.formatSuggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Palabras de impacto */}
            {result.impactWords?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">⚡ Palabras de Impacto Sugeridas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.impactWords.map((w, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-medium">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Criterios faltantes */}
            {result.missingCriteria?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">🎯 Criterios ATS Faltantes</h4>
                <ul className="space-y-1.5">
                  {result.missingCriteria.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
