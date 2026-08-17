"use client";

import React from "react";
import { BadgeCheck, Briefcase, CheckCircle2, Edit3, GraduationCap, Languages, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import { C } from "@/lib/theme";
import { Badge, Btn, Card, Progress, Ring } from "@/components/ui";
import { PageHead } from "@/components/layout";

export function CVEditor({ nav }: any) {
  const sections = [
    { t: "Educación", icon: GraduationCap, c: 100, items: ["Bach. Ing. Biomédica — UCR (2022–presente)"] },
    { t: "Experiencia", icon: Briefcase, c: 75, items: ["Asistente de investigación — LANOTEC", "Voluntaria — Cruz Roja CR"] },
    { t: "Habilidades", icon: Zap, c: 90, items: ["Diseño 3D / CAD", "Python", "Análisis de señales", "Impresión 3D"] },
    { t: "Idiomas", icon: Languages, c: 100, items: ["Español (nativo)", "Inglés (C1)"] },
    { t: "Certificaciones", icon: BadgeCheck, c: 50, items: ["Fusion 360 — Autodesk"] },
  ];
  const overall = Math.round(sections.reduce((a, s) => a + s.c, 0) / sections.length);
  return (
    <>
      <PageHead eyebrow="Tu perfil profesional" title="Editor de currículum" sub="Edición en tiempo real con guardado automático" tone={C.greenDk} action={<div className="flex items-center gap-2"><Badge tone="green"><CheckCircle2 size={12} /> Guardado · hace 2 s</Badge><Btn variant="soft" size="sm" icon={Sparkles} onClick={() => nav("cv-ai")}>Optimizar con IA</Btn></div>} />
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <Card className="lg:sticky lg:top-24 self-start">
          <div className="text-center"><Ring value={overall} size={72} /><div className="font-bold text-[14px] mt-2" style={{ color: C.ink }}>Completitud del CV</div><div className="text-[12px]" style={{ color: C.sub }}>¡Casi listo!</div></div>
          <div className="mt-5 space-y-2.5">{sections.map(s => (
            <div key={s.t}><div className="flex items-center justify-between text-[12.5px] font-semibold mb-1"><span className="flex items-center gap-1.5" style={{ color: C.ink }}><s.icon size={14} /> {s.t}</span><span style={{ color: s.c === 100 ? C.greenDk : C.sub }}>{s.c}%</span></div><Progress value={s.c} tone={s.c === 100 ? C.green : C.blue} h={5} /></div>
          ))}</div>
        </Card>
        <div className="space-y-4">{sections.map(s => (
          <Card key={s.t}>
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.greenSoft, color: C.greenDk }}><s.icon size={16} /></div><h3 className="font-bold text-[15px]" style={{ color: C.ink }}>{s.t}</h3></div><button className="text-[12.5px] font-semibold flex items-center gap-1" style={{ color: C.blue }}><Plus size={14} /> Agregar</button></div>
            <div className="space-y-2">{s.items.map(it => (
              <div key={it} className="flex items-center justify-between p-3 rounded-xl" style={{ background: C.bg }}><span className="text-[13.5px]" style={{ color: C.ink }}>{it}</span><div className="flex gap-1.5 opacity-60"><Edit3 size={15} color={C.sub} /><Trash2 size={15} color={C.sub} /></div></div>
            ))}</div>
          </Card>
        ))}</div>
      </div>
    </>
  );
}
