import { Card, Badge } from '../../components/ui/Card';
import { relativeTime } from '../../lib/utils';

const ACTION_LABELS = {
  'application.approved': { label: 'Application approved', tone: 'approved' },
  'application.rejected': { label: 'Application rejected', tone: 'rejected' },
  'member.suspended': { label: 'Member suspended', tone: 'suspended' },
  'member.reactivated': { label: 'Member reactivated', tone: 'active' },
  'member.updated': { label: 'Member edited', tone: 'draft' },
  'news.created': { label: 'News created', tone: 'draft' },
  'news.updated': { label: 'News updated', tone: 'draft' },
  'news.deleted': { label: 'News deleted', tone: 'rejected' },
  'announcement.created': { label: 'Announcement published', tone: 'published' },
  'announcement.updated': { label: 'Announcement updated', tone: 'draft' },
  'announcement.deleted': { label: 'Announcement deleted', tone: 'rejected' },
  'event.created': { label: 'Event created', tone: 'published' },
  'event.updated': { label: 'Event updated', tone: 'draft' },
  'event.deleted': { label: 'Event deleted', tone: 'rejected' },
  'vault.created': { label: 'Vault release added', tone: 'published' },
  'vault.updated': { label: 'Vault release updated', tone: 'draft' },
  'vault.deleted': { label: 'Vault release removed', tone: 'rejected' },
};

export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-silver-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatGrid({ stats }) {
  const cards = [
    { label: 'Total Members', value: stats.total_members },
    { label: 'Active Members', value: stats.active_members },
    { label: 'Pending Applications', value: stats.pending_applications, highlight: true },
    { label: 'Suspended', value: stats.suspended_members },
    { label: 'Published News', value: stats.published_news },
    { label: 'Upcoming Events', value: stats.upcoming_events },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} className={c.highlight && c.value > 0 ? 'border-gold-500/30' : ''}>
          <div className="p-4 sm:p-5">
            <p className="font-mono text-2xs uppercase tracking-[0.15em] text-silver-500">{c.label}</p>
            <p
              className={`mt-2.5 font-display text-2xl sm:text-3xl ${
                c.highlight && c.value > 0 ? 'text-gold-300' : 'text-silver-100'
              }`}
            >
              {c.value ?? 0}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ActivityFeed({ items = [] }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-silver-500">No recorded activity yet.</p>;
  }
  return (
    <ol className="divide-y divide-white/[0.04]">
      {items.map((row) => {
        const meta = ACTION_LABELS[row.action] || { label: row.action, tone: 'draft' };
        return (
          <li key={row.id} className="flex items-center gap-4 py-3.5">
            <Badge status={meta.tone}>{meta.label}</Badge>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-silver-300">
                {row.target ? row.target : ''}
                {row.admin_name ? ` — ${row.admin_name}` : ''}
              </p>
            </div>
            <span className="shrink-0 font-mono text-2xs text-silver-600">{relativeTime(row.created_at)}</span>
          </li>
        );
      })}
    </ol>
  );
}
