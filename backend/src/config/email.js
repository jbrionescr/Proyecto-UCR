const { Resend } = require('resend');
const emailjs = require('@emailjs/nodejs');

// Toda la configuracion de correo se lee del entorno, sin valores por defecto
// incrustados. Un fallback literal parece inofensivo, pero convierte al archivo
// fuente en el lugar donde vive la credencial: se publica con el repositorio y
// deja de poder rotarse sin desplegar codigo nuevo.
//
// Nota: la version anterior pasaba la clave publica de EmailJS al constructor
// de Resend como valor por defecto. Son proveedores distintos con formatos de
// credencial incompatibles, de modo que ese respaldo nunca habria funcionado:
// solo enmascaraba la ausencia de configuracion hasta el momento del envio.
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'no-reply@alumni.ucr.ac.cr';
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const TEMPLATE_ALUMNI_APPROVED = process.env.TEMPLATE_ALUMNI_APPROVED;

// EmailJS.
//
// Distincion importante entre sus dos claves:
//   PUBLIC_KEY  (user_id)     -> identificador pensado para viajar al navegador.
//   PRIVATE_KEY (accessToken) -> secreto real; autoriza el envio desde servidor
//                                y jamas debe salir del entorno.
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_PASSWORD_RESET_TEMPLATE;
const EMAILJS_MAGIC_LINK_TEMPLATE = process.env.EMAILJS_AUTH_TEMPLATE_ID || TEMPLATE_ALUMNI_APPROVED;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

/**
 * Envía un magic link de verificación al estudiante.
 * @param {string} to - Correo destino
 * @param {string} token - Token único de verificación
 */
async function sendMagicLink(to, token) {
  const link = `${FRONTEND}/auth/verificar?token=${token}&email=${encodeURIComponent(to)}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifica tu cuenta — Fundación Exalumnos UCR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
        <img src="https://www.ucr.ac.cr/medios/imagenes/sitio/logo-ucr.svg" alt="UCR" style="height:40px;margin-bottom:24px">
        <h2 style="color:#0f4c81;margin-bottom:12px">¡Bienvenido/a a la Red de Exalumnos UCR!</h2>
        <p style="color:#475569;line-height:1.6">
          Haz clic en el siguiente botón para verificar tu correo y activar tu cuenta.
          Este enlace expira en <strong>24 horas</strong>.
        </p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#0f4c81;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Verificar mi cuenta
        </a>
        <p style="color:#94a3b8;font-size:12px">
          Si no solicitaste este correo, puedes ignorarlo con seguridad.<br>
          <a href="${link}" style="color:#0f4c81;word-break:break-all">${link}</a>
      </div>
    `,
  });
}

/**
 * Envía un magic link de verificación usando EmailJS.
 * @param {string} to - Correo destino
 * @param {string} link - URL mágica completa
 */
async function sendMagicLinkEmailJS(to, link, nombre = 'Estudiante') {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_MAGIC_LINK_TEMPLATE,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: {
          email: to,
          to_email: to,
          magic_link: link,
          nombre
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error EmailJS API:', errorText);
      throw new Error('Error enviando magic link via EmailJS');
    }
    return true;
  } catch (error) {
    console.error('Error sending magic link via EmailJS:', error);
    throw error;
  }
}

/**
 * Envía un correo de confirmación de registro a exalumnos (perfil pendiente).
 */
async function sendAlumniPendingEmail(to, nombre) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Registro recibido — Fundación Exalumnos UCR',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
        <img src="https://www.ucr.ac.cr/medios/imagenes/sitio/logo-ucr.svg" alt="UCR" style="height:40px;margin-bottom:24px">
        <h2 style="color:#0f4c81">Hola, ${nombre}</h2>
        <p style="color:#475569;line-height:1.6">
          Hemos recibido tu registro en la plataforma de Exalumnos UCR. 
          Tu perfil está siendo verificado por el equipo de la Fundación.
          Te notificaremos en un plazo de <strong>48 horas hábiles</strong>.
        </p>
        <p style="color:#94a3b8;font-size:12px">Fundación de Exalumnos — Universidad de Costa Rica</p>
      </div>
    `,
  });
}

/**
 * Envía correo de recuperación de contraseña con contraseña temporal usando EmailJS.
 * @param {string} to - Correo destino
 * @param {string} nombre - Nombre del usuario
 * @param {string} tempPassword - Contraseña temporal generada
 */
async function sendPasswordReset(to, nombre, tempPassword) {
  try {
    console.log({
      email: to,
      to_email: to,
      nombre,
      password: tempPassword
    });

    return await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        email: to,
        to_email: to, // Ensure template variable compatibility (EmailJS default is to_email)
        nombre,
        password: tempPassword,
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
  } catch (error) {
    console.error('Error sending password reset email via EmailJS:', error);
    throw error;
  }
}

/**
 * Envía correo de aprobación de exalumno usando template de Resend.
 * @param {string} to - Correo destino
 * @param {string} nombre - Nombre del exalumno
 */
async function sendAlumniApprovedEmail(to, nombre) {
  try {
    return resend.emails.send({
      from: FROM,
      to,
      template: TEMPLATE_ALUMNI_APPROVED,
      props: {
        nombre,
        loginUrl: `${FRONTEND}/auth/login`,
      },
    });
  } catch (error) {
    console.error('Error sending alumni approved email:', error);
    throw error;
  }
}

/**
 * Envía correo de notificación al administrador sobre una suspensión automática.
 */
async function sendAccountSuspendedEmail(to, nombreReportado, emailReportado, reportesTotales) {
  try {
    return resend.emails.send({
      from: FROM,
      to,
      subject: '🚨 Acción Requerida: Perfil Auto-Suspendido por Reportes',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:8px">
          <h2 style="color:#b91c1c">Perfil Suspendido Automáticamente</h2>
          <p style="color:#475569;line-height:1.6">
            El siguiente perfil ha sido suspendido automáticamente tras alcanzar el límite de reportes:
          </p>
          <ul style="color:#475569">
            <li><strong>Nombre:</strong> ${nombreReportado}</li>
            <li><strong>Email:</strong> ${emailReportado}</li>
            <li><strong>Total de reportes:</strong> ${reportesTotales}</li>
          </ul>
          <p style="color:#475569;line-height:1.6">
            Por favor ingresa al panel administrativo para revisar los motivos de los reportes y decidir si reactivar o eliminar permanentemente la cuenta.
          </p>
          <a href="${FRONTEND}/admin/usuarios" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#b91c1c;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
            Revisar en Panel Admin
          </a>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending account suspended email:', error);
  }
}

module.exports = { sendMagicLink, sendMagicLinkEmailJS, sendAlumniPendingEmail, sendPasswordReset, sendAlumniApprovedEmail, sendAccountSuspendedEmail };
