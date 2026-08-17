import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (userId !== params.id && role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { cuentaPausada?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { cuentaPausada } = body;
  const updateData: Record<string, any> = {};

  if (typeof cuentaPausada === "boolean") {
    updateData.activo = !cuentaPausada;
    updateData.status = cuentaPausada ? "SUSPENDIDO" : "ACTIVO";
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "Sin datos para actualizar" }, { status: 400 });
  }

  try {
    const { data: updated, error } = await supabaseAdmin
      .from("USERS")
      .update(updateData)
      .eq("id", params.id)
      .select("id, activo, status")
      .single();

    if (error) throw error;

    return NextResponse.json({ ...updated, cuentaPausada: !updated.activo });
  } catch (error) {
    console.error("[PATCH /api/users/[id]/status]", error);
    return NextResponse.json({ message: "Error al actualizar el estado" }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (userId !== params.id && role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from("USERS")
      .select("id, activo, status")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw error;
    if (!user) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    return NextResponse.json({ ...user, cuentaPausada: !user.activo });
  } catch (error) {
    console.error("[GET /api/users/[id]/status]", error);
    return NextResponse.json({ message: "Error del servidor" }, { status: 500 });
  }
}
