import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: messages, error } = await supabaseAdmin
      .from('MESSAGES')
      .select('*')
      .eq('match_id', params.matchId)
      .order('created_at', { ascending: true });

    if (error || !messages) {
      return NextResponse.json([], { status: 200 });
    }

    const senderIds = Array.from(new Set(messages.map((m: any) => m.sender_id)));
    const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url').in('id', senderIds);

    const enrichedMessages = messages.map((m: any) => ({
      ...m,
      sender: users?.find((u: any) => u.id === m.sender_id) || null
    }));

    return NextResponse.json(enrichedMessages);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ message: "El mensaje no puede estar vacío" }, { status: 400 });
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: message, error } = await supabaseAdmin
      .from('MESSAGES')
      .insert({
        id: crypto.randomUUID(),
        match_id: params.matchId,
        sender_id: session.user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !message) {
      return NextResponse.json({ message: "Error guardando mensaje" }, { status: 500 });
    }

    const { data: user } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url').eq('id', session.user.id).maybeSingle();

    return NextResponse.json({
      ...message,
      sender: user || null
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
