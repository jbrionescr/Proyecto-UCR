import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// PATCH — editar contenido de un mensaje (solo el remitente)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { matchId: string; messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  let body: { content: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  if (!body.content?.trim())
    return NextResponse.json({ message: "El mensaje no puede estar vacío" }, { status: 400 });

  const { data: message } = await supabaseAdmin
    .from("MESSAGES")
    .select("id, sender_id, match_id")
    .eq("id", params.messageId)
    .maybeSingle();

  if (!message)
    return NextResponse.json({ message: "Mensaje no encontrado" }, { status: 404 });
  if (message.sender_id !== session.user.id)
    return NextResponse.json({ message: "No puedes editar mensajes de otros" }, { status: 403 });
  if (message.match_id !== params.matchId)
    return NextResponse.json({ message: "Mensaje no pertenece a este chat" }, { status: 400 });

  const { data: updated, error } = await supabaseAdmin
    .from("MESSAGES")
    .update({ content: body.content.trim() })
    .eq("id", params.messageId)
    .select()
    .single();

  if (error) {
    console.error("[PATCH /api/messages/:matchId/:messageId]", error);
    return NextResponse.json({ message: "Error al actualizar mensaje" }, { status: 500 });
  }

  return NextResponse.json(updated);
}

// DELETE — eliminar un mensaje (solo el remitente)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { matchId: string; messageId: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });

  const { data: message } = await supabaseAdmin
    .from("MESSAGES")
    .select("id, sender_id, match_id")
    .eq("id", params.messageId)
    .maybeSingle();

  if (!message)
    return NextResponse.json({ message: "Mensaje no encontrado" }, { status: 404 });
  if (message.sender_id !== session.user.id)
    return NextResponse.json({ message: "No puedes eliminar mensajes de otros" }, { status: 403 });
  if (message.match_id !== params.matchId)
    return NextResponse.json({ message: "Mensaje no pertenece a este chat" }, { status: 400 });

  const { error } = await supabaseAdmin.from("MESSAGES").delete().eq("id", params.messageId);

  if (error) {
    console.error("[DELETE /api/messages/:matchId/:messageId]", error);
    return NextResponse.json({ message: "Error al eliminar mensaje" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
