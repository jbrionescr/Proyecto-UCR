"use client";

import React from "react";
import { Building2, GraduationCap, Handshake, MapPin } from "lucide-react";
import { C } from "@/lib/theme";
import { ALUMNI } from "@/lib/data";
import { Avatar, Badge, Btn, Card } from "@/components/ui";
import { FilterBar, PageHead } from "@/components/layout";

export function DirectoryAlumni({ nav }: any) {
  return (
    <>
      <PageHead eyebrow="Comunidad" title="Directorio de exalumnos" sub={`${ALUMNI.length} perfiles disponibles para conectar`} tone={C.blue} />
      <FilterBar filters={["Carrera", "Industria", "País", "Tipo de apoyo", "Áreas de interés"]} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{ALUMNI.map(a => (
        <Card key={a.name} hover pad="p-0" className="overflow-hidden">
          <div className="h-16" style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.celeste})` }} />
          <div className="px-5 pb-5 -mt-8">
            <Avatar name={a.name} size={56} />
            <div className="font-bold text-[15px] mt-3" style={{ color: C.ink }}>{a.name}</div>
            <div className="text-[13px] font-semibold" style={{ color: C.sub }}>{a.role}</div>
            <div className="text-[12.5px] flex items-center gap-1 mt-1" style={{ color: C.sub }}><Building2 size={13} /> {a.company}</div>
            <div className="flex items-center gap-3 mt-2 text-[12px]" style={{ color: C.faint }}><span className="flex items-center gap-1"><GraduationCap size={13} /> {a.career}</span><span className="flex items-center gap-1"><MapPin size={13} /> {a.country}</span></div>
            <div className="flex flex-wrap gap-1.5 mt-3">{a.tags.map(t => <Badge key={t} tone="green">{t}</Badge>)}</div>
            <Btn variant="primary" full size="sm" className="mt-4" icon={Handshake} onClick={() => nav("matching")}>Conectar</Btn>
          </div>
        </Card>
      ))}</div>
    </>
  );
}
