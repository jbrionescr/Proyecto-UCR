import { computeFundingStats } from "@/lib/funding";

interface FundingProgressBarProps {
  /** Meta y recaudado, siempre en colones (₡) — ver lib/exchangeRate.ts para la conversión desde metas en USD. */
  objetivo: number;
  recaudado: number;
  /** Meta original en USD, si el estudiante la definió en dólares — se muestra como referencia. */
  objetivoUsd?: number | null;
  /** "self": lo ve el propio estudiante · "donor": lo ve un exalumno */
  variant?: "self" | "donor";
  className?: string;
}

export function FundingProgressBar({ objetivo, recaudado, objetivoUsd, variant = "donor", className = "" }: FundingProgressBarProps) {
  const { faltante, porcentaje } = computeFundingStats(objetivo, recaudado);
  const fmt = (n: number) => `₡${n.toLocaleString("es-CR")}`;

  return (
    <div className={className}>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1.5">
        {fmt(recaudado)} de {fmt(objetivo)} recaudados
        {objetivoUsd ? <span className="font-normal text-slate-400"> (meta: ${objetivoUsd.toLocaleString("es-CR")} USD al tipo de cambio actual)</span> : null}
      </p>
      {faltante > 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {variant === "self"
            ? `Te faltan ${fmt(faltante)} para alcanzar tu meta.`
            : `Faltan ${fmt(faltante)} para alcanzar la meta del estudiante.`}
        </p>
      ) : (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">¡Meta alcanzada! 🎉</p>
      )}
    </div>
  );
}
