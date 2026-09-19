import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination, EmptyState, PageLoader } from '../../components/ui/Feedback';
import { AdminPageHeader } from '../../components/admin/Parts';
import { formatDate } from '../../lib/utils';

export default function AdminNews() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async (p) => {
    try {
      setLoading(true);
      const data = await api.adminNews({ page: p, limit: 15 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      /* empty state */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const togglePublish = async (row) => {
    const next = row.status === 'published' ? 'unpublished' : 'published';
    try {
      setBusy(true);
      await api.updateNews(row.id, { status: next });
      toast.success(next === 'published' ? 'Article published.' : 'Article unpublished.');
      load(page);
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!pendingDelete) return;
    try {
      setBusy(true);
      await api.deleteNews(pendingDelete.id);
      toast.success('Article deleted.');
      setPendingDelete(null);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Could not delete.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-silver-100">{row.title}</p>
          <p className="truncate font-mono text-2xs text-silver-500">/{row.slug}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category', cellClassName: 'hidden md:table-cell' },
    {
      key: 'published_at',
      label: 'Published',
      render: (row) => <span className="text-xs text-silver-400">{formatDate(row.published_at || row.created_at)}</span>,
      cellClassName: 'hidden sm:table-cell',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePublish(row);
            }}
            disabled={busy}
            className="border border-white/10 px-2.5 py-1 font-mono text-2xs uppercase tracking-[0.1em] text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-300 disabled:opacity-50"
          >
            {row.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/news/${row.id}/edit`);
            }}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-gold-500/40 hover:text-gold-300"
            aria-label="Edit article"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(row);
            }}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-danger/50 hover:text-danger"
            aria-label="Delete article"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="News"
        description="Create, edit and control what the public sees."
        action={
          <Button to="/admin/news/new">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        }
      />

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No articles"
          description="Create your first article to publish it on the public website."
          action={<Button to="/admin/news/new">New Article</Button>}
        />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850">
          <Table columns={columns} data={items} onRowClick={(row) => navigate(`/admin/news/${row.id}/edit`)} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onDelete}
        title="Delete this article?"
        message={`"${pendingDelete?.title}" will be permanently removed from the public website. This cannot be undone.`}
        confirmLabel="Delete Article"
        danger
        loading={busy}
      />
    </div>
  );
}
