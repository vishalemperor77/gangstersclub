import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock, Sparkles, CalendarDays } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Eyebrow, SectionHeading } from '../../components/ui/Card';
import { NewsCard, EventCard } from '../../components/public/Cards';
import { Reveal } from '../../components/ui/Reveal';
import { PageLoader } from '../../components/ui/Feedback';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, n, e] = await Promise.all([
          api.publicStats(),
          api.news({ limit: 3 }),
          api.events({ limit: 3 }),
        ]);
        if (!active) return;
        setStats(s);
        setNews(n.items || []);
        setEvents(e.items || []);
      } catch {
        /* homepage must degrade gracefully */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Hero />
      <Stats stats={stats} loading={loading} />
      <About />
      <WhyJoin />
      <FeaturedNews news={news} loading={loading} />
      <UpcomingEvents events={events} loading={loading} />
      <VaultTease />
      <FinalCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(200,162,75,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(200,162,75,0.06),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      <div className="container-page relative z-10 py-20 text-center">
        <Reveal>
          <Eyebrow className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-500/50" />
            Private Members' Club
            <span className="h-px w-8 bg-gold-500/50" />
          </Eyebrow>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="display-1 font-bold text-balance">
            <span className="block text-silver-100">GANGSTERS</span>
            <span className="block text-metal animate-shine">CLUB</span>
          </h1>
        </Reveal>

        <Reveal delay={250}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-silver-300 sm:text-xl text-balance">
            Enter the inner circle. A private community built for the few who move with intention.
          </p>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to="/apply" size="lg" className="w-full sm:w-auto">
              Become a Member
            </Button>
            <Button to="/about" variant="outline" size="lg" className="w-full sm:w-auto">
              Explore the Club
            </Button>
          </div>
        </Reveal>

        <Reveal delay={550}>
          <p className="mt-10 flex items-center justify-center gap-2 font-mono text-2xs uppercase tracking-[0.25em] text-silver-600">
            <Lock className="h-3.5 w-3.5" /> Membership by application &amp; approval only
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Stats({ stats, loading }) {
  const items = [
    { label: 'Active Members', value: stats?.active_members },
    { label: 'Club News', value: stats?.club_news },
    { label: 'Upcoming Events', value: stats?.upcoming_events },
    { label: 'Years Active', value: stats?.years_active },
  ];
  return (
    <section className="border-y border-white/[0.06] bg-ink-900">
      <div className="container-page grid grid-cols-2 gap-px lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal
            key={item.label}
            delay={i * 80}
            className="border-white/[0.04] p-6 text-center sm:p-8 [&:not(:last-child)]:border-r"
          >
            <p className="font-display text-3xl text-metal sm:text-4xl">
              {loading || item.value == null ? <span className="text-silver-700">—</span> : item.value.toLocaleString()}
            </p>
            <p className="mt-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">{item.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="container-page py-20 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow className="mb-4">01 — About the Club</Eyebrow>
          <h2 className="display-2 text-balance">
            Not a place. <span className="text-metal">A position.</span>
          </h2>
        </Reveal>
        <Reveal delay={150} className="space-y-5 text-sm leading-relaxed text-silver-400 sm:text-base">
          <p>
            Gangsters Club is a private membership organisation for founders, operators and creators
            who think several moves ahead. There are no crowds here, and no admission counter —
            every seat is filled by review.
          </p>
          <p>
            What began as a small circle of trusted peers has become a disciplined network united by
            one idea: proximity is the oldest form of leverage. Inside, members trade access,
            knowledge and opportunity without the noise of the open internet.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400 link-underline"
          >
            Read our philosophy <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function WhyJoin() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Verified Membership',
      body: 'Every member is reviewed and approved individually. Each receives a unique Member ID and a QR-verifiable digital ID card.',
    },
    {
      icon: Sparkles,
      title: 'The Vault',
      body: 'A members-only archive of intelligence, private briefings and content that never appears on the public site.',
    },
    {
      icon: CalendarDays,
      title: 'Private Events',
      body: 'Curated gatherings, member-only rooms and RSVP access — announced to members before anyone else.',
    },
  ];
  return (
    <section className="border-y border-white/[0.06] bg-ink-900">
      <div className="container-page py-20 lg:py-28">
        <SectionHeading
          eyebrow="02 — Why Join"
          title="What membership unlocks"
          description="Three things the public internet cannot give you."
          align="center"
          className="mb-12"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 100}>
              <div className="group h-full border border-white/[0.06] bg-ink-850 p-7 transition-all duration-300 hover:border-gold-500/25 hover:shadow-glow">
                <span className="flex h-11 w-11 items-center justify-center border border-gold-500/30 bg-gold-500/5">
                  <b.icon className="h-5 w-5 text-gold-300" />
                </span>
                <h3 className="mt-5 font-display text-lg">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedNews({ news, loading }) {
  return (
    <section className="container-page py-20 lg:py-28">
      <div className="mb-10 flex items-end justify-between gap-4">
        <SectionHeading eyebrow="03 — Club News" title="Latest dispatches" />
        <Link
          to="/news"
          className="hidden shrink-0 items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400 link-underline sm:inline-flex"
        >
          All news <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {loading ? (
        <PageLoader />
      ) : news.length === 0 ? (
        <p className="border border-dashed border-white/10 py-16 text-center text-sm text-silver-500">
          No published news yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((article, i) => (
            <Reveal key={article.id} delay={i * 90}>
              <NewsCard article={article} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function UpcomingEvents({ events, loading }) {
  return (
    <section className="border-t border-white/[0.06] bg-ink-900">
      <div className="container-page py-20 lg:py-28">
        <div className="mb-10 flex items-end justify-between gap-4">
          <SectionHeading eyebrow="04 — Events" title="Upcoming gatherings" />
          <Link
            to="/events"
            className="hidden shrink-0 items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400 link-underline sm:inline-flex"
          >
            All events <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <PageLoader />
        ) : events.length === 0 ? (
          <p className="border border-dashed border-white/10 py-16 text-center text-sm text-silver-500">
            No upcoming events announced.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event, i) => (
              <Reveal key={event.id} delay={i * 90}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VaultTease() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(200,162,75,0.08),transparent_60%)]" />
      <div className="container-page relative z-10 py-20 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow className="mb-4 flex items-center justify-center gap-3">
              <Lock className="h-3.5 w-3.5" /> 05 — The Vault
            </Eyebrow>
            <h2 className="display-2 text-balance">
              Private <span className="text-metal">Access</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-silver-400 sm:text-base">
              The Vault is the members-only layer of Gangsters Club — private briefings, exclusive
              content and information that never goes public. Members only.
            </p>
            <div className="mt-8">
              <Button to="/apply" size="lg">
                Become a Member
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-t border-white/[0.06] bg-ink-950">
      <div className="container-page py-24 text-center lg:py-32">
        <Reveal>
          <h2 className="display-2 text-balance">
            Ready to enter <span className="text-metal">the club?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm text-silver-400">
            Applications are reviewed individually. Approval — and only approval — grants access.
          </p>
          <div className="mt-9">
            <Button to="/apply" size="lg">
              Apply for Membership
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
