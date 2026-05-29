const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase backend client is not configured");
}

// This service-role client is backend-only and bypasses RLS. Use it only after
// verifying a user token or trusted webhook; never expose this key to frontend.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  // The service client is not a logged-in browser user, so it should not manage
  // persisted auth sessions or refresh user tokens.
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
