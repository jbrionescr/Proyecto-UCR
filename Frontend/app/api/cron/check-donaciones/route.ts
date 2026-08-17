import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendDonacionAtrasadaEmail } from "@/lib/email";

// GET /api/cron/check-donaciones — recordatorio de donaciones pendientes > 48h (RF-07)
// Se ejecuta diariamente vía Vercel Cron (ver vercel.json).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const limite48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    // No volver a recordar la misma donación si ya se avisó en las últimas 24h
    // (evita duplicados si el cron corre varias veces el mismo día).
    const limiteRecordatorio = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: donaciones, error } = await supabaseAdmin
      .from("DONACIONES")
      .select("id, monto, moneda, destino, created_at, ultimo_recordatorio_at")
      .eq("estado", "PENDIENTE")
      .lt("created_at", limite48h)
      .or(`ultimo_recordatorio_at.is.null,ultimo_recordatorio_at.lt.${limiteRecordatorio}`);

    if (error) throw error;
    if (!donaciones || donaciones.length === 0) {
      return NextResponse.json({ notified: 0 });
    }

    const { data: admins, error: adminsErr } = await supabaseAdmin
      .from("USERS")
      .select("email, nombre")
      .eq("tipo", "ADMIN")
      .eq("activo", true);

    if (adminsErr) throw adminsErr;
    if (!admins || admins.length === 0) {
      return NextResponse.json({ notified: 0, warning: "No hay admins activos a quién notificar" });
    }

    const ahora = Date.now();

    await Promise.allSettled(
      donaciones.flatMap((d: any) => {
        const horasPendiente = Math.floor((ahora - new Date(d.created_at).getTime()) / (60 * 60 * 1000));
        return admins.map((admin: any) =>
          sendDonacionAtrasadaEmail(
            admin.email,
            admin.nombre ?? "Admin",
            Number(d.monto),
            d.moneda ?? "CRC",
            d.destino ?? "Fondo General",
            horasPendiente
          )
        );
      })
    );

    const { error: upErr } = await supabaseAdmin
      .from("DONACIONES")
      .update({ ultimo_recordatorio_at: new Date().toISOString() })
      .in("id", donaciones.map((d: any) => d.id));

    if (upErr) throw upErr;

    return NextResponse.json({ notified: donaciones.length, admins: admins.length });
  } catch (e: any) {
    console.error("[cron/check-donaciones]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
