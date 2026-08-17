"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageContext";
import { useTheme } from "@/components/providers/ThemeContext";
import { Settings, Globe, Moon, Sun, ShieldCheck, HelpCircle, ChevronDown, CheckCircle, Mail, MessageSquare, User, Loader2, Bell, BellRing, BellOff, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { changePasswordWithVerificationAction } from "@/actions/auth.actions";
import { useToast } from "@/hooks/use-toast";

type Tab = "general" | "terms" | "help";

function AjustesContent() {
  const searchParams = useSearchParams();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const userId = (session?.user as any)?.id as string | undefined;

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [notifications, setNotifications] = useState(true);
  const { toast } = useToast();

  // Password state
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "help" || tabParam === "terms" || tabParam === "general") {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);


  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    if (!userId) return;
    setIsChangingPassword(true);
    const result = await changePasswordWithVerificationAction(userId, passwordForm.current, passwordForm.newPass);
    setIsChangingPassword(false);
    if (result.success) {
      toast({ title: "Éxito", description: "Contraseña actualizada correctamente." });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } else {
      toast({ title: "Error", description: result.message || "Error al actualizar la contraseña", variant: "destructive" });
    }
  };

  const faqs = [
    {
      q: language === "es" ? "¿Cómo funciona la red de Exalumnos UCR?" : language === "en" ? "How does the UCR Alumni Network work?" : language === "pt" ? "Como funciona a rede de Ex-alunos da UCR?" : "Comment fonctionne le réseau des Anciens Élèves de l'UCR ?",
      a: language === "es" 
        ? "La plataforma permite a egresados y estudiantes de la Universidad de Costa Rica conectarse, buscar y publicar ofertas de empleo, realizar donaciones para proyectos estudiantiles y solicitar o brindar mentoría profesional."
        : language === "en"
        ? "The platform allows graduates and students of the University of Costa Rica to connect, search and post job openings, make donations for student projects, and request or provide professional mentoring."
        : language === "pt"
        ? "A plataforma permite que ex-alunos e estudantes da Universidade de Costa Rica se conectem, procurem e publiquem vagas de emprego, façam doações para projetos estudantis e solicitem ou ofereçam mentoria profissional."
        : "La plateforme permet aux diplômés et aux étudiants de l'Université du Costa Rica de se connecter, de rechercher et de publier des offres d'emploi, de faire des dons pour des projets étudiants, et de demander ou de fournir un mentorat professionnel."
    },
    {
      q: language === "es" ? "¿Quiénes pueden registrarse?" : language === "en" ? "Who can register?" : language === "pt" ? "Quem pode se registrar?" : "Qui peut s'inscrire ?",
      a: language === "es"
        ? "Cualquier estudiante activo de la UCR o graduado (exalumno) puede crear una cuenta de forma gratuita."
        : language === "en"
        ? "Any active UCR student or graduate (alumnus) can create an account for free."
        : language === "pt"
        ? "Qualquer estudante ativo da UCR ou graduado (ex-aluno) pode criar uma conta gratuitamente."
        : "Tout étudiant actif ou diplômé de l'UCR peut créer un compte gratuitement."
    },
    {
      q: language === "es" ? "¿Cómo puedo cambiar mis datos de perfil?" : language === "en" ? "How can I update my profile data?" : language === "pt" ? "Como posso alterar meus dados de perfil?" : "Comment puis-je modifier les données de mon profil ?",
      a: language === "es"
        ? "Dirígete a la sección de 'Editar Perfil' en la barra lateral, donde podrás actualizar tu información personal, enlaces de redes sociales y descripción profesional."
        : language === "en"
        ? "Go to the 'Edit Profile' section in the sidebar, where you can update your personal information, social media links, and professional description."
        : language === "pt"
        ? "Vá para a seção 'Editar Perfil' na barra lateral, onde você poderá atualizar suas informações pessoais, links de redes sociais e descrição profissional."
        : "Allez dans la section 'Modifier le Profil' dans la barre latérale, où vous pourrez mettre à jour vos informations personnelles, vos liens de réseaux sociaux et votre description professionnelle."
    },
    {
      q: language === "es" ? "¿Es seguro realizar donaciones?" : language === "en" ? "Is it safe to make donations?" : language === "pt" ? "É seguro fazer doações?" : "Est-il sûr de faire des dons ?",
      a: language === "es"
        ? "Sí, todas las donaciones se procesan a través de pasarelas de pago seguras y se destinan directamente a los proyectos aprobados por la Fundación UCR."
        : language === "en"
        ? "Yes, all donations are processed through secure payment gateways and go directly to projects approved by the UCR Foundation."
        : language === "pt"
        ? "Sim, todas as doações são processadas através de gateways de pagamento seguros e são destinadas diretamente aos projetos aprovados pela Fundação UCR."
        : "Oui, tous les dons sont traités via des passerelles de paiement sécurisées et vont directement aux projets approuvés par la Fondation UCR."
    }
  ];

  const termsEs = `TÉRMINOS Y CONDICIONES DE USO

1. ACEPTACIÓN DE LOS TÉRMINOS
Al acceder y utilizar la plataforma de la Fundación Exalumnos UCR, usted acepta estar sujeto a estos términos y condiciones de uso y a todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.

2. LICENCIA DE USO
Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web para visualización transitoria personal y no comercial únicamente. Esto es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede:
- Modificar o copiar los materiales.
- Utilizar los materiales para cualquier propósito comercial, o para cualquier exhibición pública (comercial o no comercial).
- Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en el sitio.
- Eliminar cualquier derecho de autor u otras notaciones de propiedad de los materiales.

3. RESPONSABILIDAD
Los materiales del sitio web se proporcionan "tal cual". La Fundación Exalumnos UCR no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, las garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.

4. LIMITACIONES
En ningún caso la Fundación o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o beneficios, o debido a la interrupción del negocio) que surja del uso o de la imposibilidad de usar los materiales.

5. POLÍTICA DE PRIVACIDAD
Su privacidad es muy importante para nosotros. Por ello, hemos desarrollado esta política para que usted entienda cómo recopilamos, usamos, comunicamos y divulgamos la información personal. Nos comprometemos a conducir nuestro negocio de acuerdo con estos principios con el fin de asegurar que la confidencialidad de la información personal esté protegida y mantenida.`;

  const termsEn = `TERMS AND CONDITIONS OF USE

1. ACCEPTANCE OF TERMS
By accessing and using the UCR Alumni Foundation platform, you agree to be bound by these terms and conditions of use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.

2. USE LICENSE
Permission is granted to temporarily download one copy of the materials (information or software) on the website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- Modify or copy the materials.
- Use the materials for any commercial purpose, or for any public display (commercial or non-commercial).
- Attempt to decompile or reverse engineer any software contained on the site.
- Remove any copyright or other proprietary notations from the materials.

3. DISCLAIMER
The materials on the website are provided on an 'as is' basis. The UCR Alumni Foundation makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

4. LIMITATIONS
In no event shall the Foundation or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials.

5. PRIVACY POLICY
Your privacy is very important to us. Accordingly, we have developed this policy in order for you to understand how we collect, use, communicate, and disclose personal information. We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.`;

  const termsPt = `TERMOS E CONDIÇÕES DE USO

1. ACEITAÇÃO DOS TERMOS
Ao acessar e usar a plataforma da Fundação de Ex-alunos da UCR, você concorda em ficar vinculado a estes termos e condições de uso e a todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer um destes termos, está proibido de usar ou acessar este site.

2. LICENÇA DE USO
É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
- Modificar ou copiar os materiais.
- Usar os materiais para qualquer finalidade comercial, ou para qualquer exibição pública (comercial ou não comercial).
- Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site.
- Remover quaisquer direitos autorais ou outras notações proprietárias dos materiais.

3. RESPONSABILIDADE
Os materiais no site são fornecidos 'como estão'. A Fundação de Ex-alunos da UCR não oferece garantias, expressas ou implícitas, e por meio deste renuncia e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.

4. LIMITAÇÕES
Em nenhum caso a Fundação ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucros, ou devido a interrupção de negócios) decorrentes do uso ou incapacidade de usar os materiais.

5. POLÍTICA DE PRIVACIDADE
Sua privacidade é muito importante para nós. Por isso, desenvolvemos esta política para que você entenda como coletamos, usamos, comunicamos e divulgamos informações pessoais. Estamos empenhados em conduzir nossos negócios de acordo com esses princípios para garantir que a confidencialidade das informações pessoais seja protegida e mantida.`;

  const termsFr = `CONDITIONS D'UTILISATION

1. ACCEPTATION DES CONDITIONS
En accédant et en utilisant la plateforme de la Fondation des Anciens Élèves de l'UCR, vous acceptez d'être lié par ces conditions d'utilisation et par toutes les lois et réglementations applicables. Si vous n'êtes pas d'accord avec l'une de ces conditions, il vous est interdit d'utiliser ou d'accéder à ce site.

2. LICENCE D'UTILISATION
Il est permis de télécharger temporairement une copie des documents (informations ou logiciels) sur le site Web pour une visualisation transitoire personnelle et non commerciale uniquement. Ceci est la concession d'une licence, non un transfert de titre, et sous cette licence vous ne pouvez pas :
- Modifier ou copier les documents.
- Utiliser les documents à des fins commerciales ou pour toute présentation publique (commerciale ou non commerciale).
- Tenter de décompiler ou de faire de l'ingénierie inverse de tout logiciel contenu sur le site.
- Supprimer tout droit d'auteur ou autres notations de propriété des documents.

3. RESPONSABILITÉ
Les documents sur le site sont fournis 'tels quels'. La Fondation des Anciens Élèves de l'UCR n'offre aucune garantie, explicite ou implicite, et rejette et nie par la présente toutes les autres garanties, y compris, sans limitation, les garanties implicites ou les conditions de qualité marchande, d'adéquation à un usage particulier ou de non-violation de la propriété intellectuelle ou d'autre violation des droits.

4. LIMITATIONS
En aucun cas la Fondation ou ses fournisseurs ne seront responsables des dommages (y compris, sans s'y limiter, les dommages pour perte de données ou de profit, ou en raison d'une interruption d'activité) découlant de l'utilisation ou de l'impossibilité d'utiliser les documents.

5. POLITIQUE DE CONFIDENTIALITÉ
Votre confidentialité est très importante pour nous. En conséquence, nous avons développé cette politique afin que vous compreniez comment nous collectons, utilisons, communiquons et divulguons les informations personnelles. Nous nous engageons à mener nos activités conformément à ces principes afin de garantir que la confidentialité des informations personnelles soit protégée et maintenue.`;

  return (
    <div className="flex-1 overflow-y-auto w-full relative bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Fondo Dinámico con Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ucr-celeste/10 dark:bg-ucr-celeste/5 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-ucr-azul-1/5 dark:bg-ucr-azul-1/2 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>

      {/* Hero Header Estilizado con la Imagen de Fondo */}
      <div className="w-full bg-[#e0f2fe] dark:bg-slate-950 pt-16 pb-24 px-4 sm:px-6 md:px-8 relative shadow-sm overflow-hidden transition-colors duration-300">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 dark:opacity-35 mix-blend-multiply pointer-events-none select-none" 
          style={{ backgroundImage: "url('/login-pattern.png')" }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-sky-200/80 via-sky-100/40 to-transparent dark:from-slate-950 dark:via-slate-900/40 dark:to-transparent z-0"></div>
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[0.5px] z-0"></div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
          <div className="p-4 bg-white/70 dark:bg-slate-800/80 rounded-2xl backdrop-blur-md border border-white/60 dark:border-slate-700/50 shadow-sm transition-colors duration-300">
            <Settings className="w-10 h-10 text-[#005eb8] dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#02477B] dark:text-sky-400 drop-shadow-sm font-display">
              {t("settings.title")}
            </h1>
            <p className="text-[#005eb8]/90 dark:text-sky-300/80 font-medium text-lg mt-2 flex items-center justify-center sm:justify-start gap-2 font-body">
              <span className="w-8 h-[2px] bg-[#005eb8] dark:bg-sky-400 rounded-full"></span>
              {t("settings.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-12 relative z-20 pb-20">
        {/* Navigation Tabs */}
        <div className="flex gap-1 sm:gap-2 p-1 sm:p-1.5 bg-white/80 dark:bg-slate-800/85 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-lg mb-6 sm:mb-8 max-w-lg transition-colors duration-300">
          {(["general", "terms", "help"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative font-body ${
                activeTab === tab 
                  ? "text-[#02477B] dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#00c0f3]/10 dark:bg-sky-400/20 border border-[#00c0f3]/20 dark:border-sky-400/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 font-semibold">
                {tab === "general" && <Globe className="w-4 h-4" />}
                {tab === "terms" && <ShieldCheck className="w-4 h-4" />}
                {tab === "help" && <HelpCircle className="w-4 h-4" />}
                {t(`settings.tab.${tab}` as any)}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Language Card */}
                  <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">{t("settings.lang.title")}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{t("settings.lang.desc")}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setLanguage("es")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          language === "es"
                            ? "bg-gradient-to-r from-[#02477B] to-[#005eb8] text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-xl">🇨🇷</span>
                        Español
                      </button>
                      <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          language === "en"
                            ? "bg-gradient-to-r from-[#02477B] to-[#005eb8] text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-xl">🇺🇸</span>
                        English
                      </button>
                      <button
                        onClick={() => setLanguage("pt")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          language === "pt"
                            ? "bg-gradient-to-r from-[#02477B] to-[#005eb8] text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-xl">🇧🇷</span>
                        Português
                      </button>
                      <button
                        onClick={() => setLanguage("fr")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          language === "fr"
                            ? "bg-gradient-to-r from-[#02477B] to-[#005eb8] text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-xl">🇫🇷</span>
                        Français
                      </button>
                    </div>
                  </div>

                  {/* Theme Card */}
                  <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                        {theme === "dark" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">{t("settings.theme.title")}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{t("settings.theme.desc")}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          theme === "light"
                            ? "bg-[#00c0f3] text-white border-transparent shadow-lg shadow-sky-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Sun className="w-5 h-5" />
                        {t("settings.theme.light")}
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          theme === "dark"
                            ? "bg-sky-500 text-slate-950 border-transparent shadow-lg shadow-sky-500/30 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Moon className="w-5 h-5" />
                        {t("settings.theme.dark")}
                      </button>
                    </div>
                  </div>

                  {/* Notifications Card — Andy */}
                  <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">
                          {language === "es" ? "Notificaciones" : language === "en" ? "Notifications" : language === "pt" ? "Notificações" : "Notifications"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
                          {language === "es" ? "Activa o desactiva las alertas del sistema." : language === "en" ? "Enable or disable system alerts." : language === "pt" ? "Ative ou desative os alertas do sistema." : "Activez ou désactivez les alertes du système."}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setNotifications(true)}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          notifications
                            ? "bg-gradient-to-r from-[#02477B] to-[#005eb8] text-white border-transparent shadow-lg shadow-blue-500/20 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <BellRing className="w-5 h-5" />
                        {language === "es" ? "Activadas" : language === "en" ? "Enabled" : language === "pt" ? "Ativadas" : "Activées"}
                      </button>
                      <button
                        onClick={() => setNotifications(false)}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold border transition-all flex items-center justify-center gap-3 font-body ${
                          !notifications
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent shadow-md scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <BellOff className="w-5 h-5" />
                        {language === "es" ? "Desactivadas" : language === "en" ? "Disabled" : language === "pt" ? "Desativadas" : "Désactivées"}
                      </button>
                    </div>
                  </div>

                  {/* Password Change Card */}
                  {userId && (
                    <div className="md:col-span-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                        <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                          <Lock className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">
                            {language === "es" ? "Cambiar contraseña" : language === "en" ? "Change password" : language === "pt" ? "Alterar a senha" : "Changer le mot de passe"}
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-body">
                            {language === "es" ? "Actualiza la contraseña de tu cuenta de forma segura." : language === "en" ? "Update your account password securely." : language === "pt" ? "Atualize a senha da sua conta de forma segura." : "Mettez à jour le mot de passe de votre compte en toute sécurité."}
                          </p>
                        </div>
                      </div>
                      <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-ucr-azul-2 dark:text-sky-300">Contraseña actual</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Tu contraseña actual"
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                              required
                              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ucr-celeste"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-ucr-azul-2 dark:text-sky-300">Nueva contraseña</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Mínimo 8 caracteres"
                              value={passwordForm.newPass}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                              required
                              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ucr-celeste"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-ucr-azul-2 dark:text-sky-300">Confirmar nueva contraseña</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="password"
                              placeholder="Repite la contraseña"
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                              required
                              className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-ucr-celeste"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                          <Button
                            type="submit"
                            disabled={isChangingPassword || !passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
                            className="h-11 bg-gradient-to-r from-[#02477B] to-[#005eb8] hover:brightness-110 text-white font-bold px-8 rounded-xl transition-all"
                          >
                            {isChangingPassword ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...</>
                            ) : (
                              <><ShieldCheck className="mr-2 h-4 w-4" /> Cambiar contraseña</>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {activeTab === "terms" && (
                <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                    <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">{t("settings.terms.title")}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{t("settings.terms.desc")}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 h-[380px] overflow-y-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-body text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {language === "es" ? termsEs : language === "en" ? termsEn : language === "pt" ? termsPt : termsFr}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === "help" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                  {/* FAQs Section */}
                  <div className="lg:col-span-3 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">{t("settings.help.faq.title")}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{t("settings.help.faq.desc")}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div 
                          key={index}
                          className="border border-slate-100 dark:border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-200"
                        >
                          <button
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            className="w-full py-4 px-4 sm:px-6 text-left font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-4 font-body hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown
                              className={`w-5 h-5 shrink-0 text-slate-500 transition-transform duration-300 ${
                                openFaq === index ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {openFaq === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                              >
                                <div className="py-4 px-6 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/30 dark:bg-slate-900/10 font-body text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
                                  {faq.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Form Section */}
                  <div className="lg:col-span-2 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl border border-white/50 dark:border-slate-800/40 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="p-3 bg-ucr-celeste/10 dark:bg-sky-400/10 rounded-xl text-ucr-celeste dark:text-sky-400">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400 font-display">{t("settings.help.contact.title")}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{t("settings.help.contact.desc")}</p>
                      </div>
                    </div>

                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-body">
                          <User className="w-4 h-4 text-slate-400" />
                          {t("settings.help.contact.name")}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Pérez"
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-150 focus:border-ucr-celeste focus:ring-2 focus:ring-ucr-celeste/20 transition-all font-body"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-body">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {t("settings.help.contact.email")}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="juan.perez@ucr.ac.cr"
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-150 focus:border-ucr-celeste focus:ring-2 focus:ring-ucr-celeste/20 transition-all font-body"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-body">
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          {t("settings.help.contact.message")}
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="..."
                          className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-150 focus:border-ucr-celeste focus:ring-2 focus:ring-ucr-celeste/20 transition-all resize-none font-body"
                        />
                      </div>

                      {submitSuccess && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 font-body">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <span>{t("settings.help.contact.success")}</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-ucr-azul-2 to-ucr-azul-1 dark:from-sky-500 dark:to-sky-600 hover:brightness-110 text-white dark:text-slate-950 font-bold shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-sky-500/20 transition-all rounded-xl font-body"
                      >
                        {isSubmitting ? t("settings.help.contact.sending") : t("settings.help.contact.send")}
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AjustesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center py-32 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <p className="text-ucr-azul-2 dark:text-sky-400 font-medium">Cargando...</p>
      </div>
    }>
      <AjustesContent />
    </Suspense>
  );
}
