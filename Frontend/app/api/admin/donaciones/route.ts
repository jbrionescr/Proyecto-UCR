import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET — todas las donaciones para el panel admin
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  if ((session.user as any).tipo !== "ADMIN")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get("estado") || undefined;
  const page   = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  try {
    let query = supabaseAdmin
      .from("DONACIONES")
      .select(`
        id, monto, destino, moneda, metodo_pago, estado,
        comprobante_url, motivo_rechazo, created_at, updated_at,
        fecha_transferencia, numero_referencia,
        validacion_estado, validacion_confianza, validacion_detalle, validacion_at,
        exalumno:EXALUMNOS!DONACIONES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email)),
        estudiante:ESTUDIANTES!DONACIONES_proyecto_estudiante_id_fkey(proyecto_titulo, user:USERS!ESTUDIANTES_user_id_fkey(nombre))
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data: rows, count, error } = await query;
    if (error) throw error;

    const data = (rows ?? []).map((d: any) => {
      const exaArr = d.exalumno;
      const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
      const uArr = exa?.user;
      const u = Array.isArray(uArr) ? uArr[0] : uArr;
      
      const estArr = d.estudiante;
      const est = Array.isArray(estArr) ? estArr[0] : estArr;
      const uEstArr = est?.user;
      const uEst = Array.isArray(uEstArr) ? uEstArr[0] : uEstArr;

      return {
        id: d.id,
        monto: Number(d.monto),
        destino: d.destino,
        moneda: d.moneda ?? "CRC",
        metodo_pago: d.metodo_pago,
        estado: d.estado,
        comprobante_url: d.comprobante_url ?? null,
        motivo_rechazo: d.motivo_rechazo ?? null,
        created_at: d.created_at,
        updated_at: d.updated_at,
        fecha_transferencia: d.fecha_transferencia ?? null,
        numero_referencia: d.numero_referencia ?? null,
        validacion_estado: d.validacion_estado ?? null,
        validacion_confianza: d.validacion_confianza ?? null,
        validacion_detalle: d.validacion_detalle ?? null,
        validacion_at: d.validacion_at ?? null,
        exalumno_nombre: u?.nombre ?? null,
        exalumno_email: u?.email ?? null,
        exalumno_id: u?.id ?? null,
        proyecto_titulo: est?.proyecto_titulo ?? d.destino ?? "Donación general",
        estudiante_nombre: uEst?.nombre ?? null,
      };
    });

    return NextResponse.json({ data, total: count ?? 0, page, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) });
  } catch (error) {
    console.error("[GET /api/admin/donaciones]", error);
    return NextResponse.json({ message: "Error al obtener donaciones" }, { status: 500 });
  }
}
