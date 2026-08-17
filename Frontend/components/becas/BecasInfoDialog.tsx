"use client";

import React, { useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

// Paleta oficial Fundación UCR
const UCR_COLORS = {
  blanco: "#FFFFFF",
  amarillo: "#ffe06a",
  celeste: "#00c0f3",
  azul: "#005da4",
  naranja: "#f37021",
  dorado: "#fdb912",
  naranjaClaro: "#f99d1c",
  mostaza: "#e9c31e",
};

type Beca = {
  id: string;
  nombre: string;
  color: string;
  exoneracion: string;
  beneficios: string[];
  requisitos: string[];
  notaExcelencia?: string;
};

const BECAS: Beca[] = [
  {
    id: "beca-1",
    nombre: "Beca 1",
    color: UCR_COLORS.celeste,
    exoneracion: "45% sobre el costo de matrícula.",
    beneficios: [
      "Posibilidad de solicitar préstamo de dinero para la adquisición de libros, equipo, instrumentos u otros.",
    ],
    requisitos: [
      "Grado: mantener un promedio ponderado modificado anual igual o superior a 7.",
      "Posgrado: mantener un promedio ponderado igual o superior a 8 por ciclo lectivo.",
    ],
  },
  {
    id: "beca-2",
    nombre: "Beca 2",
    color: UCR_COLORS.azul,
    exoneracion: "70% sobre el costo de matrícula.",
    beneficios: [
      "Posibilidad de solicitar préstamo de dinero para la adquisición de libros, equipo, instrumentos u otros.",
    ],
    requisitos: [
      "Grado: mantener un promedio ponderado modificado anual igual o superior a 7.",
      "Posgrado: mantener un promedio ponderado igual o superior a 8 por ciclo lectivo.",
    ],
  },
  {
    id: "beca-3",
    nombre: "Beca 3",
    color: UCR_COLORS.naranjaClaro,
    exoneracion: "90% sobre el costo de matrícula.",
    beneficios: [
      "Subsidio del 70% del costo del almuerzo.",
      "Préstamo de libros y préstamo de dinero para la adquisición de libros, equipo, instrumentos u otros.",
    ],
    requisitos: [
      "Grado: mantener un promedio ponderado modificado anual igual o superior a 7.",
      "Posgrado: mantener un promedio ponderado igual o superior a 8 por ciclo lectivo.",
    ],
  },
  {
    id: "beca-4",
    nombre: "Beca 4",
    color: UCR_COLORS.dorado,
    exoneracion: "100% sobre el costo de matrícula.",
    beneficios: [
      "50% de descuento en costos de laboratorios, actividad deportiva, graduación y reconocimiento de estudios.",
      "Posibilidad de solicitar transporte, reubicación geográfica o residencias estudiantiles.",
      "100% del costo del almuerzo y otros tiempos de comida.",
      "Aporte del 100% en servicios básicos de optometría y odontología.",
      "Préstamo de libros y préstamo de dinero para la adquisición de libros, equipo, instrumentos u otros.",
    ],
    requisitos: [
      "Mantener una matrícula consolidada de 12 créditos por ciclo lectivo, o justificar la carga académica según el artículo 19 del Reglamento de Adjudicación de Becas a la Población Estudiantil.",
      "Grado: mantener un promedio ponderado modificado anual igual o superior a 7.",
      "Posgrado: mantener un promedio ponderado igual o superior a 8 por ciclo lectivo.",
    ],
    notaExcelencia:
      "Si obtiene un promedio ponderado modificado anual de al menos 9.0 (grado o posgrado) y una carga académica consolidada igual o superior a 15 créditos por ciclo, se reconocerá la excelencia académica con un monto equivalente al 50% del monto económico para gastos de carrera vigente en la categoría Beca 5, mientras se mantengan las condiciones.",
  },
  {
    id: "beca-5",
    nombre: "Beca 5",
    color: UCR_COLORS.naranja,
    exoneracion: "100% sobre el costo de matrícula.",
    beneficios: [
      "100% de exoneración en costos de laboratorios, actividad deportiva, graduación y reconocimiento de estudios.",
      "Monto económico para gastos de carrera y pobreza extrema, este último cuando corresponda.",
      "Posibilidad de solicitar transporte, reubicación geográfica o residencias estudiantiles.",
      "100% del costo del almuerzo y otros tiempos de comida.",
      "100% en servicios básicos de optometría y odontología.",
      "Préstamo de libros y préstamo de dinero para la adquisición de libros, equipo, instrumentos u otros.",
    ],
    requisitos: [
      "Mantener una matrícula consolidada de 12 créditos por ciclo lectivo, o justificar la carga académica según el artículo 19 del Reglamento de Adjudicación de Becas a la Población Estudiantil.",
      "Grado: mantener un promedio ponderado modificado anual igual o superior a 7.",
      "Posgrado: mantener un promedio ponderado igual o superior a 8 por ciclo lectivo.",
    ],
    notaExcelencia:
      "Si obtiene un promedio ponderado modificado anual de al menos 9.0 (grado o posgrado) y una carga académica consolidada igual o superior a 15 créditos por ciclo, se reconocerá la excelencia académica con un monto equivalente al 50% del monto económico para gastos de carrera vigente en esta categoría, mientras se mantengan las condiciones.",
  },
];

export function BecasInfoDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(BECAS[0].id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            className="border-[#005da4] text-[#005da4] hover:bg-[#00c0f3]/10 gap-2 font-semibold"
          >
            <GraduationCap className="h-4 w-4" />
            Ver categorías de becas UCR
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-0 gap-0 border-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#005da4] to-[#00c0f3] text-white rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-white text-xl">
            <Sparkles className="h-5 w-5 text-[#ffe06a]" />
            Categorías de Becas UCR
          </DialogTitle>
          <DialogDescription className="text-white/85">
            Conoce los beneficios y requisitos de cada categoría de beca socioeconómica.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-3">
          {BECAS.map((beca) => {
            const isOpen = openId === beca.id;
            return (
              <div
                key={beca.id}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all"
                style={{ borderLeftWidth: 5, borderLeftColor: beca.color }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : beca.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-extrabold text-white shrink-0"
                      style={{ backgroundColor: beca.color }}
                    >
                      {beca.nombre.split(" ")[1]}
                    </span>
                    <span className="font-bold text-slate-800">{beca.nombre}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${beca.color}1A`, color: beca.color }}
                    >
                      {beca.exoneracion.split(" ")[0]} matrícula
                    </span>
                  </span>
                  <span className="text-lg font-bold" style={{ color: beca.color }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-3 space-y-4 bg-white">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
                        Exoneración de matrícula
                      </p>
                      <p className="text-sm text-slate-700 font-semibold">{beca.exoneracion}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
                        Beneficios
                      </p>
                      <ul className="space-y-1.5">
                        {beca.beneficios.map((b, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span style={{ color: beca.color }}>•</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
                        Requisitos
                      </p>
                      <ul className="space-y-1.5">
                        {beca.requisitos.map((r, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span style={{ color: beca.color }}>•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {beca.notaExcelencia && (
                      <div
                        className="rounded-lg p-3 text-xs text-slate-700 leading-relaxed"
                        style={{ backgroundColor: `${UCR_COLORS.mostaza}26`, borderLeft: `3px solid ${UCR_COLORS.mostaza}` }}
                      >
                        <span className="font-bold" style={{ color: UCR_COLORS.naranja }}>
                          Excelencia académica:{" "}
                        </span>
                        {beca.notaExcelencia}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BecasInfoDialog;
