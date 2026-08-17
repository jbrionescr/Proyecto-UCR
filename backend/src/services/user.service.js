const UserRepository = require('../repositories/user.repository');

class UserService {
  async findAll() {
    return await UserRepository.findAll();
  }

  async findById(id) {
    const user = await UserRepository.findById(id);
    if (user && !user.email_verified) {
      const { supabase } = require('../config/db');
      const { data, error } = await supabase.auth.admin.getUserById(id);
      if (!error && data && data.user && data.user.email_confirmed_at) {
        await UserRepository.update(id, { email_verified: true, activo: true });
        user.email_verified = true;
        user.activo = true;
      }
    }
    return user;
  }

  async create(data) {
    return await UserRepository.create(data);
  }

  async update(id, data) {
    const [updated] = await UserRepository.update(id, data);
    if (!updated) return null;
    return await UserRepository.findById(id);
  }

  async delete(id) {
    const deleted = await UserRepository.delete(id);
    return !!deleted;
  }
}

module.exports = new UserService();
