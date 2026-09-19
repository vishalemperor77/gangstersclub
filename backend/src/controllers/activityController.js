const { supabaseAdmin } = require('../config/supabase');

/** ADMIN: GET /api/admin/activity?page=&limit= */
async function listActivity(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const from = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('activity_logs')
      .select('id, admin_id, action, target, target_id, metadata, created_at, profiles!left(full_name, username)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) return next(error);

    const items = (data || []).map((row) => {
      const admin = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const { profiles, ...rest } = row;
      return { ...rest, admin_name: admin?.full_name || 'Administrator' };
    });

    return res.json({ items, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listActivity };
