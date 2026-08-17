const { supabase } = require('../config/db');
const { sendMagicLinkEmailJS, sendAlumniPendingEmail, sendPasswordReset, sendAlumniApprovedEmail } = require('../config/email');
const db = require('../models');

// Validación de contraseña: mínimo 8 chars, una mayúscula y un número
const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

// Generar contraseña temporal segura (10 caracteres, sin caracteres especiales HTML)
// Se evitan &, <, >, ", ' para que no se distorsionen al mostrarse en el email HTML
const generateTemporaryPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  const all = uppercase + lowercase + numbers;
  for (let i = 0; i < 8; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password.split('').sort(() => Math.random() - 0.5).join('');
};

class AuthService {

  /**
   * RF-01: Registro de Estudiante
   * Solo permite correos @ucr.ac.cr. Envía magic link de verificación.
   */
  async registerStudent({ email, nombre, password, cedula, fecha_nacimiento, genero, carnet_ucr, carrera, escuela_facultad, sede, anio_ingreso, nivel_academico, promedio_ponderado }) {
    // Validaciones
    // Nota: Se quitó la restricción de @ucr.ac.cr temporalmente por solicitud
    /*if (!isUCREmail(email)) {
      throw { status: 400, message: 'Solo se permiten correos institucionales @ucr.ac.cr para estudiantes.' };
    }*/
    if (!nombre || nombre.trim().length < 3) {
      throw { status: 400, message: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (!isValidPassword(password)) {
      throw { status: 400, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.' };
    }

    // Verificar si ya existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'Ya existe una cuenta con este correo.' };
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Requiere verificación vía magic link
      user_metadata: { nombre, tipo: 'ESTUDIANTE' }
    });

    if (authError) {
      throw { status: 500, message: 'Error al crear cuenta: ' + authError.message };
    }

    // Crear registro en nuestra BD
    await db.User.create({
      id: authData.user.id,
      email,
      nombre: nombre.trim(),
      tipo: 'ESTUDIANTE',
      email_verified: false,
      activo: true,
      cedula,
      fecha_nacimiento,
      genero
    });

    // Crear perfil de estudiante con información académica
    await db.Estudiante.create({ 
      user_id: authData.user.id,
      carnet_ucr,
      carrera,
      escuela_facultad,
      sede,
      anio_ingreso: anio_ingreso ? parseInt(anio_ingreso) : null,
      nivel_academico,
      promedio_ponderado: promedio_ponderado ? parseFloat(promedio_ponderado) : null
    });

    // Generar token de verificación y enviarlo
    // Guardar token en metadata de Supabase (o usar Supabase's own magic link)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/completar-perfil`
      }
    });

    if (linkError) {
      throw { status: 500, message: 'Error generando enlace de verificación: ' + linkError.message };
    }

    await sendMagicLinkEmailJS(email, linkData.properties.action_link, nombre.trim());

    return {
      message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta. El enlace expira en 24 horas.',
      userId: authData.user.id,
    };
  }

  /**
   * RF-01: Registro de Exalumno
   * Permite cualquier correo. El perfil queda pendiente de verificación admin.
   */
  async registerAlumni({ email, nombre, password, carrera, escuela_facultad, anio_graduacion, cedula, fecha_nacimiento, genero }) {
    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
      throw { status: 400, message: 'El nombre debe tener al menos 3 caracteres.' };
    }
    if (!isValidPassword(password)) {
      throw { status: 400, message: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número.' };
    }
    const currentYear = new Date().getFullYear();
    if (!anio_graduacion || anio_graduacion < 1940 || anio_graduacion > currentYear) {
      throw { status: 400, message: `El año de graduación debe estar entre 1940 y ${currentYear}.` };
    }
    if (!carrera) {
      throw { status: 400, message: 'Debe seleccionar al menos una carrera.' };
    }

    // Verificar si ya existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'Ya existe una cuenta con este correo.' };
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // El exalumno confirma correo pero queda pendiente de admin
      user_metadata: { nombre, tipo: 'EXALUMNO' }
    });

    if (authError) {
      throw { status: 500, message: 'Error al crear cuenta: ' + authError.message };
    }

    // Crear usuario en BD con estado PENDIENTE
    await db.User.create({
      id: authData.user.id,
      email,
      nombre: nombre.trim(),
      tipo: 'EXALUMNO',
      email_verified: true,
      activo: false, // Pendiente de aprobación por admin
      cedula,
      fecha_nacimiento,
      genero
    });

    // Crear perfil de exalumno
    await db.Exalumno.create({
      user_id: authData.user.id,
      escuela_facultad,
      anio_graduacion: parseInt(anio_graduacion),
    });

    await sendAlumniPendingEmail(email, nombre.trim());

    return {
      message: 'Registro exitoso. Tu perfil está siendo verificado por la Fundación. Te notificaremos en máximo 48 horas.',
      userId: authData.user.id,
    };
  }

  /**
   * RF-01: Login con correo y contraseña
   */
  async login({ email, password }) {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error || !data?.session) {
    throw {
      status: 401,
      message: error?.message || 'Correo o contraseña incorrectos.'
    };
  }

  // Buscar usuario en tu BD
  const user = await db.User.findOne({
    where: { email }
  });

  if (!user) {
    throw {
      status: 404,
      message: 'Usuario no encontrado en el sistema.'
    };
  }

  // Sincronizar verificación con Supabase
  if (!user.email_verified) {

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(user.id);

    if (
      !authError &&
      authUser?.user?.email_confirmed_at
    ) {

      await db.User.update(
        {
          email_verified: true
        },
        {
          where: {
            id: user.id
          }
        }
      );

      user.email_verified = true;

    } else {

      throw {
        status: 403,
        message: 'Debes verificar tu correo antes de iniciar sesión.'
      };

    }
  }

  if (!user.activo) {
    throw {
      status: 403,
      message: 'Tu cuenta está pendiente de verificación o ha sido suspendida.'
    };
  }

  const session = data.session;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      tipo: user.tipo,
      foto_url: user.foto_url
    }
  };
}

  /**
   * RF-01: Reenviar magic link (expira en 24 horas)
   */
  async resendMagicLink({ email }) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      throw { status: 404, message: 'No existe una cuenta con este correo.' };
    }
    if (user.email_verified) {
      throw { status: 400, message: 'Este correo ya fue verificado.' };
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/completar-perfil`
      }
    });

    if (linkError) {
      throw { status: 500, message: 'Error generando enlace de verificación: ' + linkError.message };
    }

    await sendMagicLinkEmailJS(email, linkData.properties.action_link, user.nombre);

    return { message: 'Magic link reenviado. Revisa tu bandeja de entrada.' };
  }

  /**
   * RF-01: Recuperación de contraseña
   * Genera contraseña temporal, la actualiza en Supabase y envía por email
   */
  async forgotPassword({ email }) {
    // No revelar si el correo existe por seguridad
    const user = await db.User.findOne({ where: { email } });
    if (user) {
      const tempPassword = generateTemporaryPassword();

      // Actualizar contraseña en Supabase Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: tempPassword, email_confirm: true }
      );

      if (updateError) {
        console.error('Error actualizando contraseña en Supabase:', updateError);
        throw { status: 500, message: 'Error al procesar la recuperación de contraseña.' };
      }

      // Enviar email solo si Supabase actualizó correctamente
      try {
        await sendPasswordReset(email, user.nombre, tempPassword);
      } catch (emailError) {
        console.error('Error enviando email de recuperación:', emailError);
        // El email falló pero la contraseña sí se actualizó; no revelar al usuario
      }
    }
    return { message: 'Si existe una cuenta con ese correo, recibirás tu contraseña temporal por email.' };
  }

  /**
   * Obtener datos del usuario autenticado actual
   */
  async getMe(supabaseUser) {
    const user = await db.User.findOne({
      where: { email: supabaseUser.email },
      include: [
        { model: db.Estudiante, required: false },
        { model: db.Exalumno, required: false },
      ]
    });
    if (!user) {
      throw { status: 404, message: 'Usuario no encontrado.' };
    }
    return user;
  }

  /**
   * Admin: verificar y activar un exalumno
   * Envía correo de confirmación cuando se aprueba
   */
  async approveAlumni(userId) {
    // Obtener datos del exalumno antes de actualizar
    const user = await db.User.findOne({
      where: { id: userId, tipo: 'EXALUMNO' }
    });
    if (!user) throw { status: 404, message: 'Exalumno no encontrado.' };

    // Activar el usuario
    const [updated] = await db.User.update(
      { activo: true },
      { where: { id: userId, tipo: 'EXALUMNO' } }
    );
    if (!updated) throw { status: 404, message: 'No se pudo actualizar el exalumno.' };

    // Enviar correo de aprobación
    try {
      await sendAlumniApprovedEmail(user.email, user.nombre);
    } catch (emailError) {
      console.error('Error al enviar correo de aprobación:', emailError);
      // No fallar la aprobación si falla el email
    }

    return { message: 'Perfil de exalumno aprobado y correo enviado.' };
  }
}

module.exports = new AuthService();
