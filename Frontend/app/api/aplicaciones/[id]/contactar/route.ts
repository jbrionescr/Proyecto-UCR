import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

// POST — exalumno crea/activa un match ACTIVO con el estudiante que aplicó
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const tipo   = (session.user as any).tipo as string;

  if (tipo !== "EXALUMNO" && tipo !== "ADMIN")
    return NextResponse.json({ message: "Solo exalumnos pueden contactar aplicantes" }, { status: 403 });

  const { data: aplicacion } = await supabaseAdmin
    .from("APLICACIONES")
    .select(`id, estudiante_id, posicion:POSICIONES!APLICACIONES_posicion_id_fkey(exalumno_id)`)
    .eq("id", params.id)
    .maybeSingle();

  if (!aplicacion)
    return NextResponse.json({ message: "Aplicación no encontrada" }, { status: 404 });

  const posArr = aplicacion.posicion;
  const pos = Array.isArray(posArr) ? posArr[0] : posArr;
  const exalumnoId = tipo === "ADMIN" ? pos?.exalumno_id : userId;

  if (tipo !== "ADMIN" && pos?.exalumno_id !== userId)
    return NextResponse.json({ message: "No tienes permiso para contactar este aplicante" }, { status: 403 });

  const estudianteId = aplicacion.estudiante_id;

  // Check if match already exists
  const { data: existing } = await supabaseAdmin
    .from("MATCHES")
    .select("id, estado")
    .eq("estudiante_id", estudianteId)
    .eq("exalumno_id", exalumnoId)
    .maybeSingle();

  let matchId: string;

  if (!existing) {
    matchId = randomUUID();
    const { error } = await supabaseAdmin.from("MATCHES").insert({
      id: matchId,
      estudiante_id: estudianteId,
      exalumno_id: exalumnoId,
      estado: "ACTIVO",
      score_match: 0,
      initiated_by: userId,
      tipo_apoyo: "empleo",
      accepted_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[POST /api/aplicaciones/[id]/contactar]", error);
      return NextResponse.json({ message: "Error al crear match" }, { status: 500 });
    }
  } else if (existing.estado !== "ACTIVO") {
    matchId = existing.id;
    await supabaseAdmin
      .from("MATCHES")
      .update({ estado: "ACTIVO", accepted_at: new Date().toISOString() })
      .eq("id", matchId);
  } else {
    matchId = existing.id;
  }

  return NextResponse.json({ matchId });
}
