import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

function parseSkills(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((s: any) => typeof s === "string" ? s : (s?.skill ?? "")).filter(Boolean);
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function parseCertifications(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c: any) => (typeof c === "string" ? c : c?.nombre ?? c?.name ?? JSON.stringify(c)));
  }
  return [];
}

function parseExperience(raw: any): { id: string; role: string; company: string; period: string; bullets: string[] }[] {
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : (typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);
  return arr.map((e: any, i: number) => ({
    id: e.id ?? `exp-${i + 1}`,
    role: e.role ?? e.titulo ?? e.cargo ?? e.puesto ?? "",
    company: e.company ?? e.empresa ?? e.organizacion ?? "",
    period: e.period ?? e.periodo ?? `${e.anio_inicio ?? ""} – ${e.anio_fin ?? "Presente"}`,
    bullets: Array.isArray(e.bullets) ? e.bullets : Array.isArray(e.logros) ? e.logros : [],
  }));
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const userId = session.user.id;
  const tipo = (session.user as any).tipo as string;

  try {
    const { data: user } = await supabaseAdmin
      .from("USERS")
      .select(`
        nombre, email, foto_url,
        exalumno:EXALUMNOS!EXALUMNOS_user_id_fkey(
          cargo_actual, empresa_actual, pais_ciudad,
          escuela_facultad, anio_graduacion, biografia,
          habilidades, certificaciones, experiencia_laboral
        ),
        estudiante:ESTUDIANTES!ESTUDIANTES_user_id_fkey(
          carrera, escuela_facultad, sede,
          anio_ingreso, nivel_academico, habilidades,
          soft_skills, idiomas,
          curriculum:CURRICULUM(
            habilidades_tecnicas, idiomas, cv_data,
            experiencias:CURRICULUM_EXPERIENCIA(id, titulo, organizacion, tipo),
            certificaciones:CURRICULUM_CERTIFICACIONES(id, nombre, institucion)
          )
        )
      `)
      .eq("id", userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const exArr = user.exalumno;
    const ex = Array.isArray(exArr) ? exArr[0] : exArr;
    
    const estArr = user.estudiante;
    const est = Array.isArray(estArr) ? estArr[0] : estArr;
    
    const curArr = est?.curriculum;
    const cur = Array.isArray(curArr) ? curArr[0] : curArr;

    let title = "";
    let location = "San José, Costa Rica";
    let summary = "";
    let skills: string[] = [];
    let education: { institution: string; degree: string; period: string }[] = [];
    let experience: { id: string; role: string; company: string; period: string; bullets: string[] }[] = [];
    let certifications: string[] = [];

    if (tipo === "EXALUMNO" && ex) {
      title = [ex.cargo_actual, ex.empresa_actual].filter(Boolean).join(" en ") || "";
      location = ex.pais_ciudad || "San José, Costa Rica";
      summary = ex.biografia || "";
      skills = parseSkills(ex.habilidades);
      certifications = parseCertifications(ex.certificaciones);
      experience = parseExperience(ex.experiencia_laboral);
      if (ex.escuela_facultad || ex.anio_graduacion) {
        education = [{
          institution: "Universidad de Costa Rica",
          degree: ex.escuela_facultad || "Carrera no especificada",
          period: ex.anio_graduacion ? `– ${ex.anio_graduacion}` : "",
        }];
      }
    } else if (tipo === "ESTUDIANTE" && est) {
      const nivelStr = est.nivel_academico ? `${est.nivel_academico} en ` : "";
      title = est.carrera ? `${nivelStr}${est.carrera}` : "";
      location = est.sede || "San José, Costa Rica";
      skills = parseSkills(est.habilidades ?? cur?.habilidades_tecnicas);
      certifications = (cur?.certificaciones ?? []).map((c: any) => c.nombre || "").filter(Boolean);
      experience = (cur?.experiencias ?? []).map((e: any, i: number) => ({
        id: e.id,
        role: e.titulo || "",
        company: e.organizacion || "",
        period: "",
        bullets: [],
      }));
      if (est.carrera || est.escuela_facultad) {
        education = [{
          institution: "Universidad de Costa Rica",
          degree: est.carrera || est.escuela_facultad || "Carrera no especificada",
          period: est.anio_ingreso ? `${est.anio_ingreso} – Presente` : "En curso",
        }];
      }
    }

    const base = {
      name: user.nombre,
      email: user.email,
      foto_url: user.foto_url,
      title,
      location,
      phone: "",
      summary,
      skills,
      education,
      experience,
      certifications,
    };

    const saved = cur?.cv_data;
    if (saved && typeof saved === "object") {
      return NextResponse.json({ ...base, ...saved, foto_url: user.foto_url });
    }

    return NextResponse.json(base);
  } catch (error) {
    console.error("[GET /api/curriculum]", error);
    return NextResponse.json({ message: "Error al obtener datos de curriculum" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  const tipo = (session.user as any).tipo as string;
  if (tipo !== "ESTUDIANTE") {
    return NextResponse.json({ message: "Solo los estudiantes pueden editar su CV." }, { status: 403 });
  }

  let cv: any;
  try {
    cv = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const cvData = {
    name: String(cv?.name ?? ""),
    title: String(cv?.title ?? ""),
    location: String(cv?.location ?? ""),
    email: String(cv?.email ?? ""),
    phone: String(cv?.phone ?? ""),
    summary: String(cv?.summary ?? ""),
    experience: Array.isArray(cv?.experience) ? cv.experience : [],
    skills: Array.isArray(cv?.skills) ? cv.skills : [],
    education: Array.isArray(cv?.education) ? cv.education : [],
    certifications: Array.isArray(cv?.certifications) ? cv.certifications : [],
  };

  try {
    const userId = session.user.id;
    const { data: existingCur, error: findError } = await supabaseAdmin
      .from("CURRICULUM")
      .select("id")
      .eq("estudiante_id", userId)
      .maybeSingle();

    if (findError) throw findError;

    if (existingCur) {
      const { error: updateError } = await supabaseAdmin
        .from("CURRICULUM")
        .update({ cv_data: cvData, habilidades_tecnicas: cvData.skills, updated_at: new Date().toISOString() })
        .eq("id", existingCur.id);
      if (updateError) throw updateError;
    } else {
      const now = new Date().toISOString();
      const { error: insertError } = await supabaseAdmin.from("CURRICULUM").insert({
        id: randomUUID(),
        estudiante_id: userId,
        cv_data: cvData,
        habilidades_tecnicas: cvData.skills,
        created_at: now,
        updated_at: now,
      });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/curriculum]", error);
    return NextResponse.json({ message: "Error al guardar el CV" }, { status: 500 });
  }
}
