"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { userProfileUpdateSchema, type UserProfileUpdateValues } from "@/lib/validations/profile";
import { updateUserProfile } from "@/actions/profile.actions";
import { calcularCompletitudEstudiante, calcularCompletitudExalumno } from "@/lib/profile-completeness";
import { changePasswordWithVerificationAction } from "@/actions/auth.actions";
import {
  CATALOGO_CARRERAS,
  CATALOGO_AREAS,
  SEDES_UCR,
  NIVELES_ACADEMICOS
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Loader2, User, Phone, ImageIcon, LinkIcon, Save, Briefcase, GraduationCap, BookOpen, Heart, Lock, ShieldCheck, Code2, Globe2, Star, Plus, X, ChevronDown, Search, FileText, Paperclip, Award } from "lucide-react";
import { SKILLS_BANK, SOFT_SKILLS_BANK, IDIOMAS_OPTS, NIVELES_IDIOMA, SKILL_LEVELS } from "@/lib/skills-bank";
import { AreasInteresSelector } from "@/components/forms/AreasInteresSelector";
import { BecasInfoDialog } from "@/components/becas/BecasInfoDialog";
import { Progress } from "@/components/ui/Progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileEditFormProps {
  initialData: any;
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { data: session, update } = useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingComprobante, setIsUploadingComprobante] = useState(false);
  // El botón flotante se porta a document.body: SidebarWrapper aplica
  // backdrop-blur al <main>, y eso crea un "containing block" propio para
  // los descendientes con position:fixed (se pegan al fondo del contenido
  // en vez de a la ventana). Solo se monta tras el primer render en cliente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isEstudiante = initialData?.tipo?.toUpperCase() === "ESTUDIANTE";

  // ── Skills state (fuera de react-hook-form para UI compleja) ────────────────
  function parseHardSkills(raw: any): { skill: string; level: string }[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map((r) => typeof r === "string" ? { skill: r, level: "Intermedio" } : r);
    return [];
  }
  const [hardSkills, setHardSkills] = useState<{ skill: string; level: string }[]>(
    parseHardSkills(initialData?.habilidades)
  );
  const [softSkillsList, setSoftSkillsList] = useState<string[]>(
    Array.isArray(initialData?.soft_skills) ? initialData.soft_skills : []
  );
  const [idiomasList, setIdiomasList] = useState<{ idioma: string; nivel: string }[]>(
    Array.isArray(initialData?.idiomas) ? initialData.idiomas : []
  );
  const [areasInteresList, setAreasInteresList] = useState<string[]>(
    Array.isArray(initialData?.areas_interes) ? initialData.areas_interes : []
  );
  const [skillInput, setSkillInput] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(SKILLS_BANK[0].categoria);
  const [idiomaInput, setIdiomaInput] = useState("Inglés");
  const [nivelIdiomaInput, setNivelIdiomaInput] = useState("B1 – Intermedio");

  function addHardSkill(skillName: string) {
    const name = skillName.trim();
    if (!name || hardSkills.find((s) => s.skill.toLowerCase() === name.toLowerCase())) return;
    setHardSkills((p) => [...p, { skill: name, level: "Intermedio" }]);
    setSkillInput("");
  }
  function updateSkillLevel(i: number, level: string) {
    setHardSkills((p) => p.map((s, idx) => idx === i ? { ...s, level } : s));
  }
  function removeHardSkill(i: number) {
    setHardSkills((p) => p.filter((_, idx) => idx !== i));
  }
  function toggleSoftSkill(s: string) {
    setSoftSkillsList((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  }
  function addIdioma() {
    if (idiomasList.find((id) => id.idioma === idiomaInput)) return;
    setIdiomasList((p) => [...p, { idioma: idiomaInput, nivel: nivelIdiomaInput }]);
  }
  function removeIdioma(i: number) {
    setIdiomasList((p) => p.filter((_, idx) => idx !== i));
  }

  // ── Exalumno: experiencia laboral y certificaciones ──────────────────────
  function parseExperienciaLaboral(raw: any): { cargo: string; empresa: string; anio_inicio: string; anio_fin: string; descripcion: string }[] {
    return Array.isArray(raw) ? raw : [];
  }
  function parseCertificaciones(raw: any): { nombre: string; institucion: string; anio: string }[] {
    return Array.isArray(raw) ? raw : [];
  }
  const [experienciaList, setExperienciaList] = useState(parseExperienciaLaboral(initialData?.experiencia_laboral));
  const [expForm, setExpForm] = useState({ cargo: "", empresa: "", anio_inicio: "", anio_fin: "", descripcion: "" });
  function addExperienciaLaboral() {
    if (!expForm.cargo.trim() || !expForm.empresa.trim()) return;
    setExperienciaList((p) => [...p, { ...expForm }]);
    setExpForm({ cargo: "", empresa: "", anio_inicio: "", anio_fin: "", descripcion: "" });
  }
  function removeExperienciaLaboral(i: number) {
    setExperienciaList((p) => p.filter((_, idx) => idx !== i));
  }

  const [certificacionesList, setCertificacionesList] = useState(parseCertificaciones(initialData?.certificaciones));
  const [certForm, setCertForm] = useState({ nombre: "", institucion: "", anio: "" });
  function addCertificacion() {
    if (!certForm.nombre.trim()) return;
    setCertificacionesList((p) => [...p, { ...certForm }]);
    setCertForm({ nombre: "", institucion: "", anio: "" });
  }
  function removeCertificacion(i: number) {
    setCertificacionesList((p) => p.filter((_, idx) => idx !== i));
  }

  const filteredSkills = SKILLS_BANK.find((c) => c.categoria === selectedCategory)?.skills.filter(
    (s) => !skillFilter || s.toLowerCase().includes(skillFilter.toLowerCase())
  ) ?? [];

  const form = useForm<UserProfileUpdateValues>({
    resolver: zodResolver(userProfileUpdateSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      image: initialData?.image || "",
      phone: initialData?.phone || "",
      bio: initialData?.bio || "",
      fecha_nacimiento: initialData?.fecha_nacimiento || "",
      genero: initialData?.genero || "",
      socialLinks: {
        linkedin: initialData?.socialLinks?.linkedin || "",
        github: initialData?.socialLinks?.github || "",
        twitter: initialData?.socialLinks?.twitter || "",
        website: initialData?.socialLinks?.website || "",
      },
      
      // Estudiante fields
      nivel_beca: (initialData as any)?.nivel_beca || "",
      comprobante_beca_url: (initialData as any)?.comprobante_beca_url || "",
      carnet_ucr: initialData?.carnet_ucr || "",
      carrera: initialData?.carrera || "",
      escuela_facultad: initialData?.escuela_facultad || "",
      sede: initialData?.sede || "",
      anio_ingreso: initialData?.anio_ingreso || "",
      nivel_academico: initialData?.nivel_academico || "",
      promedio_ponderado: initialData?.promedio_ponderado || "",
      proyecto_titulo: initialData?.proyecto_titulo || "",
      proyecto_tipo: initialData?.proyecto_tipo || "",
      proyecto_descripcion: initialData?.proyecto_descripcion || "",
      proyecto_porcentaje_avance: initialData?.proyecto_porcentaje_avance ?? 0,
      area_tematica: initialData?.area_tematica || "",
      busca_financiamiento: !!initialData?.busca_financiamiento,
      busca_mentoria: !!initialData?.busca_mentoria,
      busca_empleo: !!initialData?.busca_empleo,
      busca_pasantia: !!initialData?.busca_pasantia,
      perfil_pausado: !!initialData?.perfil_pausado,

      // Exalumno fields
      anio_graduacion: initialData?.anio_graduacion || "",
      empresa_actual: initialData?.empresa_actual || "",
      cargo_actual: initialData?.cargo_actual || "",
      sector: initialData?.sector || "",
      pais_ciudad: initialData?.pais_ciudad || "",
      anios_experiencia: initialData?.anios_experiencia || "",
      linkedin_url: initialData?.linkedin_url || "",
      biografia: initialData?.biografia || "",
      ofrece_mentoria: !!initialData?.ofrece_mentoria,
      ofrece_empleo: !!initialData?.ofrece_empleo,
      ofrece_pasantia: !!initialData?.ofrece_pasantia,
      ofrece_proyecto: !!initialData?.ofrece_proyecto,
      ofrece_donacion_dinero: !!initialData?.ofrece_donacion_dinero,
      ofrece_guest_speaking: !!initialData?.ofrece_guest_speaking,
      ofrece_volunteering: !!initialData?.ofrece_volunteering,
      ofrece_career_advice: !!initialData?.ofrece_career_advice,
      ofrece_networking: !!initialData?.ofrece_networking,
    },
  });

  // T-13: completitud recalculada en vivo mientras el usuario escribe, sin esperar al guardado.
  const watchedValues = useWatch({ control: form.control });
  const liveCompletitud = useMemo(() => {
    const data = { ...watchedValues, areas_interes: areasInteresList };
    return isEstudiante ? calcularCompletitudEstudiante(data) : calcularCompletitudExalumno(data);
  }, [watchedValues, areasInteresList, isEstudiante]);

  const onSubmit = (data: UserProfileUpdateValues) => {
    startTransition(async () => {
      try {
        const result = await updateUserProfile({
          ...data,
          habilidades: hardSkills as any,
          soft_skills: softSkillsList as any,
          idiomas: idiomasList as any,
          areas_interes: areasInteresList as any,
          certificaciones: certificacionesList as any,
          experiencia_laboral: experienciaList as any,
        } as any);
        if (result.success) {
          if (data.image) {
            await update({ user: { image: data.image } });
          }
          toast({
            title: "¡Perfil actualizado!",
            description: "Tus datos se han guardado correctamente.",
            className: "bg-ucr-azul-1 text-white border-none",
          });
          // T-17: si el avance llegó al 100%, preguntar si el proyecto finalizó
          if ((result as any).proyectoCompleto) {
            const { isConfirmed } = await import("sweetalert2").then(m =>
              m.default.fire({
                title: "¿Tu proyecto está finalizado?",
                text: "El avance llegó al 100%. ¿Deseas marcar el proyecto como finalizado? Esto lo retirará del directorio activo.",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, finalizar",
                cancelButtonText: "No, mantener activo",
                confirmButtonColor: "#005da4",
              })
            );
            if (isConfirmed) {
              await updateUserProfile({ ...data, proyecto_activo: false } as any);
              toast({
                title: "Proyecto marcado como finalizado",
                description: "Ya no aparecerá en el directorio activo de estudiantes.",
                className: "bg-ucr-azul-1 text-white border-none",
              });
            }
          }
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hubo un error",
          description: error.message || "No pudimos actualizar tu perfil.",
        });
      }
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast({ title: "Error", description: "Las contraseñas nuevas no coinciden.", variant: "destructive" });
      return;
    }
    const userId = (session?.user as any)?.id as string | undefined;
    if (!userId) {
      toast({ title: "Error", description: "Sesión inválida. Recarga la página.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    const result = await changePasswordWithVerificationAction(userId, passwordForm.current, passwordForm.newPass);
    setIsChangingPassword(false);
    if (result.success) {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada correctamente.", className: "bg-ucr-azul-1 text-white border-none" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">

        {/* Completitud del perfil (T-13) — se recalcula en vivo con cada cambio.
            sticky (no fixed): permanece pegada al hacer scroll sin necesitar un
            portal, ya que --a diferencia de fixed-- no la rompe el backdrop-blur
            de los contenedores padre (ver SidebarWrapper). */}
        <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {liveCompletitud.completo ? "¡Tu perfil está completo!" : "Completitud de tu perfil"}
            </p>
            <span className="text-sm font-extrabold text-ucr-celeste-medium">
              {liveCompletitud.porcentaje}%
            </span>
          </div>
          <Progress value={liveCompletitud.porcentaje} tone="#005da4" />
          {!liveCompletitud.completo && (
            <p className="text-xs text-slate-500 mt-2">
              Los perfiles solo aparecen en el directorio cuando llegan al 100%. Guarda tus cambios para que este porcentaje quede registrado.
            </p>
          )}
        </div>

        {/* Tarjeta 1: Información Personal */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400">Información Personal</h2>
              <p className="text-sm text-ucr-gris-2 dark:text-slate-400">Los datos básicos para identificarte en la plataforma.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Nombre Completo</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 dark:text-slate-400 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="Juan Pérez" {...field} className="pl-10 h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Teléfono</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 dark:text-slate-400 group-focus-within:text-ucr-celeste transition-colors" />
                      <Input placeholder="+506 8888-8888" {...field} className="pl-10 h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Foto de Perfil</FormLabel>
                  <FormControl>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="shrink-0 w-20 h-20 rounded-full border-4 border-ucr-celeste/20 overflow-hidden bg-ucr-gris-1 dark:bg-slate-800 flex items-center justify-center relative">
                        {field.value ? (
                          <img src={field.value} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-ucr-gris-2 dark:text-slate-500" />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="relative group w-full sm:flex-1">
                        <ImageIcon className={`absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 dark:text-slate-400 group-focus-within:text-ucr-celeste transition-colors ${isUploading ? "animate-pulse text-ucr-celeste" : ""}`} />
                        <Input 
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setIsUploading(true);
                                const formData = new FormData();
                                formData.append("file", file);
                                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "imagenes");
                                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dd69q4ba3";
                                
                                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                  method: "POST",
                                  body: formData,
                                });
                                if (!res.ok) throw new Error("Error subiendo imagen");
                                const data = await res.json();
                                field.onChange(data.secure_url);
                                toast({ title: "Imagen subida", description: "La imagen está lista. Recuerda presionar 'Guardar Cambios' al final." });
                              } catch (error) {
                                toast({ title: "Error", description: "No se pudo subir la imagen", variant: "destructive" });
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          }}
                          className="pl-10 h-12 pt-2.5 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ucr-celeste-medium file:text-white hover:file:bg-ucr-celeste-medium/90 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </FormControl>
                  <p className="text-xs text-ucr-gris-2 mt-2">Formatos recomendados: JPG, PNG. Recuerda guardar los cambios al final de la página.</p>
                  <FormMessage />
                </FormItem>
              )}
            />



            <FormField
              control={form.control}
              name="fecha_nacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} className="h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Género</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value || ""}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-transparent bg-ucr-gris-1/50 dark:bg-slate-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-ucr-celeste/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Seleccione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tarjeta 2: Biografía */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400">Perfil Profesional</h2>
              <p className="text-sm text-ucr-gris-2 dark:text-slate-400">Cuéntale a la comunidad sobre tu trayectoria.</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Escribe una breve descripción profesional..." 
                    className="min-h-[150px] resize-none bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl text-base p-4"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-right text-ucr-gris-2 dark:text-slate-400 font-medium mt-2">
                  {field.value?.length || 0} / 500 caracteres
                </p>
              </FormItem>
            )}
          />
        </div>

        {/* Tarjeta de Datos según Rol */}
        {isEstudiante ? (
          <>
            {/* DATOS DE ESTUDIANTE */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Información Académica</h2>
                  <p className="text-sm text-slate-500">Tus datos como estudiante activo de la UCR.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carnet_ucr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Carné UCR</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. B98765" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carrera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Carrera</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-ucr-celeste-medium/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccione una carrera</option>
                          {CATALOGO_CARRERAS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="escuela_facultad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Escuela / Facultad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Facultad de Ingeniería" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sede"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Sede</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="w-full h-12 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 px-3 outline-none focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm"
                        >
                          <option value="">Seleccione una Sede...</option>
                          {SEDES_UCR.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anio_ingreso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Año de Ingreso</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 2021" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nivel_academico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Nivel Académico</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="w-full h-12 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 px-3 outline-none focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm"
                        >
                          <option value="">Seleccione un Grado...</option>
                          {NIVELES_ACADEMICOS.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promedio_ponderado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Promedio Ponderado</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Ej. 8.50" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : "")} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"nivel_beca" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700 flex items-center gap-2">
                        Tipo de Beca
                        <span className="text-xs font-normal bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          🔒 Privado
                        </span>
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm text-sm"
                        >
                          <option value="">Sin beca</option>
                          <option value="Beca 1">Beca 1</option>
                          <option value="Beca 2">Beca 2</option>
                          <option value="Beca 3">Beca 3</option>
                          <option value="Beca 4">Beca 4</option>
                          <option value="Beca 5">Beca 5</option>
                        </select>
                      </FormControl>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400">Solo tú y el equipo UCR pueden ver este dato.</p>
                        <BecasInfoDialog
                          trigger={
                            <button type="button" className="text-xs font-bold text-[#005da4] hover:underline shrink-0 ml-2">
                              ¿Qué incluye cada beca?
                            </button>
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"comprobante_beca_url" as any}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-semibold text-slate-700 flex items-center gap-2">
                        Comprobante de Beca
                        <span className="text-xs font-normal bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          🔒 Privado
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                          {field.value ? (
                            <a
                              href={field.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-2 h-12 px-4 rounded-xl bg-[#005da4]/10 text-[#005da4] font-semibold text-sm hover:bg-[#005da4]/20 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Ver comprobante actual
                            </a>
                          ) : (
                            <div className="shrink-0 flex items-center gap-2 h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm">
                              <FileText className="w-4 h-4" />
                              Sin comprobante
                            </div>
                          )}
                          <div className="relative group w-full sm:flex-1">
                            <Paperclip className={`absolute left-3 top-3 h-5 w-5 text-ucr-gris-2 dark:text-slate-400 group-focus-within:text-ucr-celeste transition-colors ${isUploadingComprobante ? "animate-pulse text-ucr-celeste" : ""}`} />
                            <Input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={isUploadingComprobante}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setIsUploadingComprobante(true);
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "imagenes");
                                  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dd69q4ba3";

                                  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                                    method: "POST",
                                    body: formData,
                                  });
                                  if (!res.ok) throw new Error("Error subiendo el comprobante");
                                  const data = await res.json();
                                  field.onChange(data.secure_url);
                                  toast({ title: "Comprobante subido", description: "Recuerda presionar 'Guardar Cambios' al final." });
                                } catch (error) {
                                  toast({ title: "Error", description: "No se pudo subir el comprobante", variant: "destructive" });
                                } finally {
                                  setIsUploadingComprobante(false);
                                }
                              }}
                              className="pl-10 h-12 pt-2.5 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ucr-celeste-medium file:text-white hover:file:bg-ucr-celeste-medium/90 cursor-pointer"
                            />
                          </div>
                        </div>
                      </FormControl>
                      <p className="text-xs text-slate-400 mt-1">
                        Foto o PDF de tu comprobante de beca. Solo tú, el equipo UCR y el exalumno con quien tengas un match activo podrán verlo.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* PROYECTO DE GRADUACIÓN */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Proyecto de Graduación</h2>
                  <p className="text-sm text-slate-500">Detalles sobre tu trabajo final o tesis actual.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="proyecto_titulo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-semibold text-slate-700">Título del Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Investigación de Energía Renovable" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proyecto_tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Tipo de Proyecto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Tesis, Proyecto Eléctrico" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"area_tematica" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Área Temática</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          className="flex h-12 w-full items-center justify-between rounded-xl border border-transparent bg-slate-50 dark:bg-slate-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-ucr-celeste-medium/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Seleccione un área</option>
                          {CATALOGO_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"proyecto_porcentaje_avance" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Avance del Proyecto (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} placeholder="Ej. 45" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 0)} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"proyecto_descripcion" as any}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-semibold text-slate-700">Descripción del Proyecto</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe brevemente tu proyecto, objetivos y estado actual..." {...field} value={field.value || ""} className="min-h-[100px] resize-none bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ══ IDIOMAS ══════════════════════════════════════════════════ */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Idiomas</h2>
                  <p className="text-sm text-slate-500">Agrega los idiomas que manejas y tu nivel de dominio.</p>
                </div>
              </div>

              {/* Selector */}
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Idioma</label>
                  <select
                    value={idiomaInput}
                    onChange={(e) => setIdiomaInput(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm text-slate-700 dark:text-slate-100 transition-all shadow-sm"
                  >
                    {IDIOMAS_OPTS.map((id) => <option key={id}>{id}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nivel</label>
                  <select
                    value={nivelIdiomaInput}
                    onChange={(e) => setNivelIdiomaInput(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm text-slate-700 dark:text-slate-100 transition-all shadow-sm"
                  >
                    {NIVELES_IDIOMA.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addIdioma}
                  className="h-11 px-5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {/* Chips */}
              {idiomasList.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {idiomasList.map((id, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-sm font-medium text-sky-800">
                      <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                      {id.idioma}
                      <span className="text-sky-500 text-xs ml-1">{id.nivel}</span>
                      <button type="button" onClick={() => removeIdioma(i)} className="ml-1 text-sky-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {idiomasList.length === 0 && (
                <p className="text-xs text-slate-400 italic">Aún no has agregado idiomas.</p>
              )}
            </div>

            {/* ══ HABILIDADES TÉCNICAS ══════════════════════════════════════ */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Habilidades Técnicas</h2>
                  <p className="text-sm text-slate-500">Selecciona del banco predefinido o escribe una habilidad propia. Indica tu nivel en cada una.</p>
                </div>
              </div>

              {/* Banco de habilidades */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banco de habilidades</p>

                {/* Categorías */}
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS_BANK.map((cat) => (
                    <button
                      key={cat.categoria}
                      type="button"
                      onClick={() => { setSelectedCategory(cat.categoria); setSkillFilter(""); }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                        selectedCategory === cat.categoria
                          ? "bg-violet-600 text-white border-violet-600 shadow"
                          : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                      }`}
                    >
                      {cat.icon} {cat.categoria}
                    </button>
                  ))}
                </div>

                {/* Filtro de skills en categoría */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar en esta categoría..."
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-100 placeholder:text-slate-400"
                  />
                </div>

                {/* Grilla de skills */}
                <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {filteredSkills.map((skill) => {
                    const already = hardSkills.some((s) => s.skill.toLowerCase() === skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        type="button"
                        disabled={already}
                        onClick={() => addHardSkill(skill)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          already
                            ? "bg-violet-100 text-violet-500 border-violet-200 cursor-default"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-violet-50 hover:border-violet-400 hover:text-violet-700"
                        }`}
                      >
                        {already ? "✓ " : "+ "}{skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input manual */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="O escribe una habilidad propia..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHardSkill(skillInput); } }}
                  className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-transparent focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => addHardSkill(skillInput)}
                  className="h-11 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {/* Habilidades seleccionadas + nivel */}
              {hardSkills.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tus habilidades ({hardSkills.length})</p>
                  <div className="space-y-2">
                    {hardSkills.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-3 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                        <span className="flex-1 text-sm font-semibold text-slate-800 min-w-0 truncate">{s.skill}</span>
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {SKILL_LEVELS.map((lv) => (
                            <button
                              key={lv}
                              type="button"
                              onClick={() => updateSkillLevel(i, lv)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                s.level === lv
                                  ? "bg-violet-600 text-white border-violet-600"
                                  : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"
                              }`}
                            >
                              {lv}
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => removeHardSkill(i)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hardSkills.length === 0 && (
                <p className="text-xs text-slate-400 italic">Selecciona del banco o escribe tus propias habilidades técnicas.</p>
              )}
            </div>

            {/* ══ HABILIDADES BLANDAS ═══════════════════════════════════════ */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Habilidades Blandas</h2>
                  <p className="text-sm text-slate-500">Selecciona las competencias interpersonales que mejor te describen.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {SOFT_SKILLS_BANK.map((skill) => {
                  const active = softSkillsList.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSoftSkill(skill)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                        active
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                      }`}
                    >
                      {active ? "✓ " : ""}{skill}
                    </button>
                  );
                })}
              </div>

              {softSkillsList.length > 0 && (
                <p className="text-xs text-amber-700 font-semibold pt-1">
                  {softSkillsList.length} habilidad{softSkillsList.length !== 1 ? "es" : ""} seleccionada{softSkillsList.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* ÁREAS DE INTERÉS (T-11) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Áreas de Interés</h2>
                  <p className="text-sm text-slate-500">Selecciona las áreas del catálogo que mejor describen tus intereses — mejora la calidad de tus matches.</p>
                </div>
              </div>

              <AreasInteresSelector value={areasInteresList} onChange={setAreasInteresList} />
            </div>

            {/* APOYO BUSCADO */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Intereses y Apoyo Buscado</h2>
                  <p className="text-sm text-slate-500">¿En qué áreas te gustaría recibir apoyo de la red de exalumnos?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "busca_financiamiento", label: "Busco Financiamiento / Apoyo Económico" },
                  { name: "busca_mentoria", label: "Busco Mentoría Profesional / Guía" },
                  { name: "busca_empleo", label: "Busco Oportunidades de Empleo" },
                  { name: "busca_pasantia", label: "Busco Pasantías / Prácticas" }
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-slate-700 cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Pausar perfil (T-12) */}
            <div className="bg-amber-50/80 dark:bg-amber-900/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-amber-200/50 dark:border-amber-800 transition-all hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-amber-100 dark:border-amber-800">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Visibilidad del Perfil</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Controla si apareces en el directorio y recibes solicitudes de contacto.</p>
                </div>
              </div>
              <FormField
                control={form.control}
                name="perfil_pausado"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                        Pausar mi perfil temporalmente
                      </FormLabel>
                      <p className="text-xs text-slate-500 mt-1">
                        Tu perfil no aparecerá en el directorio y no recibirás nuevas solicitudes de contacto. Puedes reactivarlo en cualquier momento.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          <>
            {/* DATOS DE EXALUMNO */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Información de Graduado</h2>
                  <p className="text-sm text-slate-500">Tus credenciales académicas e información laboral.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carnet_ucr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Carné UCR (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. A81234" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="escuela_facultad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Facultad / Escuela de Graduación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Ingeniería" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anio_graduacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Año de Graduación</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 2018" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa_actual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Empresa Actual</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Intel Costa Rica" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo_actual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Cargo Actual</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Arquitecto de Software" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pais_ciudad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Ciudad / País de Residencia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. San José, Costa Rica" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anios_experiencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Años de Experiencia Profesional</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ej. 5" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : "")} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">URL de LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"sector" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-700">Sector de Industria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Tecnología, Salud, Finanzas" {...field} value={field.value || ""} className="h-12 bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={"biografia" as any}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-semibold text-slate-700">Biografía Profesional</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Cuéntale a los estudiantes sobre tu trayectoria, experiencia y qué te motiva a apoyar a la comunidad UCR..." {...field} value={field.value || ""} className="min-h-[120px] resize-none bg-slate-50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste-medium focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste-medium/20 transition-all shadow-sm rounded-xl" />
                      </FormControl>
                      <p className="text-xs text-right text-slate-400 mt-1">{field.value?.length || 0} / 1000</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* HABILIDADES (visibles en el perfil público para estudiantes) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Habilidades</h2>
                  <p className="text-sm text-slate-500">Estas habilidades se muestran en tu perfil público para que los estudiantes las vean.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Liderazgo de equipos, React, Gestión de proyectos..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHardSkill(skillInput); } }}
                  className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-transparent focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => addHardSkill(skillInput)}
                  className="h-11 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {hardSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {hardSkills.map((s, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-sm font-medium text-violet-800">
                      {s.skill}
                      <button type="button" onClick={() => removeHardSkill(i)} className="text-violet-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Aún no has agregado habilidades.</p>
              )}
            </div>

            {/* EXPERIENCIA LABORAL (visible en el perfil público para estudiantes) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Experiencia Laboral</h2>
                  <p className="text-sm text-slate-500">Agrega tu trayectoria profesional. Se muestra en tu perfil público.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Cargo (Ej. Arquitecto de Software)"
                    value={expForm.cargo}
                    onChange={(e) => setExpForm((p) => ({ ...p, cargo: e.target.value }))}
                    className="h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-ucr-celeste-medium focus:ring-2 focus:ring-ucr-celeste-medium/20 text-sm transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Empresa (Ej. Intel Costa Rica)"
                    value={expForm.empresa}
                    onChange={(e) => setExpForm((p) => ({ ...p, empresa: e.target.value }))}
                    className="h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-ucr-celeste-medium focus:ring-2 focus:ring-ucr-celeste-medium/20 text-sm transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Año inicio (Ej. 2020)"
                    value={expForm.anio_inicio}
                    onChange={(e) => setExpForm((p) => ({ ...p, anio_inicio: e.target.value }))}
                    className="h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-ucr-celeste-medium focus:ring-2 focus:ring-ucr-celeste-medium/20 text-sm transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Año fin (vacío si es tu puesto actual)"
                    value={expForm.anio_fin}
                    onChange={(e) => setExpForm((p) => ({ ...p, anio_fin: e.target.value }))}
                    className="h-11 px-4 rounded-xl bg-white border border-slate-200 focus:border-ucr-celeste-medium focus:ring-2 focus:ring-ucr-celeste-medium/20 text-sm transition-all"
                  />
                </div>
                <Textarea
                  placeholder="Descripción breve de tus funciones o logros (opcional)"
                  value={expForm.descripcion}
                  onChange={(e) => setExpForm((p) => ({ ...p, descripcion: e.target.value }))}
                  className="min-h-[80px] resize-none bg-white border border-slate-200 focus:border-ucr-celeste-medium focus:ring-2 focus:ring-ucr-celeste-medium/20 text-sm transition-all rounded-xl"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addExperienciaLaboral}
                    className="h-11 px-5 bg-ucr-celeste-medium hover:brightness-105 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Agregar experiencia
                  </button>
                </div>
              </div>

              {experienciaList.length > 0 ? (
                <div className="space-y-3">
                  {experienciaList.map((exp, i) => (
                    <div key={i} className="flex items-start justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{exp.cargo}</p>
                        <p className="text-xs text-ucr-celeste-medium font-medium">{exp.empresa}</p>
                        {(exp.anio_inicio || exp.anio_fin) && (
                          <p className="text-xs text-slate-400 mt-0.5">{exp.anio_inicio}{exp.anio_fin ? ` – ${exp.anio_fin}` : " – Presente"}</p>
                        )}
                        {exp.descripcion && <p className="text-xs text-slate-500 mt-1">{exp.descripcion}</p>}
                      </div>
                      <button type="button" onClick={() => removeExperienciaLaboral(i)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Aún no has agregado experiencia laboral.</p>
              )}
            </div>

            {/* CERTIFICACIONES (visible en el perfil público para estudiantes) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Certificaciones</h2>
                  <p className="text-sm text-slate-500">Certificaciones profesionales que quieras mostrar en tu perfil público.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej. AWS Certified Developer"
                    value={certForm.nombre}
                    onChange={(e) => setCertForm((p) => ({ ...p, nombre: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm transition-all shadow-sm"
                  />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Institución</label>
                  <input
                    type="text"
                    placeholder="Ej. Amazon Web Services"
                    value={certForm.institucion}
                    onChange={(e) => setCertForm((p) => ({ ...p, institucion: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm transition-all shadow-sm"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Año</label>
                  <input
                    type="text"
                    placeholder="2023"
                    value={certForm.anio}
                    onChange={(e) => setCertForm((p) => ({ ...p, anio: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-transparent focus:border-amber-400 focus:ring-2 focus:ring-amber-100 text-sm transition-all shadow-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addCertificacion}
                  className="h-11 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {certificacionesList.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {certificacionesList.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm text-slate-700 bg-amber-50 px-3 py-2 rounded-lg">
                      <span className="min-w-0 break-words">🏅 {cert.nombre}{cert.institucion ? ` – ${cert.institucion}` : ""}{cert.anio ? ` (${cert.anio})` : ""}</span>
                      <button type="button" onClick={() => removeCertificacion(i)} className="text-amber-400 hover:text-red-500 transition-colors shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Aún no has agregado certificaciones.</p>
              )}
            </div>

            {/* ÁREAS DE INTERÉS (T-11/T-13) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-5">
              <div className="flex items-center gap-3 mb-2 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Áreas de Interés</h2>
                  <p className="text-sm text-slate-500">Selecciona las áreas del catálogo que mejor describen tus intereses — mejora la calidad de tus matches.</p>
                </div>
              </div>

              <AreasInteresSelector value={areasInteresList} onChange={setAreasInteresList} />
            </div>

            {/* APOYO OFRECIDO */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="p-3 bg-[#e0f2fe] rounded-xl text-ucr-celeste-medium">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Contribución y Apoyo Ofrecido</h2>
                  <p className="text-sm text-slate-500">¿Cómo deseas contribuir y apoyar a la comunidad estudiantil de la UCR?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "ofrece_mentoria", label: "Mentoría / Guía Profesional" },
                  { name: "ofrece_empleo", label: "Oportunidades Laborales" },
                  { name: "ofrece_pasantia", label: "Pasantías / Prácticas" },
                  { name: "ofrece_proyecto", label: "Apoyo a Proyectos" },
                  { name: "ofrece_donacion_dinero", label: "Donaciones al Fondo de Becas" },
                  { name: "ofrece_guest_speaking", label: "Charlas / Guest Speaking" },
                  { name: "ofrece_career_advice", label: "Asesoría de Carrera" },
                  { name: "ofrece_networking", label: "Networking Profesional" },
                  { name: "ofrece_volunteering", label: "Voluntariado" },
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-slate-100 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-semibold text-slate-700 cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tarjeta 3: Redes Sociales */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400">Conexiones y Redes</h2>
              <p className="text-sm text-ucr-gris-2 dark:text-slate-400">Enlaces a tus perfiles profesionales para facilitar el contacto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="socialLinks.linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/..." {...field} className="h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-[#0A66C2] focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#0A66C2]/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.github"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} className="h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-gray-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-gray-800/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Twitter / X</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/..." {...field} className="h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-black focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-black/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-ucr-azul-1 dark:text-sky-400">Sitio Web Personal</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="h-12 bg-ucr-gris-1/50 dark:bg-slate-950/50 border-transparent focus:border-ucr-celeste focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-ucr-celeste/20 transition-all shadow-sm rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Espaciado para que el botón fijo no tape contenido */}
        <div className="h-28" />

      </form>
    </Form>

    {/* Botón de guardar, siempre visible mientras se hace scroll.
        Se porta a document.body para escapar del backdrop-blur del <main>
        (ver nota junto a `mounted` más arriba) y así quedar fijo respecto
        a la ventana real, no al contenido de la página. */}
    {mounted && createPortal(
      <div className="fixed bottom-6 right-6 md:right-8 z-50">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden md:block">
            Revisa tus cambios antes de guardar.
          </p>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => form.handleSubmit(onSubmit)()}
            className="h-12 shrink-0 bg-gradient-to-r from-ucr-celeste-medium to-ucr-celeste-medium/80 hover:brightness-105 text-white shadow-lg transition-all px-6 rounded-xl font-bold text-sm md:text-base group"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Guardando...</>
            ) : (
              <><Save className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />Guardar Cambios</>
            )}
          </Button>
        </div>
      </div>,
      document.body
    )}

    {/* Tarjeta: Seguridad — formulario independiente para evitar form anidado */}
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 md:p-8 shadow-xl border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-3 bg-ucr-celeste/10 rounded-xl text-ucr-celeste">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-ucr-azul-2 dark:text-sky-400">Seguridad</h2>
          <p className="text-sm text-ucr-gris-2 dark:text-slate-400">Cambia tu contraseña de acceso.</p>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-ucr-azul-2 dark:text-sky-300">Contraseña actual</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <div className="md:col-span-3 flex justify-end">
          <Button
            type="submit"
            disabled={isChangingPassword || !passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
            className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl"
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
    </div>
  );
}
