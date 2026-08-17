"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { X, Save, Plus, Trash2 } from "lucide-react";
import type { Experience } from "./CVTypes";

// ── Modal de confirmación ────────────────────────────────────────────────────
export function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-red-100">
        <p className="text-slate-700 mb-5 text-sm">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancelar</Button>
          <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}

// ── Formulario inline para experiencia ───────────────────────────────────────
export function ExperienceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Experience;
  onSave: (exp: Experience) => void;
  onCancel: () => void;
}) {
  const [role, setRole] = useState(initial?.role ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [period, setPeriod] = useState(initial?.period ?? "");
  const [bullets, setBullets] = useState<string[]>(initial?.bullets ?? [""]);

  const updateBullet = (i: number, v: string) => setBullets((b) => b.map((x, j) => (j === i ? v : x)));
  const addBullet = () => setBullets((b) => [...b, ""]);
  const removeBullet = (i: number) => setBullets((b) => b.filter((_, j) => j !== i));

  const handleSave = () => {
    if (!role.trim() || !company.trim()) return;
    onSave({
      id: initial?.id ?? `exp-${Date.now()}`,
      role: role.trim(),
      company: company.trim(),
      period: period.trim(),
      bullets: bullets.filter((b) => b.trim()),
    });
  };

  const input = "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Cargo *</label>
          <input className={input} placeholder="Ej. Desarrollador Frontend" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Empresa *</label>
          <input className={input} placeholder="Ej. TechCorp" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Período</label>
        <input className={input} placeholder="Ej. 2022 – Presente" value={period} onChange={(e) => setPeriod(e.target.value)} />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">Logros / Responsabilidades</label>
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className={input + " flex-1"} placeholder={`Logro ${i + 1}`} value={b} onChange={(e) => updateBullet(i, e.target.value)} />
            {bullets.length > 1 && (
              <button aria-label={`Eliminar logro ${i + 1}`} onClick={() => removeBullet(i)} className="p-2 text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addBullet} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
          <Plus className="w-3 h-3" /> Agregar logro
        </button>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
      </div>
    </div>
  );
}

// ── Formulario de experiencia para ESTUDIANTES ───────────────────────────────
// Muchos estudiantes no tienen experiencia laboral formal; lo que sí tienen son
// proyectos universitarios, pasantías o voluntariados. Este formulario enmarca
// esos casos con etiquetas amigables y deja "Organización" y "Período" opcionales:
// solo el título es obligatorio. Se guarda en la misma estructura Experience.
type StudentExpKind = "proyecto" | "pasantia" | "voluntariado" | "trabajo";

const STUDENT_KINDS: { key: StudentExpKind; label: string }[] = [
  { key: "proyecto", label: "Proyecto U" },
  { key: "pasantia", label: "Pasantía" },
  { key: "voluntariado", label: "Voluntariado" },
  { key: "trabajo", label: "Trabajo" },
];

const KIND_COPY: Record<StudentExpKind, { titleLabel: string; titlePh: string; orgLabel: string; orgPh: string; periodPh: string; bulletsLabel: string; bulletPh: string }> = {
  proyecto: {
    titleLabel: "Título del proyecto",
    titlePh: "Ej. Sistema de gestión académica",
    orgLabel: "Curso / Universidad",
    orgPh: "Ej. Bases de Datos, UCR",
    periodPh: "Ej. II Semestre 2024",
    bulletsLabel: "¿Qué hiciste? ¿Qué aprendiste?",
    bulletPh: "Ej. Diseñé la base de datos en PostgreSQL",
  },
  pasantia: {
    titleLabel: "Puesto / Rol",
    titlePh: "Ej. Pasante de desarrollo de software",
    orgLabel: "Empresa u organización",
    orgPh: "Ej. Intel Costa Rica",
    periodPh: "Ej. Verano 2024",
    bulletsLabel: "¿Qué hiciste? ¿Qué aprendiste?",
    bulletPh: "Ej. Automaticé reportes con Python",
  },
  voluntariado: {
    titleLabel: "Actividad / Rol",
    titlePh: "Ej. Tutor de matemática",
    orgLabel: "Organización",
    orgPh: "Ej. TCU UCR / ONG",
    periodPh: "Ej. 2023",
    bulletsLabel: "¿Qué hiciste? ¿Qué aprendiste?",
    bulletPh: "Ej. Apoyé a 20 estudiantes de secundaria",
  },
  trabajo: {
    titleLabel: "Cargo",
    titlePh: "Ej. Asistente administrativo",
    orgLabel: "Empresa",
    orgPh: "Ej. TechCorp",
    periodPh: "Ej. 2022 – Presente",
    bulletsLabel: "Logros / Responsabilidades",
    bulletPh: "Ej. Gestioné la agenda de 3 gerentes",
  },
};

export function StudentExperienceForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Experience;
  onSave: (exp: Experience) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<StudentExpKind>("proyecto");
  const [role, setRole] = useState(initial?.role ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [period, setPeriod] = useState(initial?.period ?? "");
  const [bullets, setBullets] = useState<string[]>(initial?.bullets?.length ? initial.bullets : [""]);

  const copy = KIND_COPY[kind];

  const updateBullet = (i: number, v: string) => setBullets((b) => b.map((x, j) => (j === i ? v : x)));
  const addBullet = () => setBullets((b) => [...b, ""]);
  const removeBullet = (i: number) => setBullets((b) => b.filter((_, j) => j !== i));

  const handleSave = () => {
    if (!role.trim()) return; // solo el título es obligatorio
    onSave({
      id: initial?.id ?? `exp-${Date.now()}`,
      role: role.trim(),
      company: company.trim(),
      period: period.trim(),
      bullets: bullets.filter((b) => b.trim()),
    });
  };

  const input = "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400";

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      {/* Selector de tipo */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">¿Qué quieres agregar?</label>
        <div className="flex flex-wrap gap-2">
          {STUDENT_KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => setKind(k.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                kind === k.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#0f4c81]/40"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          ¿No tienes experiencia laboral? Sin problema — agrega tus proyectos de la U, pasantías o voluntariados.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">{copy.titleLabel} *</label>
        <input className={input} placeholder={copy.titlePh} value={role} onChange={(e) => setRole(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">{copy.orgLabel} <span className="font-normal text-slate-400">(opcional)</span></label>
          <input className={input} placeholder={copy.orgPh} value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Período <span className="font-normal text-slate-400">(opcional)</span></label>
          <input className={input} placeholder={copy.periodPh} value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">{copy.bulletsLabel} <span className="font-normal text-slate-400">(opcional)</span></label>
        {bullets.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className={input + " flex-1"} placeholder={copy.bulletPh} value={b} onChange={(e) => updateBullet(i, e.target.value)} />
            {bullets.length > 1 && (
              <button aria-label={`Eliminar punto ${i + 1}`} onClick={() => removeBullet(i)} className="p-2 text-red-400 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addBullet} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
          <Plus className="w-3 h-3" /> Agregar otro punto
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" onClick={handleSave} disabled={!role.trim()}><Save className="w-3.5 h-3.5 mr-1" />Guardar</Button>
      </div>
    </div>
  );
}

// ── Formulario de habilidades ────────────────────────────────────────────────
export function SkillsEditor({
  skills,
  onAdd,
  onRemove,
}: {
  skills: string[];
  onAdd: (s: string) => void;
  onRemove: (s: string) => void;
}) {
  const [input, setInput] = useState("");
  const submit = () => {
    const v = input.trim();
    if (v && !skills.includes(v)) { onAdd(v); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-slate-700 rounded-full text-xs font-medium border border-transparent hover:border-red-200 transition-all group/sk cursor-default">
            {s}
            <button aria-label={`Eliminar habilidad ${s}`} onClick={() => onRemove(s)} className="opacity-0 group-hover/sk:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="text-xs border border-dashed border-slate-300 dark:border-slate-600 rounded-full px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 w-40 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          placeholder="Nueva habilidad..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button onClick={submit} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Agregar
        </button>
      </div>
    </div>
  );
}

// ── Formulario de educación ──────────────────────────────────────────────────
export function EducationForm({ onSave, onCancel }: { onSave: (e: { institution: string; degree: string; period: string }) => void; onCancel: () => void }) {
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [period, setPeriod] = useState("");
  const inp = "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400";
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 mt-3">
      <input className={inp} placeholder="Institución *" value={institution} onChange={(e) => setInstitution(e.target.value)} />
      <input className={inp} placeholder="Grado / Carrera *" value={degree} onChange={(e) => setDegree(e.target.value)} />
      <input className={inp} placeholder="Período (ej. 2018 – 2022)" value={period} onChange={(e) => setPeriod(e.target.value)} />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancelar</Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { if (institution && degree) onSave({ institution, degree, period }); }}>
          <Save className="w-3.5 h-3.5 mr-1" />Guardar
        </Button>
      </div>
    </div>
  );
}
