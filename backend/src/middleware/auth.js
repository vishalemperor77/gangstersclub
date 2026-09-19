const { supabaseAdmin } = require('../config/supabase');

/**
 * Resolve an authenticated Supabase user from the bearer token and attach
 * the profile (role/status) to the request. Public route if no token.
 */
async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, email, role, status, avatar_url')
      .eq('id', data.user.id)
      .single();

    req.user = data.user;
    req.profile = profile || { id: data.user.id, role: 'member', status: 'pending' };
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/** Optional auth — attaches user/profile when a token is present. */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data?.user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, username, full_name, email, role, status, avatar_url')
        .eq('id', data.user.id)
        .single();
      req.user = data.user;
      req.profile = profile || null;
    }
  } catch (_) {
    /* ignore — treated as anonymous */
  }
  return next();
}

module.exports = { authRequired, optionalAuth };
