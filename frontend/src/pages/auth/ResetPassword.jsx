import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Input';
import { CheckCircle2, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [mode, setMode] = useState('request'); // 'request' | 'update'
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  /**
   * A recovery link lands on this route carrying a short-lived recovery
   * session — `#...&type=recovery` in the hash for the implicit flow, or
   * `?code=...` for PKCE. When that is detected we switch straight to the
   * "choose a new password" step instead of asking for the email again.
   */
  useEffect(() => {
    const viaHash = window.location.hash.includes('type=recovery');
    const viaCode = new URLSearchParams(window.location.search).has('code');
    if (viaHash || viaCode) setMode('update');

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('update');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await import('../../lib/api').then((m) => m.default.forgotPassword(email));
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Could not send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  /** Completes the reset: sets the new password on the recovery session. */
  const onUpdate = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 8) next.password = 'At least 8 characters';
    if (form.password !== form.confirm) next.confirm = 'Passwords do not match';
    if (Object.keys(next).length) return setErrors(next);

    try {
      setLoading(true);
      const { error: err } = await supabase.auth.updateUser({ password: form.password });
      if (err) throw err;
      toast.success('Password updated. Sign in with your new password.');
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Could not update your password.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'update') {
    return (
      <section className="container-page flex min-h-[80vh] items-center py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center border border-gold-500/30 bg-gold-500/5">
              <KeyRound className="h-7 w-7 text-gold-300" />
            </span>
            <h1 className="mt-6 font-display text-3xl">Choose a new password</h1>
            <p className="mt-3 text-sm text-silver-400">
              Your reset link has been verified. Set a new password to regain access.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={onUpdate} className="space-y-5" noValidate>
              <Field label="New Password" htmlFor="rp-password" required error={errors.password} hint="Minimum 8 characters">
                <Input
                  id="rp-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  error={errors.password}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm New Password" htmlFor="rp-confirm" required error={errors.confirm}>
                <Input
                  id="rp-confirm"
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={onChange}
                  error={errors.confirm}
                  autoComplete="new-password"
                />
              </Field>
              <Button type="submit" size="lg" isLoading={loading} className="w-full">
                Update Password
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs text-silver-500">
            Link expired?{' '}
            <Link to="/reset-password" onClick={() => setMode('request')} className="font-mono text-2xs uppercase tracking-[0.15em] text-gold-400 link-underline">
              Request a new one
            </Link>
          </p>
        </div>
      </section>
    );
  }

  if (sent) {
    return (
      <section className="container-page flex min-h-[80vh] items-center py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center border border-gold-500/30 bg-gold-500/5">
            <CheckCircle2 className="h-7 w-7 text-gold-300" />
          </span>
          <h1 className="mt-6 font-display text-2xl">Check your inbox</h1>
          <p className="mt-3 text-sm text-silver-400">
            If an account exists for that address, a password reset link is on its way.
          </p>
          <div className="mt-8">
            <Button to="/login" variant="outline">
              Back to Sign In
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page flex min-h-[80vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-gold-500/40 bg-ink-900">
              <span className="font-display text-sm font-bold text-metal">GC</span>
            </span>
            <span className="font-display text-sm font-semibold tracking-[0.3em]">
              GANGSTERS <span className="text-metal">CLUB</span>
            </span>
          </Link>
          <h1 className="mt-8 font-display text-3xl">Reset password</h1>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Email" htmlFor="email" required error={error}>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                error={error}
                autoComplete="email"
              />
            </Field>
            <Button type="submit" size="lg" isLoading={loading} className="w-full">
              Send Reset Link
            </Button>
          </form>
        </Card>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-6 w-full text-center font-mono text-2xs uppercase tracking-[0.15em] text-silver-400 transition-colors hover:text-gold-300"
        >
          Back to Sign In
        </button>
      </div>
    </section>
  );
}
