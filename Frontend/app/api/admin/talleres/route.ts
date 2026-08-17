import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — listado de talleres propuestos para el panel admin
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") || undefined;

  try {
    let query = supabaseAdmin
      .from("TALLERES")
      .select(`
        id, titulo, descripcion, fecha_hora, cupos_totales, modalidad, estado, motivo_rechazo, created_at,
        exalumno:EXALUMNOS!TALLERES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))
      `)
      .order("created_at", { ascending: false });

    if (estado) query = query.eq("estado", estado);

    const { data: rows, error } = await query;
    if (error) throw error;

    const talleresIds = (rows ?? []).map((t: any) => t.id);
    const inscritosPorTaller = new Map<string, number>();
    if (talleresIds.length > 0) {
      const { data: inscripciones } = await supabaseAdmin
        .from("TALLER_INSCRIPCIONES")
        .select("taller_id")
        .in("taller_id", talleresIds);
      for (const i of inscripciones ?? []) {
        inscritosPorTaller.set(i.taller_id, (inscritosPorTaller.get(i.taller_id) ?? 0) + 1);
      }
    }

    const data = (rows ?? []).map((t: any) => {
      const exa = Array.isArray(t.exalumno) ? t.exalumno[0] : t.exalumno;
      const user = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
      return {
        id: t.id,
        titulo: t.titulo,
        descripcion: t.descripcion,
        fecha_hora: t.fecha_hora,
        cupos_totales: t.cupos_totales,
        cupos_ocupados: inscritosPorTaller.get(t.id) ?? 0,
        modalidad: t.modalidad,
        estado: t.estado,
        motivo_rechazo: t.motivo_rechazo,
        created_at: t.created_at,
        exalumno_id: user?.id ?? null,
        exalumno_nombre: user?.nombre ?? "Exalumno",
        exalumno_email: user?.email ?? null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/admin/talleres]", error);
    return NextResponse.json({ message: "Error al obtener los talleres" }, { status: 500 });
  }
}
