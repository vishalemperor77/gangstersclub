import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Vault as VaultIcon, ArrowUpRight, Lock } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { PageLoader, EmptyState, Pagination } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { relativeTime } from '../../lib/utils';

export default function Vault() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.vault({ page, limit: 12 });
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
    <div className="mx-auto max-w-5xl">
      <div className="mb-10 border border-gold-500/20 bg-gradient-to-br from-gold-500/[0.05] to-transparent p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-gold-300" />
          <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Members Only</p>
        </div>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">The Vault</h1>
        <p className="mt-3 max-w-2xl text-sm text-silver-400">
          Private briefings, exclusive content and club material reserved for active members. Nothing
          here is published publicly.
        </p>
      </div>

      {loading ? (
        <PageLoader label="Opening the vault" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={VaultIcon}
          title="The vault is empty"
          description="New releases will be announced to members first."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <Card hover className="group h-full">
                  <Link to={`/member/vault/${item.slug}`} className="flex h-full flex-col">
                    {item.cover_image_url ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="border border-gold-500/40 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-gold-300">
                          {item.category}
                        </span>
                        <span className="font-mono text-2xs text-silver-600">{relativeTime(item.created_at)}</span>
                      </div>
                      <h3 className="mt-3 font-display text-lg leading-snug transition-colors group-hover:text-gold-200">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-silver-400">{item.excerpt}</p>
                      <div className="mt-4 flex items-center gap-1.5 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400">
                        Access file <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                </Card>
              </Reveal>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
