/**
 * Bootstrap the initial administrator.
 *
 *   npm run seed
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env
 * The admin role is stored in the database (profiles.role = 'admin').
 * No admin credentials live in source code.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL || 'admin@gangstersclub.com';
const password = process.env.SEED_ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('Set SEED_ADMIN_PASSWORD (min 8 chars) in .env before seeding.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  // Look for an existing user with this email.
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = (existing?.users || []).find((u) => u.email === email);

  let userId;

  if (found) {
    userId = found.id;
    console.log(`Existing auth user found: ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: 'admin', full_name: 'Club Administrator' },
    });
    if (error) {
      console.error('Failed to create admin user:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Admin auth user created: ${email}`);
  }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        username: 'admin',
        full_name: 'Club Administrator',
        email,
        role: 'admin',
        status: 'active',
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (pErr) {
    console.error('Failed to upsert admin profile:', pErr.message);
    process.exit(1);
  }

  console.log(`Admin profile ready — role=${profile.role}, status=${profile.status}`);
  console.log('Log in at the admin dashboard with these credentials.');
  process.exit(0);
})();
