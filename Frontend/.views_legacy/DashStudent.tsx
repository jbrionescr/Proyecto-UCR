"use client";

import React from "react";
import { Check, ChevronRight, CircleDot, Handshake, Send, Sparkles, Target, Wallet } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { ALUMNI } from "@/lib/data";
import { Avatar, Badge, Btn, Card, Progress, Ring } from "@/components/ui";
import { PageHead, StatTile } from "@/components/layout";

export function DashStudent({ nav }: any) {
  return (
    <>
      <PageHead eyebrow="Hola, Valeria" title="Tu camino a la graduación" sub="Seguimiento de tu proyecto, apoyos y oportunidades." tone={C.greenDk} action={<Btn variant="green" icon={Sparkles} onClick={() => nav("matching")}>Buscar apoyo</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Avance del proyecto" value="72%" icon={Target} tone={C.greenDk} />
        <StatTile label="Aplicaciones enviadas" value="6" icon={Send} tone={C.blue} />
        <StatTile label="Mentorías activas" value="2" icon={Handshake} tone={C.naranja} />
        <StatTile label="Recibido este año" value="₡525K" icon={Wallet} tone={C.amarillo} sub="3 donantes" />
      </div>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-[16px]" style={{ color: C.ink }}>Estado del proyecto</h3><Badge tone="green">En progreso</Badge></div>
            <div className="font-semibold text-[14px] mb-1" style={{ color: C.ink }}>Prótesis de bajo costo impresas en 3D</div>
            <Progress value={72} tone={C.green} h={10} />
            <div className="grid grid-cols-4 gap-2 mt-4">{[["Propuesta", true], ["Diseño", true], ["Prototipo", true], ["Defensa", false]].map(([t, done]: any) => (
              <div key={t} className="text-center"><div className="w-9 h-9 mx-auto rounded-full flex items-center justify-center" style={done ? { background: C.green, color: "#063" } : { background: "#EDF1F7", color: C.faint }}>{done ? <Check size={16} /> : <CircleDot size={16} />}</div><div className="text-[11px] mt-1.5 font-semibold" style={{ color: done ? C.ink : C.faint }}>{t}</div></div>
            ))}</div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[16px]" style={{ color: C.ink }}>Matches recomendados</h3><button className="text-[13px] font-semibold flex items-center gap-1" style={{ color: C.greenDk }} onClick={() => nav("matching")}>Ver todos <ChevronRight size={15} /></button></div>
            <div className="space-y-3">{ALUMNI.slice(0, 3).map(a => (
              <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ border: `1px solid ${C.line}` }}><Avatar name={a.name} size={42} /><div className="min-w-0 flex-1"><div className="font-bold text-[14px] truncate" style={{ color: C.ink }}>{a.name}</div><div className="text-[12px] truncate" style={{ color: C.sub }}>{a.role} · {a.company}</div></div><Ring value={a.score} size={44} /></div>
            ))}</div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[16px] mb-4" style={{ color: C.ink }}>Donaciones recibidas</h3>
            <div className="text-center py-2"><div className="text-[30px] font-extrabold" style={{ color: C.greenDk, fontFamily: FONT_DISP }}>₡525K</div><div className="text-[13px]" style={{ color: C.sub }}>de ₡800K objetivo</div><Progress value={66} tone={C.green} h={10} /></div>
            <Btn variant="green" full className="mt-3" onClick={() => nav("")}>Ver módulo de donaciones</Btn>
          </Card>
          <Card>
            <h3 className="font-bold text-[16px] mb-4" style={{ color: C.ink }}>Aplicaciones enviadas</h3>
            <div className="space-y-3">{[["Ing. Software Jr.", "Globant", "En revisión", "gold"], ["Pasantía Datos", "BAC", "Entrevista", "green"], ["UX Designer", "Stripe", "Enviada", "blue"]].map(([t, co, st, tn]) => (
              <div key={t} className="flex items-center justify-between"><div><div className="text-[13px] font-semibold" style={{ color: C.ink }}>{t}</div><div className="text-[11.5px]" style={{ color: C.faint }}>{co}</div></div><Badge tone={tn}>{st}</Badge></div>
            ))}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
