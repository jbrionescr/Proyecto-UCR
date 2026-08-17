import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generarScoresPosiciones } from "@/actions/matching.actions";
import MisMatchesClient from "./MisMatchesClient";

export default async function MisMatchesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as any).tipo || (session.user as any).role;
  const userId = session.user.id;

  let matches: any[] = [];
  let posiciones: any[] = [];

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    if (role === "EXALUMNO") {
      redirect("/mis-matches/exalumno");
    }

    if (role === "ESTUDIANTE") {
      const { data: rawMatches } = await supabaseAdmin
        .from('MATCHES')
        .select('*')
        .eq('estudiante_id', userId)
        .order('score_match', { ascending: false });

      const exalumnoIds = rawMatches?.map((m: any) => m.exalumno_id) || [];
      const { data: exalumnos } = await supabaseAdmin.from('EXALUMNOS').select('*').in('user_id', exalumnoIds);
      const { data: users } = await supabaseAdmin.from('USERS').select('id, nombre, foto_url, email').in('id', exalumnoIds);

      matches = (rawMatches || []).map((m: any) => {
        const exa = exalumnos?.find((e: any) => e.user_id === m.exalumno_id);
        const usr = users?.find((u: any) => u.id === m.exalumno_id);
        return {
          ...m,
          exalumno: {
            carrera: exa?.carrera,
            sector: exa?.sector,
            apoyo_ofrecido: [
              ...(exa?.ofrece_mentoria ? ["Mentoría"] : []),
              ...(exa?.ofrece_empleo ? ["Empleo"] : []),
              ...(exa?.ofrece_pasantia ? ["Pasantías"] : []),
              ...(exa?.ofrece_donacion_dinero ? ["Financiamiento"] : []),
              ...(exa?.ofrece_guest_speaking ? ["Charla"] : []),
              ...(exa?.ofrece_volunteering ? ["Voluntariado"] : []),
              ...(exa?.ofrece_career_advice ? ["Consejo de Carrera"] : []),
              ...(exa?.ofrece_networking ? ["Networking"] : []),
            ],
            user: usr ? { nombre: usr.nombre, foto_url: usr.foto_url, email: usr.email } : null
          }
        };
      });

      try {
        posiciones = await generarScoresPosiciones(userId);
      } catch (posError) {
        console.error("Error generando scores de posiciones:", posError);
      }
    }


    // Normalize for the client
    matches = matches.map((m: any) => {
      let parsedReasons = null;
      if (typeof m.match_reasons === "string") {
        try { parsedReasons = JSON.parse(m.match_reasons); } catch(e){}
      } else if (m.match_reasons) {
        parsedReasons = m.match_reasons;
      }
      
      const desglose = (parsedReasons as any)?.desglose || null;

      return {
        id: m.id,
        afinidad: m.score_match || 0,
        desglose: desglose,
      status: m.estado,
      initiated_by: m.initiated_by,
      exalumno: m.exalumno ? {
        carrera: m.exalumno.carrera,
        sector: m.exalumno.sector,
        apoyoOfrecido: m.exalumno.apoyo_ofrecido || [],
        user: { name: m.exalumno.user?.nombre, image: m.exalumno.user?.foto_url }
      } : null,
      estudiante: m.estudiante ? {
        carrera: m.estudiante.carrera,
        avanceProyecto: m.estudiante.proyecto_porcentaje_avance || 0,
        areaProyecto: m.estudiante.area_proyecto,
        apoyoBuscado: m.estudiante.apoyo_buscado || [],
        user: { name: m.estudiante.user?.nombre, image: m.estudiante.user?.foto_url }
      } : null,
      };
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
  }

  return <MisMatchesClient matches={matches} posiciones={posiciones} currentUserId={userId!} />;
}