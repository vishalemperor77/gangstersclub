const { supabaseAdmin } = require('../config/supabase');

/** GET /api/auth/me — current session + profile + membership */
async function me(req, res, next) {
  try {
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('id, member_id, status, level, member_since')
      .eq('user_id', req.user.id)
      .single();

    const { data: application } = await supabaseAdmin
      .from('membership_applications')
      .select('id, status, rejection_reason, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.json({
      user: { id: req.user.id, email: req.user.email },
      profile: req.profile,
      membership,
      application,
    });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/auth/forgot-password — triggers Supabase recovery email */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(422).json({ error: 'Email is required' });

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password`,
    });
    if (error) return res.status(400).json({ error: error.message });

    // Always respond positively to avoid email enumeration.
    return res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { me, forgotPassword };
