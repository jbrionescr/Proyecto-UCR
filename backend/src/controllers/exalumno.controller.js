const ExalumnoService = require('../services/exalumno.service');
const asyncHandler = require('../utils/asyncHandler');
const { supabase } = require('../config/db');

exports.findAll = asyncHandler(async (req, res) => {
  // Parse filters from query params
  const { search, carrera, sector, pais_ciudad, apoyo } = req.query;
  const filters = { search, carrera, sector, pais_ciudad, apoyo };
  
  const data = await ExalumnoService.findAll(filters);
  res.status(200).json(data);
});

exports.findById = asyncHandler(async (req, res) => {
  // Try to resolve logged-in user id to check connection state
  let requestingUserId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined' && token !== 'null') {
      try {
        const { data } = await supabase.auth.getUser(token);
        if (data?.user) {
          requestingUserId = data.user.id;
        }
      } catch (error) {
        console.warn('Could not resolve optional user token in findById:', error.message);
      }
    }
  }

  const data = await ExalumnoService.findById(req.params.id, requestingUserId);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.create = asyncHandler(async (req, res) => {
  const data = await ExalumnoService.create(req.body);
  res.status(201).json(data);
});

exports.update = asyncHandler(async (req, res) => {
  const data = await ExalumnoService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: 'Not found' });
  res.status(200).json(data);
});

exports.delete = asyncHandler(async (req, res) => {
  const deleted = await ExalumnoService.delete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});
