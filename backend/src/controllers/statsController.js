const { supabaseAdmin } = require('../config/supabase');

/** ADMIN: GET /api/admin/stats — dashboard overview */
async function getStats(req, res, next) {
  try {
    const [
      members,
      pending,
      suspended,
      news,
      events,
      applications,
    ] = await Promise.all([
      supabaseAdmin.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('membership_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'suspended'),
      supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true })
        .eq('status', 'published').gte('event_date', new Date().toISOString().slice(0, 10)),
      supabaseAdmin.from('membership_applications').select('id', { count: 'exact', head: true }),
    ]);

    const { data: recent } = await supabaseAdmin
      .from('activity_logs')
      .select('id, admin_id, action, target, created_at, profiles!left(full_name)')
      .order('created_at', { ascending: false })
      .limit(8);

    const recentActivity = (recent || []).map((r) => {
      const admin = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return { id: r.id, action: r.action, target: r.target, created_at: r.created_at, admin_name: admin?.full_name || 'Admin' };
    });

    return res.json({
      stats: {
        total_members: members.count ?? 0,
        pending_applications: pending.count ?? 0,
        active_members: members.count ?? 0,
        suspended_members: suspended.count ?? 0,
        published_news: news.count ?? 0,
        upcoming_events: events.count ?? 0,
        total_applications: applications.count ?? 0,
      },
      recent_activity: recentActivity,
    });
  } catch (err) {
    return next(err);
  }
}

/** PUBLIC: GET /api/public/stats — homepage counters */
async function getPublicStats(req, res, next) {
  try {
    const [members, news, events] = await Promise.all([
      supabaseAdmin.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('news').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true })
        .eq('status', 'published').gte('event_date', new Date().toISOString().slice(0, 10)),
    ]);

    return res.json({
      active_members: members.count ?? 0,
      club_news: news.count ?? 0,
      upcoming_events: events.count ?? 0,
      years_active: new Date().getFullYear() - 2026,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getStats, getPublicStats };
