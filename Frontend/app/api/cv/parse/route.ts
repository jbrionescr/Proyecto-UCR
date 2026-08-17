import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/cv/parse — Toma el texto crudo extraído de un CV (PDF/DOCX/TXT) y
// lo estructura en los campos del CV, mejorando la redacción SIN inventar datos.
// Se usa al subir un CV en /mi-curriculum (flujo A).
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

  const texto = String(body?.text ?? "").trim();
  if (!texto) {
    return NextResponse.json({ message: "No hay texto que analizar." }, { status: 400 });
  }
  // Límite defensivo para no exceder el contexto del modelo.
  const textoRecortado = texto.slice(0, 12000);

  const systemPrompt = `Eres un "Reclutador Senior" experto en construir CVs profesionales optimizados para sistemas ATS. Recibirás el TEXTO CRUDO extraído del CV de un estudiante (viene desordenado, de un PDF/Word). Tu tarea es ESTRUCTURARLO en los campos correctos y MEJORAR la redacción.

REGLAS ESTRICTAS:
- NUNCA inventes datos que no estén en el texto: ni experiencias, ni empresas, ni títulos, ni certificaciones, ni habilidades, ni fechas, ni datos de contacto. Si un dato no aparece, déjalo vacío ("") o como arreglo vacío ([]).
- SÍ puedes mejorar la redacción de lo que ya existe: reescribe el resumen y las viñetas (bullets) de experiencia usando verbos de acción y logros cuantificables cuando la información lo permita.
- Separa correctamente cada sección: datos de contacto, resumen/perfil, experiencia, habilidades, educación y certificaciones.
- Si el texto trae habilidades en una lista o separadas por comas, conviértelas en un arreglo de strings individuales.
- Para cada experiencia, extrae puesto (role), empresa (company), período (period) y una lista de logros/responsabilidades (bullets).

Devuelve ÚNICAMENTE un JSON válido (sin markdown) con esta forma EXACTA:
{
  "cv": {
    "name": string,
    "title": string,
    "location": string,
    "email": string,
    "phone": string,
    "summary": string,
    "experience": [{ "id": string, "role": string, "company": string, "period": string, "bullets": string[] }],
    "skills": string[],
    "education": [{ "institution": string, "degree": string, "period": string }],
    "certifications": string[]
  }
}

Genera un "id" único para cada experiencia (ej. "exp-1", "exp-2").

TEXTO CRUDO DEL CV:
"""
${textoRecortado}
"""`;

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
          { role: "user", content: "Estructura y mejora mi CV siguiendo las reglas. Responde solo con el JSON." },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[POST /api/cv/parse] Groq error", res.status, errText);
      return NextResponse.json({ message: `Error de IA [${res.status}]` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    let parsed: any;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("[POST /api/cv/parse] Respuesta no válida", e, raw);
      return NextResponse.json({ message: "La IA devolvió una respuesta no válida. Intenta de nuevo." }, { status: 502 });
    }

    const c = parsed?.cv;
    if (!c || typeof c !== "object") {
      return NextResponse.json({ message: "La IA no pudo estructurar el CV." }, { status: 502 });
    }

    const experience = Array.isArray(c.experience)
      ? c.experience.map((e: any, i: number) => ({
          id: String(e?.id ?? `exp-${i + 1}`),
          role: String(e?.role ?? ""),
          company: String(e?.company ?? ""),
          period: String(e?.period ?? ""),
          bullets: Array.isArray(e?.bullets) ? e.bullets.filter((b: any) => typeof b === "string") : [],
        }))
      : [];

    const safe = {
      name: String(c.name ?? ""),
      title: String(c.title ?? ""),
      location: String(c.location ?? ""),
      email: String(c.email ?? ""),
      phone: String(c.phone ?? ""),
      summary: String(c.summary ?? ""),
      experience,
      skills: Array.isArray(c.skills) ? c.skills.filter((s: any) => typeof s === "string") : [],
      education: Array.isArray(c.education)
        ? c.education.map((e: any) => ({
            institution: String(e?.institution ?? ""),
            degree: String(e?.degree ?? ""),
            period: String(e?.period ?? ""),
          }))
        : [],
      certifications: Array.isArray(c.certifications) ? c.certifications.filter((s: any) => typeof s === "string") : [],
    };

    return NextResponse.json({ cv: safe });
  } catch (error) {
    console.error("[POST /api/cv/parse]", error);
    return NextResponse.json({ message: "Error al procesar el CV." }, { status: 500 });
  }
}
