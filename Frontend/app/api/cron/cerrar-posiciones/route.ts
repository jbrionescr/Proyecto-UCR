import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendAplicacionDescartada } from "@/lib/email";

// GET /api/cron/cerrar-posiciones — cierra posiciones vencidas (RF-10)
// Se ejecuta diariamente vía Vercel Cron (ver vercel.json).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // "activa" es el estado real usado en POSICIONES (no "ACTIVA")
    const { data: expiradas, error } = await supabaseAdmin
      .from("POSICIONES")
      .select("id, titulo")
      .eq("estado", "activa")
      .not("fecha_limite", "is", null)
      .lt("fecha_limite", new Date().toISOString());

    if (error) throw error;
    if (!expiradas || expiradas.length === 0) {
      return NextResponse.json({ closedCount: 0 });
    }

    const ids = expiradas.map((p) => p.id);
    const tituloPorPosicion = new Map(expiradas.map((p) => [p.id, p.titulo ?? "la posición"]));

    // Aplicantes sin decisión final (ENVIADA o EN_REVISION) de esas posiciones,
    // para descartarlos y notificarles.
    const { data: pendientes } = await supabaseAdmin
      .from("APLICACIONES")
      .select(`
        id, posicion_id,
        estudiante:ESTUDIANTES!APLICACIONES_estudiante_id_fkey(user:USERS!ESTUDIANTES_user_id_fkey(email, nombre))
      `)
      .in("posicion_id", ids)
      .in("estado", ["ENVIADA", "EN_REVISION"]);

    const { error: upErr } = await supabaseAdmin
      .from("POSICIONES")
      .update({ estado: "vencida", updated_at: new Date().toISOString() })
      .in("id", ids);

    if (upErr) throw upErr;

    if (pendientes && pendientes.length > 0) {
      const { error: descartarErr } = await supabaseAdmin
        .from("APLICACIONES")
        .update({ estado: "DESCARTADO", updated_at: new Date().toISOString() })
        .in("id", pendientes.map((a: any) => a.id));

      if (descartarErr) throw descartarErr;

      await Promise.allSettled(
        pendientes.map((a: any) => {
          const u = Array.isArray(a.estudiante) ? a.estudiante[0]?.user : a.estudiante?.user;
          const userInfo = Array.isArray(u) ? u[0] : u;
          if (!userInfo?.email) return Promise.resolve();
          const titulo = String(tituloPorPosicion.get(a.posicion_id) ?? "la posición");
          const nombreUsuario = typeof userInfo.nombre === "string" ? userInfo.nombre : "Estudiante";
          const emailUsuario = typeof userInfo.email === "string" ? userInfo.email : "";
          return sendAplicacionDescartada(emailUsuario, nombreUsuario, titulo);
        })
      );
    }

    return NextResponse.json({
      closedCount: ids.length,
      ids,
      aplicantesDescartados: pendientes?.length ?? 0,
    });
  } catch (e: any) {
    console.error("[cron/cerrar-posiciones]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
