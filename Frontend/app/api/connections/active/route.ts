import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabaseAdmin } from "@/lib/supabase-admin";

function getToken_(req: NextRequest) {
  return getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? "ucr-alumni-nextauth-secret-2026-change-in-prod",
    cookieName: req.cookies.get("__Secure-authjs.session-token")
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  }).catch(() => null);
}

async function enrichParty(userId: string) {
  const { data: user } = await supabaseAdmin
    .from("USERS")
    .select("id, nombre, foto_url, tipo")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return null;
  if (user.tipo === "EXALUMNO") {
    const { data: exalumno } = await supabaseAdmin
      .from("EXALUMNOS")
      .select("cargo_actual, empresa_actual, carrera")
      .eq("user_id", userId)
      .maybeSingle();
    return { ...user, Exalumno: exalumno ?? {} };
  }
  return user;
}

// GET /api/connections/active — conexiones aceptadas (contactos)
export async function GET(request: NextRequest) {
  const token = await getToken_(request);
  if (!token) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const userId = token.id as string;

  try {
    const { data: matches, error } = await supabaseAdmin
      .from("MATCHES")
      .select("id, estudiante_id, exalumno_id, initiated_by, created_at")
      .eq("estado", "ACTIVO")
      .or(`estudiante_id.eq.${userId},exalumno_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const result = await Promise.all(
      (matches || []).map(async (m) => {
        const initiatorId =
          m.initiated_by === m.estudiante_id || m.initiated_by === m.exalumno_id
            ? m.initiated_by
            : m.estudiante_id;
        const otherId = initiatorId === m.estudiante_id ? m.exalumno_id : m.estudiante_id;
        const [Sender, Receiver] = await Promise.all([enrichParty(initiatorId), enrichParty(otherId)]);
        return { id: m.id, sender_id: initiatorId, Sender, Receiver };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/connections/active]", error);
    return NextResponse.json({ message: "Error al obtener conexiones activas" }, { status: 500 });
  }
}
