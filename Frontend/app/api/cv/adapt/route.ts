import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// POST /api/cv/adapt — adapta el CV del estudiante a una posición específica usando Groq (RF-12 / T-50)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { message: "GROQ_API_KEY no configurada en .env.local" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { cv, posicion } = body ?? {};
  if (!cv || !posicion) {
    return NextResponse.json({ message: "Faltan datos: cv y posicion son requeridos." }, { status: 400 });
  }

  const systemPrompt = `Eres un "Reclutador Senior" experto en optimización de CVs para sistemas ATS (Applicant Tracking Systems). Tu tarea es ADAPTAR el CV de un estudiante a una posición específica.

REGLAS ESTRICTAS:
- NUNCA inventes experiencias, títulos, empresas, certificaciones ni habilidades que el estudiante no tenga.
- Puedes REESCRIBIR el resumen profesional y las viñetas (bullets) de experiencia para alinearlas con la posición, usando verbos de acción y logros cuantificables.
- Puedes REORDENAR y priorizar las habilidades existentes según lo que pide la posición. Puedes resaltar habilidades que el estudiante ya posee.
- Optimiza palabras clave (keywords) para ATS según la descripción y requisitos de la posición.
- Mantén EXACTAMENTE la misma estructura de datos del CV de entrada.

Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin texto adicional) con esta forma EXACTA:
{
  "adaptedCV": {
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
  },
  "atsScore": number (0-100, qué tan alineado queda el CV adaptado con la posición),
  "explanation": string (resumen breve de los cambios hechos, en español),
  "changedSections": string[] (lista de secciones modificadas: "summary","experience","skills","title")
}

Conserva los "id" de cada experiencia tal cual venían en el CV de entrada.

POSICIÓN OBJETIVO (JSON): ${JSON.stringify(posicion)}

CV ACTUAL DEL ESTUDIANTE (JSON): ${JSON.stringify(cv)}
`;

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
          { role: "user", content: "Adapta mi CV a esta posición siguiendo las reglas. Responde solo con el JSON." },
        ],
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[POST /api/cv/adapt] Groq error", res.status, errText);
      return NextResponse.json({ message: `Error de IA [${res.status}]` }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    let parsed: any;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("[POST /api/cv/adapt] No se pudo parsear la respuesta de IA", e, raw);
      return NextResponse.json({ message: "La IA devolvió una respuesta no válida. Intenta de nuevo." }, { status: 502 });
    }

    const adaptedCV = parsed?.adaptedCV;
    if (!adaptedCV || typeof adaptedCV !== "object") {
      return NextResponse.json({ message: "La IA no devolvió un CV adaptado." }, { status: 502 });
    }

    // Normalizar para garantizar la forma CVData
    const safe = {
      name: String(adaptedCV.name ?? cv.name ?? ""),
      title: String(adaptedCV.title ?? cv.title ?? ""),
      location: String(adaptedCV.location ?? cv.location ?? ""),
      email: String(adaptedCV.email ?? cv.email ?? ""),
      phone: String(adaptedCV.phone ?? cv.phone ?? ""),
      summary: String(adaptedCV.summary ?? cv.summary ?? ""),
      experience: Array.isArray(adaptedCV.experience) ? adaptedCV.experience : (cv.experience ?? []),
      skills: Array.isArray(adaptedCV.skills) ? adaptedCV.skills : (cv.skills ?? []),
      education: Array.isArray(adaptedCV.education) ? adaptedCV.education : (cv.education ?? []),
      certifications: Array.isArray(adaptedCV.certifications) ? adaptedCV.certifications : (cv.certifications ?? []),
    };

    const atsScore = Math.max(0, Math.min(100, Math.round(Number(parsed?.atsScore) || 0)));

    return NextResponse.json({
      adaptedCV: safe,
      atsScore,
      explanation: String(parsed?.explanation ?? ""),
      changedSections: Array.isArray(parsed?.changedSections) ? parsed.changedSections : [],
    });
  } catch (error) {
    console.error("[POST /api/cv/adapt]", error);
    return NextResponse.json({ message: "Error al adaptar el CV." }, { status: 500 });
  }
}
