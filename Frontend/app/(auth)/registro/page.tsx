"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Esta página redirige automáticamente al componente unificado de login
 * con la vista de registro activa. Toda la lógica de login/registro
 * está en /login para poder hacer la transición fluida sin navegación.
 */
export default function RegistroRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Replace the current URL to /login?view=registro so the unified component
    // shows the registro view. Using replace to avoid extra history entry.
    router.replace("/login?view=registro");
  }, [router]);

  // Render a matching background while the redirect happens (instant, no flash)
  return (
    <div className="min-h-screen bg-ucr-naranja" />
  );
}
