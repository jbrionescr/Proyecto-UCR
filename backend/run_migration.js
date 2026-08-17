require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/db');

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connected to database.');

    const sqlPath = path.join(__dirname, 'src', 'migrations', 'connections_notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration SQL...');
    // Simple parsing to split by semicolon, ignoring comments
    const lines = sql.split('\n');
    let currentQuery = '';
    const queries = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--') || !trimmed) {
        continue;
      }
      currentQuery += line + '\n';
      if (trimmed.endsWith(';')) {
        queries.push(currentQuery.trim());
        currentQuery = '';
      }
    }

    for (let i = 0; i < queries.length; i++) {
      console.log(`Executing query ${i + 1}/${queries.length}:`);
      console.log(queries[i]);
      await sequelize.query(queries[i]);
    }

    console.log('✅ Migration executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
