import { useEffect, useState } from 'react';
import { Vault as VaultIcon, Pencil, Trash2, Plus } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Field, Input, Textarea, Select } from '../../components/ui/Input';
import { Pagination, EmptyState, PageLoader } from '../../components/ui/Feedback';
import { AdminPageHeader } from '../../components/admin/Parts';
import { formatDate } from '../../lib/utils';

const EMPTY = {
  title: '',
  slug: '',
  category: 'Intelligence',
  excerpt: '',
  content: '',
  cover_image_url: '',
  status: 'draft',
};

export default function AdminVault() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async (p) => {
    try {
      setLoading(true);
      const data = await api.adminVault({ page: p, limit: 15 });
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

  const openNew = () => {
    setForm(EMPTY);
    setErrors({});
    setEditing('new');
  };

  const openEdit = (row) => {
    setForm({ ...row });
    setErrors({});
    setEditing(row.id);
  };

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.title.trim().length < 3) next.title = 'Title is required';
    if (form.excerpt.trim().length < 10) next.excerpt = 'Add a short summary';
    if (form.content.trim().length < 20) next.content = 'Content is too short';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    try {
      setBusy(true);
      if (editing === 'new') {
        await api.createVault(form);
        toast.success('Vault release added.');
      } else {
        await api.updateVault(editing, form);
        toast.success('Vault release updated.');
      }
      setEditing(null);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    try {
      setBusy(true);
      await api.deleteVault(pendingDelete.id);
      toast.success('Vault item deleted.');
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
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="font-mono text-2xs uppercase text-silver-400">{row.category}</span>,
      cellClassName: 'hidden md:table-cell',
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => <span className="text-xs text-silver-400">{formatDate(row.created_at)}</span>,
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
            onClick={() => openEdit(row)}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-gold-500/40 hover:text-gold-300"
            aria-label="Edit vault item"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-danger/50 hover:text-danger"
            aria-label="Delete vault item"
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
        title="The Vault"
        description="Members-only content. Published items are visible to active members only."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New Release
          </Button>
        }
      />

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={VaultIcon}
          title="The vault is empty"
          description="Add exclusive content for active members."
          action={<Button onClick={openNew}>New Release</Button>}
        />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850">
          <Table columns={columns} data={items} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New vault release' : 'Edit vault release'} size="lg">
        <form className="space-y-5" onSubmit={save} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="v-title" required error={errors.title}>
              <Input id="v-title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} error={errors.title} />
            </Field>
            <Field label="Category" htmlFor="v-cat">
              <Select id="v-cat" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
                {['Intelligence', 'Briefing', 'Archive', 'Member Assets', 'Private Document'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Slug" htmlFor="v-slug" hint="Leave blank to auto-generate">
            <Input id="v-slug" value={form.slug} onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))} className="font-mono" />
          </Field>
          <Field label="Short Summary" htmlFor="v-excerpt" required error={errors.excerpt}>
            <Textarea id="v-excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))} error={errors.excerpt} />
          </Field>
          <Field label="Content" htmlFor="v-content" required error={errors.content}>
            <Textarea id="v-content" rows={10} value={form.content} onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))} error={errors.content} />
          </Field>
          <Field label="Cover image URL" htmlFor="v-cover">
            <Input id="v-cover" value={form.cover_image_url} onChange={(e) => setForm((s) => ({ ...s, cover_image_url: e.target.value }))} className="font-mono" />
          </Field>
          <Field label="Status" htmlFor="v-status">
            <Select id="v-status" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </Select>
          </Field>
          <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={busy}>
              {editing === 'new' ? 'Add to Vault' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onDelete}
        title="Delete this vault item?"
        message="Members will lose access to this content immediately. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={busy}
      />
    </div>
  );
}
