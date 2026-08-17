"use client";

import { useEffect, useState } from "react";
import {
  X, MapPin, Briefcase, GraduationCap,
  Code2, Award, User, Loader2, FolderOpen, Search,
} from "lucide-react";

type Experience    = { id: string; role: string; company: string; period: string; bullets: string[] };
type Education     = { institution: string; degree: string; period: string };
type Proyecto      = { titulo: string; tipo: string; descripcion: string };

type CVData = {
  name: string;
  foto_url: string | null;
  tipo: string;
  title: string;
  location: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  certifications: string[];
  proyecto: Proyecto | null;
  busca?: string[];
};

interface Props {
  userId: string | null;
  studentName?: string;
  onClose: () => void;
}

export function CVDrawer({ userId, studentName, onClose }: Props) {
  const [cv, setCv]       = useState<CVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setCv(null);
    setError(null);
    fetch(`/api/curriculum/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.message) throw new Error(d.message);
        setCv(d);
      })
      .catch((e) => setError(e.message || "Error al cargar el CV"))
      .finally(() => setLoading(false));
  }, [userId]);

  const isOpen = !!userId;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[9999] h-full w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl
          flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <p className="text-xs font-bold text-[#005da4] uppercase tracking-wider">Curriculum Vitae</p>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
              {studentName || "Perfil del estudiante"}
            </h2>
          </div>
          <button
            aria-label="Cerrar curriculum"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 text-[#005da4] animate-spin" />
            </div>
          )}

          {error && (
            <div className="m-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {cv && !loading && (
            <div className="p-6 space-y-6">
              {/* Identity */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#005da4]/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {cv.foto_url ? (
                    <img src={cv.foto_url} alt={cv.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-[#005da4]" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cv.name}</h3>
                  {cv.title && <p className="text-sm text-[#005da4] font-medium mt-0.5">{cv.title}</p>}
                  {cv.location && (
                    <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin className="h-3 w-3" /> {cv.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Resumen */}
              {cv.summary && (
                <Section icon={<User className="h-4 w-4" />} title="Resumen">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{cv.summary}</p>
                </Section>
              )}

              {/* Proyecto de graduación */}
              {cv.proyecto && (
                <Section icon={<FolderOpen className="h-4 w-4" />} title="Proyecto de Graduación">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{cv.proyecto.titulo}</p>
                    {cv.proyecto.tipo && (
                      <span className="inline-block text-xs bg-[#005da4]/10 text-[#005da4] rounded-full px-2 py-0.5 font-medium">
                        {cv.proyecto.tipo}
                      </span>
                    )}
                    {cv.proyecto.descripcion && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        {cv.proyecto.descripcion}
                      </p>
                    )}
                  </div>
                </Section>
              )}

              {/* Experiencia */}
              {cv.experience.length > 0 && (
                <Section icon={<Briefcase className="h-4 w-4" />} title="Experiencia">
                  <div className="space-y-4">
                    {cv.experience.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-[#005da4]/20 pl-3">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{exp.role}</p>
                        <p className="text-xs text-[#005da4]">{exp.company}</p>
                        {exp.period && <p className="text-xs text-slate-400 mt-0.5">{exp.period}</p>}
                        {exp.bullets.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {exp.bullets.map((b, i) => (
                              <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                                <span className="text-[#005da4] mt-0.5 shrink-0">•</span>{b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Educación */}
              {cv.education.length > 0 && (
                <Section icon={<GraduationCap className="h-4 w-4" />} title="Educación">
                  <div className="space-y-3">
                    {cv.education.map((edu, i) => (
                      <div key={i} className="border-l-2 border-[#005da4]/20 pl-3">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{edu.degree}</p>
                        <p className="text-xs text-[#005da4]">{edu.institution}</p>
                        {edu.period && <p className="text-xs text-slate-400 mt-0.5">{edu.period}</p>}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Habilidades */}
              {cv.skills.length > 0 && (
                <Section icon={<Code2 className="h-4 w-4" />} title="Habilidades">
                  <div className="flex flex-wrap gap-2">
                    {cv.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Certificaciones */}
              {cv.certifications.length > 0 && (
                <Section icon={<Award className="h-4 w-4" />} title="Certificaciones">
                  <ul className="space-y-1.5">
                    {cv.certifications.map((cert, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Award className="h-3.5 w-3.5 text-[#005da4] mt-0.5 shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Busca */}
              {cv.busca && cv.busca.length > 0 && (
                <Section icon={<Search className="h-4 w-4" />} title="Busca oportunidades en">
                  <div className="flex flex-wrap gap-2">
                    {cv.busca.map((b, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#005da4]/10 text-[#005da4] rounded-full px-3 py-1 font-semibold border border-[#005da4]/20"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* CV vacío */}
              {!cv.summary && cv.experience.length === 0 && cv.skills.length === 0 && cv.education.length === 0 && !cv.proyecto && (!cv.busca || cv.busca.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">Este estudiante aún no ha completado su CV.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Section({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-[#005da4]/10 flex items-center justify-center text-[#005da4]">
          {icon}
        </div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );
}
