const ReporteperfilRepository = require('../repositories/reporteperfil.repository');
const db = require('../models');
const { sendAccountSuspendedEmail } = require('../config/email');
const User = db.User;

class ReporteperfilService {
  async findAll() {
    return await ReporteperfilRepository.findAll();
  }

  async findById(id) {
    return await ReporteperfilRepository.findById(id);
  }

  async create(data) {
    const report = await ReporteperfilRepository.create(data);
    
    // Auto-suspension logic
    if (data.perfil_reportado) {
      const user = await User.findByPk(data.perfil_reportado);
      if (user) {
        user.reportes_recibidos = (user.reportes_recibidos || 0) + 1;
        
        if (user.reportes_recibidos >= 3 && user.status !== 'SUSPENDIDO') {
          user.status = 'SUSPENDIDO';
          user.activo = false;
          // Send notification to admin (hardcoded admin email for now or from env)
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@alumni.ucr.ac.cr';
          await sendAccountSuspendedEmail(adminEmail, user.nombre, user.email, user.reportes_recibidos);
        }
        await user.save();
      }
    }
    
    return report;
  }

  async update(id, data) {
    const [updated] = await ReporteperfilRepository.update(id, data);
    if (!updated) return null;
    return await ReporteperfilRepository.findById(id);
  }

  async delete(id) {
    const deleted = await ReporteperfilRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new ReporteperfilService();
