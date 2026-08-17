// ─── EmailJS server-side sender ──────────────────────────────────────────────
// Usa la API REST de EmailJS con autenticación por private key (server-only).
// Templates:
//   TEMPLATE_NOTIF  (template_hih689c) → {{recipient_name}}, {{title}}, {{message}}, {{action_url}}, {{action_text}}
//   TEMPLATE_AUTH   (template_zfbvncq) → {{recipient_name}}, {{title}}, {{verification_url}}

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const TEMPLATE_NOTIF = process.env.EMAILJS_NOTIFICATION_TEMPLATE_ID ?? "template_hih689c";
const TEMPLATE_AUTH = process.env.EMAILJS_AUTH_TEMPLATE_ID ?? "template_zfbvncq";

function devLog(to: string, extra?: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n📧 [DEV email] → ${to}${extra ? "\n   " + extra : ""}\n`);
  }
}

async function sendEmailJS(
  toEmail: string,
  templateId: string,
  templateParams: Record<string, string>
): Promise<void> {
  devLog(toEmail, templateParams.verification_url ?? templateParams.action_url);

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("[sendEmailJS] Faltan EMAILJS_SERVICE_ID / EMAILJS_PUBLIC_KEY / EMAILJS_PRIVATE_KEY en .env.local");
    return;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: { to_email: toEmail, ...templateParams },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[sendEmailJS:${templateId}] Rechazado:`, txt);
    }
  } catch (e: any) {
    console.error(`[sendEmailJS:${templateId}] Excepción:`, e?.message ?? e);
  }
}

// ─── Auth / verificación ──────────────────────────────────────────────────────

export async function sendMagicLinkEmail(
  toEmail: string,
  link: string,
  nombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_AUTH, {
    recipient_name: nombre,
    title: "Verifica tu cuenta",
    verification_url: link,
  });
}

// ─── Moderación / Fraude (RF-09) ───────────────────────────────────────────────

export async function sendPerfilAutoSuspendido(
  adminEmail: string,
  nombreReportado: string,
  emailReportado: string,
  totalReportes: number
): Promise<void> {
  await sendEmailJS(adminEmail, TEMPLATE_NOTIF, {
    recipient_name: "Administrador",
    title: "🚨 Perfil auto-suspendido por reportes",
    message:
      `El perfil de ${nombreReportado} (${emailReportado}) alcanzó ${totalReportes} reportes ` +
      "y fue suspendido automáticamente por el sistema. Revisa el caso en el panel de administración " +
      "para confirmar la suspensión o rehabilitar la cuenta.",
    action_url: `${BASE_URL}/admin`,
    action_text: "Revisar en el panel",
  });
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function sendMatchAceptado(
  toEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title: `¡${exalumnoNombre} aceptó conectar contigo!`,
    message:
      `${exalumnoNombre} ha aceptado tu solicitud de conexión en la plataforma. ` +
      "¡Es momento de iniciar una conversación y aprovechar esta oportunidad!",
    action_url: `${BASE_URL}/mis-matches`,
    action_text: "Ver mis Matches",
  });
}

export async function sendMatchRechazado(
  toEmail: string,
  estudianteNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title: "Actualización sobre tu solicitud de match",
    message:
      "La solicitud de conexión enviada no pudo concretarse en esta ocasión. " +
      "No te desanimes — completa tu perfil para mejorar tus próximos matches.",
    action_url: `${BASE_URL}/mis-matches`,
    action_text: "Ver más matches",
  });
}

export async function sendMatchConnectionRequest(
  toEmail: string,
  receptorNombre: string,
  emisorNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: receptorNombre,
    title: `${emisorNombre} quiere conectar contigo`,
    message:
      `${emisorNombre} quiere conectar contigo en la plataforma. ` +
      "Ingresa para revisar su perfil y decidir si deseas aceptar.",
    action_url: `${BASE_URL}/mis-matches`,
    action_text: "Ver solicitud",
  });
}

export async function sendAdminNewActiveMatch(
  adminEmail: string,
  estudianteNombre: string,
  exalumnoNombre: string
): Promise<void> {
  await sendEmailJS(adminEmail, TEMPLATE_NOTIF, {
    recipient_name: "Administrador",
    title: `Nuevo match activo: ${estudianteNombre} ↔ ${exalumnoNombre}`,
    message:
      `El match entre el estudiante ${estudianteNombre} y el exalumno ${exalumnoNombre} ` +
      "ha sido aceptado y está activo.",
    action_url: `${BASE_URL}/admin/matches`,
    action_text: "Ver matches",
  });
}

// ─── Donaciones ───────────────────────────────────────────────────────────────

