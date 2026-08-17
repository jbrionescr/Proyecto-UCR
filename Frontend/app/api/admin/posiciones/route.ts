import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — todas las posiciones para el panel admin, sin importar el exalumno dueño (T-19)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado   = searchParams.get("estado") || undefined;
  const tipo     = searchParams.get("tipo") || undefined;
  const desde    = searchParams.get("desde") || undefined;
  const hasta    = searchParams.get("hasta") || undefined;
  const page     = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;
  const offset   = (page - 1) * PAGE_SIZE;

  try {
    let query = supabaseAdmin
      .from("POSICIONES")
      .select(`
        id, titulo, tipo, modalidad, jornada, empresa, estado,
        fecha_limite, created_at, updated_at, deleted_at, exalumno_id,
        APLICACIONES(count),
        exalumno:EXALUMNOS!POSICIONES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    // Por defecto se ocultan las eliminadas; el filtro "eliminada" las muestra explícitamente.
    if (estado === "eliminada") {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
      if (estado) query = query.eq("estado", estado);
    }

    if (tipo) query = query.ilike("tipo", `%${tipo}%`);
    if (desde) query = query.gte("created_at", desde);
    if (hasta) query = query.lte("created_at", hasta);

    const { data: rows, count, error } = await query;
    if (error) throw error;

    const data = (rows ?? []).map((p: any) => {
      const exa = Array.isArray(p.exalumno) ? p.exalumno[0] : p.exalumno;
      const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
      return {
        id: p.id,
        titulo: p.titulo,
        tipo: p.tipo,
        modalidad: p.modalidad,
        jornada: p.jornada,
        empresa: p.empresa,
        estado: p.estado,
        fecha_limite: p.fecha_limite ?? null,
        created_at: p.created_at,
        updated_at: p.updated_at,
        deleted_at: p.deleted_at ?? null,
        aplicantes: p.APLICACIONES?.[0]?.count ?? 0,
        exalumno_id: p.exalumno_id,
        exalumno_nombre: exaUser?.nombre ?? null,
        exalumno_email: exaUser?.email ?? null,
      };
    });

    return NextResponse.json({ data, total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/admin/posiciones]", error);
    return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
  }
}
