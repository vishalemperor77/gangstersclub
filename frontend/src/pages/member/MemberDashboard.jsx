import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Megaphone, CalendarDays, Vault as VaultIcon, ArrowUpRight, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { formatMonthYear, relativeTime } from '../../lib/utils';

export default function MemberDashboard() {
  const { profile, membership } = useAuth();
  const [data, setData] = useState({ announcements: [], events: [], news: [], unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ann, ev, news, notif] = await Promise.all([
          api.announcements({ limit: 3 }),
          api.events({ limit: 3 }),
          api.news({ limit: 3 }),
          api.notifications({ limit: 1 }).catch(() => ({ unread: 0 })),
        ]);
        if (!active) return;
        setData({
          announcements: ann.items || [],
          events: ev.items || [],
          news: news.items || [],
          unread: notif.unread || 0,
        });
      } catch {
        /* dashboard degrades gracefully */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageLoader label="Loading dashboard" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <Reveal>
        <div className="flex flex-col gap-6 border border-white/[0.06] bg-gradient-to-br from-ink-850 to-ink-900 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size={56} />
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.25em] text-gold-400">Welcome back</p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl">{profile?.full_name}</h1>
              <p className="mt-1 font-mono text-sm text-silver-500">{membership?.member_id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge status={membership?.status || 'active'}>{membership?.status || 'active'}</Badge>
            <Badge>{membership?.level || 'Member'}</Badge>
          </div>
        </div>
      </Reveal>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Member ID" value={membership?.member_id} mono />
        <Stat label="Member Since" value={formatMonthYear(membership?.member_since)} />
        <Stat label="Level" value={membership?.level || 'Member'} />
        <Stat label="Unread" value={data.unread} />
      </div>

      {/* Quick access */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/member/id-card', label: 'My ID Card', icon: IdCard },
          { to: '/member/announcements', label: 'Announcements', icon: Megaphone, badge: data.unread },
          { to: '/member/events', label: 'Events', icon: CalendarDays },
          { to: '/member/vault', label: 'The Vault', icon: VaultIcon },
        ].map((item, i) => (
          <Reveal key={item.to} delay={i * 70}>
            <Link
              to={item.to}
              className="group relative flex items-center justify-between overflow-hidden border border-white/[0.06] bg-ink-850 p-5 transition-all duration-300 hover:border-gold-500/30 hover:shadow-glow"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-gold-300" />
                <span className="text-sm text-silver-100">{item.label}</span>
                {item.badge > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center bg-gold-500 px-1 font-mono text-2xs text-ink-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <ArrowUpRight className="h-4 w-4 text-silver-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-300" />
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Announcements + Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Latest Announcements"
          icon={Megaphone}
          onSeeAll="/member/announcements"
          items={data.announcements}
          empty="No announcements yet."
          renderItem={(a) => (
            <div key={a.id} className="border-b border-white/[0.04] p-4 last:border-0">
              <div className="flex items-center gap-2">
                {a.priority === 'high' && <span className="h-1.5 w-1.5 bg-danger" />}
                <h4 className="text-sm font-medium text-silver-100">{a.title}</h4>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-silver-400">{a.content}</p>
              <p className="mt-2 font-mono text-2xs text-silver-600">{relativeTime(a.published_at || a.created_at)}</p>
            </div>
          )}
        />

        <Panel
          title="Upcoming Events"
          icon={CalendarDays}
          onSeeAll="/member/events"
          items={data.events}
          empty="No upcoming events."
          renderItem={(e) => (
            <Link
              key={e.id}
              to="/member/events"
              className="flex items-center gap-4 border-b border-white/[0.04] p-4 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center border border-gold-500/30 bg-ink-900">
                <span className="font-display text-base leading-none text-gold-300">{new Date(e.event_date).getDate()}</span>
                <span className="font-mono text-2xs text-silver-500">
                  {new Date(e.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="truncate text-sm font-medium text-silver-100">{e.title}</h4>
                <p className="mt-1 truncate text-xs text-silver-500">
                  {e.event_time} · {e.location}
                </p>
              </div>
            </Link>
          )}
        />
      </div>

      {/* Latest news */}
      <Panel
        title="Latest News"
        icon={Bell}
        onSeeAll="/news"
        items={data.news}
        empty="No news published."
        renderItem={(n) => (
          <Link
            key={n.id}
            to={`/news/${n.slug}`}
            className="flex items-center gap-4 border-b border-white/[0.04] p-4 transition-colors last:border-0 hover:bg-white/[0.02]"
          >
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-silver-100">{n.title}</h4>
              <p className="mt-1 truncate text-xs text-silver-500">{n.excerpt}</p>
            </div>
            <span className="shrink-0 font-mono text-2xs text-silver-600">{relativeTime(n.published_at || n.created_at)}</span>
          </Link>
        )}
      />
    </div>
  );
}

function Stat({ label, value, mono }) {
  return (
    <div className="border border-white/[0.06] bg-ink-850 p-4">
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">{label}</p>
      <p className={`mt-2 truncate text-sm text-silver-100 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, onSeeAll, items, empty, renderItem }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-gold-300" />
          <h3 className="font-display text-base">{title}</h3>
        </div>
        {onSeeAll && (
          <Link
            to={onSeeAll}
            className="font-mono text-2xs uppercase tracking-[0.15em] text-silver-400 transition-colors hover:text-gold-300"
          >
            See all
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="p-8">
          <EmptyState title={empty} />
        </div>
      ) : (
        <div>{items.map(renderItem)}</div>
      )}
    </Card>
  );
}
