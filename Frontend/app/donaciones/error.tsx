"use client";

import { useEffect } from "react";

export default function DonacionesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DonacionesPage error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-xl font-bold text-red-600">Error en la página de donaciones</h2>
      <pre className="text-xs bg-red-50 border border-red-200 rounded p-4 max-w-2xl w-full overflow-auto text-red-800">
        {error.message}
        {"\n"}
        {error.stack}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
