const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');
const { uniqueSlug } = require('./newsController');

/** MEMBER: GET /api/vault */
async function listVault(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const from = (page - 1) * limit;

    const { data, error, count } = await supabaseAdmin
      .from('vault_content')
      .select('id, title, slug, category, excerpt, cover_image_url, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (error) return next(error);
    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** MEMBER: GET /api/vault/:slug */
async function getVaultItem(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('vault_content')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single();
    if (error || !data) return res.status(404).json({ error: 'Vault item not found' });
    return res.json({ item: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: GET /api/admin/vault */
async function listAdminVault(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;

    let query = supabaseAdmin.from('vault_content').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (req.query.status && req.query.status !== 'all') query = query.eq('status', req.query.status);

    const { data, error, count } = await query.range(from, from + limit - 1);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: POST /api/admin/vault */
async function createVaultItem(req, res, next) {
  try {
    const body = { ...req.validated };
    if (!body.slug) body.slug = await uniqueSlug('vault_content', body.title);

    const { data, error } = await supabaseAdmin.from('vault_content').insert(body).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    if (body.status === 'published') {
      const { data: members } = await supabaseAdmin.from('profiles').select('id').eq('role', 'member').eq('status', 'active');
      if (members?.length) {
        await supabaseAdmin
          .from('notifications')
          .insert(members.map((m) => ({ user_id: m.id, type: 'vault', title: `New vault release: ${data.title}`, body: data.excerpt.slice(0, 160) })));
      }
    }

    logActivity({ adminId: req.profile.id, action: 'vault.created', target: data.title, targetId: data.id });
    return res.status(201).json({ item: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: PATCH /api/admin/vault/:id */
async function updateVaultItem(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('vault_content').update(req.validated).eq('id', req.params.id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'vault.updated', target: data.title, targetId: data.id });
    return res.json({ item: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: DELETE /api/admin/vault/:id */
async function deleteVaultItem(req, res, next) {
  try {
    const { error } = await supabaseAdmin.from('vault_content').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'vault.deleted', target: req.params.id });
    return res.json({ message: 'Vault item deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listVault,
  getVaultItem,
  listAdminVault,
  createVaultItem,
  updateVaultItem,
  deleteVaultItem,
};
