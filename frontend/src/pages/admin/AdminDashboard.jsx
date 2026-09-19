import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, Newspaper, CalendarDays, ArrowUpRight } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { AdminPageHeader, StatGrid, ActivityFeed } from '../../components/admin/Parts';
import { PageLoader } from '../../components/ui/Feedback';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [stats, activity] = await Promise.all([api.adminStats(), api.adminActivity({ limit: 8 })]);
        if (!active) return;
        setData({ stats: stats.stats, activity: activity.items });
      } catch {
        /* dashboard must degrade gracefully */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading || !data) return <PageLoader label="Loading control center" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Complete oversight of the club — applications, members and content."
      />

      <StatGrid stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { to: '/admin/applications', label: 'Review Applications', icon: ClipboardList, stat: data.stats.pending_applications, statLabel: 'pending' },
          { to: '/admin/members', label: 'Manage Members', icon: Users, stat: data.stats.total_members, statLabel: 'members' },
          { to: '/admin/news', label: 'Publish News', icon: Newspaper, stat: data.stats.published_news, statLabel: 'published' },
          { to: '/admin/events', label: 'Manage Events', icon: CalendarDays, stat: data.stats.upcoming_events, statLabel: 'upcoming' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center justify-between border border-white/[0.06] bg-ink-850 p-5 transition-all duration-300 hover:border-gold-500/30"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-gold-300" />
              <div>
                <p className="text-sm font-medium text-silver-100">{item.label}</p>
                <p className="font-mono text-2xs text-silver-500">
                  {item.stat} {item.statLabel}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-silver-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-300" />
          </Link>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="font-display text-base">Recent Activity</h2>
          <Link
            to="/admin/activity"
            className="font-mono text-2xs uppercase tracking-[0.15em] text-silver-400 transition-colors hover:text-gold-300"
          >
            View all
          </Link>
        </div>
        <div className="px-5">
          <ActivityFeed items={data.activity} />
        </div>
      </Card>
    </div>
  );
}
