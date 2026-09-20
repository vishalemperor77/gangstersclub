const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');
const { memberUpdateSchema } = require('../validators');

/** GET /api/admin/members?status=&page=&limit=&search= */
async function listMembers(req, res, next) {
  try {
    const { page, limit, search, status } = req.validated;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('memberships')
      // memberships has TWO foreign keys to profiles (user_id + approved_by),
      // so the embed must be disambiguated or PostgREST returns PGRST201.
      .select(
        'id, member_id, status, level, member_since, created_at, profiles!memberships_user_id_fkey!inner(id, full_name, username, email, avatar_url, status, city)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    if (search && String(search).trim()) {
      // PostgREST cannot resolve an embedded-resource filter (`!hint` is a parse
      // error inside or=), so profile matches are resolved first and applied
      // against the base column.
      const term = String(search).trim().replace(/[,()]/g, '');
      const { data: matches } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${term}%,email.ilike.%${term}%,username.ilike.%${term}%`)
        .limit(200);

      const ids = (matches || []).map((p) => p.id);
      query = query.or(
        ids.length
          ? `member_id.ilike.%${term}%,user_id.in.(${ids.join(',')})`
          : `member_id.ilike.%${term}%`
      );
    }

    const { data, error, count } = await query.range(from, to);
    if (error) return next(error);

    const items = (data || []).map((m) => ({
      id: m.id,
      member_id: m.member_id,
      status: m.status,
      level: m.level,
      member_since: m.member_since,
      created_at: m.created_at,
      profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
    }));

    return res.json({
      items,
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/admin/members/:id */
async function getMember(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('memberships')
      .select('*, profiles!memberships_user_id_fkey!inner(*)')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Member not found' });

    const { data: verification } = await supabaseAdmin
      .from('member_verification')
      .select('token, qr_payload, created_at')
      .eq('membership_id', data.id)
      .limit(1)
      .maybeSingle();

    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    return res.json({
      membership: { ...data, profiles: undefined },
      profile,
      verification,
    });
  } catch (err) {
    return next(err);
  }
}

/** PATCH /api/admin/members/:id — edit permitted member info */
async function updateMember(req, res, next) {
  try {
    const parsed = memberUpdateSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(422).json({ error: 'Validation failed', fields: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), i.message])) });
    }
    const updates = parsed.data;

    const { data: membership, error: mErr } = await supabaseAdmin
      .from('memberships')
      .select('id, member_id, user_id')
      .eq('id', req.params.id)
      .single();
    if (mErr) return res.status(404).json({ error: 'Member not found' });

    const userId = membership.user_id;
    const { level, ...profileUpdates } = updates;

    if (Object.keys(profileUpdates).length) {
      const { error: pErr } = await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', userId);
      if (pErr) return res.status(400).json({ error: pErr.message });
    }
    if (level) {
      const { error: lErr } = await supabaseAdmin.from('memberships').update({ level }).eq('id', req.params.id);
      if (lErr) return res.status(400).json({ error: lErr.message });
    }

    logActivity({
      adminId: req.profile.id,
      action: 'member.updated',
      target: membership.member_id,
      targetId: membership.id,
      metadata: { fields: Object.keys(updates) },
    });

    return res.json({ message: 'Member updated' });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/admin/members/:id/suspend */
async function suspendMember(req, res, next) {
  try {
    const reason = (req.body?.reason || '').slice(0, 500);
    const { error } = await supabaseAdmin.rpc('suspend_member', {
      p_membership_id: req.params.id,
      p_admin_id: req.profile.id,
      p_reason: reason,
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data: m } = await supabaseAdmin.from('memberships').select('member_id').eq('id', req.params.id).single();

    logActivity({
      adminId: req.profile.id,
      action: 'member.suspended',
      target: m?.member_id || 'member',
      targetId: req.params.id,
      metadata: { reason },
    });

    return res.json({ message: 'Member suspended. Access revoked.' });
  } catch (err) {
    return next(err);
  }
}

/** POST /api/admin/members/:id/reactivate */
async function reactivateMember(req, res, next) {
  try {
    const { error } = await supabaseAdmin.rpc('reactivate_member', {
      p_membership_id: req.params.id,
      p_admin_id: req.profile.id,
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data: m } = await supabaseAdmin.from('memberships').select('member_id').eq('id', req.params.id).single();

    logActivity({
      adminId: req.profile.id,
      action: 'member.reactivated',
      target: m?.member_id || 'member',
      targetId: req.params.id,
    });

    return res.json({ message: 'Member reactivated.' });
  } catch (err) {
    return next(err);
  }
}

/** DELETE /api/admin/members/:id — permanently remove a member */
async function removeMember(req, res, next) {
  try {
    const { data: membership, error } = await supabaseAdmin
      .from('memberships')
      .select('id, member_id, user_id')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: 'Member not found' });

    // An administrator cannot remove their own account from the console.
    if (membership.user_id === req.profile.id) {
      return res.status(403).json({ error: 'You cannot remove your own account.' });
    }

    // Deleting the auth user cascades through every owned row:
    // profile -> memberships -> member_verification, notifications, event
    // RSVPs. Applications are detached (user_id set to null) so the audit
    // record of the application survives the removal.
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(membership.user_id);
    if (delErr) return res.status(400).json({ error: delErr.message });

    logActivity({
      adminId: req.profile.id,
      action: 'member.removed',
      target: membership.member_id,
      targetId: membership.id,
      metadata: { user_id: membership.user_id },
    });

    return res.json({ message: 'Member removed permanently.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMembers, getMember, updateMember, suspendMember, reactivateMember, removeMember };
