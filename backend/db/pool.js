const { Pool } = require("pg");

// Plain pg pool for local/manual database scripts. The main Supabase app access
// uses backend/lib/supabase.js so it can rely on Supabase Auth and service role.
module.exports = new Pool({
  connectionString: process.env.DB_URL,
});
