import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { computeFundingStats, extractMontoObjetivo } from "@/lib/funding";
import { getExchangeRate, usdToCrc } from "@/lib/exchangeRate";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  const tipo = (session?.user as any)?.tipo;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const { data: user } = await supabaseAdmin.from('USERS').select('*').eq('id', userId).maybeSingle();
    if (!user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    let matchesActivos = 0;
    let matchesPendientes = 0;
    let matchesContactados = 0;
    let donacionTotalConfirmada = 0;
    let proyectosPatrocinados: any[] = [];
    let financiamiento: (ReturnType<typeof computeFundingStats> & { busca: boolean; objetivoUsd: number }) | null = null;

    if (tipo === "ESTUDIANTE") {
      const { data: estMatches } = await supabaseAdmin.from('MATCHES').select('estado').eq('estudiante_id', userId);
      matchesActivos = estMatches?.filter((m:any) => m.estado === "ACTIVO").length || 0;
      matchesPendientes = estMatches?.filter((m:any) => m.estado === "SUGERIDO").length || 0;

      // Recaudación de su propio proyecto: cuánto le falta para la meta.
      // La meta se registra en dólares y se convierte a colones (moneda de
      // las donaciones) con el tipo de cambio actual.
      const { data: estProfile } = await supabaseAdmin
        .from('ESTUDIANTES')
        .select('busca_financiamiento, proyecto_necesidades')
        .eq('user_id', userId)
        .maybeSingle();
      const objetivoUsd = extractMontoObjetivo(estProfile?.proyecto_necesidades);
      if (estProfile?.busca_financiamiento && objetivoUsd > 0) {
        const rate = await getExchangeRate();
        const objetivo = usdToCrc(objetivoUsd, rate);
        const { data: propiasDonaciones } = await supabaseAdmin
          .from('DONACIONES')
          .select('monto')
          .eq('proyecto_estudiante_id', userId)
          .eq('estado', 'CONFIRMADA');
        const recaudado = (propiasDonaciones ?? []).reduce((sum: number, d: any) => sum + Number(d.monto), 0);
        financiamiento = { busca: true, objetivoUsd, ...computeFundingStats(objetivo, recaudado) };
      }
    } else if (tipo === "EXALUMNO") {
      const { data: exaMatches } = await supabaseAdmin.from('MATCHES').select('estado').eq('exalumno_id', userId);
      matchesActivos = exaMatches?.filter((m:any) => m.estado === "ACTIVO").length || 0;
      matchesPendientes = exaMatches?.filter((m:any) => m.estado === "SUGERIDO").length || 0;
      matchesContactados = exaMatches?.filter((m:any) => m.estado === "CONTACTADO").length || 0;

      const { data: donaciones } = await supabaseAdmin.from('DONACIONES').select('monto, estado, proyecto_estudiante_id').eq('exalumno_id', userId);
      if (donaciones) {
        donacionTotalConfirmada = donaciones.filter((d:any) => d.estado === "CONFIRMADA").reduce((sum:number, d:any) => sum + Number(d.monto), 0);
        
        const patrocinados = donaciones.filter((d:any) => d.proyecto_estudiante_id != null).slice(0, 3);
        
        const estIds = patrocinados.map((d:any) => d.proyecto_estudiante_id);
        if (estIds.length > 0) {
          const { data: estudiantes } = await supabaseAdmin.from('ESTUDIANTES').select('*').in('user_id', estIds);
          const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre').in('id', estIds);

          // Total recaudado por estudiante entre TODOS los donantes (no solo
          // este exalumno), para poder mostrar cuánto le falta a la meta.
          const { data: todasDonaciones } = await supabaseAdmin
            .from('DONACIONES')
            .select('proyecto_estudiante_id, monto')
            .in('proyecto_estudiante_id', estIds)
            .eq('estado', 'CONFIRMADA');
          const recaudadoPorEstudiante = new Map<string, number>();
          for (const d of todasDonaciones ?? []) {
            const actual = recaudadoPorEstudiante.get(d.proyecto_estudiante_id) ?? 0;
            recaudadoPorEstudiante.set(d.proyecto_estudiante_id, actual + Number(d.monto));
          }

          const rate = await getExchangeRate();

          proyectosPatrocinados = patrocinados.map((d:any) => {
            const est = estudiantes?.find((e:any) => e.user_id === d.proyecto_estudiante_id);
            const usr = users?.find((u:any) => u.id === d.proyecto_estudiante_id);
            const objetivoUsd = extractMontoObjetivo(est?.proyecto_necesidades);
            const recaudado = recaudadoPorEstudiante.get(d.proyecto_estudiante_id) ?? 0;
            return {
              monto: Number(d.monto),
              estado: d.estado,
              nombre_estudiante: usr?.nombre ?? "Estudiante",
              proyecto_titulo: est?.proyecto_titulo ?? "Proyecto",
              avance: est?.proyecto_porcentaje_avance ?? 0,
              ...(objetivoUsd > 0 ? { montoObjetivo: usdToCrc(objetivoUsd, rate), montoObjetivoUsd: objetivoUsd, montoRecaudado: recaudado } : {}),
            };
          });
        }
      }
    }

    return NextResponse.json({
      ...user,
      matchesActivos,
      matchesPendientes,
      matchesContactados,
      donacionTotalConfirmada,
      proyectosPatrocinados,
      financiamiento,
    });
  } catch (error) {
    console.error("[GET /api/users/me]", error);
    return NextResponse.json({ message: "Error al obtener perfil" }, { status: 500 });
  }
}
