const EmailService = require('../services/email.service');
const asyncHandler = require('../utils/asyncHandler');
const NotificationService = require('../services/notification.service');
// Si hubiera un modelo de Solicitud se importaría aquí: const db = require('../models');

/**
 * PATCH /api/solicitudes/:id/accept
 * Acepta una solicitud y notifica al usuario por email.
 */
exports.acceptRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 1. Aquí iría la lógica de actualización en la Base de Datos
  // const solicitud = await db.Solicitud.findByPk(id, { include: [db.User] });
  // if (!solicitud) throw { status: 404, message: 'Solicitud no encontrada' };
  // await solicitud.update({ estado: 'ACEPTADA' });
  // const { email, nombre } = solicitud.User;

  // -- Datos simulados para demostrar el RF-06 --
  const emailMock = req.body.email || 'usuario@example.com';
  const nombreMock = req.body.nombre || 'Juan Pérez';

  // 2. Enviar notificación por correo de forma asíncrona
  // No usamos 'await' bloqueante si no queremos retrasar la respuesta HTTP,
  // pero podemos usarlo para garantizar el envío o esperar a ver si falla silenciosamente.
  await EmailService.sendAcceptanceEmail(emailMock, nombreMock);

  // Crear notificación en la base de datos
  await NotificationService.createNotification(
    /* userId */ null,
    'Solicitud aceptada',
    `${nombreMock} ha aceptado tu solicitud`,
    'solicitud_aceptada'
  );

  res.status(200).json({ 
    message: `Solicitud ${id} aceptada. Se ha enviado la notificación por correo.` 
  });
});

/**
 * PATCH /api/solicitudes/:id/reject
 * Rechaza una solicitud y notifica al usuario por email.
 */
exports.rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // 1. Aquí iría la lógica de actualización en la BD
  // const solicitud = await db.Solicitud.findByPk(id, ...);
  
  // -- Datos simulados para demostrar el RF-06 --
  const emailMock = req.body.email || 'usuario@example.com';
  const nombreMock = req.body.nombre || 'Juan Pérez';

  // 2. Enviar notificación por correo
  await EmailService.sendRejectionEmail(emailMock, nombreMock);

  // Crear notificación en la base de datos
  await NotificationService.createNotification(
    null,
    'Solicitud rechazada',
    `${nombreMock} ha rechazado tu solicitud`,
    'solicitud_rechazada'
  );

  res.status(200).json({ 
    message: `Solicitud ${id} rechazada. Se ha enviado la notificación por correo.` 
  });
});
