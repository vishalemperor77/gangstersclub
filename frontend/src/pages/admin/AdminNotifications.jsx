import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea, Select } from '../../components/ui/Input';
import { AdminPageHeader } from '../../components/admin/Parts';

export default function AdminNotifications() {
  const toast = useToast();
  const [form, setForm] = useState({ user_id: 'all', title: '', body: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.title.trim().length < 3) next.title = 'A title is required';
    if (form.body.trim().length < 5) next.body = 'A message is required';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    try {
      setBusy(true);
      const res = await api.adminNotify(form);
      setResult(res);
      toast.success(res.message || 'Notification sent.');
      setForm((f) => ({ ...f, title: '', body: '' }));
    } catch (err) {
      toast.error(err.message || 'Could not send.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Send a notification directly to a member, or to every active member at once."
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <Field label="Recipient" htmlFor="n-recipient">
            <Select id="n-recipient" value={form.user_id} onChange={(e) => setForm((s) => ({ ...s, user_id: e.target.value }))}>
              <option value="all">All active members</option>
            </Select>
          </Field>
          <Field label="Title" htmlFor="n-title" required error={errors.title}>
            <Input id="n-title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} error={errors.title} placeholder="e.g. New vault release" />
          </Field>
          <Field label="Message" htmlFor="n-body" required error={errors.body}>
            <Textarea id="n-body" rows={5} value={form.body} onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))} error={errors.body} />
          </Field>
          <div className="flex justify-end border-t border-white/[0.06] pt-6">
            <Button type="submit" isLoading={busy}>
              <Send className="h-4 w-4" /> Send Notification
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <div className="border border-success/25 bg-success/[0.04] p-5">
          <p className="text-sm text-success">{result.message}</p>
          <p className="mt-1 font-mono text-2xs uppercase tracking-[0.15em] text-silver-500">
            {result.recipients} recipient{result.recipients === 1 ? '' : 's'}
          </p>
        </div>
      )}
    </div>
  );
}
