import { AlumniDirectoryClient } from "@/components/directory/AlumniDirectoryClient";
import { ParallaxBackground } from "@/components/fu/ParallaxBackground";

export const metadata = {
  title: "Directorio de Exalumnos | Alumni UCR",
  description: "Conecta con la comunidad global de exalumnos graduados de la Universidad de Costa Rica.",
};

export default function DirectorioExalumnosPage() {
  return (
    <ParallaxBackground className="min-h-screen">
      <AlumniDirectoryClient />
    </ParallaxBackground>
  );
}
