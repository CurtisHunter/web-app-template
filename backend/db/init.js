require("dotenv").config();
const pool = require("./pool");

async function initializeDatabase() {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name VARCHAR(30) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
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
