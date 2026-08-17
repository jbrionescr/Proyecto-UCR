"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, ChevronRight, Edit3, Lightbulb, Sparkles, X } from "lucide-react";
import { C } from "@/lib/theme";
import { Badge, Btn, Card } from "@/components/ui";
import { PageHead } from "@/components/layout";

export function CVAdaptAI({ nav }: any) {
  const suggestions = [
    { sec: "Resumen", before: "Estudiante de ingeniería con interés en tecnología.", after: "Ingeniera biomédica en formación especializada en diseño 3D y dispositivos médicos de bajo costo, con experiencia en investigación aplicada.", reason: "Más específico y alineado a la vacante." },
    { sec: "Experiencia", before: "Ayudé en un laboratorio.", after: "Lideré el prototipado de 3 dispositivos en LANOTEC usando CAD y manufactura aditiva, reduciendo iteraciones en un 40%.", reason: "Cuantifica el impacto con métricas." },
    { sec: "Habilidades", before: "Conozco programas de diseño.", after: "Dominio de Fusion 360, SolidWorks y flujos de impresión 3D (FDM/SLA).", reason: "Coincide con habilidades requeridas." },
  ];
  const [state, setState] = useState({});
  return (
    <>
      <PageHead eyebrow="Asistente inteligente" title="Adaptación de CV con IA" sub="Optimizado para: Ing. de Software Jr. · Globant" tone={C.blue} action={<Btn variant="outline" size="sm" onClick={() => nav("jobs")} icon={ChevronRight}>Volver a la posición</Btn>} />
      <div className="rounded-xl p-4 mb-5 flex items-center gap-3" style={{ background: C.celesteSoft }}><Lightbulb size={20} color={C.blue} /><div className="text-[13.5px]" style={{ color: C.ink }}><b>3 sugerencias</b> aumentarían tu compatibilidad del 78% al <b style={{ color: C.greenDk }}>93%</b>. Revisa cada una y acepta, edita o descarta.</div></div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="hidden lg:block"><div className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: C.faint }}>CV original</div></div>
        <div className="hidden lg:block"><div className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: C.greenDk }}>Versión optimizada</div></div>
        {suggestions.map((s, i) => {
          const st = state[i];
          return (
            <React.Fragment key={i}>
              <Card pad="p-4" style={st === "discard" ? { opacity: .5 } : {}}><div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: C.faint }}>{s.sec} · original</div><p className="text-[13.5px] leading-relaxed" style={{ color: C.sub }}>{s.before}</p></Card>
              <Card pad="p-4" style={st === "accept" ? { borderColor: C.greenDk, boxShadow: `0 0 0 1px ${C.greenDk}` } : st === "discard" ? { opacity: .5 } : {}}>
                <div className="flex items-center justify-between mb-2"><div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: C.greenDk }}><Sparkles size={12} /> {s.sec} · sugerido</div>{st === "accept" && <Badge tone="green"><Check size={11} /> Aceptado</Badge>}{st === "discard" && <Badge tone="red"><X size={11} /> Descartado</Badge>}</div>
                <p className="text-[13.5px] leading-relaxed font-medium" style={{ color: C.ink }}>{s.after}</p>
                <div className="text-[12px] mt-2 flex items-start gap-1.5" style={{ color: C.sub }}><Lightbulb size={13} className="mt-0.5 shrink-0" color={C.amarillo} /> {s.reason}</div>
                {!st && <div className="flex gap-2 mt-3"><Btn variant="green" size="sm" icon={Check} onClick={() => setState(p => ({ ...p, [i]: "accept" }))}>Aceptar</Btn><Btn variant="outline" size="sm" icon={Edit3}>Editar</Btn><Btn variant="ghost" size="sm" icon={X} onClick={() => setState(p => ({ ...p, [i]: "discard" }))}>Descartar</Btn></div>}
                {st && <button className="text-[12.5px] font-semibold mt-3" style={{ color: C.blue }} onClick={() => setState(p => ({ ...p, [i]: undefined }))}>Deshacer</button>}
              </Card>
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex justify-end mt-5"><Btn variant="primary" size="lg" icon={CheckCircle2}>Aplicar cambios y guardar</Btn></div>
    </>
  );
}
