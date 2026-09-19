const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

// SERVICE-ROLE client. Server side only. Bypasses RLS.
// Never import this into frontend code.
const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ANON client — respects RLS. Used for public flows (verification lookups).
const supabasePublic = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin, supabasePublic };
