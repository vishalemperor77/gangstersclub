const { supabaseAdmin } = require('../config/supabase');

function publicAppFields(a) {
  return {
    id: a.id,
    application_code: a.application_code,
    full_name: a.full_name,
    username: a.username,
    email: a.email,
    phone: a.phone,
    city: a.city,
    date_of_birth: a.date_of_birth,
    profile_photo_url: a.profile_photo_url,
    introduction: a.introduction,
    motivation: a.motivation,
    status: a.status,
    rejection_reason: a.rejection_reason,
    created_at: a.created_at,
    reviewed_at: a.reviewed_at,
  };
}

/** POST /api/applications — public submission */
async function submitApplication(req, res, next) {
  try {
    const data = req.validated;

    // Gate on the authenticated user (applicants register first).
    if (!req.profile) return res.status(401).json({ error: 'Authentication required' });

    // One pending application per account.
    const { data: existing } = await supabaseAdmin
      .from('membership_applications')
      .select('id, status')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing && existing.status === 'pending') {
      return res.status(409).json({ error: 'You already have an application under review.', code: 'ALREADY_PENDING' });
    }

    // Username must be unique.
    const { data: clash } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', data.username)
      .neq('id', req.user.id)
      .maybeSingle();
    if (clash) return res.status(409).json({ error: 'That username is already taken.', fields: { username: 'Username is already taken' } });

    const payload = {
      user_id: req.user.id,
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      date_of_birth: data.date_of_birth || null,
      profile_photo_url: data.profile_photo_url || null,
      introduction: data.introduction,
      motivation: data.motivation,
      terms_accepted: true,
      status: 'pending',
    };

    const { data: app, error } = await supabaseAdmin
      .from('membership_applications')
      .insert(payload)
      .select('*')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    // Keep the profile in sync.
    await supabaseAdmin
      .from('profiles')
      .update({
        full_name: data.full_name,
        username: data.username,
        phone: data.phone || null,
        city: data.city || null,
        date_of_birth: data.date_of_birth || null,
        avatar_url: data.profile_photo_url || null,
      })
      .eq('id', req.user.id);

    return res.status(201).json({
      message: 'Your application has been submitted successfully.',
      application: publicAppFields(app),
    });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/applications/mine — applicant status lookup */
async function myApplication(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('membership_applications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return next(error);
    if (!data) return res.status(404).json({ error: 'No application found' });

    return res.json({ application: publicAppFields(data) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitApplication, myApplication, publicAppFields };