export async function sendDonacionAprobada(
  toEmail: string,
  exalumnoNombre: string,
  monto: number,
  destino: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "¡Tu donación fue aprobada!",
    message:
      `Tu donación de ₡${monto.toLocaleString("es-CR")} destinada a ${destino} ` +
      "ha sido verificada y aprobada. ¡Gracias por apoyar el talento de la UCR!",
    action_url: `${BASE_URL}/mis-donaciones`,
    action_text: "Ver mis donaciones",
  });
}

export async function sendDonacionRechazada(
  toEmail: string,
  exalumnoNombre: string,
  monto: number,
  destino: string,
  motivo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "Sobre tu donación",
    message:
      `Lamentamos informarte que tu donación de ₡${monto.toLocaleString("es-CR")} destinada a ${destino} ` +
      `no pudo ser verificada. Motivo: ${motivo}. ` +
      "Si crees que se trata de un error, por favor contacta a la Fundación UCR.",
    action_url: `${BASE_URL}/mis-donaciones`,
    action_text: "Ver mis donaciones",
  });
}

export async function sendDonacionAtrasadaEmail(
  adminEmail: string,
  adminNombre: string,
  monto: number,
  moneda: string,
  destino: string,
  horasPendiente: number
): Promise<void> {
  // Usa la plantilla genérica de notificaciones (TEMPLATE_NOTIF) mientras no
  // exista una plantilla dedicada. Cuando se cree TEMPLATE_DONACION_ATRASADA
  // en EmailJS, basta con definir EMAILJS_DONACION_ATRASADA_TEMPLATE en .env.
  const templateId = process.env.EMAILJS_DONACION_ATRASADA_TEMPLATE ?? TEMPLATE_NOTIF;
  await sendEmailJS(adminEmail, templateId, {
    recipient_name: adminNombre,
    title: "Donación pendiente de confirmar",
    message:
      `Hay una donación de ${moneda} ${monto.toLocaleString("es-CR")} destinada a "${destino}" ` +
      `que lleva más de ${horasPendiente}h sin confirmar. Revísala en el panel de administración.`,
    action_url: `${BASE_URL}/admin/donaciones`,
    action_text: "Ver donaciones pendientes",
  });
}

export async function sendDonacionRecibidaStudent(
  toEmail: string,
  estudianteNombre: string,
  proyectoTitulo: string,
  monto: number
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title: "¡Has recibido una donación!",
    message:
      `¡Felicidades! Un exalumno ha realizado una donación de ₡${monto.toLocaleString("es-CR")} ` +
      `para apoyar tu proyecto "${proyectoTitulo}". ` +
      "La Fundación UCR se pondrá en contacto pronto para gestionar la entrega de estos fondos.",
    action_url: `${BASE_URL}/mis-donaciones`,
    action_text: "Ver mis donaciones",
  });
}

// ─── Voluntariado UCR ("Retribuye a la UCR") ──────────────────────────────────

export async function sendVoluntariadoAceptado(
  toEmail: string,
  exalumnoNombre: string,
  actividadTitulo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "¡Tu oferta de apoyo fue aceptada!",
    message:
      `La Fundación UCR aceptó tu oferta para "${actividadTitulo}". ` +
      "Pronto te contactaremos para coordinar los detalles. ¡Gracias por retribuir a la UCR!",
    action_url: `${BASE_URL}/retribuir`,
    action_text: "Ver mis ofertas",
  });
}

export async function sendVoluntariadoRechazado(
  toEmail: string,
  exalumnoNombre: string,
  actividadTitulo: string,
  motivo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "Sobre tu oferta de apoyo",
    message:
      `Lamentamos informarte que tu oferta para "${actividadTitulo}" no fue aceptada en esta ocasión. ` +
      `Motivo: ${motivo}. ¡Gracias por tu disposición a apoyar a la UCR!`,
    action_url: `${BASE_URL}/retribuir`,
    action_text: "Ver mis ofertas",
  });
}

// ─── Talleres ──────────────────────────────────────────────────────────────────

export async function sendTallerAprobado(
  toEmail: string,
  exalumnoNombre: string,
  tallerTitulo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "¡Tu taller fue aprobado!",
    message:
      `Tu taller "${tallerTitulo}" fue aprobado y ya está visible para estudiantes y exalumnos. ` +
      "¡Gracias por compartir tu conocimiento con la comunidad UCR!",
    action_url: `${BASE_URL}/retribuir`,
    action_text: "Ver mis talleres",
  });
}

