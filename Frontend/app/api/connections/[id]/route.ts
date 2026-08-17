import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getToken_(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: req.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);
}

// DELETE /api/connections/[id] — eliminar conexión
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken_(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  try {
    const { error } = await supabaseAdmin
      .from("MATCHES")
      .update({ estado: "CERRADO", closed_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/connections/:id]", error);
    return NextResponse.json({ message: "Error al eliminar la conexión" }, { status: 500 });
  }
}
