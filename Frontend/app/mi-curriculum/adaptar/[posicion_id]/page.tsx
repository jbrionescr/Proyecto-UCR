"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Loader2, Save, RotateCcw, CheckCircle2,
  Briefcase, Code2, GraduationCap, Award, MapPin, Mail, Phone, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useDialog } from "@/hooks/useDialog";
import type { CVData } from "@/components/cv/CVTypes";

interface Posicion {
  id: string;
  titulo: string | null;
  empresa: string | null;
  tipo: string | null;
  descripcion: string | null;
  responsabilidades: string | null;
  hard_skills: any;
  soft_skills: any;
  idiomas_requeridos: any;
  area_estudio: string | null;
}

function CVPreview({ cv, accent }: { cv: CVData; accent: string }) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{cv.name || "—"}</h3>
        <p className="font-medium" style={{ color: accent }}>{cv.title || "—"}</p>
        <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
          {cv.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cv.location}</span>}
          {cv.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{cv.email}</span>}
          {cv.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cv.phone}</span>}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Perfil
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{cv.summary || <span className="italic text-slate-400">Sin resumen.</span>}</p>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Experiencia
        </p>
        <div className="space-y-3">
          {cv.experience.length === 0 && <p className="italic text-slate-400 text-xs">Sin experiencia.</p>}
          {cv.experience.map((e, i) => (
            <div key={e.id || i} className="pl-3 border-l-2" style={{ borderColor: accent }}>
              <p className="font-bold text-slate-800 dark:text-slate-100">{e.role}</p>
              <p className="text-xs font-medium" style={{ color: accent }}>{[e.company, e.period].filter(Boolean).join(" · ")}</p>
              {Array.isArray(e.bullets) && e.bullets.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {e.bullets.map((b, j) => (
                    <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 shrink-0" />{b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5" /> Habilidades
        </p>
        <div className="flex flex-wrap gap-1.5">
          {cv.skills.length === 0 && <p className="italic text-slate-400 text-xs">Sin habilidades.</p>}
          {cv.skills.map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}15`, color: accent }}>{s}</span>
          ))}
        </div>
      </div>

      {cv.education.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Educación
          </p>
          {cv.education.map((e, i) => (
            <div key={i} className="mb-1">
              <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">{e.institution}</p>
              <p className="text-xs text-slate-500">{[e.degree, e.period].filter(Boolean).join(" · ")}</p>
            </div>
          ))}
        </div>
      )}

      {cv.certifications.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Certificaciones
          </p>
          <div className="space-y-1">
            {cv.certifications.map((c, i) => (
              <p key={i} className="text-xs text-slate-600 dark:text-slate-300">🏅 {c}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdaptarCVPage() {
  const params = useParams<{ posicion_id: string }>();
  const posicionId = params.posicion_id;
  const { showAlert } = useDialog();

  const [posicion, setPosicion] = useState<Posicion | null>(null);
  const [cv, setCV] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adapting, setAdapting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adapted, setAdapted] = useState<CVData | null>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");
  const [changed, setChanged] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/posiciones/${posicionId}`),
          fetch(`/api/curriculum`),
        ]);
        if (pRes.ok) setPosicion(await pRes.json());
        if (cRes.ok) {
          const d = await cRes.json();
          setCV({
            name: d.name || "", title: d.title || "", location: d.location || "",
            email: d.email || "", phone: d.phone || "", summary: d.summary || "",
            experience: Array.isArray(d.experience) ? d.experience : [],
            skills: Array.isArray(d.skills) ? d.skills : [],
            education: Array.isArray(d.education) ? d.education : [],
            certifications: Array.isArray(d.certifications) ? d.certifications : [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [posicionId]);

  async function adaptar() {
    if (!cv || !posicion) return;
    setAdapting(true);
    setSaved(false);
    try {
      const res = await fetch("/api/cv/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv, posicion }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Error al adaptar");
      setAdapted(d.adaptedCV);
      setAtsScore(typeof d.atsScore === "number" ? d.atsScore : null);
      setExplanation(d.explanation || "");
      setChanged(Array.isArray(d.changedSections) ? d.changedSections : []);
    } catch (err: any) {
      await showAlert(err?.message || "No se pudo adaptar el CV.", { title: "Error de IA", variant: "error" });
    } finally {
      setAdapting(false);
    }
  }

  async function guardarVersion() {
    if (!adapted) return;
    setSaving(true);
    try {
      const res = await fetch("/api/curriculum/versiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posicion_id: posicionId,
          nombre_version: `CV para ${posicion?.titulo || "posición"}`,
          contenido: adapted,
          ats_score: atsScore,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Error al guardar");
      setSaved(true);
      await showAlert("La versión adaptada de tu CV se guardó correctamente.", { title: "¡Versión guardada!", variant: "success", buttonLabel: "Entendido" });
    } catch (err: any) {
      await showAlert(err?.message || "No se pudo guardar la versión.", { title: "Error al guardar", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0f4c81] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href={`/posiciones/${posicionId}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0f4c81] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a la posición
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#0f4c81] tracking-wider uppercase mb-1">IA de Adaptación</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Adaptar CV a esta Posición</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {posicion?.titulo ? <>Optimiza tu CV para <strong>{posicion.titulo}</strong>{posicion.empresa ? ` · ${posicion.empresa}` : ""}.</> : "Optimiza tu CV para esta oportunidad."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {adapted && (
              <Button variant="outline" onClick={() => { setAdapted(null); setAtsScore(null); setExplanation(""); setChanged([]); setSaved(false); }} disabled={adapting || saving}>
                <RotateCcw className="w-4 h-4 mr-2" /> Descartar
              </Button>
            )}
            <Button onClick={adaptar} disabled={adapting || !cv || !posicion} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {adapting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {adapting ? "Adaptando..." : adapted ? "Re-adaptar" : "Adaptar con IA"}
            </Button>
          </div>
        </div>

        {/* Resumen de la posición */}
        {posicion && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-[#0f4c81]" />
              <span className="font-bold text-slate-800 dark:text-slate-100">{posicion.titulo || "Posición"}</span>
              {posicion.tipo && <Badge variant="outline" className="text-xs">{posicion.tipo}</Badge>}
            </div>
            {posicion.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{posicion.descripcion}</p>}
            {Array.isArray(posicion.hard_skills) && posicion.hard_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {posicion.hard_skills.map((s: any, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    {typeof s === "string" ? s : s?.skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Panel de resultado IA */}
        {adapted && (
          <div className="bg-gradient-to-r from-[#0f4c81]/5 to-sky-50 dark:from-sky-900/10 dark:to-slate-900 border border-[#0f4c81]/20 dark:border-sky-800/30 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#0f4c81] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#0f4c81] dark:text-sky-400">Sugerencia generada por IA</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{explanation || "Revisa los cambios propuestos en el panel derecho."}</p>
                {changed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {changed.map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#0f4c81]/10 text-[#0f4c81] dark:text-sky-400 font-semibold uppercase tracking-wide">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {atsScore !== null && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-700">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Alineación ATS</p>
                  <p className="text-2xl font-extrabold text-green-600 leading-none">{atsScore}%</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparación lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Tu CV actual
              </span>
            </div>
            {cv ? <CVPreview cv={cv} accent="#64748b" /> : <p className="text-sm text-slate-400">No se pudo cargar tu CV.</p>}
          </div>

          {/* Adaptado */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-2 border-[#0f4c81]/30 dark:border-sky-800/40 p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#0f4c81] dark:text-sky-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Versión adaptada
              </span>
              {adapted && (
                <Button size="sm" onClick={guardarVersion} disabled={saving || saved} className="bg-green-600 hover:bg-green-700 text-white text-xs">
                  {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : saved ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  {saved ? "Guardada" : saving ? "Guardando..." : "Guardar versión"}
                </Button>
              )}
            </div>
            {adapted ? (
              <CVPreview cv={adapted} accent="#0f4c81" />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-sky-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Pulsa <strong>“Adaptar con IA”</strong> para generar una versión de tu CV optimizada para esta posición. No se inventan datos: solo se reescribe y prioriza lo que ya tienes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
