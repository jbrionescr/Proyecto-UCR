import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { dispararValidacionComprobante } from "@/lib/n8n";

// ─── GET /api/donaciones ──────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const tipo = (session.user as any).tipo as string;
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  try {
    let query = supabaseAdmin
      .from("DONACIONES")
      .select(`
        id, monto, destino, moneda, metodo_pago, estado,
        comprobante_url, created_at, updated_at,
        exalumno:EXALUMNOS!DONACIONES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(id, nombre, foto_url)),
        estudiante:ESTUDIANTES!DONACIONES_proyecto_estudiante_id_fkey(proyecto_titulo, user:USERS!ESTUDIANTES_user_id_fkey(nombre))
      `)
      .order("created_at", { ascending: false });

    if (tipo === "ADMIN") {
      if (targetUserId) {
        query = query.or(`exalumno_id.eq.${targetUserId},proyecto_estudiante_id.eq.${targetUserId}`);
      }
      // else: all donations for admin
    } else if (tipo === "EXALUMNO") {
      query = query.eq("exalumno_id", userId);
    } else if (tipo === "ESTUDIANTE") {
      query = query.eq("proyecto_estudiante_id", userId);
    } else {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const { data: donaciones, error } = await query;

    if (error) {
      console.error("[GET /api/donaciones] Supabase error:", error);
      return NextResponse.json({ message: "Error al obtener donaciones" }, { status: 500 });
    }

    const data = (donaciones ?? []).map((d: any) => {
      const exaUser = Array.isArray(d.exalumno) ? d.exalumno[0]?.user : d.exalumno?.user;
      const estData = Array.isArray(d.estudiante) ? d.estudiante[0] : d.estudiante;
      const estUser = estData?.user;
      return {
        id: d.id,
        monto: Number(d.monto),
        destino: d.destino,
        moneda: d.moneda ?? "CRC",
        metodo_pago: d.metodo_pago,
        estado: d.estado,
        comprobante_url: d.comprobante_url ?? null,
        created_at: d.created_at,
        updated_at: d.updated_at,
        proyecto_titulo: estData?.proyecto_titulo ?? d.destino ?? "Donación general",
        estudiante_nombre: Array.isArray(estUser) ? estUser[0]?.nombre ?? null : estUser?.nombre ?? null,
        exalumno_nombre: Array.isArray(exaUser) ? exaUser[0]?.nombre ?? null : exaUser?.nombre ?? null,
        exalumno_id: Array.isArray(exaUser) ? exaUser[0]?.id ?? null : exaUser?.id ?? null,
        exalumno_foto: Array.isArray(exaUser) ? exaUser[0]?.foto_url ?? null : exaUser?.foto_url ?? null,
      };
    });

    // Aggregate totals
    const totalConfirmada = data
      .filter((d) => d.estado === "CONFIRMADA")
      .reduce((s, d) => s + d.monto, 0);
    const totalPendiente = data
      .filter((d) => d.estado === "PENDIENTE")
      .reduce((s, d) => s + d.monto, 0);

    return NextResponse.json({ data, total: data.length, totalConfirmada, totalPendiente });
  } catch (error) {
    console.error("[GET /api/donaciones]", error);
    return NextResponse.json({ message: "Error al obtener donaciones" }, { status: 500 });
  }
}

// ─── POST /api/donaciones ─────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const role = (session.user as any).tipo || (session.user as any).role;

  if (role !== "EXALUMNO" && role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo exalumnos pueden realizar donaciones" },
      { status: 403 }
    );
  }

  let body: {
    exalumnoId: string;
    monto: number;
    moneda?: "CRC" | "USD";
    comprobanteUrl: string;
    destino: string;
    metodoPago?: string;
    fechaTransferencia?: string | null;
    numeroReferencia?: string | null;
    proyectoEstudianteId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { exalumnoId, monto, moneda, comprobanteUrl, destino, metodoPago, fechaTransferencia, numeroReferencia, proyectoEstudianteId } = body;

  if (!exalumnoId || !monto || !destino) {
    return NextResponse.json(
      { message: "Faltan campos requeridos: exalumnoId, monto, destino" },
      { status: 400 }
    );
  }

  if (monto <= 0) {
    return NextResponse.json({ message: "El monto debe ser mayor a 0" }, { status: 400 });
  }

  if (role !== "ADMIN" && exalumnoId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Verificar/crear usuario si no existe
  const { data: userExists } = await supabaseAdmin.from("USERS").select("id").eq("id", exalumnoId).maybeSingle();
  if (!userExists) {
    try {
      await supabaseAdmin.from("USERS").insert({
        id: exalumnoId,
        nombre: session.user?.name || "Usuario Restaurado",
        email: session.user?.email || `user_${exalumnoId}@example.com`,
        tipo: "EXALUMNO",
        activo: true,
        email_verified: true,
        updated_at: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error("Fallo auto-creando usuario:", e);
    }
  }

  const { data: exalumno } = await supabaseAdmin.from("EXALUMNOS").select("user_id").eq("user_id", exalumnoId).maybeSingle();
  if (!exalumno) {
    const { error: exErr } = await supabaseAdmin
      .from("EXALUMNOS")
      .insert({ user_id: exalumnoId, updated_at: new Date().toISOString() });
    if (exErr) return NextResponse.json({ message: "Error interno creando perfil: " + exErr.message }, { status: 500 });
  }

  try {
    const monedaFinal = moneda === "USD" ? "USD" : "CRC";
    const { data: donacion, error } = await supabaseAdmin
      .from("DONACIONES")
      .insert({
        id: crypto.randomUUID(),
        exalumno_id: exalumnoId,
        monto,
        moneda: monedaFinal,
        destino,
        estado: "PENDIENTE",
        comprobante_url: comprobanteUrl || null,
        fecha_transferencia: fechaTransferencia || null,
        numero_referencia: numeroReferencia || null,
        updated_at: new Date().toISOString(),
        ...(metodoPago ? { metodo_pago: metodoPago } : {}),
        ...(proyectoEstudianteId ? { proyecto_estudiante_id: proyectoEstudianteId } : {}),
      })
      .select("*")
      .single();

    if (error) throw error;

    // Dispara la verificación OCR en n8n (best-effort). Solo si hay comprobante
    // y datos suficientes para comparar. No bloquea la respuesta si n8n falla.
    if (comprobanteUrl) {
      await dispararValidacionComprobante({
        donacion_id: donacion.id,
        comprobante_url: comprobanteUrl,
        formulario: {
          monto: Number(monto),
          moneda: monedaFinal,
          metodo_pago: metodoPago || "",
          fecha_transferencia: fechaTransferencia || null,
          numero_referencia: numeroReferencia || null,
        },
      });
    }

    return NextResponse.json(donacion, { status: 201 });
  } catch (error) {
    console.error("[POST /api/donaciones]", error);
    return NextResponse.json({ message: "Error al registrar la donación" }, { status: 500 });
  }
}
