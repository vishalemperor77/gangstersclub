const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');

/** PUBLIC: GET /api/events */
async function listPublicEvents(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const from = (page - 1) * limit;

    const isActiveMember = req.profile?.status === 'active' || req.profile?.role === 'admin';

    let query = supabaseAdmin
      .from('events')
      .select('id, title, description, event_date, event_time, location, cover_image_url, visibility, rsvp_enabled', { count: 'exact' })
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (!isActiveMember) query = query.eq('visibility', 'public');

    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: GET /api/admin/events */
async function listAdminEvents(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabaseAdmin
      .from('events')
      .select('*', { count: 'exact' })
      .order('event_date', { ascending: false });

    if (req.query.status && req.query.status !== 'all') query = query.eq('status', req.query.status);

    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: POST /api/admin/events */
async function createEvent(req, res, next) {
  try {
    const body = { ...req.validated };
    if (body.status === 'published') body.published_at = null;

    const { data, error } = await supabaseAdmin.from('events').insert(body).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    if (body.status === 'published') {
      const { data: members } = await supabaseAdmin.from('profiles').select('id').eq('role', 'member').eq('status', 'active');
      if (members?.length) {
        await supabaseAdmin
          .from('notifications')
          .insert(members.map((m) => ({ user_id: m.id, type: 'event', title: `New event: ${data.title}`, body: data.description.slice(0, 180) })));
      }
    }

    logActivity({ adminId: req.profile.id, action: 'event.created', target: data.title, targetId: data.id });
    return res.status(201).json({ event: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: PATCH /api/admin/events/:id */
async function updateEvent(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('events').update(req.validated).eq('id', req.params.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'event.updated', target: data.title, targetId: data.id });
    return res.json({ event: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: DELETE /api/admin/events/:id */
async function deleteEvent(req, res, next) {
  try {
    const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'event.deleted', target: req.params.id });
    return res.json({ message: 'Event deleted' });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: GET /api/events/:id/rsvp */
async function getRsvp(req, res, next) {
  try {
    const { data } = await supabaseAdmin
      .from('event_rsvps')
      .select('id, status, created_at')
      .eq('event_id', req.params.id)
      .eq('user_id', req.user.id)
      .maybeSingle();

    return res.json({ rsvp: data });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: POST /api/events/:id/rsvp */
async function setRsvp(req, res, next) {
  try {
    const status = req.body?.status === 'not_going' ? 'not_going' : 'going';

    const { data: event } = await supabaseAdmin
      .from('events')
      .select('id, title, rsvp_enabled, status, visibility')
      .eq('id', req.params.id)
      .single();
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.rsvp_enabled) return res.status(400).json({ error: 'RSVP is not enabled for this event' });

    const { data, error } = await supabaseAdmin
      .from('event_rsvps')
      .upsert({ event_id: req.params.id, user_id: req.user.id, status }, { onConflict: 'event_id,user_id' })
      .select('id, status')
      .single();
    if (error) return res.status(400).json({ error: error.message });

    return res.json({ rsvp: data });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: DELETE /api/events/:id/rsvp */
async function cancelRsvp(req, res, next) {
  try {
    await supabaseAdmin.from('event_rsvps').delete().eq('event_id', req.params.id).eq('user_id', req.user.id);
    return res.json({ message: 'RSVP cancelled' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPublicEvents,
  listAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getRsvp,
  setRsvp,
  cancelRsvp,
};
