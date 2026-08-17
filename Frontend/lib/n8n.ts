// Integración con n8n — Verificación de comprobantes de donación con OCR.
// La app dispara un webhook a n8n al recibir un comprobante; n8n corre el OCR,
// compara contra lo declarado en el formulario y devuelve el veredicto vía el
// endpoint callback /api/donaciones/[id]/validacion.

export interface FormularioComprobante {
  monto: number;
  moneda: "CRC" | "USD";
  metodo_pago: string;
  fecha_transferencia: string | null; // ISO
  numero_referencia: string | null;
}

interface DispararArgs {
  donacion_id: string;
  formulario: FormularioComprobante;
  comprobante_url: string;
}

// Dispara la validación en n8n. Es "best-effort": si n8n no está configurado o
// no responde, NO rompe el flujo de donación (la donación queda PENDIENTE y el
// admin la revisa igual, solo sin el semáforo del OCR).
export async function dispararValidacionComprobante(args: DispararArgs): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) {
    // n8n aún no configurado: se omite silenciosamente (feature opcional).
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Secreto compartido para que n8n confíe en que la llamada viene de la app.
        ...(process.env.N8N_WEBHOOK_SECRET ? { "x-n8n-secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    // No propagar: el registro de la donación ya se guardó.
    console.error("[n8n] No se pudo disparar la validación del comprobante:", error);
  }
}

// Valida el secreto compartido en el callback que envía n8n.
export function verificarSecretoN8N(headerValue: string | null): boolean {
  const expected = process.env.N8N_WEBHOOK_SECRET;
  if (!expected) return true; // sin secreto configurado, no se exige (modo dev)
  return headerValue === expected;
}
