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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerStudentAction } from "@/actions/auth.actions";
import { CATALOGO_CARRERAS, SEDES_UCR, NIVELES_ACADEMICOS } from "@/lib/constants";

// Antes de producción: poner NEXT_PUBLIC_REQUIRE_UCR_EMAIL_DOMAIN=true en .env
// (por ahora no hay correos @ucr.ac.cr reales disponibles para probar el registro).
const REQUIRE_UCR_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_REQUIRE_UCR_EMAIL_DOMAIN === "true";

const registerSchema = z.object({
  tipo_identificacion: z.string().min(1, "Seleccione un tipo de identificación"),
  cedula: z.string().min(9, "La identificación debe tener al menos 9 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string()
    .email("Correo inválido")
    .refine((v) => !REQUIRE_UCR_EMAIL_DOMAIN || v.trim().toLowerCase().endsWith("@ucr.ac.cr"), {
      message: "Debes usar tu correo institucional @ucr.ac.cr",
    }),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida"),
  genero: z.string().min(1, "Género es requerido"),
  carnet_ucr: z.string().min(6, "Carné inválido"),
  carrera: z.string().min(3, "Carrera es requerida"),
  escuela_facultad: z.string().min(3, "Escuela/Facultad es requerida"),
  sede: z.string().min(3, "Sede es requerida"),
  anio_ingreso: z.string().min(4, "Año de ingreso inválido"),
  nivel_academico: z.string().min(2, "Nivel académico es requerido"),
  promedio_ponderado: z.string().min(1, "Promedio es requerido"),
  password: z.string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
  aceptaPrivacidad: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de privacidad para continuar",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function EstudianteRegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
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
      fechaNacimiento: "",
      genero: "",
      carnet_ucr: "",
      carrera: "",
      escuela_facultad: "",
      sede: "",
      anio_ingreso: "",
      nivel_academico: "",
      promedio_ponderado: "",
      password: "",
      confirmPassword: "",
      aceptaPrivacidad: false,
    },
  });

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
    setIsLoading(true);
    try {
      const result = await registerStudentAction({
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        cedula: data.cedula,
        fecha_nacimiento: data.fechaNacimiento,
        genero: data.genero,
        carnet_ucr: data.carnet_ucr,
        carrera: data.carrera,
        escuela_facultad: data.escuela_facultad,
        sede: data.sede,
        anio_ingreso: parseInt(data.anio_ingreso),
        nivel_academico: data.nivel_academico,
        promedio_ponderado: parseFloat(data.promedio_ponderado),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-2xl mx-auto">

        {/* SECCIÓN: Información Personal */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Información Personal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
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
                    <Input placeholder="Ej. Mariana Rodríguez" {...field} />
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
                  <FormLabel>Correo Institucional</FormLabel>
                  <FormControl>
                    <Input placeholder="nombre.apellido@ucr.ac.cr" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN: Información Académica */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Información Académica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <FormField
              control={form.control}
              name="carnet_ucr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carné UCR</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. B98765" {...field} />
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
                  <FormLabel>Carrera</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Ingeniería Eléctrica" {...field} />
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
              name="sede"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sede</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una Sede" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEDES_UCR.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anio_ingreso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Año de Ingreso</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 2021" type="number" {...field} />
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
                  <FormLabel>Nivel Académico</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un Grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIVELES_ACADEMICOS.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="promedio_ponderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promedio Ponderado</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. 8.50" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN: Seguridad */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Seguridad</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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
          </div>
        </div>

        <FormField
          control={form.control}
          name="aceptaPrivacidad"
          render={({ field }) => (
            <FormItem className="flex items-start gap-2 space-y-0">
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

        <Button type="submit" disabled={isLoading} className="w-full bg-ucr-celeste-medium hover:bg-ucr-celeste-medium/90 text-white py-2">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...</>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>
    </Form>
  );
}
