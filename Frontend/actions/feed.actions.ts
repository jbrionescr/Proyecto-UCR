"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_CONTENIDO = 2000;
const MAX_COMENTARIO = 1000;

// ─── Feed: leer publicaciones ─────────────────────────────────────────────────

export async function getFeed(limit = 30) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const userId = session.user.id;
  const esAdmin = (session.user as any).tipo === "ADMIN";

  const { data: publicaciones, error } = await supabaseAdmin
    .from("PUBLICACIONES")
    .select(`
      id, contenido, imagen_url, created_at, autor_id,
      autor:USERS!PUBLICACIONES_autor_id_fkey(id, nombre, foto_url, tipo)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Error al cargar el feed: ${error.message}`);

  const publicacionesList = (publicaciones ?? []) as Array<any>;
  const ids = publicacionesList.map((p) => p.id);
  const { reaccionesCount, misReacciones, comentariosCount } = await getContadores(ids, userId);

  return publicacionesList.map((p: any) => {
    const autor = Array.isArray(p.autor) ? p.autor[0] : p.autor;
    return {
      id: p.id,
      contenido: p.contenido,
      imagen_url: p.imagen_url,
      created_at: p.created_at,
      autor_id: p.autor_id,
      autor_nombre: autor?.nombre ?? "Usuario UCR",
      autor_foto: autor?.foto_url ?? null,
      autor_tipo: autor?.tipo ?? null,
      total_reacciones: reaccionesCount.get(p.id) ?? 0,
      total_comentarios: comentariosCount.get(p.id) ?? 0,
      ya_reaccione: misReacciones.has(p.id),
      es_mio: p.autor_id === userId,
      puede_eliminar: p.autor_id === userId || esAdmin,
    };
  });
}

async function getContadores(publicacionIds: string[], userId: string) {
  const reaccionesCount = new Map<string, number>();
  const comentariosCount = new Map<string, number>();
  const misReacciones = new Set<string>();
  if (publicacionIds.length === 0) return { reaccionesCount, misReacciones, comentariosCount };

  const [{ data: reacciones }, { data: comentarios }] = await Promise.all([
    supabaseAdmin.from("PUBLICACION_REACCIONES").select("publicacion_id, user_id").in("publicacion_id", publicacionIds),
    supabaseAdmin.from("PUBLICACION_COMENTARIOS").select("publicacion_id").in("publicacion_id", publicacionIds),
  ]);

  const reaccionesList = (reacciones ?? []) as Array<any>;
  const comentariosList = (comentarios ?? []) as Array<any>;

  for (const r of reaccionesList) {
    reaccionesCount.set(r.publicacion_id, (reaccionesCount.get(r.publicacion_id) ?? 0) + 1);
    if (r.user_id === userId) misReacciones.add(r.publicacion_id);
  }
  for (const c of comentariosList) {
    comentariosCount.set(c.publicacion_id, (comentariosCount.get(c.publicacion_id) ?? 0) + 1);
  }
  return { reaccionesCount, misReacciones, comentariosCount };
}

// ─── Publicar ─────────────────────────────────────────────────────────────────

export async function crearPublicacion(contenido: string, imagen_url?: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const tipo = (session.user as any).tipo;
  if (tipo !== "ESTUDIANTE" && tipo !== "EXALUMNO") {
    throw new Error("Solo estudiantes y exalumnos pueden publicar.");
  }

  const texto = contenido?.trim();
  if (!texto && !imagen_url) throw new Error("La publicación no puede estar vacía.");
  if (texto && texto.length > MAX_CONTENIDO) throw new Error("La publicación es demasiado larga.");

  const { error } = await supabaseAdmin.from("PUBLICACIONES").insert({
    id: randomUUID(),
    autor_id: session.user.id,
    contenido: texto || "",
    imagen_url: imagen_url || null,
  });

  if (error) throw new Error(`Error al publicar: ${error.message}`);

  revalidatePath("/feed");
  return { success: true };
}

export async function eliminarPublicacion(publicacionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const esAdmin = (session.user as any).tipo === "ADMIN";

  const { data: pub } = await supabaseAdmin
    .from("PUBLICACIONES")
    .select("autor_id")
    .eq("id", publicacionId)
    .maybeSingle();

  if (!pub) throw new Error("Publicación no encontrada.");
  // Solo el autor o un admin pueden eliminar.
  if (pub.autor_id !== session.user.id && !esAdmin) {
    throw new Error("No tienes permiso para eliminar esta publicación.");
  }

  const { error } = await supabaseAdmin.from("PUBLICACIONES").delete().eq("id", publicacionId);
  if (error) throw new Error(`Error al eliminar: ${error.message}`);

  revalidatePath("/feed");
  return { success: true };
}

// ─── Me gusta ──────────────────────────────────────────────────────────────────

