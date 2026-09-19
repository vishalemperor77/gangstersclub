import { supabase } from './supabaseClient';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Joins path segments into a URL-safe path. */
function join(...parts) {
  return parts
    .map((p) => String(p ?? '').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

let cache = new Map();

/**
 * Thin fetch wrapper. Automatically attaches the Supabase access token and
 * serializes the response. The service-role key is never present in the client.
 */
async function request(path, { method = 'GET', body, query, signal, cacheKey, ttl = 0 } = {}) {
  const url = `${BASE}/${join(path)}${query ? `?${new URLSearchParams(query)}` : ''}`;

  if (cacheKey && ttl > 0 && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.t < ttl) return entry.v;
  }

  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  const res = await fetch(url, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let json;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: 'Invalid server response' };
  }

  if (!res.ok) {
    const err = new Error(json.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  if (cacheKey && ttl > 0) cache.set(cacheKey, { v: json, t: Date.now() });
  return json;
}

export function clearCache(key) {
  if (key) cache.delete(key);
  else cache = new Map();
}

export const api = {
  // Public
  publicStats: (signal) => request('public/stats', { signal, cacheKey: 'public-stats', ttl: 60_000 }),
  news: (q = {}, signal) => request('news', { query: q, signal, cacheKey: `news-${JSON.stringify(q)}`, ttl: 30_000 }),
  newsBySlug: (slug, signal) => request(`news/${slug}`, { signal, cacheKey: `news-${slug}`, ttl: 30_000 }),
  announcements: (q = {}, signal) => request('announcements', { query: q, signal }),
  events: (q = {}, signal) => request('events', { query: q, signal, cacheKey: `events-${JSON.stringify(q)}`, ttl: 30_000 }),
  verify: (memberId, signal) => request(`verify/lookup/${encodeURIComponent(memberId)}`, { signal }),

  // Auth / session
  me: () => request('auth/me', { cacheKey: 'auth-me' }),
  forgotPassword: (email) => request('auth/forgot-password', { method: 'POST', body: { email } }),

  // Application
  submitApplication: (data) => request('applications', { method: 'POST', body: data }),
  myApplication: () => request('applications/mine'),

  // Member
  getProfile: () => request('member/profile'),
  updateProfile: (data) => request('member/profile', { method: 'PATCH', body: data }),
  idCard: () => request('member/id-card', { cacheKey: 'id-card' }),
  notifications: (q = {}) => request('notifications', { query: q }),
  markAllRead: () => request('notifications/read', { method: 'POST' }),
  markOneRead: (id) => request(`notifications/${id}/read`, { method: 'POST' }),
  vault: (q = {}) => request('vault', { query: q }),
  vaultItem: (slug) => request(`vault/${slug}`),
  getRsvp: (eventId) => request(`events/${eventId}/rsvp`),
  setRsvp: (eventId, status) => request(`events/${eventId}/rsvp`, { method: 'POST', body: { status } }),
  cancelRsvp: (eventId) => request(`events/${eventId}/rsvp`, { method: 'DELETE' }),
  upload: (file, folder = 'avatar') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return supabase.auth.getSession().then(({ data: { session } }) =>
      fetch(`${BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      }).then((r) => r.json())
    );
  },

  // Admin
  adminStats: () => request('admin/stats', { cacheKey: 'admin-stats' }),
  adminActivity: (q = {}) => request('admin/activity', { query: q }),
  adminApplications: (q = {}) => request('admin/applications', { query: q }),
  adminApplication: (id) => request(`admin/applications/${id}`),
  approveApplication: (id) => request(`admin/applications/${id}/approve`, { method: 'POST' }),
  rejectApplication: (id, reason) => request(`admin/applications/${id}/reject`, { method: 'POST', body: { reason } }),
  adminMembers: (q = {}) => request('admin/members', { query: q }),
  adminMember: (id) => request(`admin/members/${id}`),
  updateMember: (id, data) => request(`admin/members/${id}`, { method: 'PATCH', body: data }),
  suspendMember: (id, reason) => request(`admin/members/${id}/suspend`, { method: 'POST', body: { reason } }),
  reactivateMember: (id) => request(`admin/members/${id}/reactivate`, { method: 'POST' }),

  adminNews: (q = {}) => request('admin/news', { query: q }),
  adminNewsItem: (id) => request(`admin/news/${id}`),
  createNews: (data) => request('admin/news', { method: 'POST', body: data }),
  updateNews: (id, data) => request(`admin/news/${id}`, { method: 'PATCH', body: data }),
  deleteNews: (id) => request(`admin/news/${id}`, { method: 'DELETE' }),

  adminAnnouncements: (q = {}) => request('admin/announcements', { query: q }),
  createAnnouncement: (data) => request('admin/announcements', { method: 'POST', body: data }),
  updateAnnouncement: (id, data) => request(`admin/announcements/${id}`, { method: 'PATCH', body: data }),
  deleteAnnouncement: (id) => request(`admin/announcements/${id}`, { method: 'DELETE' }),

  adminEvents: (q = {}) => request('admin/events', { query: q }),
  createEvent: (data) => request('admin/events', { method: 'POST', body: data }),
  updateEvent: (id, data) => request(`admin/events/${id}`, { method: 'PATCH', body: data }),
  deleteEvent: (id) => request(`admin/events/${id}`, { method: 'DELETE' }),

  adminVault: (q = {}) => request('admin/vault', { query: q }),
  createVault: (data) => request('admin/vault', { method: 'POST', body: data }),
  updateVault: (id, data) => request(`admin/vault/${id}`, { method: 'PATCH', body: data }),
  deleteVault: (id) => request(`admin/vault/${id}`, { method: 'DELETE' }),

  adminNotify: (data) => request('admin/notifications', { method: 'POST', body: data }),
};

export default api;
