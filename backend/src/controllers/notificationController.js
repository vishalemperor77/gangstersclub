const { supabaseAdmin } = require('../config/supabase');

/** MEMBER: GET /api/notifications */
async function listNotifications(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('notifications')
      .select('id, type, title, body, read, created_at', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) return next(error);

    const { count: unread } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('read', false);

    return res.json({ items: data, unread: unread ?? 0, total: count ?? 0, page, limit });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: POST /api/notifications/read */
async function markAllRead(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id)
      .eq('read', false);
    if (error) return next(error);
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: POST /api/notifications/:id/read */
async function markOneRead(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) return next(error);
    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listNotifications, markAllRead, markOneRead, adminNotify };

/** ADMIN: POST /api/admin/notifications — notify one member or all members. */
async function adminNotify(req, res, next) {
  try {
    const { user_id, title, body } = req.body || {};
    if (!title || title.trim().length < 3) return res.status(422).json({ error: 'A title is required' });
    if (!body || body.trim().length < 5) return res.status(422).json({ error: 'A message is required' });

    const payload = {
      type: 'general',
      title: String(title).slice(0, 160),
      body: String(body).slice(0, 2000),
    };

    if (user_id && user_id !== 'all') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, status')
        .eq('id', user_id)
        .single();
      if (!profile) return res.status(404).json({ error: 'Member not found' });

      const { error } = await supabaseAdmin.from('notifications').insert({ user_id, ...payload });
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ message: 'Notification sent.', recipients: 1 });
    }

    const { data: members } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'member')
      .eq('status', 'active');

    if (!members || members.length === 0) return res.json({ message: 'No active members to notify.', recipients: 0 });

    const { error } = await supabaseAdmin
      .from('notifications')
      .insert(members.map((m) => ({ user_id: m.id, ...payload })));
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ message: 'Notification sent to all active members.', recipients: members.length });
  } catch (err) {
    return next(err);
  }
}
