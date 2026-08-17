"use client";

import { CATALOGO_AREAS_INTERES } from "@/lib/catalogos";

interface AreasInteresSelectorProps {
  value: string[];
  onChange: (codigos: string[]) => void;
}

// Selector de checkboxes/chips para el catálogo fijo de 14 áreas de interés (T-11).
export function AreasInteresSelector({ value, onChange }: AreasInteresSelectorProps) {
  function toggle(codigo: string) {
    onChange(value.includes(codigo) ? value.filter((c) => c !== codigo) : [...value, codigo]);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {CATALOGO_AREAS_INTERES.map(({ codigo, etiqueta }) => {
          const active = value.includes(codigo);
          return (
            <button
              key={codigo}
              type="button"
              onClick={() => toggle(codigo)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                active
                  ? "bg-ucr-celeste-medium text-white border-ucr-celeste-medium shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-ucr-celeste-medium/10 hover:border-ucr-celeste-medium/50 hover:text-ucr-celeste-medium"
              }`}
            >
              {active ? "✓ " : ""}{etiqueta}
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-xs text-ucr-celeste-medium font-semibold">
          {value.length} área{value.length !== 1 ? "s" : ""} seleccionada{value.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
