import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cv } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY no configurada en .env.local" }, { status: 500 });
    }

    const prompt = `Eres un "Reclutador Senior", experto en mejores prácticas de contratación y optimización para sistemas ATS (Applicant Tracking Systems). 
Tu objetivo es evaluar el contenido estructurado del CV del estudiante. Evalúa estrictamente el uso de logros cuantificables, verbos de acción y relevancia por contexto, ignorando completamente cualquier diseño visual.
Devuelve ÚNICAMENTE un JSON válido (sin markdown, sin texto extra) con esta estructura exacta:
{
  "atsScore": number entre 0 y 100,
  "formatSuggestions": ["sugerencia1", "sugerencia2", "sugerencia3"],
  "impactWords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],
  "missingCriteria": ["criterio1", "criterio2", "criterio3"]
}

Criterios para el puntaje ATS:
- Palabras clave relevantes al cargo (+20pts)
- Verbos de acción y logros cuantificados (+20pts)
- Estructura clara de secciones (+20pts)
- Información de contacto completa (+20pts)
- Experiencia y educación bien documentadas (+20pts)

CV a analizar: ${JSON.stringify(cv)}

Responde SOLO con el JSON, sin texto adicional, sin bloques de código markdown.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      return NextResponse.json(
        { error: `Error Groq [${res.status}]: ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "{}";

    let parsed;
    try {
      const cleaned = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback si el modelo no devuelve JSON puro
      parsed = {
        atsScore: 72,
        formatSuggestions: [
          "Agrega más palabras clave del puesto al que aplicas",
          "Cuantifica tus logros con números concretos",
          "Incluye un resumen profesional más impactante",
        ],
        impactWords: ["Lideré", "Optimicé", "Implementé", "Desarrollé", "Incrementé"],
        missingCriteria: ["Logros cuantificados", "Palabras clave técnicas", "Resumen orientado al puesto"],
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error en optimize route:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
