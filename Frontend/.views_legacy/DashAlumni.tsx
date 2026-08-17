"use client";

import React from "react";
import { Award, Briefcase, CheckCircle2, ChevronRight, Handshake, Plus, Send, Sparkles, Wallet } from "lucide-react";
import { C } from "@/lib/theme";
import { DONATIONS_HIST, STUDENTS } from "@/lib/data";
import { Avatar, Btn, Card, Ring } from "@/components/ui";
import { Sunburst } from "@/components/brand";
import { DonationTable, PageHead, StatTile } from "@/components/layout";

export function DashAlumni({ nav }: any) {
  return (
    <>
      <PageHead eyebrow="Buenos días, María Fernanda" title="Tu panel de impacto" sub="Esto sucede en tu comunidad UCR." tone={C.blue} action={<Btn variant="orange" icon={Plus} onClick={() => nav("jobs")}>Publicar posición</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Matches activos" value="5" icon={Sparkles} tone={C.blue} sub="+2" />
        <StatTile label="Posiciones abiertas" value="3" icon={Briefcase} tone={C.amarillo} />
        <StatTile label="Donado este año" value="₡725K" icon={Wallet} tone={C.greenDk} sub="18%" />
        <StatTile label="Mentorías activas" value="4" icon={Handshake} tone={C.naranja} />
      </div>
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[16px]" style={{ color: C.ink }}>Matches recomendados</h3><button className="text-[13px] font-semibold flex items-center gap-1" style={{ color: C.blue }} onClick={() => nav("matching")}>Ver todos <ChevronRight size={15} /></button></div>
            <div className="space-y-3">{STUDENTS.slice(0, 3).map(s => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ border: `1px solid ${C.line}` }}>
                <Avatar name={s.name} size={42} tone={C.green} />
                <div className="min-w-0 flex-1"><div className="font-bold text-[14px] truncate" style={{ color: C.ink }}>{s.name}</div><div className="text-[12px] truncate" style={{ color: C.sub }}>{s.career} · {s.project}</div></div>
                <Ring value={s.score} size={44} /><Btn variant="softblue" size="sm" onClick={() => nav("matching")}>Ver</Btn>
              </div>
            ))}</div>
          </Card>
          <Card><h3 className="font-bold text-[16px] mb-4" style={{ color: C.ink }}>Historial de donaciones</h3><DonationTable rows={_HIST.slice(0, 3)} /></Card>
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[16px] mb-4" style={{ color: C.ink }}>Actividad reciente</h3>
            <div className="space-y-4">{[["Valeria aceptó tu mentoría", "hace 2 h", C.greenDk, Handshake], ["Donación confirmada · ₡300K", "hace 1 d", C.blue, CheckCircle2], ["3 nuevos matches sugeridos", "hace 2 d", C.amarillo, Sparkles], ["Mateo aplicó a tu pasantía", "hace 3 d", C.naranja, Send]].map(([t, time, c, Icon]) => (
              <div key={t} className="flex gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c + "1a", color: c }}><Icon size={15} /></div><div><div className="text-[13px] font-semibold leading-tight" style={{ color: C.ink }}>{t}</div><div className="text-[11.5px]" style={{ color: C.faint }}>{time}</div></div></div>
            ))}</div>
          </Card>
          <Card className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.esmeralda}, ${C.blue})`, border: "none" }}>
            <div className="absolute -right-4 -top-4"><Sunburst size={70} color="rgba(255,255,255,.25)" /></div>
            <Award size={22} color={C.celeste} /><div className="text-white font-bold text-[16px] mt-3">Embajador UCR 2026</div><p className="text-[13px] mt-1" style={{ color: "#CDEAF8" }}>Estás entre el top 5% de exalumnos más activos. ¡Gracias por devolver!</p>
          </Card>
        </div>
      </div>
    </>
  );
}
