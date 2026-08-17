import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = session.user.id;
  const tipo = (session.user as any)?.tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN") {
    return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  }

  try {
    let query = supabaseAdmin
      .from("POSICIONES")
      .select("id, titulo, tipo, modalidad, jornada, empresa, estado, fecha_limite, created_at, APLICACIONES(count)", { count: "exact" })
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (tipo !== "ADMIN") {
      query = query.eq("exalumno_id", userId);
    }

    const { data: posiciones, error } = await query;

    if (error) {
      console.error("[GET /api/posiciones/mis-posiciones]", error);
      return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
    }

    const data = (posiciones ?? []).map((p: any) => ({
      id: p.id,
      titulo: p.titulo,
      tipo: p.tipo,
      modalidad: p.modalidad,
      jornada: p.jornada,
      empresa: p.empresa,
      estado: p.estado,
      fecha_limite: p.fecha_limite ?? null,
      created_at: p.created_at,
      _count: { aplicaciones: p.APLICACIONES?.[0]?.count ?? 0 },
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/posiciones/mis-posiciones]", error);
    return NextResponse.json({ message: "Error al obtener posiciones" }, { status: 500 });
  }
}
