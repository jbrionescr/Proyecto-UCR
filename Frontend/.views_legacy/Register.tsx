"use client";

import React, { useState } from "react";
import { ArrowRight, Check, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { C } from "@/lib/theme";
import { Badge, Btn, Card, Eyebrow, Field, Progress, Title, inputCls, inputSty } from "@/components/ui";
import { Brand } from "@/components/brand";

export function Register({ role, nav }: any) {
  const isAlum = role === "alumni";
  const accent = isAlum ? C.blue : C.greenDk;
  const steps = isAlum
    ? ["Información personal", "Historial académico UCR", "Información profesional", "Áreas de interés", "Tipo de apoyo"]
    : ["Verificación UCR", "Información académica", "Proyecto de graduación", "Necesidades de apoyo", "Áreas de interés"];
  const [step, setStep] = useState(0);
  const pct = Math.round(((step + 1) / steps.length) * 100);
  const interests = ["Salud", "Tecnología", "Sostenibilidad", "Educación", "Finanzas", "Emprendimiento", "Arte", "Ingeniería", "Ciencias sociales"];
  const support = isAlum ? ["Mentoría", "Oferta de empleo", "Pasantías", "Financiamiento", "Networking", "Revisión de CV"] : ["Mentoría", "Empleo", "Pasantía", "Financiamiento", "Asesoría de proyecto"];
  const [sel, setSel] = useState([]);
  const toggle = x => setSel(s => s.includes(x) ? s.filter(i => i !== x) : [...s, x]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <header className="h-16 flex items-center justify-between px-5 bg-white" style={{ borderBottom: `1px solid ${C.line}` }}>
        <Brand size={30} /><Btn variant="ghost" size="sm" icon={X} onClick={() => nav("landing")}>Salir</Btn>
      </header>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Eyebrow tone={accent}>{isAlum ? "Registro de Exalumno" : "Registro de Estudiante"}</Eyebrow>
        <Title upper className="mt-3" style={{ fontSize: 32 }}>{steps[step]}</Title>
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between mb-2 text-[12px] font-semibold" style={{ color: C.sub }}><span>Paso {step + 1} de {steps.length}</span><span>{pct}%</span></div>
          <Progress value={pct} tone={accent} h={8} />
          <div className="hidden sm:flex justify-between mt-3">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex justify-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold" style={i <= step ? { background: accent, color: "#fff" } : { background: "#EDF1F7", color: C.faint }}>{i < step ? <Check size={14} /> : i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <Card pad="p-6 md:p-8">
          {step === 0 && !isAlum && (
            <div className="space-y-5">
              <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: C.greenSoft }}>
                <ShieldCheck size={20} color={C.greenDk} className="mt-0.5" />
                <div><div className="font-bold text-[14px]" style={{ color: C.greenDk }}>Verificación obligatoria</div><div className="text-[13px]" style={{ color: C.sub }}>Solo correos institucionales @ucr.ac.cr pueden registrarse como estudiantes.</div></div>
              </div>
              <Field label="Correo institucional UCR" ok hint="Te enviaremos un código de 6 dígitos."><input className={inputCls} style={inputSty} defaultValue="valeria.campos@ucr.ac.cr" /></Field>
              <Field label="Código de verificación"><div className="flex gap-2">{[2, 4, 9, 1, 0, 5].map((d, i) => <input key={i} maxLength={1} defaultValue={d} className="w-12 h-12 text-center text-lg font-bold rounded-xl outline-none" style={inputSty} />)}</div></Field>
              <Badge tone="green"><CheckCircle2 size={13} /> Correo verificado correctamente</Badge>
            </div>
          )}
          {step === 0 && isAlum && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Nombre completo" ok><input className={inputCls} style={inputSty} defaultValue="María Fernanda Rojas" /></Field>
              <Field label="Correo electrónico" ok><input className={inputCls} style={inputSty} defaultValue="mf.rojas@gmail.com" /></Field>
              <Field label="Teléfono"><input className={inputCls} style={inputSty} placeholder="+506 8888 8888" /></Field>
              <Field label="País de residencia"><input className={inputCls} style={inputSty} defaultValue="Costa Rica" /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Carrera UCR" ok><input className={inputCls} style={inputSty} defaultValue={isAlum ? "Ing. Eléctrica" : "Ing. Biomédica"} /></Field>
              <Field label="Sede"><input className={inputCls} style={inputSty} defaultValue="Rodrigo Facio" /></Field>
              <Field label={isAlum ? "Año de graduación" : "Año de ingreso"}><input className={inputCls} style={inputSty} defaultValue={isAlum ? "2014" : "2022"} /></Field>
              <Field label={isAlum ? "Grado obtenido" : "Avance de carrera"}><input className={inputCls} style={inputSty} defaultValue={isAlum ? "Licenciatura" : "Cuarto año"} /></Field>
            </div>
          )}
          {step === 2 && isAlum && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Cargo actual" ok><input className={inputCls} style={inputSty} defaultValue="VP de Ingeniería" /></Field>
              <Field label="Empresa" ok><input className={inputCls} style={inputSty} defaultValue="Globant" /></Field>
              <Field label="Industria"><input className={inputCls} style={inputSty} defaultValue="Tecnología" /></Field>
              <Field label="LinkedIn"><input className={inputCls} style={inputSty} placeholder="linkedin.com/in/..." /></Field>
            </div>
          )}
          {step === 2 && !isAlum && (
            <div className="space-y-5">
              <Field label="Título del proyecto de graduación" ok><input className={inputCls} style={inputSty} defaultValue="Prótesis de bajo costo impresas en 3D" /></Field>
              <Field label="Resumen del proyecto"><textarea rows={4} className={inputCls} style={inputSty} defaultValue="Diseño de prótesis transtibiales modulares mediante impresión 3D para reducir costos en un 80% y mejorar el acceso en zonas rurales." /></Field>
              <Field label="Avance actual"><Progress value={72} tone={C.green} h={10} showLabel /></Field>
            </div>
          )}
          {step === 3 && (
            <div>
              <p className="text-sm mb-4" style={{ color: C.sub }}>{isAlum ? "Selecciona las áreas en las que te gustaría apoyar." : "Selecciona tus áreas de interés profesional."}</p>
              <div className="flex flex-wrap gap-2">{interests.map(x => <button key={x} onClick={() => toggle(x)} className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all" style={sel.includes(x) ? { background: accent, color: "#fff" } : { background: "#EEF2F8", color: C.sub }}>{x}</button>)}</div>
            </div>
          )}
          {step === 4 && (
            <div>
              <p className="text-sm mb-4" style={{ color: C.sub }}>{isAlum ? "¿Qué tipo de apoyo puedes ofrecer?" : "¿Qué tipo de apoyo necesitas?"}</p>
              <div className="grid sm:grid-cols-2 gap-3">{support.map(x => (
                <button key={x} onClick={() => toggle(x)} className="flex items-center gap-3 p-4 rounded-xl text-left transition-all" style={sel.includes(x) ? { border: `2px solid ${accent}`, background: isAlum ? C.celesteSoft : C.greenSoft } : { border: `1px solid ${C.line}`, background: "#fff" }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={sel.includes(x) ? { background: accent } : { border: `2px solid ${C.line}` }}>{sel.includes(x) && <Check size={13} color="#fff" />}</div>
                  <span className="text-[14px] font-semibold" style={{ color: C.ink }}>{x}</span>
                </button>
              ))}</div>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Btn variant="outline" onClick={() => step === 0 ? nav("landing") : setStep(s => s - 1)}>Atrás</Btn>
          {step < steps.length - 1
            ? <Btn variant={isAlum ? "primary" : "green"} icon={ArrowRight} onClick={() => setStep(s => s + 1)}>Continuar</Btn>
            : <Btn variant="orange" icon={CheckCircle2} onClick={() => nav(isAlum ? "dash-alumni" : "dash-student")}>Finalizar registro</Btn>}
        </div>
      </div>
    </div>
  );
}