export async function toggleReaccion(publicacionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const userId = session.user.id;

  const { data: existente } = await supabaseAdmin
    .from("PUBLICACION_REACCIONES")
    .select("id")
    .eq("publicacion_id", publicacionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existente) {
    await supabaseAdmin.from("PUBLICACION_REACCIONES").delete().eq("id", existente.id);
    revalidatePath("/feed");
    return { success: true, reaccionado: false };
  }

  const { error } = await supabaseAdmin.from("PUBLICACION_REACCIONES").insert({
    id: randomUUID(),
    publicacion_id: publicacionId,
    user_id: userId,
  });
  // Si dos clics rápidos generan un duplicado (violación de UNIQUE), lo tratamos
  // como que ya estaba reaccionado, no como error.
  if (error && error.code !== "23505") throw new Error(`Error al reaccionar: ${error.message}`);

  await notificarAutor(publicacionId, userId, "reaccion", `${session.user.name ?? "Alguien"} reaccionó a tu publicación.`);

  revalidatePath("/feed");
  return { success: true, reaccionado: true };
}

// ─── Comentarios ────────────────────────────────────────────────────────────────

export async function getComentarios(publicacionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const esAdmin = (session.user as any).tipo === "ADMIN";

  const { data, error } = await supabaseAdmin
    .from("PUBLICACION_COMENTARIOS")
    .select(`
      id, contenido, created_at, autor_id,
      autor:USERS!PUBLICACION_COMENTARIOS_autor_id_fkey(nombre, foto_url, tipo)
    `)
    .eq("publicacion_id", publicacionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Error al cargar comentarios: ${error.message}`);

  return (data ?? []).map((c: any) => {
    const autor = Array.isArray(c.autor) ? c.autor[0] : c.autor;
    return {
      id: c.id,
      contenido: c.contenido,
      created_at: c.created_at,
      autor_id: c.autor_id,
      autor_nombre: autor?.nombre ?? "Usuario UCR",
      autor_foto: autor?.foto_url ?? null,
      autor_tipo: autor?.tipo ?? null,
      puede_eliminar: c.autor_id === session.user!.id || esAdmin,
    };
  });
}

export async function agregarComentario(publicacionId: string, contenido: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");

  const texto = contenido?.trim();
  if (!texto) throw new Error("El comentario no puede estar vacío.");
  if (texto.length > MAX_COMENTARIO) throw new Error("El comentario es demasiado largo.");

  const { error } = await supabaseAdmin.from("PUBLICACION_COMENTARIOS").insert({
    id: randomUUID(),
    publicacion_id: publicacionId,
    autor_id: session.user.id,
    contenido: texto,
  });

  if (error) throw new Error(`Error al comentar: ${error.message}`);

  await notificarAutor(publicacionId, session.user.id, "comentario", `${session.user.name ?? "Alguien"} comentó tu publicación.`);

  revalidatePath("/feed");
  return { success: true };
}

export async function eliminarComentario(comentarioId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No estás autenticado.");
  const esAdmin = (session.user as any).tipo === "ADMIN";

  const { data: com } = await supabaseAdmin
    .from("PUBLICACION_COMENTARIOS")
    .select("autor_id")
    .eq("id", comentarioId)
    .maybeSingle();

  if (!com) throw new Error("Comentario no encontrado.");
  if (com.autor_id !== session.user.id && !esAdmin) {
    throw new Error("No tienes permiso para eliminar este comentario.");
  }

  const { error } = await supabaseAdmin.from("PUBLICACION_COMENTARIOS").delete().eq("id", comentarioId);
  if (error) throw new Error(`Error al eliminar: ${error.message}`);

  revalidatePath("/feed");
  return { success: true };
}

// ─── Notificación in-app al autor (no a uno mismo) ────────────────────────────

async function notificarAutor(publicacionId: string, actorId: string, tipo: string, mensaje: string) {
  try {
    const { data: pub } = await supabaseAdmin
      .from("PUBLICACIONES")
      .select("autor_id")
      .eq("id", publicacionId)
      .maybeSingle();
    if (!pub || pub.autor_id === actorId) return; // no notificar interacciones con tu propia publicación

    const ahora = new Date().toISOString();
    await supabaseAdmin.from("NOTIFICATIONS").insert({
      id: randomUUID(),
      user_id: pub.autor_id,
      title: tipo === "reaccion" ? "Nueva reacción" : "Nuevo comentario",
      message: mensaje,
      type: tipo === "reaccion" ? "feed_reaccion" : "feed_comentario",
      read: false,
      reference_id: publicacionId,
      created_at: ahora,
      updated_at: ahora,
    });
  } catch (e) {
    console.error("[notificarAutor] No se pudo crear la notificación:", e);
  }
}
