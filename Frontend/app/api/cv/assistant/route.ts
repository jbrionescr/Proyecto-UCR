import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, cv } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY no configurada en .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = `Eres un "Reclutador Senior", un asistente experto de Inteligencia Artificial enfocado en las mejores prácticas de reclutamiento profesional. Tu objetivo es guiar al estudiante a construir un CV con criterio de reclutador: enfocándote en logros cuantificables, el uso correcto de verbos de acción, relevancia por contexto y una optimización estricta para sistemas ATS (Applicant Tracking Systems). No te importan las plantillas visuales; tu enfoque está 100% en el contenido estructurado. Analiza el CV, genera sugerencias estructuradas y devuélvelas en un JSON que el frontend pueda aplicar.

Respuesta JSON exacta (sin markdown):
{
  "suggestions": [
    {
      "section": "profile" | "experience" | "education" | "skills" | "certifications" | "all",
      "changes": { /* objeto con los campos a actualizar */ }
    }
    // ... más sugerencias
  ],
  "explanation": "texto explicativo opcional para el usuario"
}

INSTRUCCIONES:
- Nunca devuelvas texto fuera del JSON.
- Usa claves exactas que coincidan con la estructura del CV en el frontend.
- Si la sugerencia es agregar una nueva experiencia, usa la clave "add" dentro de "changes" con un array de objetos Experience.
- Si es modificar, usa "update" con objeto a mergear.
- Si es eliminar, usa "remove" con array de ids.
- Para cambios en todo el CV, usa "section": "all" y provee los cambios completos.

CV actual (JSON): ${JSON.stringify(cv)}
`; 

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
          ...messages,
          { role: "assistant", content: `CV actual: ${JSON.stringify(cv)}` },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error status:", res.status, errText);
      return NextResponse.json(
        { reply: `❌ Error Groq [${res.status}]: ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? "";

    // Intentar parsear JSON directamente
    let parsed;
    try {
      const cleaned = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse assistant reply", e);
      // Fallback minimal suggestion: no changes
      parsed = { suggestions: [], explanation: "No se pudieron generar sugerencias." };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error en assistant route:", error);
    return NextResponse.json({ reply: `❌ Error: ${String(error)}` }, { status: 500 });
  }
}
