import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

async function ensureCurriculumId(estudianteId: string): Promise<string> {
  const { data: cur, error: findError } = await supabaseAdmin
    .from("CURRICULUM")
    .select("id")
    .eq("estudiante_id", estudianteId)
    .maybeSingle();

  if (findError) throw findError;
  if (cur) return cur.id;

  const newId = randomUUID();
  const now = new Date().toISOString();
  const { error: insertError } = await supabaseAdmin.from("CURRICULUM").insert({
    id: newId,
    estudiante_id: estudianteId,
    cv_data: {},
    habilidades_tecnicas: [],
    created_at: now,
    updated_at: now,
  });
  if (insertError) throw insertError;
  return newId;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  if ((session.user as any).tipo !== "ESTUDIANTE") {
    return NextResponse.json({ message: "Solo estudiantes." }, { status: 403 });
  }

  try {
    const { data: curriculum } = await supabaseAdmin
      .from("CURRICULUM")
      .select(`
        id,
        versiones:CURRICULUM_VERSIONES!CURRICULUM_VERSIONES_curriculum_id_fkey(
          id, nombre_version, posicion_id, ats_score, created_at,
          posicion:POSICIONES!CURRICULUM_VERSIONES_posicion_id_fkey(titulo, empresa)
        )
      `)
      .eq("estudiante_id", session.user.id)
      .maybeSingle();

    const curArr = curriculum?.versiones;
    const versiones = Array.isArray(curArr) ? curArr : [];

    const data = versiones.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((v: any) => {
      const posArr = v.posicion;
      const pos = Array.isArray(posArr) ? posArr[0] : posArr;
      return {
        id: v.id,
        nombre_version: v.nombre_version,
        posicion_id: v.posicion_id,
        posicion_titulo: pos?.titulo ?? null,
        posicion_empresa: pos?.empresa ?? null,
        ats_score: v.ats_score,
        created_at: v.created_at,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/curriculum/versiones]", error);
    return NextResponse.json({ message: "Error al obtener versiones" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }
  if ((session.user as any).tipo !== "ESTUDIANTE") {
    return NextResponse.json({ message: "Solo estudiantes." }, { status: 403 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido" }, { status: 400 });
  }

  const { posicion_id, nombre_version, contenido, ats_score } = body ?? {};
  if (!contenido || typeof contenido !== "object") {
    return NextResponse.json({ message: "Falta el contenido del CV adaptado." }, { status: 400 });
  }

  try {
    const curriculumId = await ensureCurriculumId(session.user.id);
    const newId = randomUUID();

    const { data: version, error } = await supabaseAdmin
      .from("CURRICULUM_VERSIONES")
      .insert({
        id: newId,
        curriculum_id: curriculumId,
        posicion_id: posicion_id || null,
        nombre_version: nombre_version || "Versión adaptada",
        contenido,
        ats_score: typeof ats_score === "number" ? Math.max(0, Math.min(100, Math.round(ats_score))) : null,
      })
      .select("id, nombre_version, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error("[POST /api/curriculum/versiones]", error);
    return NextResponse.json({ message: "Error al guardar la versión" }, { status: 500 });
  }
}
