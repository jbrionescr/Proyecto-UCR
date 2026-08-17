"use client";

import React from "react";
import { BookOpen, CheckCircle2, ChevronRight, GraduationCap, Heart, PartyPopper, Quote, ShieldCheck, Sparkles, User } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { IMGS, IMPACT } from "@/lib/data";
import { Avatar, Badge, Btn, Card, Eyebrow, Img, Ring, Title } from "@/components/ui";
import { Brand, Sunburst } from "@/components/brand";
import { Matching } from "@/views";

export function Landing({ nav }: any) {
  const steps = [
    { n: "01", t: "Crea tu perfil", d: "Exalumnos y estudiantes se registran y verifican su vínculo con la UCR.", icon: User, c: C.blue },
    { n: "02", t: "Recibe tu match", d: "Nuestro motor de afinidad conecta perfiles por carrera, intereses y tipo de apoyo.", icon: Sparkles, c: C.amarillo },
    { n: "03", t: "Genera impacto", d: "Mentoría, empleo, pasantías o financiamiento con trazabilidad total.", icon: Heart, c: C.naranja },
  ];
  const stories = [
    { q: "El financiamiento de un exalumno hizo posible mi prototipo de prótesis. Hoy es una empresa.", n: "Valeria Campos", r: "Ing. Biomédica · Generación 2025" },
    { q: "Mentoré a tres estudiantes y dos ya trabajan en mi equipo. La UCR me formó; ahora devuelvo.", n: "Lucía Vargas", r: "Product Lead en Stripe" },
    { q: "Una pasantía conseguida aquí definió mi carrera. La transparencia del proceso me dio confianza.", n: "Mateo Jiménez", r: "Ciencias de la Computación" },
  ];
  return (
    <div style={{ background: C.white }}>
      <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(255,255,255,.9)", borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Brand size={32} />
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold" style={{ color: C.sub }}>
            <a className="hover:opacity-70 cursor-pointer">Cómo funciona</a><a className="hover:opacity-70 cursor-pointer">Impacto</a>
            <a className="hover:opacity-70 cursor-pointer">Historias</a><a className="hover:opacity-70 cursor-pointer">Empresas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={() => nav("dash-alumni")}>Ingresar</Btn>
            <Btn variant="orange" size="sm" onClick={() => nav("register-alumni")}>Inscríbete</Btn>
          </div>
        </div>
      </header>

      {/* HERO — estilo de marca: fondo celeste, texto esmeralda, formas geométricas */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(165deg, ${C.celeste} 0%, #7CCDF0 100%)` }}>
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full opacity-30" style={{ background: C.blue }} />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rotate-12 opacity-20" style={{ background: C.esmeralda }} />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-24 grid lg:grid-cols-[1.08fr_.92fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[.16em] px-3 py-1.5 rounded-full" style={{ background: C.esmeralda, color: "#fff" }}>
              <ShieldCheck size={13} /> Fundación Exalumnos de la UCR
            </span>
            <Title upper className="mt-5" style={{ fontSize: "clamp(34px,5vw,58px)", color: C.esmeralda }}>
              Conectamos exalumnos UCR con estudiantes que <span style={{ color: C.naranja }}>transforman el futuro.</span>
            </Title>
            <p className="mt-5 text-[16px] leading-relaxed max-w-xl font-medium" style={{ color: "#0B4456" }}>
              Mentoría, empleo, pasantías y financiamiento, con trazabilidad total y enfoque en impacto social. Un solo lugar para retribuir lo que la U nos dio.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn variant="orange" size="lg" icon={GraduationCap} onClick={() => nav("register-alumni")}>Registrarme como Exalumno</Btn>
              <Btn size="lg" icon={BookOpen} onClick={() => nav("register-student")} style={{ background: C.esmeralda, color: "#fff" }}>Soy Estudiante</Btn>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-[13px] font-semibold" style={{ color: C.esmeralda }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} /> Verificación con correo UCR</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={15} /> 100% transparente</span>
            </div>
          </div>
          {/* Tarjeta de match con formas geométricas */}
          <div className="relative">
            <div className="absolute -top-7 -left-6 w-24 h-24 rounded-2xl rotate-12" style={{ background: C.naranja, opacity: .9 }} />
            <div className="absolute -bottom-8 -right-4"><Sunburst size={92} color={C.amarillo} /></div>
            <Card pad="p-5" className="relative shadow-2xl" style={{ border: "none" }}>
              <div className="flex items-center justify-between mb-4"><Eyebrow tone={C.blue}>Match recomendado</Eyebrow><Ring value={96} size={48} /></div>
              <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <Avatar name="Lucía Vargas" size={44} /><div><div className="font-bold text-[14px]" style={{ color: C.ink }}>Lucía Vargas</div><div className="text-[12px]" style={{ color: C.sub }}>Product Lead · Stripe</div></div>
              </div>
              <div className="flex items-center gap-3 pt-3">
                <Avatar name="Valeria Campos" size={44} tone={C.green} /><div><div className="font-bold text-[14px]" style={{ color: C.ink }}>Valeria Campos</div><div className="text-[12px]" style={{ color: C.sub }}>Ing. Biomédica · Estudiante</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5"><Badge tone="green">Mentoría</Badge><Badge tone="blue">Salud + Tech</Badge><Badge tone="gold">Mismo interés</Badge></div>
            </Card>
          </div>
        </div>
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 40 }}><path d="M0 60 L1440 60 L1440 0 C1080 50 360 50 0 0 Z" fill={C.white} /></svg>
      </section>

      {/* IMPACTO */}
      <section className="max-w-6xl mx-auto px-5 -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPACT.map(s => (
            <Card key={s.label} hover pad="p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.tone + "1a", color: s.tone }}><s.icon size={19} /></div>
              <div className="text-[26px] font-extrabold leading-none" style={{ color: C.ink, fontFamily: FONT_DISP }}>{s.value}</div>
              <div className="text-[13px] font-semibold mt-1.5" style={{ color: C.ink }}>{s.label}</div>
              <div className="text-[12px] mt-0.5 font-semibold" style={{ color: C.greenDk }}>{s.sub}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* PASOS */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex justify-center"><Eyebrow>Así funciona</Eyebrow></div>
          <Title upper className="mt-3" style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>Tres pasos para generar impacto real</Title>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <Card key={s.n} pad="p-7" className="relative" hover>
              <div className="text-[28px] font-extrabold mb-3" style={{ color: C.line, fontFamily: FONT_DISP }}>{s.n}</div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: s.c + "1a", color: s.c }}><s.icon size={22} /></div>
              <div className="font-bold text-[18px] uppercase tracking-wide" style={{ color: C.ink, fontFamily: FONT_DISP }}>{s.t}</div>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: C.sub }}>{s.d}</p>
              {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2" size={22} color={C.line} />}
            </Card>
          ))}
        </div>
      </section>

      {/* HISTORIAS */}
      <section style={{ background: C.bg }}>
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="flex justify-center"><Eyebrow tone={C.amarillo}>Historias de éxito</Eyebrow></div>
          <Title upper className="mt-3 text-center" style={{ fontSize: "clamp(26px,3.4vw,40px)" }}>El círculo virtuoso de devolver</Title>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {stories.map(s => (
              <Card key={s.n} pad="p-7" hover>
                <Quote size={26} color={C.naranja} />
                <p className="mt-4 text-[15px] leading-relaxed font-medium" style={{ color: C.ink }}>“{s.q}”</p>
                <div className="mt-6 flex items-center gap-3"><Avatar name={s.n} size={42} /><div><div className="font-bold text-[13.5px]" style={{ color: C.ink }}>{s.n}</div><div className="text-[12px]" style={{ color: C.sub }}>{s.r}</div></div></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VIDA UNIVERSITARIA — SEMANA U */}
      <section className="max-w-6xl mx-auto px-5 py-4">
        <div className="rounded-3xl overflow-hidden grid md:grid-cols-2" style={{ border: `1px solid ${C.line}` }}>
          <div className="p-8 md:p-10 flex flex-col justify-center" style={{ background: `linear-gradient(135deg, ${C.celeste}, #7CCDF0)` }}>
            <Eyebrow tone={C.esmeralda}>Vida universitaria</Eyebrow>
            <Title upper className="mt-3" style={{ color: C.esmeralda, fontSize: "clamp(24px,3vw,34px)" }}>Conoce la Semana U</Title>
            <p className="mt-3 text-[14.5px] leading-relaxed font-medium" style={{ color: "#0B4456" }}>La fiesta universitaria más esperada de la UCR: música, ferias, deporte, arte y memoria histórica cada abril. Los exalumnos también vuelven a vivirla.</p>
            <div className="mt-5"><Btn variant="orange" icon={PartyPopper} onClick={() => nav("semana-u")}>Ver la Semana U</Btn></div>
          </div>
          <div className="relative" style={{ minHeight: 240 }}>
            <Img src={IMGS.conciertos} alt="Conciertos de la Semana U de la UCR" label="Semana U" className="absolute inset-0 w-full h-full" style={{ height: "100%" }} />
            <div className="absolute -bottom-4 -right-4"><Sunburst size={84} color={C.amarillo} /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.esmeralda}, ${C.blue})` }}>
          <div className="absolute -top-6 right-10"><Sunburst size={80} color={C.amarillo} /></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-25" style={{ background: C.naranja }} />
          <Title upper className="relative" style={{ color: "#fff", fontSize: "clamp(24px,3vw,36px)" }}>¿Listo para ser parte del cambio?</Title>
          <p className="relative mt-3 text-[15px] max-w-lg mx-auto" style={{ color: "#CDEAF8" }}>Súmate a más de 3,500 exalumnos que ya transforman vidas en la comunidad UCR.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Btn variant="orange" size="lg" icon={Sparkles} onClick={() => nav("register-alumni")}>Empezar ahora</Btn>
            <Btn size="lg" onClick={() => nav("matching")} style={{ background: "rgba(255,255,255,.14)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>Ver matches</Btn>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.ink }}>
        <div className="max-w-6xl mx-auto px-5 py-14 grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
          <div>
            <Brand light size={34} />
            <p className="mt-4 text-[13px] leading-relaxed max-w-xs" style={{ color: "#9AA6B2" }}>Iniciativa de la comunidad de la Universidad de Costa Rica. Egresados comprometidos con impulsar los sueños y el futuro de la UCR.</p>
          </div>
          {[["Plataforma", ["Cómo funciona", "Matching", "Donaciones", "Empleos"]], ["Comunidad", ["Exalumnos", "Estudiantes", "Empresas aliadas", "Historias"]], ["Legal", ["Privacidad", "Términos", "Transparencia", "Contacto"]]].map(([t, items]: any) => (
            <div key={t}><div className="text-white font-bold text-[13px] mb-3 uppercase tracking-wide" style={{ fontFamily: FONT_DISP }}>{t}</div>
              <ul className="space-y-2 text-[13px]" style={{ color: "#9AA6B2" }}>{items.map(i => <li key={i} className="hover:text-white cursor-pointer">{i}</li>)}</ul></div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <div className="max-w-6xl mx-auto px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px]" style={{ color: "#6B7682" }}>
            <span>© 2026 Fundación Exalumnos de la UCR · Alumni UCR.</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Datos protegidos · Cumplimiento WCAG 2.1 AA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
