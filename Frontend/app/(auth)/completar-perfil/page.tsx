import { ProfileEditForm } from "@/components/forms/ProfileEditForm";
import { getUserProfile } from "@/actions/profile.actions";
import { Suspense } from "react";
import { Loader2, UserCheck } from "lucide-react";

export const metadata = {
  title: "Completar Perfil | Exalumnos U",
};

export default async function CompletarPerfilPage() {
  let userData: any = null;
  let errorMsg: string | null = null;
  
  try {
    userData = await getUserProfile();
  } catch (error: any) {
    errorMsg = error.message;
  }

  return (
    <div className="flex-1 w-full relative bg-ucr-gris-1/30 min-h-screen">
      {/* Fondo Dinámico con Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ucr-celeste/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-ucr-azul-1/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-ucr-azul-2/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Hero Header Estilizado */}
      <div className="w-full bg-[#e0f2fe] pt-16 pb-24 px-4 sm:px-6 md:px-8 relative shadow-sm overflow-hidden">
        {/* Imagen de fondo patrón */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-multiply pointer-events-none select-none" 
          style={{ backgroundImage: "url('/login-pattern.png')" }}
        ></div>
        
        {/* Degradado celeste elegante para integrarlo suavemente y asegurar contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-200/80 via-sky-100/40 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-0"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
          <div className="p-4 bg-white/70 rounded-2xl backdrop-blur-md border border-white/60 shadow-sm">
            <UserCheck className="w-10 h-10 text-[#005eb8]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#02477B] drop-shadow-sm">
              ¡Cuenta Activada!
            </h1>
            <p className="text-[#005eb8] font-semibold text-lg mt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="w-8 h-[2px] bg-[#005eb8] rounded-full"></span>
              Completa tu perfil para formar parte de la red
            </p>
          </div>
        </div>
      </div>

      {/* Contenedor Principal Flotante */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-12 relative z-20 pb-20">
        {errorMsg ? (
          <div className="p-6 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-red-700 mb-2">No se pudo cargar el perfil</h3>
            <p className="text-red-600 max-w-md">{errorMsg}</p>
          </div>
        ) : (
          <Suspense fallback={
            <div className="flex flex-col justify-center items-center py-32 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl">
              <Loader2 className="w-12 h-12 animate-spin text-ucr-celeste mb-4" />
              <p className="text-ucr-azul-2 font-medium">Cargando tu información...</p>
            </div>
          }>
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-md border border-ucr-celeste/20">
              <h2 className="text-xl font-bold text-ucr-azul-1 mb-2">Completa tu información</h2>
              <p className="text-ucr-gris-2">Por favor, asegúrate de llenar todos los campos requeridos, como tu fecha de nacimiento y género, antes de continuar.</p>
            </div>
            <ProfileEditForm initialData={userData || {}} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
