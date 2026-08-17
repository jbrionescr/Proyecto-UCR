import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/cv/improve — Mejora GENERAL del CV (sin una vacante específica):
// reescribe el resumen y las viñetas con verbos de acción y logros, reordena
// habilidades y optimiza para ATS, SIN inventar datos. Devuelve el CV mejorado
// para que el estudiante lo revise y aplique. Se usa en /mi-curriculum (flujo B general).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ message: "GROQ_API_KEY no configurada en .env.local" }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { cv } = body ?? {};
  if (!cv || typeof cv !== "object") {
    return NextResponse.json({ message: "Falta el CV a mejorar." }, { status: 400 });
  }

  const systemPrompt = `Eres un "Reclutador Senior" experto en optimización de CVs para sistemas ATS (Applicant Tracking Systems). Tu tarea es MEJORAR de forma general el CV de un estudiante, sin apuntar a una vacante específica.

REGLAS ESTRICTAS:
- NUNCA inventes experiencias, títulos, empresas, certificaciones, habilidades ni datos de contacto que el estudiante no tenga.
- SÍ puedes REESCRIBIR el resumen profesional y las viñetas (bullets) de experiencia para que sean más impactantes: verbos de acción, logros cuantificables y claridad.
- Puedes REORDENAR las habilidades para priorizar las más relevantes y fuertes. No agregues habilidades nuevas.
- Mejora la coherencia y el profesionalismo general. Mantén EXACTAMENTE la misma estructura de datos.
- Conserva los "id" de cada experiencia tal cual venían.

Devuelve ÚNICAMENTE un JSON válido (sin markdown) con esta forma EXACTA:
{
  "improvedCV": {
    "name": string, "title": string, "location": string, "email": string, "phone": string, "summary": string,
    "experience": [{ "id": string, "role": string, "company": string, "period": string, "bullets": string[] }],
    "skills": string[],
    "education": [{ "institution": string, "degree": string, "period": string }],
    "certifications": string[]
  },
  "atsScore": number (0-100, qué tan fuerte queda el CV mejorado),
  "explanation": string (resumen breve en español de las mejoras hechas),
  "changedSections": string[] (secciones modificadas: "summary","experience","skills","title")
}

CV ACTUAL DEL ESTUDIANTE (JSON): ${JSON.stringify(cv)}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Mejora mi CV siguiendo las reglas. Responde solo con el JSON." },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[POST /api/cv/improve] Groq error", res.status, errText);
      return NextResponse.json({ message: `Error de IA [${res.status}]` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    let parsed: any;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("[POST /api/cv/improve] Respuesta no válida", e, raw);
      return NextResponse.json({ message: "La IA devolvió una respuesta no válida. Intenta de nuevo." }, { status: 502 });
    }

    const improved = parsed?.improvedCV;
    if (!improved || typeof improved !== "object") {
      return NextResponse.json({ message: "La IA no devolvió un CV mejorado." }, { status: 502 });
    }

    const experience = Array.isArray(improved.experience)
      ? improved.experience.map((e: any, i: number) => ({
          id: String(e?.id ?? cv.experience?.[i]?.id ?? `exp-${i + 1}`),
          role: String(e?.role ?? ""),
          company: String(e?.company ?? ""),
          period: String(e?.period ?? ""),
          bullets: Array.isArray(e?.bullets) ? e.bullets.filter((b: any) => typeof b === "string") : [],
        }))
      : (cv.experience ?? []);

    const safe = {
      name: String(improved.name ?? cv.name ?? ""),
      title: String(improved.title ?? cv.title ?? ""),
      location: String(improved.location ?? cv.location ?? ""),
      email: String(improved.email ?? cv.email ?? ""),
      phone: String(improved.phone ?? cv.phone ?? ""),
      summary: String(improved.summary ?? cv.summary ?? ""),
      experience,
      skills: Array.isArray(improved.skills) ? improved.skills.filter((s: any) => typeof s === "string") : (cv.skills ?? []),
      education: Array.isArray(improved.education) ? improved.education : (cv.education ?? []),
      certifications: Array.isArray(improved.certifications) ? improved.certifications.filter((s: any) => typeof s === "string") : (cv.certifications ?? []),
    };

    const atsScore = Math.max(0, Math.min(100, Math.round(Number(parsed?.atsScore) || 0)));

    return NextResponse.json({
      improvedCV: safe,
      atsScore,
      explanation: String(parsed?.explanation ?? ""),
      changedSections: Array.isArray(parsed?.changedSections) ? parsed.changedSections : [],
    });
  } catch (error) {
    console.error("[POST /api/cv/improve]", error);
    return NextResponse.json({ message: "Error al mejorar el CV." }, { status: 500 });
  }
}
