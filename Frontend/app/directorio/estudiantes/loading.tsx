import { BookLoader } from "@/components/ui/BookLoader";

export default function LoadingEstudiantes() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col">
      <div className="h-16 border-b border-border bg-white dark:bg-slate-900 flex items-center px-8">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <BookLoader message="Cargando directorio de estudiantes..." />
        </div>
      </div>
    </div>
  );
}
