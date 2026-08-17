"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, BookOpen, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerAlumniAction } from "@/actions/auth.actions";

const registerSchema = z.object({
  tipo_identificacion: z.string().min(1, "Seleccione un tipo de identificación"),
  cedula: z.string().min(9, "La identificación debe tener al menos 9 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
  carrera: z.string().min(3, "Indica la carrera de la cual te graduaste"),
  escuela_facultad: z.string().min(3, "Indica la escuela o facultad"),
  anio_graduacion: z.coerce.number().min(1940, "Año inválido").max(new Date().getFullYear(), "Año inválido"),
  aceptaPrivacidad: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de privacidad para continuar",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type UCRStatus = "graduado" | "estudiante_activo" | null;

export function ExalumnoRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [ucrStatus, setUcrStatus] = useState<UCRStatus>(null);
  const [cedulaLoading, setCedulaLoading] = useState(false);
  const [cedulaHint, setCedulaHint] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      tipo_identificacion: "01",
      cedula: "",
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      carrera: "",
      escuela_facultad: "",
      anio_graduacion: new Date().getFullYear(),
      aceptaPrivacidad: false,
    },
  });

  const emailValue = form.watch("email");
  const isUCREmail = emailValue?.toLowerCase().endsWith("@ucr.ac.cr");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value.toLowerCase().endsWith("@ucr.ac.cr")) {
      setUcrStatus(null);
    }
  };

  const handleSelectEstudianteActivo = () => {
    router.push("/registro/estudiante");
  };

  const handleSelectGraduado = () => {
    setUcrStatus("graduado");
  };

  const handleCedulaBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cedula = e.target.value;
    if (cedula.length < 9) return;

    setCedulaLoading(true);
    setCedulaHint(null);

    const timeoutId = setTimeout(() => {
      setCedulaLoading(false);
      setCedulaHint("Está tardando. Puede ingresar el nombre manualmente si lo prefiere.");
    }, 3000);

    try {
      const response = await fetch(`/api/hacienda?identificacion=${encodeURIComponent(cedula)}`);
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        if (data.nombre) {
          form.setValue("nombre", data.nombre, { shouldValidate: true });
          setCedulaHint("Nombre cargado automáticamente desde Hacienda.");
        } else {
          setCedulaHint("No se encontró el nombre. Ingréselo manualmente.");
        }
      } else {
        setCedulaHint("No se encontró el nombre. Ingréselo manualmente.");
      }
    } catch {
      clearTimeout(timeoutId);
      setCedulaHint("No se pudo verificar la cédula. Ingrese el nombre manualmente.");
    } finally {
      setCedulaLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (isUCREmail && ucrStatus !== "graduado") {
      toast({
        title: "Confirma tu estado",
        description: "Por favor indica si eres graduado o estudiante activo antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerAlumniAction({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        carrera: data.carrera,
        escuela_facultad: data.escuela_facultad,
        anio_graduacion: data.anio_graduacion,
        cedula: data.cedula,
        aceptaPrivacidad: data.aceptaPrivacidad,
      });

      if (result.success) {
        toast({
          title: "Registro exitoso",
          description: "Revisa tu correo para verificar tu cuenta.",
        });
        router.push(`/verificar-correo?email=${encodeURIComponent(data.email)}`);
      } else {
        // Errores de duplicado → error inline en el campo correspondiente
        if (result.message?.toLowerCase().includes("correo")) {
          form.setError("email", { message: result.message });
        } else if (result.message?.toLowerCase().includes("cédula")) {
          form.setError("cedula", { message: result.message });
        } else {
          toast({ title: "Error en el registro", description: result.message, variant: "destructive" });
        }
      }
    } catch {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error al registrarse. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const UCREmailSelector = () => (
    <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-5">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
            Detectamos un correo institucional UCR
          </p>
          <p className="text-amber-700 dark:text-amber-400 text-sm mt-0.5">
            ¿Cuál es tu estado actual en la universidad?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleSelectGraduado}
          className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all cursor-pointer ${
            ucrStatus === "graduado"
              ? "border-ucr-celeste-medium bg-ucr-celeste-medium/10 dark:bg-ucr-celeste/10"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-ucr-celeste-medium/50"
          }`}
        >
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            ucrStatus === "graduado" ? "bg-ucr-celeste-medium/20" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            <GraduationCap className={`w-5 h-5 ${ucrStatus === "graduado" ? "text-ucr-celeste-medium" : "text-slate-500"}`} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${ucrStatus === "graduado" ? "text-ucr-celeste-medium" : "text-slate-800 dark:text-slate-200"}`}>
              Soy graduado
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ya obtuve mi título en la UCR</p>
          </div>
          {ucrStatus === "graduado" && (
            <div className="ml-auto w-5 h-5 rounded-full bg-ucr-celeste-medium flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>

        <button
          type="button"
          onClick={handleSelectEstudianteActivo}
          className="flex items-center gap-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-left transition-all cursor-pointer hover:border-green-400/60"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Soy estudiante activo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aún estoy cursando mi carrera</p>
          </div>
        </button>
      </div>

      {ucrStatus === "graduado" && (
        <p className="mt-3 text-xs text-ucr-celeste-medium dark:text-ucr-celeste font-medium">
          Perfecto, continúa completando el formulario como exalumno.
        </p>
      )}
    </div>
  );

  const showUCRSelector = isUCREmail;
  const formBlocked = isUCREmail && ucrStatus !== "graduado";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-6">

        <div className="md:col-span-2 mb-2 border-b pb-2">
          <h3 className="text-lg font-medium text-ucr-celeste-medium">Datos de Cuenta</h3>
        </div>

        <FormField
          control={form.control}
          name="tipo_identificacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Identificación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="01">Cédula Física</SelectItem>
                  <SelectItem value="02">Cédula Jurídica</SelectItem>
                  <SelectItem value="03">DIMEX</SelectItem>
                  <SelectItem value="04">NITE</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cedula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Identificación</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ej. 101110111"
                    {...field}
                    onBlur={(e) => { field.onBlur(); handleCedulaBlur(e); }}
                  />
                  {cedulaLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
                  )}
                </div>
              </FormControl>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ingrese su número de identificación y haga clic fuera del campo para cargar el nombre automáticamente.
                Si demora más de 3 segundos o no se carga, ingréselo manualmente.
              </p>
              {cedulaHint && (
                <p className={`text-xs mt-1 ${cedulaHint.includes("cargado") ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {cedulaHint}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Carlos Mendoza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Correo Electrónico (Personal o Profesional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="correo@ejemplo.com"
                  type="email"
                  {...field}
                  onChange={(e) => { field.onChange(e); handleEmailChange(e); }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showUCRSelector && <UCREmailSelector />}

        <fieldset disabled={formBlocked} className="contents">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={formBlocked ? "opacity-40 pointer-events-none" : ""}>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="••••••••" type={showPassword ? "text" : "password"} {...field} />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className={formBlocked ? "opacity-40 pointer-events-none" : ""}>
                <FormLabel>Confirmar Contraseña</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} {...field} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={`md:col-span-2 mt-6 mb-2 border-b pb-2 ${formBlocked ? "opacity-40" : ""}`}>
            <h3 className="text-lg font-medium text-ucr-celeste-medium">Datos Universitarios</h3>
          </div>

          <FormField
            control={form.control}
            name="carrera"
            render={({ field }) => (
              <FormItem className={formBlocked ? "opacity-40 pointer-events-none" : ""}>
                <FormLabel>Carrera</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Ingeniería Industrial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="escuela_facultad"
            render={({ field }) => (
              <FormItem className={formBlocked ? "opacity-40 pointer-events-none" : ""}>
                <FormLabel>Escuela / Facultad</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Facultad de Ingeniería" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="anio_graduacion"
            render={({ field }) => (
              <FormItem className={`md:col-span-2 w-1/2 pr-3 ${formBlocked ? "opacity-40 pointer-events-none" : ""}`}>
                <FormLabel>Fecha de Graduación</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min="1940-01-01"
                    max={`${new Date().getFullYear()}-12-31`}
                    value={field.value ? `${field.value}-06-15` : ""}
                    onChange={(e) => {
                      const year = e.target.value ? new Date(e.target.value).getFullYear() : "";
                      field.onChange(year);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aceptaPrivacidad"
            render={({ field }) => (
              <FormItem className={`md:col-span-2 flex items-start gap-2 space-y-0 ${formBlocked ? "opacity-40 pointer-events-none" : ""}`}>
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                </FormControl>
                <div>
                  <FormLabel className="font-normal text-sm text-slate-600 dark:text-slate-400">
                    Acepto la{" "}
                    <Link href="/politica-privacidad" target="_blank" className="underline text-ucr-celeste-medium">
                      política de privacidad
                    </Link>{" "}
                    y el tratamiento de mis datos conforme a la Ley 8968.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="md:col-span-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || formBlocked}
              className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white py-2 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
              ) : (
                "Crear cuenta"
              )}
            </Button>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-4">
              Te enviaremos un correo para confirmar tu cuenta antes de poder iniciar sesión.
            </p>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}
