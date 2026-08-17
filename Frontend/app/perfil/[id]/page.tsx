import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/actions/profile.actions";
import { ProfileDetailsClient } from "@/components/profile/ProfileDetailsClient";
import { DonacionesAdminPanel } from "@/components/donaciones/DonacionesAdminPanel";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const profile = await getPublicProfile(params.id).catch(() => null);
  if (!profile) return { title: "Perfil | Exalumnos UCR" };
  return {
    title: `${profile.nombre} | Perfil | Exalumnos UCR`,
    description: profile.biografia || `Perfil de ${profile.nombre} en la red de Exalumnos UCR.`,
  };
}

export default async function PerfilPublicoPage({ params }: Props) {
  const session = await auth();
  const profile = await getPublicProfile(params.id).catch(() => null);

  if (!profile) notFound();

  const isAdmin = (session?.user as any)?.tipo === "ADMIN";

  // Shape compatible con ProfileDetailsClient que espera { User, ofrece_*, ... }
  const exalumnoShape = {
    ...profile,
    User: {
      id: profile.id,
      nombre: profile.nombre,
      foto_url: profile.foto_url,
      email: null,
    },
    connectionStatus: "none",
    connectionId: null,
  };

  return (
    <div>
      <ProfileDetailsClient
        exalumno={exalumnoShape}
        currentUser={session?.user ?? null}
        accessToken={(session?.user as any)?.accessToken}
        apiUrl="/api"
      />

      {/* Panel de donaciones — solo visible para administradores */}
      {isAdmin && (
        <div className="max-w-4xl mx-auto px-6 pb-12">
          <DonacionesAdminPanel
            userId={params.id}
            tipoUsuario={(profile as any).tipo ?? "EXALUMNO"}
          />
        </div>
      )}
    </div>
  );
}
