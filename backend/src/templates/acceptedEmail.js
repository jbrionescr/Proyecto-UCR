/**
 * Genera el contenido HTML y el Asunto para el correo de solicitud ACEPTADA.
 * 
 * @param {string} nombre - Nombre del usuario
 * @param {string} fecha - Fecha de la actualización
 * @returns {Object} Objeto con el 'subject' y 'html'
 */
const getAcceptedEmailTemplate = (nombre, fecha) => {
  const subject = 'Tu solicitud ha sido ACEPTADA — Sistema de Exalumnos UCR';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
      <p>Hola, <strong>${nombre}</strong>.</p>
      
      <p>Tu solicitud ha sido <strong style="color: #2e7d32;">APROBADA</strong>.</p>
      
      <p><strong>Fecha:</strong> ${fecha}</p>
      
      <p>Puedes ingresar a la plataforma para más detalles.</p>
      
      <br>
      <p>Saludos,<br>
      <strong>Sistema de Exalumnos UCR</strong></p>
    </div>
  `;

  return { subject, html };
};

module.exports = { getAcceptedEmailTemplate };
