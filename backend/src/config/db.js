const { createClient } = require('@supabase/supabase-js');
const { Sequelize } = require('sequelize');
const dns = require('dns');
const { URL } = require('url');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Forzar IPv4
dns.setDefaultResultOrder('ipv4first');

// ====================
// DEBUG DATABASE URL
// ====================
if (process.env.DATABASE_URL) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`📦 DB → ${dbUrl.hostname}:${dbUrl.port} (usuario: ${dbUrl.username})`);
} else {
  console.error('❌ DATABASE_URL no está definida en .env');
}

// ====================
// SUPABASE
// ====================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Supabase client initialized.');
} else {
  console.warn(
    '⚠️ Supabase credentials missing. Please update the .env file.'
  );
}

// ====================
// SEQUELIZE
// ====================
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Silencia el SQL verboso; cambia a console.log para debug
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    // Compatibilidad con PgBouncer (Transaction Mode)
    statement_timeout: 10000,
    idle_in_transaction_session_timeout: 10000,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const PORT = process.env.PORT || 3001;

module.exports = {
  supabase,
  sequelize,
  PORT
};