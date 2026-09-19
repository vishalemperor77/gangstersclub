import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Clock, Check, X } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { useToast } from '../../context/ToastContext';

export default function MemberEvents() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.events({ limit: 24 });
      setItems(data.items || []);
    } catch {
      /* empty state */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRsvp = async (event, status) => {
    try {
      if (status === 'going') {
        await api.setRsvp(event.id, 'going');
        toast.success(`You're on the list for ${event.title}.`);
      } else {
        await api.cancelRsvp(event.id);
        toast.info(`Removed your RSVP for ${event.title}.`);
      }
      load();
    } catch (err) {
      toast.error(err.message || 'Could not update RSVP.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Events</p>
        <h1 className="mt-3 font-display text-3xl">Members' gatherings</h1>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No upcoming events" description="New gatherings are announced here first." />
      ) : (
        <div className="space-y-4">
          {items.map((event, i) => (
            <Reveal key={event.id} delay={i * 60}>
              <EventRow event={event} onRsvp={onRsvp} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({ event, onRsvp }) {
  const [rsvp, setRsvp] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!event.rsvp_enabled) return undefined;
    let active = true;
    api
      .getRsvp(event.id)
      .then((d) => {
        if (active) setRsvp(d.rsvp || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [event.id, event.rsvp_enabled]);

  const handle = async (status) => {
    setBusy(true);
    try {
      await onRsvp(event, status);
      setRsvp(status === 'going' ? { status: 'going' } : null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {event.cover_image_url ? (
          <div className="aspect-[16/9] w-full shrink-0 overflow-hidden sm:h-auto sm:w-40">
            <img src={event.cover_image_url} alt={event.title} loading="lazy" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="flex-1 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {event.visibility === 'members' && (
              <span className="border border-gold-500/40 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300">
                Members only
              </span>
            )}
            {rsvp?.status === 'going' && (
              <span className="inline-flex items-center gap-1 border border-success/40 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-success">
                <Check className="h-3 w-3" /> Going
              </span>
            )}
          </div>
          <h3 className="mt-3 font-display text-lg">{event.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-silver-400">{event.description}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-2xs uppercase tracking-[0.15em] text-silver-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(event.event_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {event.event_time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {event.location}
            </span>
          </div>

          {event.rsvp_enabled && (
            <div className="mt-5 flex flex-wrap gap-2">
              {rsvp?.status === 'going' ? (
                <Button variant="surface" size="sm" onClick={() => handle('not_going')} isLoading={busy}>
                  <X className="h-3.5 w-3.5" /> Cancel RSVP
                </Button>
              ) : (
                <Button size="sm" onClick={() => handle('going')} isLoading={busy}>
                  <Check className="h-3.5 w-3.5" /> RSVP
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
