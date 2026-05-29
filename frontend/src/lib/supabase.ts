import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Browser Supabase client. This uses the publishable key and remains subject to
// RLS; service-role access only exists in the Express backend.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
