import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field, Input } from '../../components/ui/Input';

export default function Login() {
  const { signIn, refresh } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'At least 8 characters';
    if (Object.keys(next).length) return setErrors(next);

    try {
      setLoading(true);
      await signIn(form.email, form.password);
      // Load the identity for the new session so the redirect matches the role:
      // an administrator belongs on /admin, a member on /member. Before this,
      // every sign-in went to /member (and the member shell had no way back to
      // the admin area), so an admin login looked like a member login.
      const identity = await refresh();
      toast.success('Signed in.');
      const from = location.state?.from?.pathname;
      const isAdminNow = identity?.profile?.role === 'admin';
      navigate(from || (isAdminNow ? '/admin' : '/member'), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="mt-8 font-display text-3xl">Members' entrance</h1>
          <p className="mt-3 text-sm text-silver-400">Sign in to access your dashboard.</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <Input id="email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="password" required error={errors.password}>
              <Input id="password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} autoComplete="current-password" />
            </Field>
            <div className="flex justify-end">
              <Link
                to="/reset-password"
                className="font-mono text-2xs uppercase tracking-[0.15em] text-silver-400 transition-colors hover:text-gold-300"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" size="lg" isLoading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-silver-400">
          Not a member yet?{' '}
          <Link to="/apply" className="font-mono text-2xs uppercase tracking-[0.15em] text-gold-400 link-underline">
            Apply for membership
          </Link>
        </p>
      </div>
    </section>
  );
}
