const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Sandes_Old_database',
  password: 'Singhabhishek@512',
  port: 5432,
});
module.exports = pool;