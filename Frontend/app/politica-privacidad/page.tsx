import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Fundación Exalumnos U",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8 px-4 sm:py-12 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 sm:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f4c81] dark:text-sky-400">Política de Privacidad</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Última actualización: julio de 2026
          </p>
        </div>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Esta política describe cómo la Fundación Exalumnos U recolecta, utiliza y protege los
          datos personales de quienes usan la plataforma, en cumplimiento con la{" "}
          <strong>Ley N.º 8968 de Protección de la Persona frente al Tratamiento de sus Datos
          Personales</strong> de Costa Rica.
        </p>

        <Section title="1. Responsable del tratamiento">
          <p>
            La <strong>Fundación Exalumnos U</strong> es la responsable del tratamiento de los
            datos personales recolectados a través de esta plataforma.
          </p>
        </Section>

        <Section title="2. Finalidad del tratamiento">
          <p>Los datos personales se utilizan para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Conectar a estudiantes de la UCR con exalumnos para mentoría, empleo y pasantías.</li>
            <li>Gestionar donaciones dirigidas a proyectos estudiantiles.</li>
            <li>Verificar la identidad y el estado académico/profesional de las personas usuarias.</li>
            <li>Enviar notificaciones relevantes sobre el uso de la plataforma (solicitudes, mensajes, estado de donaciones y aplicaciones).</li>
            <li>Generar estadísticas agregadas y anónimas sobre el impacto de la Fundación.</li>
          </ul>
        </Section>

        <Section title="3. Datos que recolectamos">
          <p>Dependiendo del rol (estudiante, exalumno o administrador), podemos recolectar:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Datos de identificación: nombre completo, cédula o identificación equivalente, correo electrónico, fecha de nacimiento, género.</li>
            <li>Datos académicos: carné UCR, carrera, escuela/facultad, sede, año de ingreso o graduación, nivel académico, promedio ponderado.</li>
            <li>Datos socioeconómicos sensibles: nivel de beca (visible únicamente para la persona titular y para administradores).</li>
            <li>Datos profesionales (exalumnos): empresa actual, cargo, años de experiencia, enlaces profesionales.</li>
            <li>Contenido generado por la persona usuaria: mensajes, aplicaciones a posiciones, currículums, comprobantes de donación.</li>
          </ul>
        </Section>

        <Section title="4. Base legal del tratamiento">
          <p>
            El tratamiento de los datos se basa en el <strong>consentimiento expreso, informado e
            inequívoco</strong> otorgado por la persona usuaria al momento de registrarse en la
            plataforma, mediante la aceptación explícita de esta política.
          </p>
        </Section>

        <Section title="5. Derechos ARCO">
          <p>Toda persona usuaria tiene derecho a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos personales suyos tratamos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
            <li><strong>Cancelación:</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
            <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
          </ul>
          <p className="mt-2">
            Estos derechos pueden ejercerse escribiendo al correo de contacto indicado en la
            sección 7.
          </p>
        </Section>

        <Section title="6. Tiempo de retención">
          <p>
            Los datos personales se conservan mientras la cuenta permanezca activa en la
            plataforma. Si una persona solicita la eliminación de su cuenta, sus datos se
            eliminarán o anonimizarán en un plazo razonable, salvo aquella información que deba
            conservarse por obligación legal o para la trazabilidad de donaciones ya confirmadas.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p>
            Para ejercer tus derechos ARCO o realizar cualquier consulta sobre el tratamiento de
            tus datos, puedes escribir a la Fundación Exalumnos U al correo de contacto publicado
            en la plataforma.
          </p>
        </Section>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <Link href="/aviso-legal" className="text-ucr-celeste-medium hover:underline font-medium">
            Ver también el Aviso Legal →
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
