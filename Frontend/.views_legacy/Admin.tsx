"use client";

import React from "react";
import { AlertTriangle, Calendar, GraduationCap, Shield, ShieldCheck, Sparkles, Target, Users, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { C } from "@/lib/theme";
import { DONATIONS_HIST, byCareer, byMonth, bySede, donorMix } from "@/lib/data";
import { Badge, Btn, Card, EmptyState } from "@/components/ui";
import { DonationTable, PageHead, StatTile } from "@/components/layout";

export function Admin(_props: any) {
  const kpis = [
    { label: "Total donado", value: "₡248.6M", icon: Wallet, tone: C.greenDk, sub: "18%" },
    { label: "Matches activos", value: "892", icon: Sparkles, tone: C.blue, sub: "12%" },
    { label: "Proyectos apoyados", value: "1,284", icon: Target, tone: C.amarillo },
    { label: "Exalumnos activos", value: "3,512", icon: Users, tone: C.naranja, sub: "9%" },
    { label: "Estudiantes activos", value: "2,140", icon: GraduationCap, tone: C.esmeralda, sub: "15%" },
  ];
  return (
    <>
      <PageHead eyebrow="Panel administrativo" title="Dashboard ejecutivo" sub="Visión integral del impacto de la Fundación" tone={C.esmeralda} action={<Btn variant="outline" size="sm" icon={Calendar}>2026 · Año actual</Btn>} />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">{kpis.map(k => <StatTile key={k.label} {...k} />)}</div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-bold text-[15px] mb-4" style={{ color: C.ink }}>Donaciones por carrera <span className="font-normal" style={{ color: C.faint }}>(₡ millones)</span></h3>
          <ResponsiveContainer width="100%" height={240}><BarChart data={byCareer} margin={{ left: -18 }}><CartesianGrid vertical={false} stroke={C.line} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#F0F4FA" }} contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} /><Bar dataKey="v" radius={[6, 6, 0, 0]} fill={C.blue} /></BarChart></ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-bold text-[15px] mb-4" style={{ color: C.ink }}>Evolución mensual <span className="font-normal" style={{ color: C.faint }}>(₡ millones)</span></h3>
          <ResponsiveContainer width="100%" height={240}><AreaChart data={byMonth} margin={{ left: -18 }}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.green} stopOpacity={.35} /><stop offset="100%" stopColor={C.green} stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke={C.line} /><XAxis dataKey="m" tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: C.faint }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12 }} /><Area dataKey="v" stroke={C.greenDk} strokeWidth={2.5} fill="url(#g)" /></AreaChart></ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-bold text-[15px] mb-4" style={{ color: C.ink }}>Distribución por sede</h3>
          <div className="flex items-center gap-4"><ResponsiveContainer width="55%" height={180}><PieChart><Pie data={bySede} dataKey="v" innerRadius={42} outerRadius={70} paddingAngle={2}>{bySede.map(s => <Cell key={s.name} fill={s.c} />)}</Pie></PieChart></ResponsiveContainer><div className="space-y-2 flex-1">{bySede.map(s => <div key={s.name} className="flex items-center justify-between text-[12.5px]"><span className="flex items-center gap-2" style={{ color: C.sub }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.c }} /> {s.name}</span><b style={{ color: C.ink }}>{s.v}%</b></div>)}</div></div>
        </Card>
        <Card>
          <h3 className="font-bold text-[15px] mb-4" style={{ color: C.ink }}>Donantes nuevos vs. recurrentes</h3>
          <div className="flex items-center gap-4"><ResponsiveContainer width="55%" height={180}><PieChart><Pie data={donorMix} dataKey="v" innerRadius={42} outerRadius={70} paddingAngle={2}>{donorMix.map(s => <Cell key={s.name} fill={s.c} />)}</Pie></PieChart></ResponsiveContainer><div className="space-y-3 flex-1">{donorMix.map(s => <div key={s.name}><div className="flex items-center justify-between text-[13px] mb-1"><span className="flex items-center gap-2" style={{ color: C.sub }}><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.c }} /> {s.name}</span><b style={{ color: C.ink }}>{s.v}%</b></div></div>)}</div></div>
        </Card>
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Card><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[15px]" style={{ color: C.ink }}>Donaciones pendientes</h3><Badge tone="gold">{DONATIONS_HIST.filter(d => d.status === "Pendiente").length} por revisar</Badge></div><DonationTable rows={DONATIONS_HIST} /></Card>
        <Card>
          <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-[15px] flex items-center gap-2" style={{ color: C.ink }}><Shield size={16} color="#C0392B" /> Reportes de fraude</h3><Badge tone="red">2 activos</Badge></div>
          <div className="space-y-3">{[["Comprobante duplicado", "Donación #4821", "Alta"], ["Perfil sin verificar", "Usuario #1290", "Media"]].map(([t, ref, sev]) => (
            <div key={ref} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#FDF3F3" }}><AlertTriangle size={18} color="#C0392B" className="mt-0.5 shrink-0" /><div className="flex-1"><div className="text-[13.5px] font-bold" style={{ color: C.ink }}>{t}</div><div className="text-[11.5px]" style={{ color: C.sub }}>{ref}</div></div><Badge tone={sev === "Alta" ? "red" : "gold"}>{sev}</Badge></div>
          ))}<EmptyState icon={ShieldCheck} title="Todo en orden" sub="No hay más reportes pendientes de revisión." /></div>
        </Card>
      </div>
    </>
  );
}
