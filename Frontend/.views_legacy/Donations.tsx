"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Heart, ShieldCheck, Target, Upload, Users } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { Avatar, Badge, Btn, Card, Field, Progress, inputCls, inputSty } from "@/components/ui";
import { Sunburst } from "@/components/brand";
import { PageHead } from "@/components/layout";

export function Donations(_props: any) {
  const [amount, setAmount] = useState("50000");
  const presets = ["25000", "50000", "100000", "300000"];
  return (
    <>
      <PageHead eyebrow="Impacto directo" title="Módulo de donaciones" sub="Financia un proyecto con trazabilidad total" tone={C.greenDk} />
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <Card pad="p-0" className="overflow-hidden">
          <div className="h-28 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.greenDk}, ${C.green})` }}>
            <div className="absolute -right-2 -top-2"><Sunburst size={70} color="rgba(255,255,255,.3)" /></div>
            <div className="absolute bottom-4 left-5"><Badge tone="dark"><Target size={12} /> Meta de financiamiento</Badge></div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3"><Avatar name="Valeria Campos" size={48} tone={C.green} /><div><div className="font-bold text-[16px]" style={{ color: C.ink }}>Prótesis de bajo costo en 3D</div><div className="text-[13px]" style={{ color: C.sub }}>Valeria Campos · Ing. Biomédica</div></div></div>
            <p className="text-sm mt-4 leading-relaxed" style={{ color: C.sub }}>Diseño de prótesis transtibiales modulares que reducen el costo en un 80% para mejorar el acceso en zonas rurales de Costa Rica.</p>
            <div className="mt-5"><div className="flex items-end justify-between mb-1.5"><span className="text-[22px] font-extrabold" style={{ color: C.greenDk, fontFamily: FONT_DISP }}>₡525,000</span><span className="text-[13px] font-semibold" style={{ color: C.sub }}>de ₡800,000</span></div><Progress value={66} tone={C.green} h={12} /><div className="flex items-center gap-4 mt-3 text-[12.5px]" style={{ color: C.sub }}><span className="flex items-center gap-1"><Users size={14} /> 3 donantes</span><span className="flex items-center gap-1"><Clock size={14} /> 21 días restantes</span></div></div>
            <div className="mt-5 pt-5 space-y-2" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Trazabilidad</div>
              {[["Donación recibida", "Confirmada"], ["Comprobante validado", "Confirmada"], ["Fondos transferidos", "Pendiente"]].map(([t, st]) => (
                <div key={t} className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2" style={{ color: C.ink }}><CheckCircle2 size={15} color={st === "Confirmada" ? C.greenDk : C.faint} /> {t}</span><Badge tone={st === "Confirmada" ? "green" : "gold"}>{st}</Badge></div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-bold text-[16px]" style={{ color: C.ink }}>Realizar donación</h3>
          <div className="grid grid-cols-2 gap-2 mt-4">{presets.map(p => (
            <button key={p} onClick={() => setAmount(p)} className="py-3 rounded-xl font-bold text-[15px] transition-all" style={amount === p ? { background: C.greenDk, color: "#fff" } : { background: C.bg, color: C.ink, border: `1px solid ${C.line}` }}>₡{Number(p).toLocaleString()}</button>
          ))}</div>
          <Field label="Otro monto"><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold" style={{ color: C.sub }}>₡</span><input value={Number(amount).toLocaleString()} onChange={e => setAmount(e.target.value.replace(/\D/g, "") || "0")} className={inputCls + " pl-8"} style={inputSty} /></div></Field>
          <div className="mt-4"><Field label="Comprobante de transferencia" hint="PDF o imagen, máx. 5MB"><div className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-6 cursor-pointer" style={{ borderColor: C.line }}><Upload size={22} color={C.greenDk} /><div className="text-[13px] font-semibold mt-2" style={{ color: C.ink }}>Sube tu comprobante</div><div className="text-[11.5px]" style={{ color: C.faint }}>Arrastra o haz clic</div></div></Field></div>
          <Btn variant="green" full size="lg" className="mt-5" icon={Heart}>Donar ₡{Number(amount).toLocaleString()}</Btn>
          <div className="flex items-center justify-center gap-1.5 mt-3 text-[11.5px]" style={{ color: C.faint }}><ShieldCheck size={14} /> Transacción segura y verificada</div>
        </Card>
      </div>
    </>
  );
}
