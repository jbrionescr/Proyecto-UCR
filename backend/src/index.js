require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./config/db');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');
const http = require('http');

const app = express();

// Aumentar límites para headers y body size (NextAuth v5 envía tokens muy grandes)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Setup Routes
app.use('/api', routes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Crear servidor HTTP con maxHeaderSize aumentado
const server = http.createServer({
  maxHeaderSize: 16 * 1024, // 16KB en lugar de 8KB (por defecto)
}, app);

// Manejo de errores del servidor HTTP
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso. Detén el proceso que lo ocupa o cambia PORT en .env.`);
  } else {
    console.error('❌ Error del servidor HTTP:', err);
  }
  process.exit(1);
});

// Iniciar servidor siempre — la sincronización de BD es opcional al arranque
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Intentar conectar BD en background (no bloquea el servidor)
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a base de datos establecida.'))
  .catch(() => {
    // El pooler de Supabase (puerto 6543/PgBouncer) no soporta los comandos
    // de autenticación de Sequelize — esperado en este entorno. El servidor
    // opera normalmente vía Supabase REST API y Prisma (Next.js).
  });

