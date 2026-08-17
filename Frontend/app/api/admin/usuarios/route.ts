import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const nombre  = searchParams.get("nombre") || null;
  const tipo    = searchParams.get("tipo")   || null;
  const status  = searchParams.get("status") || null;
  const page    = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;
  const offset  = (page - 1) * PAGE_SIZE;

  try {
    let query = supabaseAdmin
      .from("USERS")
      .select(`
        id, nombre, email, tipo, activo, status, email_verified,
        created_at, reportes_recibidos,
        estudiante:ESTUDIANTES!ESTUDIANTES_user_id_fkey(carrera, carnet_ucr, anio_ingreso, nivel_academico, nivel_beca, comprobante_beca_url),
        exalumno:EXALUMNOS!EXALUMNOS_user_id_fkey(escuela_facultad, empresa_actual)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (nombre) query = query.ilike("nombre", `%${nombre}%`);
    if (tipo)   query = query.eq("tipo", tipo);
    if (status) query = query.eq("status", status);

    const { data: users, error, count } = await query;
    if (error) throw error;

    const anioActual = new Date().getFullYear();

    const data = (users ?? []).map((u: any) => {
      const est = Array.isArray(u.estudiante) ? u.estudiante[0] : u.estudiante;
      const exa = Array.isArray(u.exalumno)   ? u.exalumno[0]   : u.exalumno;
      const anioIngreso = est?.anio_ingreso ?? null;
      const coherencia_alerta = !!(
        u.tipo === "ESTUDIANTE" && anioIngreso && anioActual - anioIngreso > 8
      );
      return {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        tipo: u.tipo,
        activo: u.activo,
        status: u.status,
        email_verified: u.email_verified,
        created_at: u.created_at,
        reportes_recibidos: u.reportes_recibidos,
        carrera: est?.carrera ?? exa?.escuela_facultad ?? null,
        carnet_ucr: est?.carnet_ucr ?? null,
        empresa_actual: exa?.empresa_actual ?? null,
        anio_ingreso: anioIngreso,
        nivel_academico: est?.nivel_academico ?? null,
        nivel_beca: est?.nivel_beca ?? null,
        comprobante_beca_url: est?.comprobante_beca_url ?? null,
        coherencia_alerta,
      };
    });

    return NextResponse.json({ data, total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/admin/usuarios]", error);
    return NextResponse.json({ message: "Error al obtener usuarios" }, { status: 500 });
  }
}
