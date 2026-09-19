import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Input';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../../lib/utils';

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useAsync(() => api.adminApplication(id), [id]);
  const app = data?.application;

  const confirm = async () => {
    try {
      setBusy(true);
      if (action === 'approve') {
        await api.approveApplication(id);
        toast.success('Application approved. Member account activated and ID issued.');
      } else {
        await api.rejectApplication(id, reason);
        toast.success('Application rejected.');
      }
      setAction(null);
      setReason('');
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader label="Loading application" />;
  if (error || !app)
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState title="Application not found" onRetry={() => navigate('/admin/applications')} />
      </div>
    );

  const pending = app.status === 'pending';

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => navigate('/admin/applications')}
        className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Applications
      </button>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar src={app.profile_photo_url} name={app.full_name} size={72} />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-display text-2xl">{app.full_name}</h1>
                  <Badge status={app.status}>{app.status}</Badge>
                </div>
                <p className="mt-1 font-mono text-2xs text-silver-500">
                  {app.application_code} · submitted {formatDate(app.created_at)}
                </p>
                {app.reviewed_at && (
                  <p className="mt-1 font-mono text-2xs text-silver-600">Reviewed {formatDate(app.reviewed_at)}</p>
                )}
              </div>
            </div>

            <dl className="mt-8 grid gap-px sm:grid-cols-2">
              <Detail label="Email" value={app.email} />
              <Detail label="Username" value={`@${app.username}`} />
              <Detail label="Phone" value={app.phone || '—'} />
              <Detail label="City" value={app.city || '—'} />
              <Detail label="Date of Birth" value={app.date_of_birth ? formatDate(app.date_of_birth) : '—'} />
              <Detail label="Terms Accepted" value={app.terms_accepted ? 'Yes' : 'No'} />
            </dl>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Introduction</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-silver-300">{app.introduction}</p>
              </div>
              <div>
                <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Why they want to join</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-silver-300">{app.motivation}</p>
              </div>
              {app.rejection_reason && (
                <div className="border border-danger/20 bg-danger/5 p-4">
                  <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-danger">Rejection Reason</h3>
                  <p className="mt-2 text-sm text-silver-300">{app.rejection_reason}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="w-full shrink-0 space-y-3 lg:w-64">
          {pending ? (
            <>
              <div className="border border-white/[0.06] bg-ink-850 p-5">
                <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Review</h3>
                <p className="mt-2 text-xs leading-relaxed text-silver-400">
                  Approving activates the member account, issues a unique Member ID and generates their
                  QR verification card.
                </p>
              </div>
              <Button onClick={() => setAction('approve')} className="w-full">
                <Check className="h-4 w-4" /> Approve
              </Button>
              <Button variant="danger" onClick={() => setAction('reject')} className="w-full">
                <X className="h-4 w-4" /> Reject
              </Button>
            </>
          ) : (
            <div className="border border-white/[0.06] bg-ink-850 p-5 text-center">
              <Badge status={app.status}>{app.status}</Badge>
              <p className="mt-3 text-xs text-silver-500">
                This application has already been {app.status}. Further changes are not permitted.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={action === 'approve'}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        title="Approve this application?"
        message={`${app.full_name} will become an active member. A unique Member ID and digital ID card will be issued automatically. This action is logged.`}
        confirmLabel="Approve Member"
        loading={busy}
      />

      <Modal open={action === 'reject'} onClose={() => setAction(null)} title="Reject application" size="sm">
        <p className="text-sm text-silver-400">
          {app.full_name} will be notified. Providing a reason is optional but recommended.
        </p>
        <div className="mt-5">
          <label htmlFor="reason" className="mb-2 block font-mono text-2xs uppercase tracking-[0.2em] text-silver-300">
            Rejection reason (optional)
          </label>
          <Textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Application does not meet current membership criteria."
          />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setAction(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} isLoading={busy}>
            Reject Application
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="border-b border-white/[0.04] py-3.5 [&:nth-child(odd)]:sm:border-r sm:px-1">
      <dt className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">{label}</dt>
      <dd className="mt-1 text-sm text-silver-200">{value}</dd>
    </div>
  );
}