export async function sendTallerRechazado(
  toEmail: string,
  exalumnoNombre: string,
  tallerTitulo: string,
  motivo: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "Sobre tu taller propuesto",
    message:
      `Lamentamos informarte que tu taller "${tallerTitulo}" no fue aprobado en esta ocasión. ` +
      `Motivo: ${motivo}. ¡Gracias por tu interés en aportar a la comunidad UCR!`,
    action_url: `${BASE_URL}/retribuir`,
    action_text: "Ver mis talleres",
  });
}

export async function sendTallerCupoConfirmado(
  toEmail: string,
  estudianteNombre: string,
  tallerTitulo: string,
  fechaHora: string | null
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: estudianteNombre,
    title: "¡Cupo confirmado!",
    message:
      `Tu cupo para el taller "${tallerTitulo}" quedó confirmado` +
      (fechaHora ? ` para el ${fechaHora}.` : ".") +
      " Te contactaremos con más detalles antes de la fecha.",
    action_url: `${BASE_URL}/talleres`,
    action_text: "Ver talleres",
  });
}

// ─── Aplicaciones ─────────────────────────────────────────────────────────────

async function sendApplicantEmailJS(
  toEmail: string,
  templateId: string,
  templateParams: Record<string, string | number>
): Promise<void> {
  devLog(toEmail);

  const serviceId  = process.env.EMAILJS_APPLICANT_SERVICE_ID;
  const publicKey  = process.env.EMAILJS_APPLICANT_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_APPLICANT_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("[sendApplicantEmailJS] Faltan EMAILJS_APPLICANT_* en .env.local");
    return;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: { to_email: toEmail, ...templateParams },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[sendApplicantEmailJS:${templateId}] Rechazado (${res.status}):`, txt);
    } else {
      console.log(`[sendApplicantEmailJS:${templateId}] ✓ aceptado por EmailJS → ${toEmail}`);
    }
  } catch (e: any) {
    console.error(`[sendApplicantEmailJS:${templateId}] Excepción:`, e?.message ?? e);
  }
}

export async function sendNuevaAplicacion(
  toEmail: string,
  exalumnoNombre: string,
  posicionTitulo: string,
  estudianteNombre: string
): Promise<void> {
  await sendEmailJS(toEmail, TEMPLATE_NOTIF, {
    recipient_name: exalumnoNombre,
    title: "¡Nueva aplicación recibida!",
    message: `${estudianteNombre} acaba de aplicar a tu posición "${posicionTitulo}". Revisa su perfil en tu panel.`,
    action_url: `${BASE_URL}/mis-posiciones`,
    action_text: "Ver mis posiciones",
  });
}

export async function sendAplicacionSeleccionada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string,
  vacancyOwnerName: string,
  vacancyOwnerEmail: string
): Promise<void> {
  const templateId = process.env.EMAILJS_APPLICANT_ACCEPTED_TEMPLATE ?? "template_7e3p7jr";
  await sendApplicantEmailJS(toEmail, templateId, {
    applicant_name: estudianteNombre,
    name: estudianteNombre,
    vacancy_name: posicionTitulo,
    vacancy_owner_name: vacancyOwnerName,
    vacancy_owner_email: vacancyOwnerEmail,
    email: toEmail,
  });
}

export async function sendAplicacionDescartada(
  toEmail: string,
  estudianteNombre: string,
  posicionTitulo: string
): Promise<void> {
  const templateId = process.env.EMAILJS_APPLICANT_REJECTED_TEMPLATE ?? "template_5dkl7bw";
  await sendApplicantEmailJS(toEmail, templateId, {
    applicant_name: estudianteNombre,
    vacancy_name: posicionTitulo,
    email: toEmail,
  });
}

// ─── Recuperación de contraseña ───────────────────────────────────────────────

export async function sendPasswordResetEmailJS(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey) {
    console.error("[sendPasswordResetEmailJS] Faltan variables EMAILJS_* en .env.local");
    return false;
  }

  devLog(toEmail, `Contraseña temporal: ${tempPassword}`);

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: "template_zfbvncq",
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          to_email: toEmail,
          email: toEmail,
          recipient_name: nombre,
          nombre,
          title: "Recuperación de contraseña",
          password: tempPassword,
          verification_url: "",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[sendPasswordResetEmailJS] Rechazado:", errText);
      return false;
    }
    return true;
  } catch (e: any) {
    console.error("[sendPasswordResetEmailJS] Excepción:", e?.message ?? e);
    return false;
  }
}

// Alias para compatibilidad con auth.actions.ts (llama a EmailJS internamente)
export async function sendPasswordResetEmail(
  toEmail: string,
  nombre: string,
  tempPassword: string
): Promise<boolean> {
  return sendPasswordResetEmailJS(toEmail, nombre, tempPassword);
}
