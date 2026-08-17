"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import prisma from "@/lib/prisma";
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendPasswordResetEmailJS,
} from "@/lib/email";

type ActionResult =
  | { success: true; message: string; userId?: string }
  | { success: false; message: string };

// Antes de producción: poner NEXT_PUBLIC_REQUIRE_UCR_EMAIL_DOMAIN=true en .env
// (por ahora no hay correos @ucr.ac.cr reales disponibles para probar el registro).
const REQUIRE_UCR_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_REQUIRE_UCR_EMAIL_DOMAIN === "true";

const isValidPassword = (password: string) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

const generateTemporaryPassword = (): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  const all = uppercase + lowercase + numbers;
  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password.split("").sort(() => Math.random() - 0.5).join("");
};

// ─── Registro de Estudiante ────────────────────────────────────────────────

export async function registerStudentAction(data: {
  nombre: string;
  email: string;
  password: string;
  cedula?: string;
  fecha_nacimiento?: string;
  genero?: string;
  carnet_ucr?: string;
  carrera?: string;
  escuela_facultad?: string;
  sede?: string;
  anio_ingreso?: number;
  nivel_academico?: string;
  promedio_ponderado?: number;
  aceptaPrivacidad: boolean;
}): Promise<ActionResult> {
  if (!data.nombre || data.nombre.trim().length < 3) {
    return { success: false, message: "El nombre debe tener al menos 3 caracteres." };
  }
  if (!isValidPassword(data.password)) {
    return { success: false, message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número." };
  }
  if (!data.aceptaPrivacidad) {
    return { success: false, message: "Debes aceptar la política de privacidad para registrarte." };
  }

  if (REQUIRE_UCR_EMAIL_DOMAIN && !data.email.trim().toLowerCase().endsWith("@ucr.ac.cr")) {
    return {
      success: false,
      message: "Los estudiantes deben registrarse con su correo institucional @ucr.ac.cr",
    };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false, message: "Ya existe una cuenta con este correo electrónico." };
  }

  if (data.cedula) {
    const existingCedula = await prisma.user.findFirst({ where: { cedula: data.cedula } });
    if (existingCedula) {
      return { success: false, message: "Ya existe una cuenta registrada con esta cédula." };
    }
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: false,
    user_metadata: { nombre: data.nombre, tipo: "ESTUDIANTE" },
  });

  if (authError || !authData.user) {
    console.error("[registerStudent] Supabase error:", authError);
    return { success: false, message: "Error al crear cuenta: " + (authError?.message ?? "desconocido") };
  }

  await prisma.user.create({
    data: {
      id: authData.user.id,
      email: data.email,
      nombre: data.nombre.trim(),
      tipo: "ESTUDIANTE",
      email_verified: false,
      activo: true,
      cedula: data.cedula,
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
      genero: data.genero,
      acepta_privacidad_at: new Date(),
    },
  });

  await prisma.estudiante.create({
    data: {
      user_id: authData.user.id,
      carnet_ucr: data.carnet_ucr,
      carrera: data.carrera,
      escuela_facultad: data.escuela_facultad,
      sede: data.sede,
      anio_ingreso: data.anio_ingreso ?? null,
      nivel_academico: data.nivel_academico,
      promedio_ponderado: data.promedio_ponderado ?? null,
    },
  });

  const callbackUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/auth/callback?email=${encodeURIComponent(data.email)}`;
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email: data.email,
    password: data.password,
    options: { redirectTo: callbackUrl },
  });

  if (!linkError && linkData?.properties?.action_link) {
    await sendMagicLinkEmail(data.email, linkData.properties.action_link, data.nombre.trim());
  } else {
    console.error("[registerStudent] Error generando magic link:", linkError);
  }

  return {
    success: true,
    message: "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
    userId: authData.user.id,
  };
}

// ─── Registro de Exalumno ─────────────────────────────────────────────────

export async function registerAlumniAction(data: {
  nombre: string;
  email: string;
  password: string;
  carrera?: string;
  escuela_facultad?: string;
  anio_graduacion: number;
  cedula?: string;
  fecha_nacimiento?: string;
  genero?: string;
  aceptaPrivacidad: boolean;
}): Promise<ActionResult> {
  if (!data.nombre || data.nombre.trim().length < 3) {
    return { success: false, message: "El nombre debe tener al menos 3 caracteres." };
  }
  if (!isValidPassword(data.password)) {
    return { success: false, message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número." };
  }
  if (!data.aceptaPrivacidad) {
    return { success: false, message: "Debes aceptar la política de privacidad para registrarte." };
  }
  const currentYear = new Date().getFullYear();
  if (!data.anio_graduacion || data.anio_graduacion < 1940 || data.anio_graduacion > currentYear) {
    return { success: false, message: `El año de graduación debe estar entre 1940 y ${currentYear}.` };
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false, message: "Ya existe una cuenta registrada con este correo electrónico." };
  }

  if (data.cedula) {
    const existingCedula = await prisma.user.findFirst({ where: { cedula: data.cedula } });
    if (existingCedula) {
      return { success: false, message: "Ya existe una cuenta registrada con esta cédula." };
    }
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: false,
    user_metadata: { nombre: data.nombre, tipo: "EXALUMNO" },
  });

  if (authError || !authData.user) {
    console.error("[registerAlumni] Supabase error:", authError);
    return { success: false, message: "Error al crear cuenta: " + (authError?.message ?? "desconocido") };
  }

  await prisma.user.create({
    data: {
      id: authData.user.id,
      email: data.email,
      nombre: data.nombre.trim(),
      tipo: "EXALUMNO",
      email_verified: false,
      activo: true,
      cedula: data.cedula,
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
      genero: data.genero,
      acepta_privacidad_at: new Date(),
    },
  });

  await prisma.exalumno.create({
    data: {
      user_id: authData.user.id,
      carrera: data.carrera,
      escuela_facultad: data.escuela_facultad,
      anio_graduacion: data.anio_graduacion,
    },
  });

  const callbackUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/auth/callback?email=${encodeURIComponent(data.email)}`;
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email: data.email,
    password: data.password,
    options: { redirectTo: callbackUrl },
  });

  if (!linkError && linkData?.properties?.action_link) {
    await sendMagicLinkEmail(data.email, linkData.properties.action_link, data.nombre.trim());
  } else {
    console.error("[registerAlumni] Error generando magic link:", linkError);
  }

  return {
    success: true,
    message: "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
    userId: authData.user.id,
  };
}

