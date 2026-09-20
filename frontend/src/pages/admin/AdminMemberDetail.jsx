import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Check, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Card, Badge } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input, Field, Textarea } from '../../components/ui/Input';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { useAsync } from '../../hooks/useAsync';
import { MemberCardVisual } from '../../pages/member/MemberIDCard';
import { formatDate } from '../../lib/utils';

export default function AdminMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState(null); // 'suspend' | 'reactivate' | 'edit' | 'remove'
  const [reason, setReason] = useState('');
  const [edit, setEdit] = useState({ full_name: '', username: '', email: '', phone: '', city: '', level: '' });

  const { data, loading, error, refetch } = useAsync(() => api.adminMember(id), [id]);

  const openEdit = () => {
    setEdit({
      full_name: data.profile?.full_name || '',
      username: data.profile?.username || '',
      email: data.profile?.email || '',
      phone: data.profile?.phone || '',
      city: data.profile?.city || '',
      level: data.membership?.level || '',
    });
    setDialog('edit');
  };

  const submitEdit = async () => {
    try {
      setBusy(true);
      await api.updateMember(id, edit);
      toast.success('Member updated.');
      setDialog(null);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update member.');
    } finally {
      setBusy(false);
    }
  };

  const submitSuspend = async () => {
    try {
      setBusy(true);
      await api.suspendMember(id, reason);
      toast.success('Member suspended. Access revoked.');
      setDialog(null);
      setReason('');
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Could not suspend member.');
    } finally {
      setBusy(false);
    }
  };

  const submitReactivate = async () => {
    try {
      setBusy(true);
      await api.reactivateMember(id);
      toast.success('Member reactivated.');
      setDialog(null);
      await refetch();
    } catch (err) {
      toast.error(err.message || 'Could not reactivate member.');
    } finally {
      setBusy(false);
    }
  };

  const submitRemove = async () => {
    try {
      setBusy(true);
      await api.removeMember(id);
      toast.success('Member removed permanently.');
      setDialog(null);
      navigate('/admin/members');
    } catch (err) {
      toast.error(err.message || 'Could not remove member.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader label="Loading member" />;
  if (error || !data)
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState title="Member not found" onRetry={() => navigate('/admin/members')} />
      </div>
    );

  const { membership, profile, verification } = data;

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate('/admin/members')}
        className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.2em] text-silver-400 transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Members
      </button>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size={72} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl">{profile?.full_name}</h1>
                <Badge status={membership.status}>{membership.status}</Badge>
              </div>
              <p className="mt-1 font-mono text-2xs text-gold-300">{membership.member_id}</p>
              <p className="mt-1 font-mono text-2xs text-silver-500">
                Member since {formatDate(membership.member_since)}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid gap-px sm:grid-cols-2">
            <Detail label="Email" value={profile?.email} />
            <Detail label="Username" value={`@${profile?.username}`} />
            <Detail label="Phone" value={profile?.phone || '—'} />
            <Detail label="City" value={profile?.city || '—'} />
            <Detail label="Date of Birth" value={profile?.date_of_birth ? formatDate(profile.date_of_birth) : '—'} />
            <Detail label="Level" value={membership.level} />
            <Detail label="Verification Token" value={verification?.token ? `${verification.token.slice(0, 12)}…` : '—'} />
            <Detail label="Account Status" value={profile?.status} />
          </dl>

          {profile?.bio && (
            <div className="mt-6">
              <h3 className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Bio</h3>
              <p className="mt-2 text-sm leading-relaxed text-silver-300">{profile.bio}</p>
            </div>
          )}
        </Card>

        <div className="flex w-full flex-col gap-3 lg:w-56">
          <Button variant="surface" onClick={openEdit}>
            <Pencil className="h-4 w-4" /> Edit Member
          </Button>
          {membership.status === 'active' ? (
            <Button variant="danger" onClick={() => setDialog('suspend')}>
              <Ban className="h-4 w-4" /> Suspend
            </Button>
          ) : (
            <Button onClick={() => setDialog('reactivate')}>
              <Check className="h-4 w-4" /> Reactivate
            </Button>
          )}
          <Button variant="danger" onClick={() => setDialog('remove')}>
            <Trash2 className="h-4 w-4" /> Remove Member
          </Button>
          <a
            href={`/verify/${membership.member_id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-white/10 px-5 py-2.5 font-mono text-2xs uppercase tracking-[0.2em] text-silver-200 transition-all hover:border-gold-500/40 hover:text-gold-300"
          >
            <ShieldCheck className="h-4 w-4" /> Public verification
          </a>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="mb-4 font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Issued ID Card</h3>
        <div className="mx-auto max-w-sm">
          <MemberCardVisual
            card={{
              full_name: profile?.full_name,
              member_id: membership.member_id,
              level: membership.level,
              member_since: membership.member_since,
              status: membership.status,
              avatar_url: profile?.avatar_url,
              qr_payload: verification?.qr_payload,
            }}
          />
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={dialog === 'edit'} onClose={() => setDialog(null)} title="Edit member" size="md">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" htmlFor="m-name">
            <Input id="m-name" value={edit.full_name} onChange={(e) => setEdit((s) => ({ ...s, full_name: e.target.value }))} />
          </Field>
          <Field label="Username" htmlFor="m-username">
            <Input id="m-username" value={edit.username} onChange={(e) => setEdit((s) => ({ ...s, username: e.target.value }))} />
          </Field>
          <Field label="Email" htmlFor="m-email">
            <Input id="m-email" type="email" value={edit.email} onChange={(e) => setEdit((s) => ({ ...s, email: e.target.value }))} />
          </Field>
          <Field label="Phone" htmlFor="m-phone">
            <Input id="m-phone" value={edit.phone} onChange={(e) => setEdit((s) => ({ ...s, phone: e.target.value }))} />
          </Field>
          <Field label="City" htmlFor="m-city">
            <Input id="m-city" value={edit.city} onChange={(e) => setEdit((s) => ({ ...s, city: e.target.value }))} />
          </Field>
          <Field label="Level" htmlFor="m-level">
            <Input id="m-level" value={edit.level} onChange={(e) => setEdit((s) => ({ ...s, level: e.target.value }))} />
          </Field>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button onClick={submitEdit} isLoading={busy}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Suspend modal */}
      <Modal open={dialog === 'suspend'} onClose={() => setDialog(null)} title="Suspend member" size="sm">
        <p className="text-sm text-silver-400">
          {profile?.full_name} will immediately lose access to the member dashboard, The Vault and
          member-only events. The action is logged.
        </p>
        <div className="mt-5">
          <label htmlFor="s-reason" className="mb-2 block font-mono text-2xs uppercase tracking-[0.2em] text-silver-300">
            Reason (optional)
          </label>
          <Textarea
            id="s-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Documented for the activity log and the member."
          />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDialog(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submitSuspend} isLoading={busy}>
            Suspend Member
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={dialog === 'reactivate'}
        onClose={() => setDialog(null)}
        onConfirm={submitReactivate}
        title="Reactivate member?"
        message={`${profile?.full_name} will regain full member access immediately.`}
        confirmLabel="Reactivate"
        loading={busy}
      />

      <ConfirmDialog
        open={dialog === 'remove'}
        onClose={() => setDialog(null)}
        onConfirm={submitRemove}
        title="Remove member permanently?"
        message={`${profile?.full_name} (${membership.member_id}) will be permanently deleted: account, membership, ID card, verification token and notifications. The application record is kept for audit. This cannot be undone.`}
        confirmLabel="Remove Permanently"
        loading={busy}
      />
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
