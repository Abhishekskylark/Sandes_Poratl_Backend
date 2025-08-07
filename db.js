const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sandes_Old_Database',
  password: 'Singhabhishek@512',
  port: 5432,
});
module.exports = pool;