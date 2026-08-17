export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MatchesExalumnoClient from "./MatchesExalumnoClient";

type Desglose = { C: number; I: number; A: number; S: number };

function parseDesglose(tipoApoyo: string | null): Desglose | null {
  if (!tipoApoyo || !tipoApoyo.startsWith("C:")) return null;
  const obj: Record<string, number> = {};
  tipoApoyo.split(",").forEach(p => {
    const idx = p.indexOf(":");
    if (idx > 0) obj[p.slice(0, idx)] = parseInt(p.slice(idx + 1), 10) || 0;
  });
  return { C: obj.C ?? 0, I: obj.I ?? 0, A: obj.A ?? 0, S: obj.S ?? 0 };
}

export default async function MatchesExalumnoPage() {
  let matches: any[] = [];
  let userId = "";

  try {
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;

      const { createClient } = require("@supabase/supabase-js");
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );

      const { data: rawMatches } = await supabaseAdmin
        .from('MATCHES')
        .select('*')
        .eq('exalumno_id', userId)
        .order('score_match', { ascending: false });

      const estudianteIds = rawMatches?.map((m: any) => m.estudiante_id) || [];
      const { data: estudiantes } = await supabaseAdmin.from('ESTUDIANTES').select('*').in('user_id', estudianteIds);
      const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url').in('id', estudianteIds);

      const combinedMatches = (rawMatches || []).map((m: any) => {
        const est = estudiantes?.find((e: any) => e.user_id === m.estudiante_id);
        const usr = users?.find((u: any) => u.id === m.estudiante_id);
        return {
          ...m,
          estudiante: {
            ...est,
            user: usr
          }
        };
      });

      matches = combinedMatches.map((m: any) => ({
        id: m.id,
        afinidad: m.score_match ?? 0,
        desglose: parseDesglose(m.tipo_apoyo),
        status: m.estado as string,
        initiated_by: m.initiated_by ?? "sistema",
        estudiante: {
          user: { name: m.estudiante?.user?.nombre ?? null },
          carrera: m.estudiante?.carrera ?? "",
          avanceProyecto: m.estudiante?.proyecto_porcentaje_avance ?? 0,
          apoyoBuscado: [
            m.estudiante?.busca_mentoria       ? "Mentoría"       : null,
            m.estudiante?.busca_empleo         ? "Empleo"         : null,
            m.estudiante?.busca_pasantia       ? "Pasantía"       : null,
            m.estudiante?.busca_financiamiento ? "Financiamiento" : null,
          ].filter(Boolean) as string[],
        },
      }));
    }
  } catch (e) {
    console.error("[MatchesExalumnoPage]", e);
  }

  return (
    <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Cargando matches...</div>}>
      <MatchesExalumnoClient matches={matches} currentUserId={userId} />
    </Suspense>
  );
}
