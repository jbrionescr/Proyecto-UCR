import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).tipo !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get("status") || null;
    const nombre = searchParams.get("nombre") || null;

    let query = supabaseAdmin
      .from("MATCHES")
      .select(`
        id, estado, score_match, tipo_apoyo, match_reasons,
        initiated_by, created_at, accepted_at, resultado, estudiante_id, exalumno_id,
        estudiante:ESTUDIANTES!MATCHES_estudiante_id_fkey(
          user_id, carrera,
          user:USERS!ESTUDIANTES_user_id_fkey(nombre, email)
        ),
        exalumno:EXALUMNOS!MATCHES_exalumno_id_fkey(
          user_id, escuela_facultad,
          user:USERS!EXALUMNOS_user_id_fkey(nombre, email)
        )
      `)
      .order("created_at", { ascending: false });

    if (estado) query = query.eq("estado", estado);

    const { data: matches, error } = await query;
    if (error) throw error;

    const normalized = (matches ?? []).map((m: any) => {
      const est = Array.isArray(m.estudiante) ? m.estudiante[0] : m.estudiante;
      const exa = Array.isArray(m.exalumno)   ? m.exalumno[0]   : m.exalumno;
      const estUser = Array.isArray(est?.user) ? est.user[0] : est?.user;
      const exaUser = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;

      // Filter by nombre on JS side (Supabase doesn't support ilike on nested tables easily)
      if (nombre) {
        const n = nombre.toLowerCase();
        if (!estUser?.nombre?.toLowerCase().includes(n) && !exaUser?.nombre?.toLowerCase().includes(n)) {
          return null;
        }
      }

      // T-20: "meses activo" se cuenta desde que el match pasó a ACTIVO
      // (accepted_at), no desde que fue sugerido (created_at) — un match
      // puede llevar meses como SUGERIDO sin que eso implique falta de
      // seguimiento de una conexión real.
      let mesesActivo: number | null = null;
      let requiereSeguimiento = false;
      if (m.estado === "ACTIVO" && m.accepted_at) {
        mesesActivo = Math.floor((Date.now() - new Date(m.accepted_at).getTime()) / (30 * 24 * 60 * 60 * 1000));
        requiereSeguimiento = mesesActivo > 6;
      }

      return {
        ...m,
        status: m.estado,
        afinidad: m.score_match,
        estudianteId: m.estudiante_id,
        exalumnoId: m.exalumno_id,
        mesesActivo,
        requiereSeguimiento,
        estudiante: est ? { ...est, id: est.user_id, user: { name: estUser?.nombre, email: estUser?.email } } : null,
        exalumno:   exa ? { ...exa, id: exa.user_id, user: { name: exaUser?.nombre, email: exaUser?.email } } : null,
      };
    }).filter(Boolean);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[Admin Matches] Error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
