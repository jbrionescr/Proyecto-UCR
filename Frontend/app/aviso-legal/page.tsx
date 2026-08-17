import Link from "next/link";

export const metadata = {
  title: "Aviso Legal | Fundación Exalumnos U",
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8 px-4 sm:py-12 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 sm:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f4c81] dark:text-sky-400">Aviso Legal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Última actualización: julio de 2026
          </p>
        </div>

        <Section title="1. Titularidad de la plataforma">
          <p>
            Esta plataforma es operada por la <strong>Fundación Exalumnos U</strong>, con el
            objetivo de conectar a estudiantes y exalumnos de la Universidad de Costa Rica para
            actividades de mentoría, empleo, pasantías y donaciones a proyectos estudiantiles.
          </p>
        </Section>

        <Section title="2. Condiciones de uso">
          <p>
            El acceso y uso de la plataforma implica la aceptación de este Aviso Legal y de la{" "}
            <Link href="/politica-privacidad" className="text-ucr-celeste-medium hover:underline">
              Política de Privacidad
            </Link>
            . La persona usuaria se compromete a proporcionar información veraz y a utilizar la
            plataforma únicamente para los fines para los que fue diseñada.
          </p>
        </Section>

        <Section title="3. Cuentas de usuario">
          <p>
            El registro está dirigido a estudiantes activos y exalumnos de la UCR. La Fundación
            se reserva el derecho de verificar la información proporcionada y de suspender cuentas
            que incumplan estas condiciones o que reporten actividad indebida (reportes de perfil,
            suplantación de identidad, uso fraudulento de donaciones, etc.).
          </p>
        </Section>

        <Section title="4. Donaciones">
          <p>
            Las donaciones realizadas a través de la plataforma son voluntarias y están dirigidas
            a apoyar proyectos estudiantiles específicos o al fondo general de la Fundación. Toda
            donación queda sujeta a verificación y confirmación administrativa antes de
            considerarse efectiva.
          </p>
        </Section>

        <Section title="5. Propiedad intelectual">
          <p>
            El contenido, diseño y funcionalidades de la plataforma pertenecen a la Fundación
            Exalumnos U. El contenido generado por las personas usuarias (perfiles, currículums,
            mensajes) es de su propiedad, y se otorga a la Fundación una licencia limitada para
            mostrarlo dentro de la plataforma con el fin de prestar el servicio.
          </p>
        </Section>

        <Section title="6. Limitación de responsabilidad">
          <p>
            La Fundación facilita el contacto entre estudiantes y exalumnos, pero no garantiza
            resultados específicos (contratación, financiamiento, aceptación de mentoría) ni es
            responsable por acuerdos alcanzados directamente entre las partes fuera de la
            plataforma.
          </p>
        </Section>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <Link href="/politica-privacidad" className="text-ucr-celeste-medium hover:underline font-medium">
            Ver también la Política de Privacidad →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
