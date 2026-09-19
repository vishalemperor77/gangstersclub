import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { PageLoader, EmptyState, Pagination } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { relativeTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export default function MemberAnnouncements() {
  const { refresh } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p) => {
    try {
      setLoading(true);
      const data = await api.announcements({ page: p, limit: 10 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      // Clear the unread badge once announcements are viewed.
      api.markAllRead().then(() => refresh()).catch(() => {});
    } catch {
      /* empty state */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Club Announcements</p>
        <h1 className="mt-3 font-display text-3xl">Official word</h1>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Official club notices will appear here." />
      ) : (
        <div className="space-y-4">
          {items.map((a, i) => (
            <Reveal key={a.id} delay={i * 60}>
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  {a.priority === 'high' && (
                    <span className="border border-danger/40 bg-danger/10 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-danger">
                      Priority
                    </span>
                  )}
                  {a.target === 'public' && (
                    <span className="border border-white/10 px-2 py-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-silver-400">
                      Public
                    </span>
                  )}
                  <span className="ml-auto font-mono text-2xs text-silver-600">
                    {relativeTime(a.published_at || a.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg">{a.title}</h3>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-silver-400">{a.content}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
