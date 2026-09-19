import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatDate } from '../../lib/utils';

export function NewsCard({ article, priority = false }) {
  return (
    <Card hover className="group h-full">
      <Link to={`/news/${article.slug}`} className="flex h-full flex-col">
        <div className={`relative overflow-hidden ${priority ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}>
          {article.cover_image_url ? (
            <img
              src={article.cover_image_url}
              alt={article.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ink-800 bg-grain">
              <span className="font-display text-3xl text-silver-700">GC</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
          {article.category && (
            <span className="absolute left-3 top-3 border border-gold-500/40 bg-ink-950/80 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300 backdrop-blur-sm">
              {article.category}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">
            {formatDate(article.published_at || article.created_at)}
          </p>
          <h3 className="mt-2 font-display text-lg leading-snug transition-colors group-hover:text-gold-200">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-silver-400">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400">
            Read article
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function EventCard({ event }) {
  const d = new Date(event.event_date);
  const day = Number.isNaN(d.getTime()) ? '—' : d.getDate();
  const month = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <Card hover className="group">
      <Link to="/events" className="flex h-full flex-col">
        <div className="relative overflow-hidden aspect-[16/9]">
          {event.cover_image_url ? (
            <img
              src={event.cover_image_url}
              alt={event.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ink-800 bg-grain">
              <CalendarDays className="h-8 w-8 text-silver-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-transparent to-transparent" />
          {event.visibility === 'members' && (
            <span className="absolute right-3 top-3 border border-gold-500/40 bg-ink-950/80 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300 backdrop-blur-sm">
              Members only
            </span>
          )}
        </div>
        <div className="flex gap-4 p-5">
          <div className="flex w-12 shrink-0 flex-col items-center border border-white/10 bg-ink-900 py-2">
            <span className="font-display text-xl leading-none text-gold-300">{day}</span>
            <span className="font-mono text-2xs tracking-[0.15em] text-silver-500">{month}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base leading-snug transition-colors group-hover:text-gold-200">
              {event.title}
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-silver-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </p>
            <p className="mt-1 text-xs text-silver-500">{event.event_time}</p>
          </div>
        </div>
      </Link>
    </Card>
  );
}
