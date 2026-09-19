import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, Search, ScanLine } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input, Field } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Feedback';
import { Reveal } from '../../components/ui/Reveal';
import { formatMonthYear, isValidMemberId } from '../../lib/utils';

export default function Verify() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(memberId || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (id) => {
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
      setResult({ valid: false, status: 'error', message: err.message || 'Verification failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Direct QR deep-link: /verify/GC-2026-000001
  useEffect(() => {
    if (memberId) {
      setValue(memberId.toUpperCase());
      run(memberId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const onSubmit = (e) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    navigate(`/verify/${id}`, { replace: true });
    run(id);
  };

  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-xl">
        <Reveal className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-gold-500/30 bg-gold-500/5">
            <ScanLine className="h-6 w-6 text-gold-300" />
          </span>
          <p className="mt-6 font-mono text-2xs uppercase tracking-[0.35em] text-gold-400">Member Verification</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Verify a member</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-silver-400">
            Enter a Gangsters Club Member ID or scan a member's ID card to confirm their standing.
          </p>
        </Reveal>

        <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
          <Field label="Member ID" htmlFor="memberId" error={error} hint="Format: GC-YYYY-NNNNNN">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="memberId"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="GC-2026-000001"
                error={error}
                className="flex-1 font-mono uppercase"
                autoCapitalize="characters"
                spellCheck="false"
              />
              <Button type="submit" isLoading={loading} className="shrink-0">
                <Search className="h-4 w-4" /> Verify
              </Button>
            </div>
          </Field>
        </form>

        {loading && (
          <div className="mt-10 flex flex-col items-center gap-3 border border-white/[0.06] bg-ink-850 py-12">
            <Spinner size={24} />
            <p className="font-mono text-2xs uppercase tracking-[0.25em] text-silver-500">Checking the registry</p>
          </div>
        )}

        {!loading && result && <ResultCard result={result} />}
      </div>
    </section>
  );
}

function ResultCard({ result }) {
  if (result.status === 'active') {
    return (
      <div className="mt-10 border border-success/30 bg-success/[0.04] animate-scale-in">
        <div className="border-b border-success/20 px-6 py-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-success" />
            <div>
              <p className="font-display text-lg text-success">Verified Member</p>
              <p className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">Gangsters Club</p>
            </div>
          </div>
        </div>
        <dl className="grid gap-px sm:grid-cols-2">
          <Detail label="Member Name" value={result.full_name} />
          <Detail label="Member ID" value={result.member_id} mono />
          <Detail label="Status" value="Active" />
          <Detail label="Member Since" value={formatMonthYear(result.member_since)} />
        </dl>
      </div>
    );
  }

  if (result.status === 'suspended') {
    return (
      <div className="mt-10 border border-warning/30 bg-warning/[0.04] px-6 py-10 text-center animate-scale-in">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
        <p className="mt-4 font-display text-lg text-warning">Membership Suspended</p>
        <p className="mt-2 font-mono text-sm text-silver-400">{result.member_id}</p>
        <p className="mt-3 text-sm text-silver-400">{result.message}</p>
      </div>
    );
  }

  if (result.status === 'inactive') {
    return (
      <div className="mt-10 border border-silver-500/20 bg-ink-850 px-6 py-10 text-center animate-scale-in">
        <AlertTriangle className="mx-auto h-8 w-8 text-silver-300" />
        <p className="mt-4 font-display text-lg text-silver-200">Membership Inactive</p>
        <p className="mt-2 font-mono text-sm text-silver-400">{result.member_id}</p>
        <p className="mt-3 text-sm text-silver-400">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="mt-10 border border-danger/30 bg-danger/[0.04] px-6 py-10 text-center animate-scale-in">
      <XCircle className="mx-auto h-8 w-8 text-danger" />
      <p className="mt-4 font-display text-lg text-danger">Invalid Member ID</p>
      <p className="mt-3 text-sm text-silver-400">
        {result.message || 'No membership matches this Member ID.'}
      </p>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="border-b border-white/[0.04] px-6 py-4 [&:nth-child(odd)]:sm:border-r">
      <dt className="font-mono text-2xs uppercase tracking-[0.2em] text-silver-500">{label}</dt>
      <dd className={`mt-1.5 text-sm text-silver-100 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}
