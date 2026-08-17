"use client";

import React, { useState } from "react";
import { Building2, Calendar, CheckCircle2, Send, Sparkles } from "lucide-react";
import { C } from "@/lib/theme";
import { JOBS } from "@/lib/data";
import { Badge, Btn, Card, Ring } from "@/components/ui";
import { FilterBar, PageHead } from "@/components/layout";

export function Jobs({ nav }: any) {
  const [active, setActive] = useState(0);
  return (
    <>
      <PageHead eyebrow="Oportunidades" title="Bolsa de empleo y pasantías" sub="Posiciones de empresas aliadas, por compatibilidad" tone={C.blue} />
      <FilterBar filters={["Empleo", "Pasantía", "Modalidad", "Jornada", "Habilidades"]} />
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <div className="space-y-3">{JOBS.map((j, i) => (
          <Card key={j.title} hover pad="p-4" className="cursor-pointer" style={active === i ? { borderColor: C.blue, boxShadow: `0 0 0 2px ${C.blue}33` } : {}}>
            <div onClick={() => setActive(i)}>
              <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold shrink-0" style={{ background: C.blue }}>{j.logo}</div><div className="flex-1 min-w-0"><div className="font-bold text-[14.5px] leading-tight" style={{ color: C.ink }}>{j.title}</div><div className="text-[13px]" style={{ color: C.sub }}>{j.company}</div></div><Ring value={j.compat} size={40} /></div>
              <div className="flex flex-wrap gap-1.5 mt-3"><Badge tone={j.type === "Empleo" ? "blue" : "orange"}>{j.type}</Badge><Badge tone="gray">{j.modality}</Badge><Badge tone="gray">{j.jornada}</Badge></div>
              <div className="flex items-center gap-1.5 mt-3 text-[11.5px]" style={{ color: C.faint }}><Calendar size={13} /> Cierra el {j.deadline}</div>
            </div>
          </Card>
        ))}</div>
        <JobDetail j={JOBS[active]} nav={nav} />
      </div>
    </>
  );
}

function JobDetail({ j, nav }: any) {
  return (
    <Card className="lg:sticky lg:top-24 self-start">
      <div className="flex items-start gap-3"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shrink-0" style={{ background: C.blue }}>{j.logo}</div><div className="flex-1"><h2 className="font-bold text-[18px] leading-tight" style={{ color: C.ink }}>{j.title}</h2><div className="text-[13.5px] font-semibold" style={{ color: C.sub }}>{j.company} · {j.modality}</div></div></div>
      <div className="flex items-center gap-4 mt-4 p-3 rounded-xl" style={{ background: C.greenSoft }}><Ring value={j.compat} size={48} /><div><div className="font-bold text-[13.5px]" style={{ color: C.greenDk }}>Alta compatibilidad con tu perfil</div><div className="text-[12px]" style={{ color: C.sub }}>Coincide en {j.skills.length} habilidades clave.</div></div></div>
      <Section title="Descripción"><p className="text-[13.5px] leading-relaxed" style={{ color: C.sub }}>Únete a un equipo de alto rendimiento para construir productos usados por millones. Buscamos talento UCR con ganas de crecer y generar impacto.</p></Section>
      <Section title="Responsabilidades"><ul className="space-y-1.5">{["Desarrollar y mantener componentes de producto", "Colaborar con diseño y producto", "Escribir código limpio y testeado"].map(r => <li key={r} className="flex gap-2 text-[13.5px]" style={{ color: C.sub }}><CheckCircle2 size={15} color={C.greenDk} className="shrink-0 mt-0.5" /> {r}</li>)}</ul></Section>
      <Section title="Habilidades requeridas"><div className="flex flex-wrap gap-1.5">{j.skills.map(s => <Badge key={s} tone="blue">{s}</Badge>)}</div></Section>
      <Section title="Sobre la empresa"><div className="flex items-center gap-3 text-[13px]" style={{ color: C.sub }}><Building2 size={16} /> {j.company} · Empresa aliada UCR · 500+ empleados</div></Section>
      <div className="flex gap-2 mt-5 pt-5" style={{ borderTop: `1px solid ${C.line}` }}><Btn variant="primary" full icon={Send}>Aplicar ahora</Btn><Btn variant="soft" icon={Sparkles} onClick={() => nav("cv-ai")}>Adaptar CV con IA</Btn></div>
    </Card>
  );
}

function Section({ title, children }: any) {
  return <div className="mt-5"><div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: C.faint }}>{title}</div>{children}</div>;
}