// ─── Reenviar Magic Link ──────────────────────────────────────────────────

export async function resendMagicLinkAction(email: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: "No existe una cuenta con este correo." };
  }
  if (user.email_verified) {
    return { success: false, message: "Este correo ya fue verificado." };
  }

  // Usa magiclink para no requerir contraseña al reenviar verificación
  const callbackUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/auth/callback?email=${encodeURIComponent(email)}`;
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: callbackUrl },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("[resendMagicLink] Error:", linkError);
    return { success: false, message: "Error generando enlace de verificación." };
  }

  await sendMagicLinkEmail(email, linkData.properties.action_link, user.nombre);
  return { success: true, message: "Magic link reenviado. Revisa tu bandeja de entrada." };
}

// ─── Recuperación de Contraseña ───────────────────────────────────────────

export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // No revelar si el correo existe, respuesta siempre igual
    return {
      success: true,
      message: "Si existe una cuenta con ese correo, recibirás tu contraseña temporal por email.",
    };
  }

  const tempPassword = generateTemporaryPassword();

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: tempPassword,
    email_confirm: true,
  });

  if (updateError) {
    console.error("[forgotPassword] Error actualizando contraseña en Supabase:", updateError);
    return { success: false, message: "Error interno al procesar la solicitud. Intenta de nuevo." };
  }

  // Intentar con EmailJS primero (mismo mecanismo que el backend Express)
  let emailSent = await sendPasswordResetEmailJS(email, user.nombre, tempPassword);

  // Fallback a Resend si EmailJS falla (requiere dominio verificado en Resend)
  if (!emailSent) {
    console.warn("[forgotPassword] EmailJS falló, intentando con Resend...");
    emailSent = await sendPasswordResetEmail(email, user.nombre, tempPassword);
  }

  if (!emailSent) {
    if (process.env.NODE_ENV !== "production") {
      return {
        success: false,
        message:
          "El correo no pudo enviarse (fallaron EmailJS y Resend). " +
          "Revisa la consola del servidor y las credenciales EMAILJS_* en .env.local.",
      };
    }
    return { success: false, message: "No pudimos enviar el correo. Intenta de nuevo en unos minutos." };
  }

  return {
    success: true,
    message: "Si existe una cuenta con ese correo, recibirás tu contraseña temporal por email.",
  };
}

// ─── Verificar Email (callback de Supabase) ───────────────────────────────

export async function verifyEmailAction(email: string): Promise<ActionResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: "Usuario no encontrado." };
  }
  if (user.email_verified) {
    return { success: true, message: "Correo ya verificado." };
  }

  const { data: supabaseData } = await supabaseAdmin.auth.admin.getUserById(user.id);
  if (!supabaseData?.user?.email_confirmed_at) {
    return { success: false, message: "El token aún no ha sido confirmado." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { email_verified: true } });
  return { success: true, message: "Correo verificado exitosamente." };
}

// ─── Cambiar Contraseña (sin verificar la actual — para flujo forgot-password) ─
export async function changePasswordAction(userId: string, newPassword: string): Promise<ActionResult> {
  if (!isValidPassword(newPassword)) {
    return { success: false, message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número." };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) {
    console.error("[changePassword] Error:", error);
    return { success: false, message: "Error actualizando contraseña: " + error.message };
  }

  return { success: true, message: "Contraseña actualizada correctamente." };
}

// ─── Cambiar Contraseña verificando la contraseña actual (desde el perfil) ─
export async function changePasswordWithVerificationAction(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  if (!currentPassword) {
    return { success: false, message: "Debes ingresar tu contraseña actual." };
  }
  if (!isValidPassword(newPassword)) {
    return { success: false, message: "La nueva contraseña debe tener mínimo 8 caracteres, una mayúscula y un número." };
  }

  // 1. Obtener el email del usuario para verificar su contraseña actual
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, message: "Usuario no encontrado." };
  }

  // 2. Verificar la contraseña actual contra Supabase
  const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, message: "La contraseña actual es incorrecta." };
  }

  // 3. Actualizar la contraseña
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    console.error("[changePasswordWithVerification] Error:", updateError);
    return { success: false, message: "Error actualizando la contraseña. Intenta de nuevo." };
  }

  return { success: true, message: "Contraseña actualizada correctamente." };
}

// ─── Logout ───────────────────────────────────────────────────────────────

export async function logoutAction() {
  const cookieStore = cookies();
  
  // Borrar cookies de sesión de NextAuth / Auth.js
  cookieStore.set("authjs.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  cookieStore.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  
  // Redirigir a la página de login
  redirect("/login");
}
