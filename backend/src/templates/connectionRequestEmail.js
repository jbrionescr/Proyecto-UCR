/**
 * Genera el contenido HTML y el Asunto para el correo de SOLICITUD DE CONEXIÓN.
 * 
 * @param {string} receptorNombre - Nombre del usuario que recibe la solicitud
 * @param {string} emisorNombre - Nombre del usuario que envía la solicitud
 * @returns {Object} Objeto con el 'subject' y 'html'
 */
const getConnectionRequestEmailTemplate = (receptorNombre, emisorNombre) => {
  const subject = `¡${emisorNombre} quiere conectar contigo! — Alumni U`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #0f4c81; margin-top: 0;">¡Nueva Solicitud de Conexión!</h2>
      <p>Hola, <strong>${receptorNombre}</strong>.</p>
      
      <p><strong>${emisorNombre}</strong> te ha enviado una solicitud de conexión en la plataforma Alumni U.</p>
      
      <p>Ingresa a tu bandeja de entrada en la plataforma para aceptar o rechazar esta solicitud y empezar a colaborar.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mis-conexiones" 
           style="background-color: #0f4c81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Ver Solicitudes
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
      <p style="font-size: 12px; color: #64748b;">
        Este es un correo automático enviado por el Sistema de Exalumnos UCR.
      </p>
    </div>
  `;

  return { subject, html };
};

module.exports = { getConnectionRequestEmailTemplate };
