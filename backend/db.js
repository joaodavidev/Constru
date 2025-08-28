const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'constru',
  port: Number(process.env.PGPORT || 5432),
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
