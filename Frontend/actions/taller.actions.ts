"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendTallerCupoConfirmado } from "@/lib/email";

const MODALIDADES = ["ONLINE", "PRESENCIAL", "HIBRIDO"] as const;

// ─── Exalumno: crear taller ("Retribuye a la UCR") ────────────────────────────

export async function crearTaller(input: {
  titulo: string;
  descripcion: string;
  fecha_hora?: string | null;
  cupos_totales: number;
  modalidad: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  if ((session.user as any).tipo !== "EXALUMNO") throw new Error("Solo los exalumnos pueden proponer talleres.");

  const titulo = input.titulo?.trim();
  const descripcion = input.descripcion?.trim();
  const cupos = Number(input.cupos_totales);
  const modalidad = MODALIDADES.includes(input.modalidad as any) ? input.modalidad : "ONLINE";

  if (!titulo) throw new Error("El título del taller es obligatorio.");
  if (!descripcion) throw new Error("La descripción del taller es obligatoria.");
  if (!Number.isFinite(cupos) || cupos <= 0) throw new Error("Los cupos disponibles deben ser un número mayor a 0.");

  const { data: inserted, error } = await supabaseAdmin
    .from("TALLERES")
    .insert({
      id: randomUUID(),
      exalumno_id: session.user.id,
      titulo,
      descripcion,
      fecha_hora: input.fecha_hora || null,
      cupos_totales: cupos,
      modalidad,
      estado: "PENDIENTE",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Error al enviar tu taller: ${error.message}`);

  const { data: admins } = await supabaseAdmin.from("USERS").select("id").eq("tipo", "ADMIN");
  if (admins && admins.length > 0) {
    const ahora = new Date().toISOString();
    await supabaseAdmin.from("NOTIFICATIONS").insert(
      admins.map((admin) => ({
        id: randomUUID(),
        user_id: admin.id,
        title: "Nuevo taller propuesto",
        message: `${session.user?.name ?? "Un exalumno"} propuso el taller "${titulo}".`,
        type: "taller_nuevo",
        read: false,
        reference_id: inserted.id,
        created_at: ahora,
        updated_at: ahora,
      }))
    );
  }

  revalidatePath("/retribuir");
  revalidatePath("/admin/talleres");
  return { success: true, id: inserted.id };
}

export async function getMisTalleres() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const { data: talleres, error } = await supabaseAdmin
    .from("TALLERES")
    .select("id, titulo, descripcion, fecha_hora, cupos_totales, modalidad, estado, motivo_rechazo, created_at")
    .eq("exalumno_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener tus talleres: ${error.message}`);

  const talleresIds = (talleres ?? []).map((t) => t.id);
  const inscritosPorTaller = await contarInscritosPorTaller(talleresIds);

  return (talleres ?? []).map((t) => ({
    ...t,
    cupos_ocupados: inscritosPorTaller.get(t.id) ?? 0,
  }));
}

// ─── Estudiantes y exalumnos: ver talleres aprobados ("Talleres") ─────────────

export async function getTalleresAprobados() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const { data: talleres, error } = await supabaseAdmin
    .from("TALLERES")
    .select(`
      id, titulo, descripcion, fecha_hora, cupos_totales, modalidad, created_at,
      exalumno:EXALUMNOS!TALLERES_exalumno_id_fkey(user:USERS!EXALUMNOS_user_id_fkey(nombre, foto_url))
    `)
    .eq("estado", "APROBADO")
    .order("fecha_hora", { ascending: true, nullsFirst: false });

  if (error) throw new Error(`Error al obtener los talleres: ${error.message}`);

  const talleresIds = (talleres ?? []).map((t) => t.id);
  const inscritosPorTaller = await contarInscritosPorTaller(talleresIds);

  let misInscripciones = new Set<string>();
  if (talleresIds.length > 0) {
    const { data: inscripciones } = await supabaseAdmin
      .from("TALLER_INSCRIPCIONES")
      .select("taller_id")
      .eq("estudiante_id", session.user.id)
      .in("taller_id", talleresIds);
    misInscripciones = new Set((inscripciones ?? []).map((i) => i.taller_id));
  }

  return (talleres ?? []).map((t: any) => {
    const exa = Array.isArray(t.exalumno) ? t.exalumno[0] : t.exalumno;
    const user = Array.isArray(exa?.user) ? exa.user[0] : exa?.user;
    const cuposOcupados = inscritosPorTaller.get(t.id) ?? 0;
    return {
      id: t.id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      fecha_hora: t.fecha_hora,
      cupos_totales: t.cupos_totales,
      cupos_ocupados: cuposOcupados,
      cupos_disponibles: Math.max(0, t.cupos_totales - cuposOcupados),
      modalidad: t.modalidad,
      facilitador_nombre: user?.nombre ?? "Exalumno UCR",
      facilitador_foto: user?.foto_url ?? null,
      ya_inscrito: misInscripciones.has(t.id),
    };
  });
}

async function contarInscritosPorTaller(talleresIds: string[]) {
  const mapa = new Map<string, number>();
  if (talleresIds.length === 0) return mapa;
  const { data } = await supabaseAdmin
    .from("TALLER_INSCRIPCIONES")
    .select("taller_id")
    .in("taller_id", talleresIds);
  for (const row of data ?? []) {
    mapa.set(row.taller_id, (mapa.get(row.taller_id) ?? 0) + 1);
  }
  return mapa;
}

// ─── Estudiante: postularse a un taller ───────────────────────────────────────

export async function postularseATaller(tallerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  if ((session.user as any).tipo !== "ESTUDIANTE") throw new Error("Solo los estudiantes pueden postularse a talleres.");

  const { data: taller, error: tallerErr } = await supabaseAdmin
    .from("TALLERES")
    .select("id, titulo, fecha_hora, cupos_totales, estado")
    .eq("id", tallerId)
    .maybeSingle();

  if (tallerErr || !taller) throw new Error("Taller no encontrado.");
  if (taller.estado !== "APROBADO") throw new Error("Este taller no está disponible.");

  const { count } = await supabaseAdmin
    .from("TALLER_INSCRIPCIONES")
    .select("id", { count: "exact", head: true })
    .eq("taller_id", tallerId);

  if ((count ?? 0) >= taller.cupos_totales) {
    throw new Error("Cupos llenos. Ya no hay espacio disponible en este taller.");
  }

  const { error: insertErr } = await supabaseAdmin
    .from("TALLER_INSCRIPCIONES")
    .insert({ id: randomUUID(), taller_id: tallerId, estudiante_id: session.user.id });

  if (insertErr) {
    if (insertErr.code === "23505") throw new Error("Ya estás inscrito en este taller.");
    throw new Error(`Error al postularte: ${insertErr.message}`);
  }

  // Revalida la cuenta de cupos por si dos personas se postularon a la vez;
  // si ya se llenó con esta inscripción de más, se revierte y se avisa.
  const { count: countFinal } = await supabaseAdmin
    .from("TALLER_INSCRIPCIONES")
    .select("id", { count: "exact", head: true })
    .eq("taller_id", tallerId);

  if ((countFinal ?? 0) > taller.cupos_totales) {
    await supabaseAdmin
      .from("TALLER_INSCRIPCIONES")
      .delete()
      .eq("taller_id", tallerId)
      .eq("estudiante_id", session.user.id);
    throw new Error("Cupos llenos. Alguien más tomó el último cupo justo antes que tú.");
  }

  if (session.user.email) {
    const fecha = taller.fecha_hora
      ? new Date(taller.fecha_hora).toLocaleString("es-CR", { dateStyle: "long", timeStyle: "short" })
      : null;
    await sendTallerCupoConfirmado(session.user.email, session.user.name || "Estudiante", taller.titulo, fecha);
  }

  revalidatePath("/talleres");
  return { success: true };
}
