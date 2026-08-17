import { BookLoader } from "@/components/ui/BookLoader";

export default function LoadingAdmin() {
  return (
    <div className="min-h-full bg-[#f8fafc] flex flex-col">
      {/* Barra superior simulada */}
      <div className="h-16 border-b border-border bg-white flex items-center px-8">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <BookLoader message="Cargando panel de administración..." />
        </div>
      </div>
    </div>
  );
}
