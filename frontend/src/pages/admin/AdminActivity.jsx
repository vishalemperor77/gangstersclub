import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import api from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Card';
import { Pagination, EmptyState, PageLoader } from '../../components/ui/Feedback';
import { AdminPageHeader, ActivityFeed } from '../../components/admin/Parts';

export default function AdminActivity() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.adminActivity({ page, limit: 20 });
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

  if (loading) return <PageLoader label="Loading logs" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Activity Logs"
        description="An immutable audit trail of every administrative action."
      />

      {items.length === 0 ? (
        <EmptyState icon={History} title="No activity recorded" description="Administrative actions appear here." />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850 px-5 py-4">
          <ActivityFeed items={items} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
}
