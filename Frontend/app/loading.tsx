import { BookLoader } from "@/components/ui/BookLoader";

/**
 * Fallback global de carga — Next.js lo usa como boundary de Suspense en
 * el layout raíz para CUALQUIER ruta que no tenga su propio loading.tsx
 * (admin, directorio/estudiantes y directorio/exalumnos ya tienen uno más
 * específico y no se ven afectados). Da feedback instantáneo en la
 * navegación mientras el bundle de la página de destino se descarga/monta.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2 w-full max-w-xs">
        <BookLoader message="Cargando..." />
      </div>
    </div>
  );
}
