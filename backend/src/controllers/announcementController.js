const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');

/** PUBLIC/MEMBER: GET /api/announcements */
async function listAnnouncements(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const isActiveMember = req.profile?.status === 'active' || req.profile?.role === 'admin';

    let query = supabaseAdmin
      .from('announcements')
      .select('id, title, content, priority, target, status, published_at, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (!isActiveMember) query = query.eq('target', 'public');

    const { data, error, count } = await query.range(from, to);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: GET /api/admin/announcements */
async function listAdminAnnouncements(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabaseAdmin
      .from('announcements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.status && req.query.status !== 'all') query = query.eq('status', req.query.status);

    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: POST /api/admin/announcements */
async function createAnnouncement(req, res, next) {
  try {
    const body = { ...req.validated };
    if (body.status === 'published') body.published_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from('announcements').insert(body).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    // Fan out notifications to members when published to all members.
    if (body.status === 'published' && body.target === 'all_members') {
      const { data: members } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'member')
        .eq('status', 'active');

      if (members && members.length) {
        const rows = members.map((m) => ({
          user_id: m.id,
          type: 'announcement',
          title: data.title,
          body: data.content.slice(0, 180),
        }));
        await supabaseAdmin.from('notifications').insert(rows);
      }
    }

    logActivity({ adminId: req.profile.id, action: 'announcement.created', target: data.title, targetId: data.id });

    return res.status(201).json({ announcement: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: PATCH /api/admin/announcements/:id */
async function updateAnnouncement(req, res, next) {
  try {
    const body = { ...req.validated };
    const id = req.params.id;

    const { data: current } = await supabaseAdmin.from('announcements').select('status, target, title').eq('id', id).single();
    if (!current) return res.status(404).json({ error: 'Announcement not found' });

    if (body.status === 'published' && current.status !== 'published') body.published_at = new Date().toISOString();
    if (body.status && body.status !== 'published') body.published_at = null;

    const { data, error } = await supabaseAdmin.from('announcements').update(body).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    if (body.status === 'published' && current.status !== 'published' && data.target === 'all_members') {
      const { data: members } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'member')
        .eq('status', 'active');
      if (members && members.length) {
        await supabaseAdmin
          .from('notifications')
          .insert(members.map((m) => ({ user_id: m.id, type: 'announcement', title: data.title, body: data.content.slice(0, 180) })));
      }
    }

    logActivity({ adminId: req.profile.id, action: 'announcement.updated', target: data.title, targetId: id });

    return res.json({ announcement: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: DELETE /api/admin/announcements/:id */
async function deleteAnnouncement(req, res, next) {
  try {
    const { error } = await supabaseAdmin.from('announcements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'announcement.deleted', target: req.params.id });

    return res.json({ message: 'Announcement deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listAnnouncements,
  listAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
