const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  const { rows } = await pool.query('SELECT name, COUNT(*) FROM "customers" GROUP BY name HAVING COUNT(*) > 1');
  console.log('DUPE CUSTOMERS:', rows);
  pool.end();
}
main().catch(console.error);
