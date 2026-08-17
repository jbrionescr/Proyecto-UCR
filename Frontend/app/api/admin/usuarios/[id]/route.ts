import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";


// PATCH — actualizar tipo/status de un usuario (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const TIPOS_VALIDOS = ["ESTUDIANTE", "EXALUMNO", "ADMIN"];
  const STATUS_VALIDOS = ["PENDIENTE", "ACTIVO", "SUSPENDIDO"];

  const data: any = {};
  if (body.tipo !== undefined) {
    if (!TIPOS_VALIDOS.includes(body.tipo))
      return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
    data.tipo = body.tipo;
  }
  if (body.status !== undefined) {
    if (!STATUS_VALIDOS.includes(body.status))
      return NextResponse.json({ message: "Status inválido" }, { status: 400 });
    data.status = body.status;
    data.activo  = body.status === "ACTIVO";
  }

  if (Object.keys(data).length === 0)
    return NextResponse.json({ message: "Nada que actualizar" }, { status: 400 });

  try {
    const { data: updated, error } = await supabaseAdmin
      .from("USERS")
      .update(data)
      .eq("id", params.id)
      .select("id, tipo, status, activo")
      .single();
    if (error) throw error;
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/admin/usuarios/[id]]", error);
    return NextResponse.json({ message: "Error al actualizar usuario" }, { status: 500 });
  }
}

// DELETE — elimina permanentemente un usuario (solo admin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  // Un admin no puede eliminarse a sí mismo
  if (session.user.id === params.id)
    return NextResponse.json({ message: "No puedes eliminar tu propia cuenta." }, { status: 400 });

  try {
    const { data: target } = await supabaseAdmin
      .from("USERS")
      .select("id, tipo")
      .eq("id", params.id)
      .maybeSingle();
    if (!target) return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });

    // Delete messages first, then user (cascade handles the rest)
    await supabaseAdmin.from("MESSAGES").delete().eq("sender_id", params.id);
    const { error: deleteErr } = await supabaseAdmin.from("USERS").delete().eq("id", params.id);
    if (deleteErr) throw deleteErr;

    // Delete from Supabase Auth
    try {
      await supabaseAdmin.auth.admin.deleteUser(params.id);
    } catch (authError) {
      console.error("[DELETE /api/admin/usuarios/[id]] Falló borrar auth de Supabase:", authError);
    }

    console.log(`[AUDITORIA] Usuario ${params.id} eliminado permanentemente por el admin ${session.user.id}.`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/usuarios/[id]]", error);
    return NextResponse.json({ message: "Error al eliminar usuario" }, { status: 500 });
  }
}
