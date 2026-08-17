"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CATALOGO_VOLUNTARIADO } from "@/lib/voluntariado-catalog";

// ─── Exalumno: ofrecer apoyo ("Retribuye a la UCR") ───────────────────────────

export async function ofrecerVoluntariado(tipo: string, mensaje?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  if ((session.user as any).tipo !== "EXALUMNO") throw new Error("Solo los exalumnos pueden ofrecer apoyo a la UCR.");

  const item = CATALOGO_VOLUNTARIADO.find((c) => c.tipo === tipo);
  if (!item) throw new Error("Tipo de apoyo inválido.");

  const exalumnoId = session.user.id;

  // Evita duplicar una oferta ya pendiente para la misma actividad.
  const { data: existente } = await supabaseAdmin
    .from("VOLUNTARIADOS_UCR")
    .select("id")
    .eq("exalumno_id", exalumnoId)
    .eq("tipo", tipo)
    .eq("estado", "PENDIENTE")
    .maybeSingle();
  if (existente) throw new Error("Ya tienes una oferta pendiente para esta actividad.");

  const { data: inserted, error } = await supabaseAdmin
    .from("VOLUNTARIADOS_UCR")
    .insert({
      id: randomUUID(),
      exalumno_id: exalumnoId,
      tipo: item.tipo,
      titulo: item.titulo,
      categoria: item.categoria,
      mensaje: mensaje?.trim() || null,
      estado: "PENDIENTE",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Error al enviar tu oferta: ${error.message}`);

  // Notificar a los administradores.
  const { data: admins } = await supabaseAdmin.from("USERS").select("id").eq("tipo", "ADMIN");
  if (admins && admins.length > 0) {
    const ahora = new Date().toISOString();
    await supabaseAdmin.from("NOTIFICATIONS").insert(
      admins.map((admin) => ({
        id: randomUUID(),
        user_id: admin.id,
        title: "Nueva oferta de voluntariado",
        message: `${session.user?.name ?? "Un exalumno"} ofreció apoyo para "${item.titulo}".`,
        type: "voluntariado_nuevo",
        read: false,
        reference_id: inserted.id,
        created_at: ahora,
        updated_at: ahora,
      }))
    );
  }

  revalidatePath("/retribuir");
  revalidatePath("/admin/voluntariados");
  return { success: true, id: inserted.id };
}

export async function getMisVoluntariados() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const { data, error } = await supabaseAdmin
    .from("VOLUNTARIADOS_UCR")
    .select("id, tipo, titulo, categoria, mensaje, estado, motivo_rechazo, created_at")
    .eq("exalumno_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener tus ofertas: ${error.message}`);
  return data ?? [];
}
