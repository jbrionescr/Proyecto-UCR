const MatchRepository = require('../repositories/match.repository');

class MatchService {
  async findAll() {
    return await MatchRepository.findAll();
  }

  async findById(id) {
    return await MatchRepository.findById(id);
  }

  async findByEstudiante(estudianteId) {
    return await MatchRepository.findByEstudiante(estudianteId);
  }

  async findByExalumno(exalumnoId) {
    return await MatchRepository.findByExalumno(exalumnoId);
  }

  async create(data) {
    return await MatchRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await MatchRepository.update(id, data);
    if (!updated) return null;
    return await MatchRepository.findById(id);
  }

  async delete(id) {
    return !!(await MatchRepository.delete(id));
  }

  /**
   * Ejecuta una transición de estado con validación.
   * @param {string} id - UUID del match
   * @param {string} estadoRequerido - Estado que debe tener actualmente
   * @param {string} estadoNuevo - Estado al que se quiere mover
   */
  async transicion(id, estadoRequerido, estadoNuevo, extraData = {}) {
    const match = await MatchRepository.findById(id);
    if (!match) {
      const err = new Error('Match no encontrado');
      err.status = 404;
      throw err;
    }
    if (match.estado !== estadoRequerido) {
      const err = new Error(`Transición inválida: el match está en estado "${match.estado}", se requiere "${estadoRequerido}"`);
      err.status = 422;
      throw err;
    }
    const [updated] = await MatchRepository.update(id, { estado: estadoNuevo, ...extraData });
    if (!updated) throw new Error('No se pudo actualizar el match');
    return await MatchRepository.findById(id);
  }
}

module.exports = new MatchService();
