import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { status: "ACTIVO" | "SUSPENDIDO" | "PENDIENTE" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { status } = body;
  const validStatuses = ["ACTIVO", "SUSPENDIDO", "PENDIENTE"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { message: `Status inválido. Debe ser: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { data: updated, error } = await supabaseAdmin
      .from("USERS")
      .update({ status })
      .eq("id", params.id)
      .select("id, nombre, email, status, tipo")
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...updated,
      name: updated.nombre,
      role: updated.tipo,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/users/[id]/status]", error);
    return NextResponse.json({ message: "Error al actualizar el status del usuario" }, { status: 500 });
  }
}
