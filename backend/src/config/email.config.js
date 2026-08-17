require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 465,
  secure: process.env.EMAIL_PORT == '465', // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  },
  from: process.env.EMAIL_FROM || '"Sistema de Exalumnos UCR" <no-reply@alumni.ucr.ac.cr>'
};
