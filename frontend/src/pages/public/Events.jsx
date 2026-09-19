import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Lock, MapPin, Clock } from 'lucide-react';
import api from '../../lib/api';
import { Reveal } from '../../components/ui/Reveal';
import { EmptyState, PageLoader, Pagination } from '../../components/ui/Feedback';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';

export default function Events() {
  const { isActiveMember } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.events({ page, limit: 9 });
        if (!active) return;
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        /* empty state */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page]);

  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mb-12 text-center">
        <Reveal>
          <p className="font-mono text-2xs uppercase tracking-[0.35em] text-gold-400">Events</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Gatherings</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-silver-400">
            What happens in these rooms stays in these rooms.
          </p>
        </Reveal>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="New gatherings are announced to members first." />
      ) : (
        <div className="space-y-4">
          {items.map((event, i) => (
            <Reveal key={event.id} delay={i * 60}>
              <EventRow event={event} canAccess={isActiveMember} />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </section>
  );
}

function EventRow({ event, canAccess }) {
  const locked = event.visibility === 'members' && !canAccess;
  return (
    <div className="group grid gap-5 border border-white/[0.06] bg-ink-850 p-5 transition-all duration-300 hover:border-gold-500/25 sm:grid-cols-[auto_1fr] sm:p-6">
      <div className="flex w-full flex-row items-center gap-4 sm:w-16 sm:flex-col sm:items-center">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center border border-gold-500/30 bg-ink-900">
          <span className="font-display text-xl leading-none text-gold-300">
            {new Date(event.event_date).getDate()}
          </span>
          <span className="font-mono text-2xs tracking-[0.15em] text-silver-500">
            {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {event.visibility === 'members' && (
            <span className="inline-flex items-center gap-1.5 border border-gold-500/40 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300">
              <Lock className="h-3 w-3" /> Members only
            </span>
          )}
          {event.rsvp_enabled && (
            <span className="border border-white/10 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-silver-400">
              RSVP
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-xl">{event.title}</h3>
        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-silver-400">{event.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-2xs uppercase tracking-[0.15em] text-silver-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {event.event_time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {event.location}
          </span>
        </div>
        {locked && (
          <p className="mt-4 text-xs text-gold-400/80">
            Members-only event.{' '}
            <Link to="/apply" className="link-underline">
              Apply for membership
            </Link>{' '}
            to attend.
          </p>
        )}
      </div>
    </div>
  );
}
