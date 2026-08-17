"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Eye, Filter, Handshake, Sparkles, TrendingUp } from "lucide-react";
import { C } from "@/lib/theme";
import { matchReasons } from "@/lib/data";
import { Avatar, Badge, Btn, Card, Ring } from "@/components/ui";
import { PageHead } from "@/components/layout";

// PASO 1: Importa tu cliente de Supabase (Descomenta y ajusta la ruta cuando lo vayas a usar)
// import { supabase } from "@/lib/supabaseClient"; 

// PASO 2: Separamos los datos quemados fuera del componente para mantener el orden
const datosQuemados = [
  { a: "Lucía Vargas", aRole: "Product Lead · Stripe", s: "Valeria Campos", sRole: "Ing. Biomédica", score: 96, areas: ["Salud", "Tecnología"], support: "Mentoría + Financiamiento" },
  { a: "María F. Rojas", aRole: "VP Ing · Globant", s: "Esteban Picado", sRole: "Ing. Eléctrica", score: 92, areas: ["Energía", "Tecnología"], support: "Financiamiento" },
  { a: "Carlos Méndez", aRole: "CFO · BAC", s: "Sofía Aguilar", sRole: "Economía", score: 89, areas: ["Finanzas", "Impacto social"], support: "Empleo" },
  { a: "Diego Hernández", aRole: "Arquitecto · Gensler", s: "Andrés Solano", sRole: "Arquitectura", score: 88, areas: ["Sostenibilidad"], support: "Mentoría + Pasantía" },
];

// PASO 3: Creamos el dato de Naydelin adaptado a las variables que usa tu Card (a, s, score, etc.)
const datoNaydelinLocal = {
  a: "Tu Perfil Alumni", // Aquí puedes poner el nombre de quien inició sesión
  aRole: "Ingeniería en Computación",
  s: "NAYDELIN JUDITH RIVERA RODRIGUEZ", // <--- Dato Real del Directorio
  sRole: "Ingeniería en Computación", // <--- Dato Real
  score: 98,
  areas: ["Desarrollo de Software", "Networking"],
  support: "Mentoría Profesional"
};

export function Matching({ nav }: any) {
  // PASO 4: Usamos useState para combinar a Naydelin + los datos quemados
  const [matches, setMatches] = useState([datoNaydelinLocal, ...datosQuemados]);

  // PASO 5: Aquí está el espacio exacto donde llamarás a Supabase
  useEffect(() => {
    async function obtenerMatchesReales() {
      try {
        /* ==== DESCOMENTA ESTO CUANDO TENGAS SUPABASE LISTO ====
        
        const { data, error } = await supabase
          .from('estudiantes') // <-- Cambia esto por el nombre de tu tabla real
          .select('*')
          .eq('nombre', 'NAYDELIN JUDITH RIVERA RODRIGUEZ')
          .single();

        if (error) throw error;

        if (data) {
          // Formateamos lo que viene de la base de datos para que la tarjeta no se rompa
          const naydelinDesdeBD = {
            a: "Tu Perfil Alumni", 
            aRole: "Tu Rol",
            s: data.nombre, 
            sRole: data.carrera || "Ingeniería en Computación",
            score: data.afinidad || 98,
            areas: data.areas || ["Desarrollo de Software"],
            support: data.apoyo_buscado || "Mentoría Profesional"
          };
          
          // Actualizamos la pantalla: Naydelin (de BD) + datos de prueba
          setMatches([naydelinDesdeBD, ...datosQuemados]);
        }
        
        ======================================================== */
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    }

    obtenerMatchesReales();
  }, []);

  return (
    <>
      <PageHead 
        eyebrow="Marketplace de afinidad" 
        title="Sistema de matching" 
        sub="Ordenado por compatibilidad. Cada match explica su porqué." 
        tone={C.blue} 
        action={
          <div className="flex gap-2">
            <Btn variant="outline" size="sm" icon={Filter}>Filtrar</Btn>
            <Btn variant="softblue" size="sm" icon={TrendingUp}>Por afinidad</Btn>
          </div>
        } 
      />
      <div className="grid lg:grid-cols-2 gap-4">
        {matches.map(m => (
          <Card key={m.s} hover>
            <div className="flex items-center justify-between mb-4">
              <Badge tone={m.score >= 90 ? "green" : "blue"}>
                <Sparkles size={12} /> {m.score >= 90 ? "Match excelente" : "Buen match"}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: C.sub }}>Compatibilidad</span>
                <Ring value={m.score} size={52} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar name={m.a} size={40} />
                <div className="min-w-0">
                  <div className="font-bold text-[13.5px] truncate" style={{ color: C.ink }}>{m.a}</div>
                  <div className="text-[11.5px] truncate" style={{ color: C.sub }}>{m.aRole}</div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: C.greenSoft, color: C.greenDk }}>
                <Handshake size={16} />
              </div>
              <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                <div className="min-w-0 text-right">
                  <div className="font-bold text-[13.5px] truncate" style={{ color: C.ink }}>{m.s}</div>
                  <div className="text-[11.5px] truncate" style={{ color: C.sub }}>{m.sRole}</div>
                </div>
                <Avatar name={m.s} size={40} tone={C.green} />
              </div>
            </div>
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${C.line}` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.faint }}>Razones del match</div>
              {matchReasons.slice(0, 3).map(r => (
                <div key={r} className="flex items-center gap-2 text-[12.5px]" style={{ color: C.ink }}>
                  <CheckCircle2 size={14} color={C.greenDk} /> {r}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-[11.5px] font-semibold" style={{ color: C.sub }}>Áreas:</span>
              {m.areas.map(a => <Badge key={a} tone="blue">{a}</Badge>)}
              <Badge tone="gold">{m.support}</Badge>
            </div>
            <div className="flex gap-2 mt-4">
              <Btn variant="primary" size="sm" full icon={Handshake}>Aceptar match</Btn>
              <Btn variant="outline" size="sm" icon={Eye}>Perfil</Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}