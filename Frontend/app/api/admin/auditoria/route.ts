import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/admin/auditoria — logs de AUDIT_LOGS paginados, solo admin
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const tabla      = searchParams.get("tabla") || null;
  const usuario_id = searchParams.get("usuario_id") || null;
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE  = 20;
  const offset     = (page - 1) * PAGE_SIZE;

  try {
    let query = supabaseAdmin
      .from("AUDIT_LOGS")
      .select("id, tabla, operacion, registro_id, usuario_id, datos_antes, datos_despues, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (tabla) query = query.eq("tabla", tabla);
    if (usuario_id) query = query.eq("usuario_id", usuario_id);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
    });
  } catch (error) {
    console.error("[GET /api/admin/auditoria]", error);
    return NextResponse.json({ message: "Error al obtener el historial de auditoría" }, { status: 500 });
  }
}
