const { supabaseAdmin } = require('../config/supabase');
const config = require('../config/env');
const { logActivity } = require('../utils/activity');
const { publicAppFields } = require('./applicationController');

/** GET /api/admin/applications?status=&page=&limit=&search= */
async function listApplications(req, res, next) {
  try {
    const { page, limit, search, status } = req.validated;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('membership_applications')
      .select('id, application_code, full_name, username, email, city, profile_photo_url, status, created_at, reviewed_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,application_code.ilike.%${search}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) return next(error);

    return res.json({
      items: data,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/admin/applications/:id */
async function getApplication(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('membership_applications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Application not found' });
    return res.json({ application: publicAppFields(data) });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/admin/applications/:id/approve */
async function approveApplication(req, res, next) {
  try {
    const adminId = req.profile.id;
    const applicationId = req.params.id;

    const { error } = await supabaseAdmin.rpc('approve_application', {
      p_application_id: applicationId,
      p_admin_id: adminId,
      p_public_url: config.publicUrl,
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data: app } = await supabaseAdmin
      .from('membership_applications')
      .select('full_name, email')
      .eq('id', applicationId)
      .single();

    logActivity({
      adminId,
      action: 'application.approved',
      target: app?.full_name || 'application',
      targetId: applicationId,
      metadata: { email: app?.email },
    });

    return res.json({ message: 'Application approved. Member account activated.' });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/admin/applications/:id/reject */
async function rejectApplication(req, res, next) {
  try {
    const adminId = req.profile.id;
    const applicationId = req.params.id;
    const reason = (req.body?.reason || '').slice(0, 500);

    const { error } = await supabaseAdmin.rpc('reject_application', {
      p_application_id: applicationId,
      p_admin_id: adminId,
      p_reason: reason,
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data: app } = await supabaseAdmin
      .from('membership_applications')
      .select('full_name, email')
      .eq('id', applicationId)
      .single();

    logActivity({
      adminId,
      action: 'application.rejected',
      target: app?.full_name || 'application',
      targetId: applicationId,
      metadata: { email: app?.email, reason },
    });

    return res.json({ message: 'Application rejected.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listApplications, getApplication, approveApplication, rejectApplication };
