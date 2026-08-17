const MatchService       = require('../services/match.service');
const NotificationService = require('../services/notification.service');
const EmailService        = require('../services/email.service');
const asyncHandler        = require('../utils/asyncHandler');
const db                  = require('../models');

// ── CRUD base ─────────────────────────────────────────────────────────────────

exports.findAll = asyncHandler(async (req, res) => {
  const data = await MatchService.findAll();
  res.status(200).json(data);
});

exports.findById = asyncHandler(async (req, res) => {
  const data = await MatchService.findById(req.params.id);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.findByEstudiante = asyncHandler(async (req, res) => {
  const data = await MatchService.findByEstudiante(req.params.estudianteId);
  res.status(200).json(data);
});

exports.findByExalumno = asyncHandler(async (req, res) => {
  const data = await MatchService.findByExalumno(req.params.exalumnoId);
  res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await MatchService.create(req.body);
  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await MatchService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await MatchService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});

// ── Transiciones de estado ────────────────────────────────────────────────────

/**
 * SUGERIDO → CONTACTADO
 * Lo ejecuta el ESTUDIANTE cuando hace clic en "Contactar".
 * Envía notificación al exalumno.
 */
exports.contactar = asyncHandler(async (req, res) => {
  const data = await MatchService.transicion(
    req.params.id,
    'SUGERIDO',
    'CONTACTADO',
    { initiated_by: 'estudiante' }
  );

  try {
    const [estudianteUser, exalumnoUser] = await Promise.all([
      db.User.findByPk(data.estudiante_id, { attributes: ['nombre'] }),
      db.User.findByPk(data.exalumno_id,   { attributes: ['nombre', 'email'] }),
    ]);

    await NotificationService.createNotification(
      data.exalumno_id,
      'Solicitud de Apoyo',
      `${estudianteUser?.nombre || 'Un estudiante'} te ha enviado una solicitud de apoyo.`,
      'match_contact_request',
      data.id
    );

    if (exalumnoUser?.email) {
      await EmailService.sendStudentToAlumniEmail(
        exalumnoUser.email,
        exalumnoUser.nombre,
        estudianteUser?.nombre || 'Un estudiante'
      );
    }
  } catch (notifErr) {
    console.error('[contactar] Error enviando notificación/email:', notifErr.message);
  }

  res.status(200).json(data);
});

/**
 * CONTACTADO → ACTIVO
 * Lo ejecuta quien recibió la solicitud (exalumno si fue el estudiante quien inició,
 * o el estudiante si fue el exalumno quien ofreció).
 * Envía notificación al otro participante.
 */
exports.aceptar = asyncHandler(async (req, res) => {
  const matchBefore = await MatchService.findById(req.params.id);
  const data = await MatchService.transicion(req.params.id, 'CONTACTADO', 'ACTIVO');

  try {
    const initiatedBy = matchBefore?.initiated_by || 'estudiante';

    if (initiatedBy === 'estudiante') {
      // Exalumno aceptó → notificar al estudiante
      const exalumnoUser = await db.User.findByPk(data.exalumno_id, { attributes: ['nombre', 'email'] });
      await NotificationService.createNotification(
        data.estudiante_id,
        'Solicitud Aceptada',
        `${exalumnoUser?.nombre || 'El exalumno'} aceptó tu solicitud. ¡Ya pueden chatear!`,
        'match_accepted',
        data.id
      );
      const estudianteUser = await db.User.findByPk(data.estudiante_id, { attributes: ['nombre', 'email'] });
      if (estudianteUser?.email) {
        await EmailService.sendAcceptanceEmail(estudianteUser.email, estudianteUser.nombre);
      }
    } else {
      // Estudiante aceptó → notificar al exalumno
      const estudianteUser = await db.User.findByPk(data.estudiante_id, { attributes: ['nombre'] });
      await NotificationService.createNotification(
        data.exalumno_id,
        'Oferta Aceptada',
        `${estudianteUser?.nombre || 'El estudiante'} aceptó tu oferta de apoyo. ¡Ya pueden chatear!`,
        'match_accepted',
        data.id
      );
    }
  } catch (notifErr) {
    console.error('[aceptar] Error enviando notificación:', notifErr.message);
  }

  res.status(200).json(data);
});

/**
 * ACTIVO → CERRADO
 * Lo puede ejecutar cualquiera de los dos participantes.
 */
exports.cerrar = asyncHandler(async (req, res) => {
  const data = await MatchService.transicion(req.params.id, 'ACTIVO', 'CERRADO');
  res.status(200).json(data);
});

/**
 * CONTACTADO → CERRADO (rechazo)
 * Body: { rejectedBy: 'estudiante' | 'exalumno' }
 * Si el estudiante rechaza una oferta del exalumno, se bloquea futuras ofertas.
 */
exports.rechazar = asyncHandler(async (req, res) => {
  const match = await MatchService.findById(req.params.id);
  if (!match) return res.status(404).json({ message: 'Match no encontrado' });
  if (match.estado !== 'CONTACTADO') {
    return res.status(422).json({ message: 'Solo se pueden rechazar matches en estado CONTACTADO' });
  }

  const { rejectedBy } = req.body; // 'estudiante' | 'exalumno'
  const extra = {};
  if (rejectedBy === 'estudiante' && match.initiated_by === 'exalumno') {
    extra.rechazado_por_estudiante = true;
  }

  const data = await MatchService.transicion(req.params.id, 'CONTACTADO', 'CERRADO', extra);

  try {
    if (rejectedBy === 'estudiante') {
      const estudianteUser = await db.User.findByPk(data.estudiante_id, { attributes: ['nombre'] });
      await NotificationService.createNotification(
        data.exalumno_id,
        'Oferta Rechazada',
        `${estudianteUser?.nombre || 'El estudiante'} no pudo aceptar tu oferta en este momento.`,
        'match_rejected'
      );
    } else {
      const exalumnoUser = await db.User.findByPk(data.exalumno_id, { attributes: ['nombre'] });
      await NotificationService.createNotification(
        data.estudiante_id,
        'Solicitud No Disponible',
        `${exalumnoUser?.nombre || 'El exalumno'} no puede atender tu solicitud en este momento.`,
        'match_rejected'
      );
    }
  } catch (notifErr) {
    console.error('[rechazar] Error enviando notificación:', notifErr.message);
  }

  res.status(200).json(data);
});

/**
 * Exalumno ofrece apoyo a un estudiante directamente.
 * Body: { estudianteId, exalumnoId }
 * Crea/actualiza el match como CONTACTADO con initiated_by='exalumno',
 * envía notificación y email al estudiante.
 */
exports.ofrecerApoyo = asyncHandler(async (req, res) => {
  const { estudianteId, exalumnoId } = req.body;
  if (!estudianteId || !exalumnoId) {
    return res.status(400).json({ message: 'Se requieren estudianteId y exalumnoId' });
  }

  // Verificar si el exalumno fue rechazado anteriormente por este estudiante
  const existingMatches = await MatchService.findByEstudiante(estudianteId);
  const existingMatch = existingMatches.find(m => m.exalumno_id === exalumnoId);

  if (existingMatch?.rechazado_por_estudiante) {
    return res.status(403).json({
      message: 'Este estudiante ya rechazó una oferta anterior. No es posible ofrecer apoyo nuevamente.'
    });
  }

  let match;
  if (existingMatch) {
    if (existingMatch.estado === 'ACTIVO') {
      return res.status(409).json({ message: 'Ya existe un match activo con este estudiante.' });
    }
    if (existingMatch.estado === 'CONTACTADO') {
      return res.status(409).json({ message: 'Ya hay una solicitud pendiente con este estudiante.' });
    }
    // Reabrir match existente (SUGERIDO o CERRADO sin bloqueo)
    await MatchService.update(existingMatch.id, {
      estado: 'CONTACTADO',
      initiated_by: 'exalumno',
    });
    match = await MatchService.findById(existingMatch.id);
  } else {
    match = await MatchService.create({
      estudiante_id: estudianteId,
      exalumno_id: exalumnoId,
      score_match: 80,
      estado: 'CONTACTADO',
      initiated_by: 'exalumno',
    });
  }

  try {
    const [estudianteUser, exalumnoUser, estudiantePerfil] = await Promise.all([
      db.User.findByPk(estudianteId,       { attributes: ['nombre', 'email'] }),
      db.User.findByPk(exalumnoId,         { attributes: ['nombre'] }),
      db.Estudiante.findByPk(estudianteId, { attributes: ['proyecto_titulo'] }),
    ]);

    await NotificationService.createNotification(
      estudianteId,
      'Nueva Oferta de Apoyo',
      `${exalumnoUser?.nombre || 'Un exalumno'} te ha ofrecido apoyo.`,
      'match_offer',
      match.id
    );

    if (estudianteUser?.email) {
      await EmailService.sendAlumniToStudentEmail(
        estudianteUser.email,
        estudianteUser.nombre,
        estudiantePerfil?.proyecto_titulo || null,
        exalumnoUser?.nombre || 'Un exalumno'
      );
    }
  } catch (notifErr) {
    console.error('[ofrecerApoyo] Error enviando notificación/email:', notifErr.message);
  }

  res.status(200).json(match);
});
