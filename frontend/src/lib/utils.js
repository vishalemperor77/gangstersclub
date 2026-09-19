export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatDate(input, opts = {}) {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', ...opts });
}

export function formatMonthYear(input) {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(input) {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(input) {
  if (!input) return '—';
  const d = new Date(input);
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (sec < 60) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day < 30) return `${day}d ago`;
  return formatDate(input);
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function isValidMemberId(v = '') {
  return /^GC-\d{4}-\d{6}$/.test(v.trim().toUpperCase());
}

export function titleCase(str = '') {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function classNamesForStatus(status = '') {
  const map = {
    active: 'text-success border-success/30 bg-success/10',
    approved: 'text-success border-success/30 bg-success/10',
    published: 'text-success border-success/30 bg-success/10',
    pending: 'text-warning border-warning/30 bg-warning/10',
    draft: 'text-silver-300 border-silver-500/30 bg-silver-500/10',
    suspended: 'text-danger border-danger/30 bg-danger/10',
    rejected: 'text-danger border-danger/30 bg-danger/10',
    inactive: 'text-silver-300 border-silver-500/30 bg-silver-500/10',
    unpublished: 'text-silver-300 border-silver-500/30 bg-silver-500/10',
    high: 'text-danger border-danger/30 bg-danger/10',
    normal: 'text-silver-200 border-silver-500/30 bg-silver-500/10',
    low: 'text-silver-400 border-silver-500/20 bg-silver-500/5',
  };
  return map[String(status).toLowerCase()] || map.normal;
}
