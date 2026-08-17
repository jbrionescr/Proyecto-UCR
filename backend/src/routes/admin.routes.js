const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { requireRole } = require('../middlewares/role.middleware');
const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase admin usando la service key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // Match the actual .env variable name
);

// GET /api/admin/kpis — Solo ADMINISTRADOR
router.get('/kpis', requireRole('ADMINISTRADOR', 'ADMIN'), asyncHandler(async (req, res) => {
  // Conteos en paralelo vía Supabase REST API
  const [
    estudiantesRes,
    exalumnosRes,
    posicionesRes,
    donacionesPendientesRes,
    donacionesVerificadasRes
  ] = await Promise.all([
    supabase.from('Estudiantes').select('*', { count: 'exact', head: true }),
    supabase.from('Exalumnos').select('*', { count: 'exact', head: true }),
    supabase.from('Posiciones').select('*', { count: 'exact', head: true }).eq('estado', 'ACTIVO'),
    supabase.from('Donaciones').select('id, monto, destino, exalumno_id').eq('estado', 'PENDIENTE'),
    supabase.from('Donaciones').select('monto').eq('estado', 'VERIFICADO')
  ]);

  const totalDonado = donacionesVerificadasRes.data
    ? donacionesVerificadasRes.data
        .reduce((acc, d) => acc + (parseFloat(d.monto) || 0), 0)
        .toLocaleString('es-CR')
    : '0';

  res.json({
    totalDonado,
    estudiantesActivos: estudiantesRes.count || 0,
    exalumnosActivos: exalumnosRes.count || 0,
    posicionesActivas: posicionesRes.count || 0,
    donacionesPendientes: donacionesPendientesRes.data || []
  });
}));

// GET /api/admin/alumni-pending — Exalumnos pendientes de aprobación
router.get('/alumni-pending', requireRole('ADMINISTRADOR', 'ADMIN'), asyncHandler(async (req, res) => {
  const db = require('../models');
  
  const pendingAlumni = await db.User.findAll({
    where: { 
      tipo: 'EXALUMNO', 
      activo: false 
    },
    include: [
      { 
        model: db.Exalumno, 
        required: false,
        attributes: ['escuela_facultad', 'anio_graduacion']
      }
    ],
    attributes: ['id', 'email', 'nombre', 'email_verified', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.json({
    totalPending: pendingAlumni.length,
    alumni: pendingAlumni
  });
}));

module.exports = router;
