require("dotenv").config();
const pool = require("./pool");

async function initializeDatabase() {
  // Local helper for the old/simple Postgres setup. In the Supabase setup,
  // production table/RLS changes are made in the Supabase SQL editor.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY,
      name VARCHAR(30),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    `);
  console.log("Database initialized");
}

initializeDatabase()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    pool.end();
  });
