import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(_request: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.tipo || (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json(
      { message: "Solo ADMIN puede acceder a estas estadísticas" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(_request.url);
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");
  const desde = desdeParam
    ? new Date(desdeParam + "T00:00:00").toISOString()
    : new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
  const hasta = hastaParam ? new Date(hastaParam + "T23:59:59").toISOString() : null;

  try {
    // Parallel KPI queries
    const [
      { count: matchesActivos },
      { count: matchesCerrados },
      { count: estudiantesActivos },
      { count: exalumnosActivos },
      { data: allDonacionesConfirmadas },
      { data: donacionesRango },
      { data: donacionesPendientesRaw },
      { data: sedesData },
      { data: matchesCarreraData },
    ] = await Promise.all([
      supabaseAdmin.from("MATCHES").select("id", { count: "exact", head: true }).eq("estado", "ACTIVO"),
      supabaseAdmin.from("MATCHES").select("id", { count: "exact", head: true }).eq("estado", "CERRADO"),
      supabaseAdmin.from("USERS").select("id", { count: "exact", head: true }).eq("tipo", "ESTUDIANTE").eq("status", "ACTIVO").eq("activo", true),
      supabaseAdmin.from("USERS").select("id", { count: "exact", head: true }).eq("tipo", "EXALUMNO").eq("status", "ACTIVO").eq("activo", true),
      // All-time confirmed for global total
      supabaseAdmin.from("DONACIONES").select("monto").eq("estado", "CONFIRMADA"),
      // In-range confirmed for period charts
      supabaseAdmin.from("DONACIONES")
        .select("monto, created_at, exalumno_id, proyecto_estudiante_id")
        .eq("estado", "CONFIRMADA")
        .gte("created_at", desde)
        .order("created_at", { ascending: true }),
      // Pending donations with exalumno info
      supabaseAdmin.from("DONACIONES")
        .select(`id, monto, estado, destino, metodo_pago, moneda, created_at, updated_at, exalumno_id,
          exalumno:EXALUMNOS!DONACIONES_exalumno_id_fkey(user_id, user:USERS!EXALUMNOS_user_id_fkey(id, nombre, email))`)
        .eq("estado", "PENDIENTE")
        .order("created_at", { ascending: true }),
      // Sedes distribution
      supabaseAdmin.from("ESTUDIANTES").select("sede").not("sede", "is", null),
      // Matches by carrera
      supabaseAdmin.from("MATCHES")
        .select("estudiante:ESTUDIANTES!MATCHES_estudiante_id_fkey(carrera)")
        .eq("estado", "ACTIVO"),
    ]);

    // Compute totals
    const totalDonado = (allDonacionesConfirmadas ?? []).reduce((s: number, d: any) => s + Number(d.monto), 0);
    const donacionesAprobadas = allDonacionesConfirmadas?.length ?? 0;

    // Period metrics
    const totalDonadoRango = (donacionesRango ?? []).reduce((s: number, d: any) => s + Number(d.monto), 0);
    const donantesEnRango = Array.from(new Set((donacionesRango ?? []).map((d: any) => d.exalumno_id)));
    const proyectosApoyados = new Set((donacionesRango ?? []).map((d: any) => d.proyecto_estudiante_id).filter(Boolean)).size;

    // Donantes nuevos vs recurrentes
    let donantesRecurrentes = 0;
    if (donantesEnRango.length > 0) {
      const { data: previas } = await supabaseAdmin
        .from("DONACIONES")
        .select("exalumno_id")
        .eq("estado", "CONFIRMADA")
        .in("exalumno_id", donantesEnRango as string[])
        .lt("created_at", desde);
      const setPrevias = new Set((previas ?? []).map((p: any) => p.exalumno_id));
      donantesRecurrentes = donantesEnRango.filter((id) => setPrevias.has(id)).length;
    }
    const donantesNuevos = donantesEnRango.length - donantesRecurrentes;

    // Chart data
    const mesesES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const donacionesPorMes: Record<string, number> = {};
    for (const d of (donacionesRango ?? [])) {
      const fecha = new Date(d.created_at);
      const key = `${mesesES[fecha.getMonth()]} ${fecha.getFullYear()}`;
      donacionesPorMes[key] = (donacionesPorMes[key] || 0) + Number(d.monto);
    }
    const graficoDonaciones = Object.entries(donacionesPorMes).map(([mes, total]) => ({ mes, total }));

    // Sedes distribution
    const sedesCount: Record<string, number> = {};
    for (const s of (sedesData ?? [])) {
      if (s.sede) sedesCount[s.sede] = (sedesCount[s.sede] || 0) + 1;
    }
    const graficoSedes = Object.entries(sedesCount).map(([name, value]) => ({ name, value }));

    // Matches by carrera
    const carreraCount: Record<string, number> = {};
    for (const m of (matchesCarreraData ?? [])) {
      const est = Array.isArray(m.estudiante) ? m.estudiante[0] : m.estudiante;
      if (est?.carrera) carreraCount[est.carrera] = (carreraCount[est.carrera] || 0) + 1;
    }
    const graficoMatchesCarrera = Object.entries(carreraCount).map(([name, value]) => ({ name, value }));

    // Normalize pending donations
    const pendientesNormalized = (donacionesPendientesRaw ?? []).map((d: any) => {
      const exaArr = d.exalumno;
      const exa = Array.isArray(exaArr) ? exaArr[0] : exaArr;
      const userArr = exa?.user;
      const u = Array.isArray(userArr) ? userArr[0] : userArr;
      return {
        ...d,
        status: d.estado,
        createdAt: d.created_at,
        exalumno: exa ? { ...exa, id: exa.user_id, user: { id: u?.id, name: u?.nombre, email: u?.email } } : null,
      };
    });

    return NextResponse.json({
      kpis: {
        totalDonado,
        donacionesAprobadas,
        matchesActivos: matchesActivos ?? 0,
        matchesCerrados: matchesCerrados ?? 0,
        estudiantesActivos: estudiantesActivos ?? 0,
        exalumnosActivos: exalumnosActivos ?? 0,
        totalDonadoPeriodo: totalDonadoRango,
        proyectosApoyados,
        donantesNuevos,
        donantesRecurrentes,
      },
      rango: { desde, hasta },
      graficoDonaciones,
      graficoSedes,
      graficoMatchesCarrera,
      graficoDonantes: [
        { name: "Nuevos", value: donantesNuevos },
        { name: "Recurrentes", value: donantesRecurrentes },
      ],
      donacionesPendientes: pendientesNormalized,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ message: "Error al obtener estadísticas" }, { status: 500 });
  }
}
