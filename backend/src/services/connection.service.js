const ConnectionRepository = require('../repositories/connection.repository');
const NotificationService = require('./notification.service');
const EmailService = require('./email.service');
const db = require('../models');

class ConnectionService {
  async sendRequest(senderId, receiverId) {
    if (senderId === receiverId) {
      throw { status: 400, message: 'No puedes enviarte una solicitud de conexión a ti mismo.' };
    }

    const sender = await db.User.findByPk(senderId);
    const receiver = await db.User.findByPk(receiverId);

    if (!sender || !receiver) {
      throw { status: 404, message: 'Usuario no encontrado.' };
    }

    // Check existing connection
    const existing = await ConnectionRepository.findBySenderAndReceiver(senderId, receiverId);

    if (existing) {
      if (existing.status === 'pending') {
        throw { status: 400, message: 'Ya tienes una solicitud de conexión pendiente con esta persona.' };
      }
      if (existing.status === 'accepted') {
        throw { status: 400, message: 'Ya estás conectado con esta persona.' };
      }

      // If rejected or cancelled, reuse/update the connection
      existing.sender_id = senderId;
      existing.receiver_id = receiverId;
      existing.status = 'pending';
      await existing.save();

      // Trigger notification
      await NotificationService.createNotification(
        receiverId,
        'Nueva solicitud de conexión',
        `${sender.nombre} te ha enviado una solicitud de conexión.`,
        'connection_request'
      );

      // Enviar correo
      try {
        if (receiver && sender) {
          await EmailService.sendStudentToAlumniEmail(receiver.email, receiver.nombre, sender.nombre);
        }
      } catch (err) {
        console.error("Error al enviar email de solicitud de conexión (reuso)", err);
      }

      return existing;
    }

    // Create a new connection request
    const connection = await ConnectionRepository.create({
      sender_id: senderId,
      receiver_id: receiverId,
      status: 'pending'
    });

    // Trigger notification
    await NotificationService.createNotification(
      receiverId,
      'Nueva solicitud de conexión',
      `${sender.nombre} te ha enviado una solicitud de conexión.`,
      'connection_request'
    );

    // Enviar correo
    try {
      if (receiver && sender) {
        await EmailService.sendStudentToAlumniEmail(receiver.email, receiver.nombre, sender.nombre);
      }
    } catch (err) {
      console.error("Error al enviar email de solicitud de conexión (nueva)", err);
    }

    return connection;
  }

  async getPendingReceived(userId) {
    return await ConnectionRepository.findPendingReceived(userId);
  }

  async getSent(userId) {
    return await ConnectionRepository.findSent(userId);
  }

  async getActiveConnections(userId) {
    return await ConnectionRepository.findActiveConnections(userId);
  }

  async acceptRequest(id, userId) {
    const connection = await ConnectionRepository.findById(id);

    if (!connection) {
      throw { status: 404, message: 'Solicitud de conexión no encontrada.' };
    }

    if (connection.receiver_id !== userId) {
      throw { status: 403, message: 'No estás autorizado para aceptar esta solicitud.' };
    }

    if (connection.status !== 'pending') {
      throw { status: 400, message: 'La solicitud no está en estado pendiente.' };
    }

    connection.status = 'accepted';
    await connection.save();

    const receiver = await db.User.findByPk(userId);
    const sender = await db.User.findByPk(connection.sender_id);

    // Trigger notification to the sender
    await NotificationService.createNotification(
      connection.sender_id,
      'Solicitud de conexión aceptada',
      `${receiver.nombre} ha aceptado tu solicitud de conexión.`,
      'connection_accepted'
    );

    // Enviar correo
    try {
      if (sender) await EmailService.sendAcceptanceEmail(sender.email, sender.nombre);
    } catch(err) {
      console.error("Error al enviar email de aceptación", err);
    }

    return connection;
  }

  async rejectRequest(id, userId) {
    const connection = await ConnectionRepository.findById(id);

    if (!connection) {
      throw { status: 404, message: 'Solicitud de conexión no encontrada.' };
    }

    if (connection.receiver_id !== userId) {
      throw { status: 403, message: 'No estás autorizado para rechazar esta solicitud.' };
    }

    if (connection.status !== 'pending') {
      throw { status: 400, message: 'La solicitud no está en estado pendiente.' };
    }

    connection.status = 'rejected';
    await connection.save();

    const receiver = await db.User.findByPk(userId);
    const sender = await db.User.findByPk(connection.sender_id);

    // Trigger notification to the sender
    await NotificationService.createNotification(
      connection.sender_id,
      'Solicitud de conexión rechazada',
      `${receiver.nombre} ha rechazado tu solicitud de conexión.`,
      'connection_rejected'
    );

    // Enviar correo
    try {
      if (sender) await EmailService.sendRejectionEmail(sender.email, sender.nombre);
    } catch(err) {
      console.error("Error al enviar email de rechazo", err);
    }

    return connection;
  }

  async cancelRequest(id, userId) {
    const connection = await ConnectionRepository.findById(id);

    if (!connection) {
      throw { status: 404, message: 'Solicitud de conexión no encontrada.' };
    }

    if (connection.sender_id !== userId) {
      throw { status: 403, message: 'No estás autorizado para cancelar esta solicitud.' };
    }

    if (connection.status !== 'pending') {
      throw { status: 400, message: 'Solo puedes cancelar solicitudes pendientes.' };
    }

    connection.status = 'cancelled';
    await connection.save();

    return connection;
  }

  async deleteConnection(id, userId) {
    const connection = await ConnectionRepository.findById(id);

    if (!connection) {
      throw { status: 404, message: 'Conexión no encontrada.' };
    }

    if (connection.sender_id !== userId && connection.receiver_id !== userId) {
      throw { status: 403, message: 'No estás autorizado para eliminar esta conexión.' };
    }

    await ConnectionRepository.delete(id);
    return { success: true };
  }
}

module.exports = new ConnectionService();
