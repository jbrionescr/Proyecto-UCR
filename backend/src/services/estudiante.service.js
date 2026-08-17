const EstudianteRepository = require('../repositories/estudiante.repository');

class EstudianteService {
  async findAll() {
    return await EstudianteRepository.findAll();
  }

  async findById(id) {
    return await EstudianteRepository.findById(id);
  }

  async create(data) {
    return await EstudianteRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await EstudianteRepository.update(id, data);
    if (!updated) return null;
    return await EstudianteRepository.findById(id);
  }

  async delete(id) {
    const deleted = await EstudianteRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new EstudianteService();
