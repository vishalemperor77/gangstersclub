import { useEffect, useState } from 'react';
import { Megaphone, Pencil, Trash2, Plus } from 'lucide-react';
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
  content: '',
  priority: 'normal',
  target: 'all_members',
  status: 'published',
};

export default function AdminAnnouncements() {
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
      const data = await api.adminAnnouncements({ page: p, limit: 15 });
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
    if (form.content.trim().length < 10) next.content = 'Content is too short';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    try {
      setBusy(true);
      if (editing === 'new') {
        await api.createAnnouncement(form);
        toast.success('Announcement published to members.');
      } else {
        await api.updateAnnouncement(editing, form);
        toast.success('Announcement updated.');
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
      await api.deleteAnnouncement(pendingDelete.id);
      toast.success('Announcement deleted.');
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
      label: 'Announcement',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-silver-100">{row.title}</p>
          <p className="truncate text-xs text-silver-500">{row.content}</p>
        </div>
      ),
    },
    {
      key: 'target',
      label: 'Audience',
      render: (row) => <span className="font-mono text-2xs uppercase text-silver-400">{row.target === 'all_members' ? 'Members' : 'Public'}</span>,
      cellClassName: 'hidden md:table-cell',
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => <Badge status={row.priority}>{row.priority}</Badge>,
      cellClassName: 'hidden sm:table-cell',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (row) => <span className="text-xs text-silver-400">{formatDate(row.published_at || row.created_at)}</span>,
      cellClassName: 'hidden lg:table-cell',
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
            aria-label="Edit announcement"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-danger/50 hover:text-danger"
            aria-label="Delete announcement"
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
        title="Announcements"
        description="Official club notices. Member-targeted announcements generate notifications."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        }
      />

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements"
          description="Create one to notify every active member."
          action={<Button onClick={openNew}>New Announcement</Button>}
        />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850">
          <Table columns={columns} data={items} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New announcement' : 'Edit announcement'}
        size="lg"
      >
        <form className="space-y-5" onSubmit={save} noValidate>
          <Field label="Title" htmlFor="a-title" required error={errors.title}>
            <Input id="a-title" name="title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} error={errors.title} />
          </Field>
          <Field label="Content" htmlFor="a-content" required error={errors.content}>
            <Textarea
              id="a-content"
              name="content"
              rows={5}
              value={form.content}
              onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
              error={errors.content}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Priority" htmlFor="a-priority">
              <Select id="a-priority" value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </Select>
            </Field>
            <Field label="Audience" htmlFor="a-target">
              <Select id="a-target" value={form.target} onChange={(e) => setForm((s) => ({ ...s, target: e.target.value }))}>
                <option value="all_members">All Members</option>
                <option value="public">Public</option>
              </Select>
            </Field>
            <Field label="Status" htmlFor="a-status">
              <Select id="a-status" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </Select>
            </Field>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={busy}>
              {editing === 'new' ? 'Publish' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onDelete}
        title="Delete this announcement?"
        message="Members will no longer see this notice. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={busy}
      />
    </div>
  );
}
