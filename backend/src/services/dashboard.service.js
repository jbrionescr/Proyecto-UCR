const { 
  Estudiante, 
  Exalumno, 
  User, 
  Posicion, 
  Aplicacion, 
  Donacion, 
  Connection 
} = require('../models');

class DashboardService {
  async getMetrics() {
    try {
      const [
        students,
        graduates,
        jobs,
        applications,
        donations,
        acceptedRequests,
        rejectedRequests,
        activeUsers,
        companies
      ] = await Promise.all([
        Estudiante.count(),
        Exalumno.count(),
        Posicion.count(),
        Aplicacion.count(),
        Donacion ? Donacion.count() : Promise.resolve(0),
        Connection.count({ where: { status: 'accepted' } }),
        Connection.count({ where: { status: 'rejected' } }),
        User.count({ where: { activo: true } }),
        Posicion.count({ distinct: true, col: 'empresa' }).catch(() => 0) // Approximation if EMPRESA table doesn't exist
      ]);

      return {
        students,
        graduates,
        companies: companies || 0,
        jobs,
        applications,
        donations,
        events: 0, // Event model doesn't exist yet
        acceptedRequests,
        rejectedRequests,
        activeUsers
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
