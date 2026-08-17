import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  let session: any = null;
  let userId: string | undefined;

  try {
    session = await auth();
    userId = session?.user?.id;
  } catch (authErr: any) {
    console.error("[notifications] auth() falló:", authErr?.message);
    return NextResponse.json({ message: "Error de autenticación" }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return NextResponse.json({ message: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: notificationsData, error } = await supabaseAdmin
      .from("NOTIFICATIONS")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const notifications = notificationsData || [];
    const isExalumno = (session.user as any)?.tipo === "EXALUMNO";
    const matchesUrl = isExalumno ? "/mis-matches/exalumno" : "/mis-matches";

    const formatted = notifications.map(n => {
      const date = new Date(n.created_at || n.time);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeStr = "Hace un momento";
      if (diffDays > 0) {
        timeStr = `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        timeStr = `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
      } else if (diffMins > 0) {
        timeStr = `Hace ${diffMins} minuto${diffMins > 1 ? "s" : ""}`;
      }

      const isActionable =
        (n.type === "match_offer" && !isExalumno) ||
        (n.type === "match_contact_request" && isExalumno);

      const rejectedBy = isExalumno ? "exalumno" : "estudiante";
      let url = matchesUrl;
      
      if (n.type === "match_accepted" && n.reference_id) {
        url = `/mensajes?matchId=${n.reference_id}`;
      } else if (n.type?.includes("connection")) {
        url = "/mis-conexiones";
      }

      return {
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: timeStr,
        type: n.type,
        matchId: n.reference_id || null,
        actionable: isActionable && !!n.reference_id && !n.read,
        rejectedBy,
        url,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("[GET /api/notifications] DB ERROR:", error?.message, error?.code);
    return NextResponse.json({ message: "Error al obtener notificaciones" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (id) {
      const { error } = await supabaseAdmin
        .from("NOTIFICATIONS")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("NOTIFICATIONS")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("read", false);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/notifications]", error);
    return NextResponse.json({ message: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
