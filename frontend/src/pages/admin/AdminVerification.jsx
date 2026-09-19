import { useState } from 'react';
import { ScanLine, CheckCircle2, XCircle, AlertTriangle, Search } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Feedback';
import { AdminPageHeader } from '../../components/admin/Parts';
import { formatMonthYear, isValidMemberId } from '../../lib/utils';

export default function AdminVerification() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (!isValidMemberId(id)) {
      setError('Enter a valid Member ID, e.g. GC-2026-000001');
      setResult(null);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      setResult(null);
      const data = await api.verify(id);
      setResult(data);
    } catch (err) {
      setResult({ valid: false, status: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AdminPageHeader
        title="Verification"
        description="Run the same registry lookup a member's QR code performs."
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-4" onSubmit={run} noValidate>
          <Field label="Member ID" htmlFor="v-id" error={error} hint="Format: GC-YYYY-NNNNNN">
            <Input
              id="v-id"
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="GC-2026-000001"
              error={error}
              className="font-mono uppercase"
              spellCheck="false"
              autoCapitalize="characters"
            />
          </Field>
          <Button type="submit" isLoading={loading}>
            <Search className="h-4 w-4" /> Verify Member
          </Button>
        </form>
      </Card>

      {loading && (
        <Card className="flex items-center justify-center gap-3 py-10">
          <Spinner size={22} />
          <span className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Checking the registry</span>
        </Card>
      )}

      {!loading && result && <ResultPanel result={result} />}

      {!loading && !result && (
        <div className="flex items-start gap-3 border border-white/[0.06] bg-ink-850 p-5">
          <ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
          <p className="text-xs leading-relaxed text-silver-400">
            Verification returns only public fields: member name, Member ID, status and join date.
            Email, phone and date of birth are never exposed — even to this panel.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultPanel({ result }) {
  if (result.status === 'active') {
    return (
      <div className="border border-success/30 bg-success/[0.04]">
        <div className="flex items-center gap-3 border-b border-success/20 px-6 py-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <p className="font-display text-base text-success">Verified Member</p>
        </div>
        <dl className="grid gap-px sm:grid-cols-2">
          <Row label="Member Name" value={result.full_name} />
          <Row label="Member ID" value={result.member_id} mono />
          <Row label="Status" value="Active" />
          <Row label="Member Since" value={formatMonthYear(result.member_since)} />
        </dl>
      </div>
    );
  }

  if (result.status === 'suspended') {
    return (
      <div className="flex items-center gap-3 border border-warning/30 bg-warning/[0.04] px-6 py-6">
        <AlertTriangle className="h-6 w-6 text-warning" />
        <div>
          <p className="font-display text-base text-warning">Membership Suspended</p>
          <p className="mt-1 font-mono text-sm text-silver-400">{result.member_id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 border border-danger/30 bg-danger/[0.04] px-6 py-6">
      <XCircle className="h-6 w-6 text-danger" />
      <div>
        <p className="font-display text-base text-danger">Invalid Member ID</p>
        <p className="mt-1 text-sm text-silver-400">{result.message || 'No membership found.'}</p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="border-b border-white/[0.04] px-6 py-3.5 [&:nth-child(odd)]:sm:border-r">
      <dt className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">{label}</dt>
      <dd className={`mt-1 text-sm text-silver-100 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
