"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { groq } from "@ai-sdk/groq";

const SYSTEM_PROMPT = `Actúa como un reclutador senior. Analiza el CV del usuario y los requisitos del puesto. 
Sugiere reescribir viñetas usando verbos de acción y cuantificando logros. 
CRÍTICO: NUNCA inventes experiencia o habilidades que no estén en el CV original.`;

export async function optimizeCV(cvContent: string, positionRequirements: string) {
  const stream = createStreamableValue("");

  (async () => {
    const { textStream } = await streamText({
      // @ts-expect-error Incompatibilidad temporal de tipos entre ai-sdk/groq y ai core
      model: groq("llama3-70b-8192"), // Usando el modelo de Llama3 en Groq para máxima velocidad
      system: SYSTEM_PROMPT,
      prompt: `Requisitos de la vacante: \n${positionRequirements}\n\nMi CV original (experiencia):\n${cvContent}\n\nReescribe mi experiencia en formato de viñetas de menos de 120 caracteres.`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return { output: stream.value };
}
