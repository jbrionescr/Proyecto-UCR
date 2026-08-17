const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
});

/**
 * Función genérica para enviar correos electrónicos.
 * Captura errores para no romper la ejecución de la aplicación.
 *
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} htmlContent - Contenido HTML del correo
 * @returns {Promise<boolean>} Retorna true si el envío fue exitoso, false en caso contrario
 */
const sendMail = async (to, subject, htmlContent) => {
  if (!to) {
    console.warn('[MailSender] Intento de envío de correo sin destinatario.');
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      html: htmlContent,
    });
    
    console.log(`[MailSender] Correo enviado exitosamente a: ${to} | ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[MailSender] Error al enviar correo a ${to}:`, error.message);
    // Retornamos false en lugar de lanzar la excepción para que no detenga el proceso principal
    return false;
  }
};

module.exports = { sendMail };
