const { supabaseAdmin } = require('../config/supabase');
const { logActivity } = require('../utils/activity');

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(table, title, ignoreId) {
  let base = slugify(title) || 'post';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = supabaseAdmin.from(table).select('id').eq('slug', slug).limit(1);
    const { data } = ignoreId ? await query.neq('id', ignoreId) : await query;
    if (!data || data.length === 0) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

/** PUBLIC: GET /api/news?page=&limit=&category= */
async function listPublicNews(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('news')
      .select('id, title, slug, cover_image_url, excerpt, category, author, published_at, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false });

    if (req.query.category) query = query.eq('category', req.query.category);

    const { data, error, count } = await query.range(from, to);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** PUBLIC: GET /api/news/:slug */
async function getPublicNews(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('status', 'published')
      .single();

    if (error || !data) return res.status(404).json({ error: 'Article not found' });
    return res.json({ article: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: GET /api/admin/news */
async function listAdminNews(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('news')
      .select('id, title, slug, status, category, author, featured, published_at, created_at, cover_image_url', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (req.query.status && req.query.status !== 'all') query = query.eq('status', req.query.status);
    if (req.query.search) query = query.or(`title.ilike.%${req.query.search}%`);

    const { data, error, count } = await query.range(from, to);
    if (error) return next(error);

    return res.json({ items: data, total: count ?? 0, page, limit, totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)) });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: GET /api/admin/news/:id */
async function getAdminNews(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('news').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ error: 'Article not found' });
    return res.json({ article: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: POST /api/admin/news */
async function createNews(req, res, next) {
  try {
    const body = { ...req.validated };
    if (!body.slug) body.slug = await uniqueSlug('news', body.title);
    body.author = body.author || 'Gangsters Club';
    if (body.status === 'published') body.published_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from('news').insert(body).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'news.created', target: data.title, targetId: data.id });

    return res.status(201).json({ article: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: PATCH /api/admin/news/:id */
async function updateNews(req, res, next) {
  try {
    const body = { ...req.validated };
    const id = req.params.id;

    const { data: current } = await supabaseAdmin.from('news').select('title, status, published_at').eq('id', id).single();
    if (!current) return res.status(404).json({ error: 'Article not found' });

    if (body.slug === undefined) delete body.slug;
    if (body.status === 'published' && current.status !== 'published') body.published_at = new Date().toISOString();
    if (body.status && body.status !== 'published') body.published_at = null;

    const { data, error } = await supabaseAdmin.from('news').update(body).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'news.updated', target: data.title, targetId: id, metadata: { status: data.status } });

    return res.json({ article: data });
  } catch (err) {
    return next(err);
  }
}

/** ADMIN: DELETE /api/admin/news/:id */
async function deleteNews(req, res, next) {
  try {
    const { data } = await supabaseAdmin.from('news').select('title').eq('id', req.params.id).single();
    const { error } = await supabaseAdmin.from('news').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    logActivity({ adminId: req.profile.id, action: 'news.deleted', target: data?.title || 'article', targetId: req.params.id });

    return res.json({ message: 'Article deleted' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  slugify,
  uniqueSlug,
  listPublicNews,
  getPublicNews,
  listAdminNews,
  getAdminNews,
  createNews,
  updateNews,
  deleteNews,
};
