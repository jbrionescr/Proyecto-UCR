"use client";

import React from "react";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { C } from "@/lib/theme";
import { STUDENTS } from "@/lib/data";
import { Avatar, Badge, Btn, Card, Progress } from "@/components/ui";
import { FilterBar, PageHead } from "@/components/layout";

export function DirectoryStudent({ nav }: any) {
  return (
    <>
      <PageHead eyebrow="Comunidad" title="Directorio de estudiantes" sub="Conoce proyectos en busca de apoyo" tone={C.greenDk} />
      <div className="rounded-xl p-3 mb-5 flex items-center gap-2.5 text-[13px] font-semibold" style={{ background: C.greenSoft, color: C.greenDk }}><ShieldCheck size={16} /> Por transparencia y ética, nunca mostramos información socioeconómica de los estudiantes.</div>
      <FilterBar filters={["Carrera", "Sede", "Tipo de apoyo", "Áreas de interés"]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{STUDENTS.map(s => (
        <Card key={s.name} hover>
          <div className="flex items-center gap-3"><Avatar name={s.name} size={48} tone={C.green} /><div className="min-w-0"><div className="font-bold text-[15px] truncate" style={{ color: C.ink }}>{s.name}</div><div className="text-[12.5px]" style={{ color: C.sub }}>{s.career}</div></div></div>
          <div className="flex items-center gap-1 mt-2 text-[12px]" style={{ color: C.faint }}><MapPin size={13} /> {s.sede}</div>
          <div className="mt-3 p-3 rounded-xl text-[13px] leading-snug" style={{ background: C.bg, color: C.ink }}><div className="text-[10.5px] font-bold uppercase tracking-wider mb-1" style={{ color: C.faint }}>Proyecto</div>{s.project}</div>
          <div className="mt-3"><div className="flex justify-between text-[11.5px] font-semibold mb-1" style={{ color: C.sub }}><span>Avance</span><span>{s.progress}%</span></div><Progress value={s.progress} tone={C.green} h={7} /></div>
          <div className="flex flex-wrap gap-1.5 mt-3">{s.need.map(t => <Badge key={t} tone="blue">{t}</Badge>)}</div>
          <Btn variant="green" full size="sm" className="mt-4" icon={Heart} onClick={() => nav("donations")}>Ofrecer apoyo</Btn>
        </Card>
      ))}</div>
    </>
  );
}
