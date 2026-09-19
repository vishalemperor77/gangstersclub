import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { NewsCard } from '../../components/public/Cards';
import { Pagination, PageLoader, EmptyState } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { Newspaper } from 'lucide-react';

export default function NewsList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.news({ page, limit: 9 });
        if (!active) return;
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch {
        /* handled by empty state */
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
          <p className="font-mono text-2xs uppercase tracking-[0.35em] text-gold-400">Club News</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Dispatches</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-silver-400">
            Official announcements, club reports and stories from inside the circle.
          </p>
        </Reveal>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState icon={Newspaper} title="No news yet" description="The first dispatches will appear here." />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article, i) => (
              <Reveal key={article.id} delay={i * 70}>
                <NewsCard article={article} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </section>
  );
}
