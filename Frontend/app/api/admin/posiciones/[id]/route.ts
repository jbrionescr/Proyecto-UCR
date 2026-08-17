import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ESTADOS_VALIDOS = ["activa", "pausada"];

// PATCH — pausar / reactivar una posición (T-19, solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: { estado?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.estado || !ESTADOS_VALIDOS.includes(body.estado)) {
    return NextResponse.json({ message: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}` }, { status: 400 });
  }

  try {
    const { data: posicion } = await supabaseAdmin
      .from("POSICIONES")
      .select("id, deleted_at")
      .eq("id", params.id)
      .maybeSingle();

    if (!posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });
    if (posicion.deleted_at) return NextResponse.json({ message: "La posición está eliminada" }, { status: 400 });

    const { data: updated, error } = await supabaseAdmin
      .from("POSICIONES")
      .update({ estado: body.estado, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select("id, estado")
      .single();

    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar la posición" }, { status: 500 });
  }
}

// DELETE — soft delete (T-19: preserva las aplicaciones asociadas)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  try {
    const { data: posicion } = await supabaseAdmin
      .from("POSICIONES")
      .select("id")
      .eq("id", params.id)
      .maybeSingle();

    if (!posicion) return NextResponse.json({ message: "Posición no encontrada" }, { status: 404 });

    const { error } = await supabaseAdmin
      .from("POSICIONES")
      .update({
        estado: "eliminada",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/posiciones/[id]]", error);
    return NextResponse.json({ message: "Error al eliminar la posición" }, { status: 500 });
  }
}
