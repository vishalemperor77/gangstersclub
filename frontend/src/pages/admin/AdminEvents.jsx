import { useEffect, useState } from 'react';
import { CalendarDays, Pencil, Trash2, Plus } from 'lucide-react';
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
  description: '',
  event_date: '',
  event_time: '19:00',
  location: '',
  cover_image_url: '',
  visibility: 'public',
  rsvp_enabled: false,
  status: 'published',
};

export default function AdminEvents() {
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
      const data = await api.adminEvents({ page: p, limit: 15 });
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
    setForm({ ...row, event_date: row.event_date ? row.event_date.slice(0, 10) : '' });
    setErrors({});
    setEditing(row.id);
  };

  const save = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.title.trim().length < 3) next.title = 'Title is required';
    if (form.description.trim().length < 10) next.description = 'Add a description';
    if (!form.event_date) next.event_date = 'Pick a date';
    if (!form.event_time) next.event_time = 'Pick a time';
    if (!form.location.trim()) next.location = 'Location is required';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    try {
      setBusy(true);
      if (editing === 'new') {
        await api.createEvent(form);
        toast.success('Event created.');
      } else {
        await api.updateEvent(editing, form);
        toast.success('Event updated.');
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
      await api.deleteEvent(pendingDelete.id);
      toast.success('Event deleted.');
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
      label: 'Event',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-silver-100">{row.title}</p>
          <p className="truncate text-xs text-silver-500">{row.location}</p>
        </div>
      ),
    },
    {
      key: 'event_date',
      label: 'Date',
      render: (row) => <span className="whitespace-nowrap text-xs text-silver-400">{formatDate(row.event_date)}</span>,
      cellClassName: 'hidden sm:table-cell',
    },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (row) => (
        <span className="font-mono text-2xs uppercase text-silver-400">{row.visibility === 'members' ? 'Members' : 'Public'}</span>
      ),
      cellClassName: 'hidden md:table-cell',
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
            aria-label="Edit event"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="flex h-7 w-7 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-danger/50 hover:text-danger"
            aria-label="Delete event"
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
        title="Events"
        description="Create and manage club gatherings. Published events notify active members."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New Event
          </Button>
        }
      />

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events"
          description="Create an event to announce it to the club."
          action={<Button onClick={openNew}>New Event</Button>}
        />
      ) : (
        <div className="border border-white/[0.06] bg-ink-850">
          <Table columns={columns} data={items} />
        </div>
      )}

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'New event' : 'Edit event'} size="lg">
        <form className="space-y-5" onSubmit={save} noValidate>
          <Field label="Event Title" htmlFor="e-title" required error={errors.title}>
            <Input id="e-title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} error={errors.title} />
          </Field>
          <Field label="Description" htmlFor="e-desc" required error={errors.description}>
            <Textarea
              id="e-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              error={errors.description}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" htmlFor="e-date" required error={errors.event_date}>
              <Input
                id="e-date"
                type="date"
                value={form.event_date}
                onChange={(e) => setForm((s) => ({ ...s, event_date: e.target.value }))}
                error={errors.event_date}
              />
            </Field>
            <Field label="Time" htmlFor="e-time" required error={errors.event_time}>
              <Input
                id="e-time"
                type="time"
                value={form.event_time}
                onChange={(e) => setForm((s) => ({ ...s, event_time: e.target.value }))}
                error={errors.event_time}
              />
            </Field>
          </div>
          <Field label="Location" htmlFor="e-loc" required error={errors.location}>
            <Input id="e-loc" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} error={errors.location} />
          </Field>
          <Field label="Cover image URL" htmlFor="e-cover">
            <Input id="e-cover" value={form.cover_image_url} onChange={(e) => setForm((s) => ({ ...s, cover_image_url: e.target.value }))} className="font-mono" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Visibility" htmlFor="e-vis">
              <Select id="e-vis" value={form.visibility} onChange={(e) => setForm((s) => ({ ...s, visibility: e.target.value }))}>
                <option value="public">Public</option>
                <option value="members">Members only</option>
              </Select>
            </Field>
            <Field label="Status" htmlFor="e-status">
              <Select id="e-status" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </Select>
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-silver-300">
            <input type="checkbox" checked={form.rsvp_enabled} onChange={(e) => setForm((s) => ({ ...s, rsvp_enabled: e.target.checked }))} className="h-4 w-4 accent-gold-500" />
            Enable RSVP for members
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={busy}>
              {editing === 'new' ? 'Create Event' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={onDelete}
        title="Delete this event?"
        message={`"${pendingDelete?.title}" and its RSVPs will be removed. This cannot be undone.`}
        confirmLabel="Delete Event"
        danger
        loading={busy}
      />
    </div>
  );
}
