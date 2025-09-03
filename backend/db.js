// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Preferir a URL pooler do Neon (DATABASE_URL).
// Faz fallback para variáveis separadas (útil no dev local).
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}` +
  `@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'constru'}?sslmode=require`;

const pool = new Pool({
  connectionString,
  // Neon precisa de SSL; este objeto evita erro de CA local.
  ssl: { rejectUnauthorized: false },
  // (opcional) ajuste de pool:
  // max: 10,
  // idleTimeoutMillis: 30000,
});

module.exports = pool;
// opcional: exportar helper
// module.exports.query = (text, params) => pool.query(text, params);
