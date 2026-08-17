"use client";

import React from "react";
import { Briefcase, Calendar, ChevronRight, Drama, Flag, GraduationCap, MapPin, Music, Palette, PartyPopper, Trophy, Users } from "lucide-react";
import { C, FONT_DISP } from "@/lib/theme";
import { IMGS } from "@/lib/data";
import { Badge, Btn, Card, Eyebrow, Img, Title } from "@/components/ui";
import { Brand, Sunburst } from "@/components/brand";

export function SemanaU({ nav, embedded }: any) {
  const facts = [
    { v: "Cada abril", l: "Se celebra anualmente", icon: Calendar, c: C.naranja },
    { v: "200+", l: "Actividades en todas las sedes", icon: PartyPopper, c: C.blue },
    { v: "Años 70", l: "Origen en la lucha estudiantil", icon: Flag, c: C.amarillo },
    { v: "6 sedes", l: "De costa a costa del país", icon: MapPin, c: C.greenDk },
  ];
  const acts = [
    { t: "Conciertos FEUCR", d: "Tres noches de música en el parqueo de Ciencias Económicas, el cartel artístico organizado por la Federación de Estudiantes.", icon: Music, c: C.naranja },
    { t: "Ferias de emprendedores", d: "Estudiantes y egresados muestran proyectos, productos y emprendimientos nacidos en la U.", icon: Briefcase, c: C.blue },
    { t: "Deporte y recreación", d: "Torneos, la Milla Universitaria recreativa y actividades al aire libre por todo el campus.", icon: Trophy, c: C.greenDk },
    { t: "Teatro y artes", d: "Obras, exposiciones de pintura y fotografía, y grupos artísticos de la Universidad.", icon: Drama, c: C.amarillo },
    { t: "Conferencias y foros", d: "Charlas, debates y espacios de reflexión sobre la realidad nacional y el quehacer universitario.", icon: Users, c: C.esmeralda },
    { t: "Memoria histórica", d: "Marchas y actos que conmemoran las luchas del movimiento estudiantil cada 24 de abril.", icon: Flag, c: C.naranja },
  ];
  const gallery = [
    { src: IMGS.campus, cap: "Campus Rodrigo Facio, San Pedro", credit: "Wikimedia Commons · CC BY-SA", label: "Campus UCR" },
    { src: IMGS.estudiantes1, cap: "Comunidad estudiantil de la UCR", credit: "Wikimedia Commons · CC BY-SA", label: "Estudiantes" },
    { src: IMGS.estudiantes2, cap: "Charlas y foros universitarios", credit: "Wikimedia Commons · CC BY-SA", label: "Foros" },
  ];
  const prog = [
    { day: "Lun 20", date: "Apertura", items: [["10:00", "Inauguración en el Pretil", Flag], ["1:00", "Feria de emprendedores UCR", Briefcase], ["6:00", "Teatro — grupo Dionisios", Drama]] },
    { day: "Mar 21", date: "Cultura", items: [["11:00", "Exposición de arte y fotografía", Palette], ["3:00", "Foro: juventud y país", Users], ["7:00", "Concierto FEUCR — Noche 1", Music]] },
    { day: "Mié 22", date: "Deporte", items: [["8:00", "Milla Universitaria recreativa", Trophy], ["2:00", "Torneos interfacultades", Trophy], ["7:00", "Concierto FEUCR — Noche 2", Music]] },
    { day: "Jue 23", date: "Conmemoración", items: [["9:00", "Marcha por la milla universitaria", Flag], ["4:30", "Acto 24 de Abril — Plaza 24 de Abril", Flag], ["8:00", "Concierto FEUCR — Noche 3", Music]] },
    { day: "Vie 24", date: "Cierre", items: [["12:00", "Feria gastronómica y cultural", PartyPopper], ["5:00", "Premiación y cierre", Trophy]] },
  ];
  const header = (
    <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(255,255,255,.9)", borderBottom: `1px solid ${C.line}` }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Brand size={32} /><Btn variant="ghost" size="sm" icon={ChevronRight} onClick={() => nav("landing")}>Volver al inicio</Btn>
      </div>
    </header>
  );
  const body = (
    <>
      {/* HERO con foto real de conciertos */}
      <section className="relative overflow-hidden" style={{ minHeight: 420, background: C.esmeralda }}>
        <Img src={IMGS.conciertos} alt="Conciertos de la Semana Universitaria de la UCR" label="Semana U · Conciertos" className="absolute inset-0 w-full h-full" style={{ height: "100%" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(6,24,40,.55) 0%, rgba(0,76,99,.82) 100%)` }} />
        <div className="absolute -bottom-6 right-6 opacity-90"><Sunburst size={110} color={C.amarillo} /></div>
        <div className="relative max-w-6xl mx-auto px-5 py-16 flex flex-col justify-end" style={{ minHeight: 420 }}>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[.16em] px-3 py-1.5 rounded-full w-fit" style={{ background: C.naranja, color: "#fff" }}><PartyPopper size={13} /> Tradición UCR · cada abril</span>
          <Title upper className="mt-4" style={{ color: "#fff", fontSize: "clamp(40px,7vw,76px)" }}>Semana U</Title>
          <p className="mt-3 text-[17px] max-w-2xl font-medium" style={{ color: "#DCEFF8" }}>La Semana Universitaria: la fiesta más esperada de la UCR. Música, arte, deporte, ferias y memoria histórica que llenan de energía cada sede del país.</p>
        </div>
      </section>

      {/* FACTS */}
      <section className="max-w-6xl mx-auto px-5 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{facts.map(f => (
          <Card key={f.l} hover pad="p-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: f.c + "1a", color: f.c }}><f.icon size={19} /></div><div className="text-[22px] font-extrabold leading-none" style={{ color: C.ink, fontFamily: FONT_DISP }}>{f.v}</div><div className="text-[12.5px] font-semibold mt-1.5" style={{ color: C.sub }}>{f.l}</div></Card>
        ))}</div>
      </section>

      {/* DÓNDE Y CUÁNDO */}
      <section className="max-w-6xl mx-auto px-5 pt-16">
        <div className="grid md:grid-cols-3 gap-4">
          <Card pad="p-6"><div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: C.naranja + "1a", color: C.naranja }}><Calendar size={20} /></div><div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Cuándo</div><div className="font-bold text-[18px] mt-1" style={{ color: C.ink, fontFamily: FONT_DISP }}>20 – 24 de abril, 2026</div><div className="text-[13px] mt-1" style={{ color: C.sub }}>Una semana completa de actividades, de lunes a viernes.</div></Card>
          <Card pad="p-6"><div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: C.blue + "1a", color: C.blue }}><MapPin size={20} /></div><div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Dónde</div><div className="font-bold text-[18px] mt-1" style={{ color: C.ink, fontFamily: FONT_DISP }}>Sede Rodrigo Facio</div><div className="text-[13px] mt-1" style={{ color: C.sub }}>El Pretil, la Plaza 24 de Abril y el parqueo de Ciencias Económicas. También en todas las sedes regionales.</div></Card>
          <Card pad="p-6"><div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: C.greenDk + "1a", color: C.greenDk }}><PartyPopper size={20} /></div><div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Qué</div><div className="font-bold text-[18px] mt-1" style={{ color: C.ink, fontFamily: FONT_DISP }}>Conciertos, ferias y más</div><div className="text-[13px] mt-1" style={{ color: C.sub }}>Música, deporte, teatro, foros y conmemoración. Entrada libre para la comunidad UCR.</div></Card>
        </div>
      </section>

      {/* PROGRAMA */}
      <section className="max-w-6xl mx-auto px-5 pt-16">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div><Eyebrow>Programa</Eyebrow><Title upper className="mt-2" style={{ fontSize: "clamp(22px,3vw,32px)" }}>Qué se va a hacer, día por día</Title></div>
          <Badge tone="gold"><Calendar size={12} /> Agenda de ejemplo · sujeta a cambios</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {prog.map((d, i) => (
            <Card key={d.day} pad="p-0" className="overflow-hidden">
              <div className="px-4 py-3" style={{ background: i === 3 ? C.naranja : C.esmeralda }}>
                <div className="text-white font-extrabold text-[15px]" style={{ fontFamily: FONT_DISP }}>{d.day}</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,.82)" }}>{d.date}</div>
              </div>
              <div className="p-3 space-y-3">
                {d.items.map(([h, t, Ic]) => (
                  <div key={t} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: C.bg, color: C.blue }}><Ic size={14} /></div>
                    <div><div className="text-[12px] font-bold leading-none mb-0.5" style={{ color: C.ink }}>{h}</div><div className="text-[12px] leading-snug" style={{ color: C.sub }}>{t}</div></div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* QUÉ ES */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
          <div>
            <Eyebrow>¿Qué es la Semana U?</Eyebrow>
            <Title upper className="mt-3" style={{ fontSize: "clamp(24px,3vw,34px)" }}>Seis décadas de comunidad y celebración</Title>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.sub }}>
              La Semana Universitaria —o «Semana U», como la conoce todo el mundo— es una de las tradiciones más significativas de la Universidad de Costa Rica. Durante una semana de abril, las sedes y recintos se transforman en escenario de conciertos, conferencias, ferias, teatro y encuentros deportivos organizados por estudiantes, docentes y personal administrativo.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.sub }}>
              Más allá de la música y la alegría, la Semana U es un espacio de expresión colectiva, memoria histórica y celebración de la diversidad que caracteriza a la comunidad universitaria.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl overflow-hidden" style={{ height: 180 }}><Img src={IMGS.estudiantes1} alt="Estudiantes UCR" label="Estudiantes" className="w-full h-full" style={{ height: "100%" }} /></div>
            <div className="rounded-2xl overflow-hidden mt-6" style={{ height: 180 }}><Img src={IMGS.campus} alt="Campus UCR" label="Campus" className="w-full h-full" style={{ height: "100%" }} /></div>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section style={{ background: C.esmeralda }}>
        <div className="max-w-6xl mx-auto px-5 py-16 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 opacity-30"><Sunburst size={140} color={C.amarillo} /></div>
          <div className="relative max-w-3xl">
            <Eyebrow tone={C.amarillo}>El 24 de abril</Eyebrow>
            <Title upper className="mt-3" style={{ color: "#fff", fontSize: "clamp(24px,3vw,34px)" }}>Una fiesta con raíces de lucha</Title>
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#CDEAF8" }}>
              Su origen se remonta a los años setenta, cuando el movimiento estudiantil de la UCR se organizó para oponerse a la explotación de bauxita por parte de la transnacional ALCOA. Aquel acontecimiento, el 24 de abril, quedó grabado en la memoria universitaria.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "#CDEAF8" }}>
              Por eso la celebración nació como conmemoración y protesta, y hoy la <b style={{ color: "#fff" }}>Plaza 24 de Abril</b>, frente a la Facultad de Ciencias Sociales, es el sitio simbólico por excelencia de la Semana U: cada año recuerda que detrás de la fiesta hay una historia de dignidad estudiantil.
            </p>
          </div>
        </div>
      </section>

      {/* ACTIVIDADES */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="text-center max-w-2xl mx-auto"><div className="flex justify-center"><Eyebrow>Qué vas a encontrar</Eyebrow></div><Title upper className="mt-3" style={{ fontSize: "clamp(24px,3vw,34px)" }}>Actividades para toda la comunidad</Title></div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{acts.map(a => (
          <Card key={a.t} hover pad="p-6"><div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: a.c + "1a", color: a.c }}><a.icon size={22} /></div><div className="font-bold text-[16px] uppercase tracking-wide" style={{ color: C.ink, fontFamily: FONT_DISP }}>{a.t}</div><p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: C.sub }}>{a.d}</p></Card>
        ))}</div>
      </section>

      {/* GALERÍA */}
      <section style={{ background: C.bg }}>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex justify-center"><Eyebrow tone={C.amarillo}>Galería</Eyebrow></div>
          <Title upper className="mt-3 text-center" style={{ fontSize: "clamp(24px,3vw,34px)" }}>La UCR en imágenes</Title>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="md:col-span-3 rounded-2xl overflow-hidden relative" style={{ height: 300 }}>
              <Img src={IMGS.conciertos} alt="Conciertos de la Semana U" label="Conciertos · Semana U" className="w-full h-full" style={{ height: "100%" }} />
              <div className="absolute bottom-0 inset-x-0 p-4" style={{ background: "linear-gradient(0deg, rgba(6,24,40,.85), transparent)" }}>
                <div className="text-white font-bold text-[15px]">Conciertos de la Semana Universitaria</div>
                <div className="text-[11.5px]" style={{ color: "#BBD3E2" }}>Foto: Universidad de Costa Rica (ucr.ac.cr)</div>
              </div>
            </div>
            {gallery.map(g => (
              <div key={g.cap} className="rounded-2xl overflow-hidden relative" style={{ height: 220 }}>
                <Img src={g.src} alt={g.cap} label={g.label} className="w-full h-full" style={{ height: "100%" }} />
                <div className="absolute bottom-0 inset-x-0 p-3" style={{ background: "linear-gradient(0deg, rgba(6,24,40,.82), transparent)" }}>
                  <div className="text-white font-semibold text-[13px]">{g.cap}</div>
                  <div className="text-[10.5px]" style={{ color: "#BBD3E2" }}>{g.credit}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] mt-4 text-center" style={{ color: C.faint }}>Imágenes del campus y la comunidad UCR (Wikimedia Commons, CC BY-SA) y de la Semana U (UCR). Mostradas con fines ilustrativos.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.blue}, ${C.celeste})` }}>
          <div className="absolute -top-6 left-10"><Sunburst size={80} color={C.amarillo} /></div>
          <Title upper className="relative" style={{ color: "#fff", fontSize: "clamp(22px,3vw,32px)" }}>Vive la Semana U con la comunidad Alumni</Title>
          <p className="relative mt-3 text-[15px] max-w-lg mx-auto" style={{ color: "#EAF6FC" }}>Los exalumnos también regresan cada abril. Únete y sigue conectado con la fiesta más universitaria del país.</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Btn variant="orange" size="lg" icon={GraduationCap} onClick={() => nav("register-alumni")}>Unirme como Exalumno</Btn>
            <Btn size="lg" onClick={() => nav("landing")} style={{ background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>Volver al inicio</Btn>
          </div>
        </div>
      </section>
    </>
  );
  if (embedded) return body;
  return (
    <div style={{ background: C.white, minHeight: "100vh" }}>
      {header}
      {body}
    </div>
  );
}
