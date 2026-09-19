const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');

/** MEMBER: GET /api/member/profile */
async function getMyProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, email, avatar_url, phone, city, date_of_birth, bio, status, created_at')
      .eq('id', req.user.id)
      .single();
    if (error) return next(error);
    return res.json({ profile: data });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: PATCH /api/member/profile */
async function updateMyProfile(req, res, next) {
  try {
    const allowed = ['username', 'full_name', 'avatar_url', 'phone', 'city', 'date_of_birth', 'bio'];
    const updates = {};
    Object.keys(req.body || {}).forEach((k) => {
      if (allowed.includes(k) && typeof req.body[k] === 'string') updates[k] = req.body[k].slice(0, 2000);
    });
    if (updates.username) {
      const { data: clash } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', req.user.id)
        .maybeSingle();
      if (clash) return res.status(409).json({ error: 'That username is already taken.', fields: { username: 'Username is already taken' } });
    }

    const { data, error } = await supabaseAdmin.from('profiles').update(updates).eq('id', req.user.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ profile: data });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile };
