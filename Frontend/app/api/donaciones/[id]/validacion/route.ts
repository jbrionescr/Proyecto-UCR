import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verificarSecretoN8N } from "@/lib/n8n";

// POST /api/donaciones/[id]/validacion
// Callback que llama el workflow de n8n con el veredicto del OCR.
// NO usa sesión de usuario: n8n es un servicio externo; se autentica con el
// secreto compartido en el header x-n8n-secret.
//
// Body esperado (salida del nodo Code de n8n):
//   { estado: "pre_validada"|"discrepancia"|"revision_manual",
//     confianza: number, checks: [...], motivos: [...] }
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verificarSecretoN8N(request.headers.get("x-n8n-secret"))) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const ESTADOS = ["pre_validada", "discrepancia", "revision_manual"];
  const estado = body?.estado;
  if (!ESTADOS.includes(estado)) {
    return NextResponse.json({ message: "estado inválido" }, { status: 400 });
  }

  const confianza = Number.isFinite(Number(body?.confianza))
    ? Math.max(0, Math.min(100, Math.round(Number(body.confianza))))
    : null;

  // Se guarda el detalle campo-por-campo para que el admin lo vea en su cola.
  const detalle = {
    checks: Array.isArray(body?.checks) ? body.checks : [],
    motivos: Array.isArray(body?.motivos) ? body.motivos : [],
  };

  try {
    const { data: existing } = await supabaseAdmin
      .from("DONACIONES")
      .select("id")
      .eq("id", params.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ message: "Donación no encontrada" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("DONACIONES")
      .update({
        validacion_estado: estado,
        validacion_confianza: confianza,
        validacion_detalle: detalle,
        validacion_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) throw error;

    // Nota: la donación sigue en estado PENDIENTE. El OCR pre-valida; la
    // confirmación/rechazo final la hace el admin (RF-08.2).
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/donaciones/[id]/validacion]", error);
    return NextResponse.json({ message: "Error al guardar la validación" }, { status: 500 });
  }
}
