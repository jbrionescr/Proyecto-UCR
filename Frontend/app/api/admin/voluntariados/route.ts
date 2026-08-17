import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — listado de ofertas de voluntariado para el panel admin
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") || undefined;

  try {
    let query = supabaseAdmin
      .from("VOLUNTARIADOS_UCR")
      .select(`
        id, tipo, titulo, categoria, mensaje, estado, motivo_rechazo, created_at,
        exalumno:EXALUMNOS!VOLUNTARIADOS_UCR_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))
      `)
      .order("created_at", { ascending: false });

    if (estado) query = query.eq("estado", estado);

    const { data: rows, error } = await query;
    if (error) throw error;

    const data = (rows ?? []).map((v: any) => {
      const exa = Array.isArray(v.exalumno) ? v.exalumno[0] : v.exalumno;
      const user = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
      return {
        id: v.id,
        tipo: v.tipo,
        titulo: v.titulo,
        categoria: v.categoria,
        mensaje: v.mensaje,
        estado: v.estado,
        motivo_rechazo: v.motivo_rechazo,
        created_at: v.created_at,
        exalumno_id: user?.id ?? null,
        exalumno_nombre: user?.nombre ?? "Exalumno",
        exalumno_email: user?.email ?? null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/admin/voluntariados]", error);
    return NextResponse.json({ message: "Error al obtener las ofertas de voluntariado" }, { status: 500 });
  }
}
