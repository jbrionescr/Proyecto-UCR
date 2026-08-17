import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Métricas generales de la plataforma para el tab "Impacto" del panel admin.
// Reemplaza al antiguo backend Express (/api/backend/dashboard/metrics), que
// dependía de un servidor separado en el puerto 3001 que ya no se ejecuta —
// esos datos ahora viven en Supabase, igual que el resto del panel admin.
export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo ADMIN puede acceder a estas métricas" },
      { status: 403 }
    );
  }

  try {
    const [
      { count: students },
      { count: graduates },
      { count: jobs },
      { count: applications },
      { count: donations },
      { count: events },
      { count: acceptedRequests },
      { count: rejectedRequests },
      { count: activeUsers },
      { data: posicionesEmpresas },
    ] = await Promise.all([
      supabaseAdmin.from("USERS").select("id", { count: "exact", head: true }).eq("tipo", "ESTUDIANTE"),
      supabaseAdmin.from("USERS").select("id", { count: "exact", head: true }).eq("tipo", "EXALUMNO"),
      supabaseAdmin.from("POSICIONES").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("APLICACIONES").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("DONACIONES").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("TALLERES").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("MATCHES").select("id", { count: "exact", head: true }).eq("estado", "ACTIVO"),
      supabaseAdmin.from("MATCHES").select("id", { count: "exact", head: true }).eq("estado", "RECHAZADO"),
      supabaseAdmin.from("USERS").select("id", { count: "exact", head: true }).eq("activo", true),
      supabaseAdmin.from("POSICIONES").select("empresa").not("empresa", "is", null),
    ]);

    const companies = new Set((posicionesEmpresas ?? []).map((p: any) => p.empresa?.trim().toLowerCase()).filter(Boolean)).size;

    return NextResponse.json({
      students: students ?? 0,
      graduates: graduates ?? 0,
      companies,
      jobs: jobs ?? 0,
      applications: applications ?? 0,
      donations: donations ?? 0,
      events: events ?? 0,
      acceptedRequests: acceptedRequests ?? 0,
      rejectedRequests: rejectedRequests ?? 0,
      activeUsers: activeUsers ?? 0,
    });
  } catch (error) {
    console.error("[GET /api/dashboard/metrics]", error);
    return NextResponse.json({ message: "Error al obtener métricas del servidor" }, { status: 500 });
  }
}
