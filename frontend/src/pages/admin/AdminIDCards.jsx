import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IdCard } from 'lucide-react';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Pagination, EmptyState, PageLoader } from '../../components/ui/Feedback';
import { AdminPageHeader } from '../../components/admin/Parts';
import { formatMonthYear } from '../../lib/utils';

export default function AdminIDCards() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.adminMembers({ page, limit: 12 });
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
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="ID Cards"
        description="Every approved member is issued a unique, QR-verifiable digital card."
      />

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState icon={IdCard} title="No cards issued" description="Cards are issued when applications are approved." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar src={m.profile?.avatar_url} name={m.profile?.full_name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-silver-100">{m.profile?.full_name}</p>
                  <p className="truncate font-mono text-2xs text-gold-300">{m.member_id}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4 font-mono text-2xs text-silver-500">
                <span>Since {formatMonthYear(m.member_since)}</span>
                <Link
                  to={`/verify/${m.member_id}`}
                  className="text-gold-400 transition-colors hover:text-gold-300"
                >
                  Verify →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
