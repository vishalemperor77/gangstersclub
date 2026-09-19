import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Upload, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Field, Input, Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Feedback';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';

const EMPTY = {
  full_name: '',
  username: '',
  email: '',
  phone: '',
  city: '',
  date_of_birth: '',
  introduction: '',
  motivation: '',
  profile_photo_url: '',
  terms_accepted: false,
};

export default function Apply() {
  const { loading, isAuthenticated, profile, application, membership, refresh } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (loading) return;
    if (profile) {
      setForm((f) => ({
        ...f,
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        date_of_birth: profile.date_of_birth || '',
        profile_photo_url: profile.avatar_url || '',
      }));
    }
  }, [loading, profile]);

  if (loading) return <PageLoader label="Loading" />;

  // Approved members don't need to apply.
  if (membership?.status === 'active') {
    return (
      <StatusCard
        icon={CheckCircle2}
        eyebrow="Membership Active"
        title="You're already inside"
        body={`Your membership ${membership.member_id} is active. Head to your dashboard.`}
        action={<Button to="/member">Go to Dashboard</Button>}
      />
    );
  }

  if (application?.status === 'pending') {
    return (
      <StatusCard
        icon={Clock}
        eyebrow="Application Status"
        title="Pending Review"
        body="Your application has been submitted and is awaiting review. You will be notified once a decision is made."
        action={<Button to="/member" variant="outline">Check Dashboard</Button>}
      />
    );
  }

  if (application?.status === 'rejected') {
    return (
      <StatusCard
        icon={Clock}
        eyebrow="Application Status"
        title="Not Approved"
        body={
          application.rejection_reason
            ? application.rejection_reason
            : 'Your application was not approved at this time. You may submit a new application.'
        }
        action={<Button to="/member" variant="outline">Dashboard</Button>}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  if (submitted) {
    return (
      <StatusCard
        icon={CheckCircle2}
        eyebrow="Application Submitted"
        title="Pending Review"
        body="Your application has been submitted successfully. An administrator will review it and notify you of a decision."
        action={<Button to="/member">Go to Dashboard</Button>}
      />
    );
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      toast.error('Unsupported format. Use JPG, PNG, WebP or AVIF.');
      return;
    }
    try {
      setUploading(true);
      const res = await api.upload(file, 'avatar');
      if (res.error) throw new Error(res.error);
      setForm((f) => ({ ...f, profile_photo_url: res.url }));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const next = {};
    if (!form.full_name.trim()) next.full_name = 'Full name is required';
    if (form.username.trim().length < 3) next.username = 'At least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.introduction.trim().length < 20) next.introduction = 'Tell us more (20+ characters)';
    if (form.motivation.trim().length < 20) next.motivation = 'Tell us more (20+ characters)';
    if (!form.terms_accepted) next.terms_accepted = 'You must accept the terms';

    if (Object.keys(next).length) {
      setErrors(next);
      toast.error('Please correct the highlighted fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitApplication(form);
      await refresh();
      setSubmitted(true);
      toast.success('Application submitted.');
    } catch (err) {
      if (err.status === 409) {
        toast.error(err.message);
        await refresh();
        navigate('/apply');
      } else {
        toast.error(err.message || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="font-mono text-2xs uppercase tracking-[0.35em] text-gold-400">Membership Application</p>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl">Apply to the club</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-silver-400">
            All fields marked with an asterisk are required. Applications are reviewed individually.
          </p>
        </div>

        <Card className="p-6 sm:p-8 lg:p-10">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <Avatar src={form.profile_photo_url} name={form.full_name} size={72} />
              <div>
                <label
                  htmlFor="photo"
                  className="inline-flex cursor-pointer items-center gap-2 border border-white/15 px-4 py-2 font-mono text-2xs uppercase tracking-[0.15em] text-silver-200 transition-colors hover:border-gold-500/50 hover:text-gold-300"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? 'Uploading…' : 'Upload photo'}
                </label>
                <input id="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onUpload} className="sr-only" />
                <p className="mt-2 text-xs text-silver-500">JPG / PNG / WebP · max 5MB</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="full_name" required error={errors.full_name}>
                <Input id="full_name" name="full_name" value={form.full_name} onChange={onChange} error={errors.full_name} autoComplete="name" />
              </Field>
              <Field label="Username" htmlFor="username" required error={errors.username}>
                <Input id="username" name="username" value={form.username} onChange={onChange} error={errors.username} autoComplete="username" />
              </Field>
              <Field label="Email" htmlFor="email" required error={errors.email}>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
              </Field>
              <Field label="Phone Number" htmlFor="phone" error={errors.phone}>
                <Input id="phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input id="city" name="city" value={form.city} onChange={onChange} error={errors.city} autoComplete="address-level2" />
              </Field>
              <Field label="Date of Birth" htmlFor="date_of_birth" error={errors.date_of_birth}>
                <Input id="date_of_birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={onChange} error={errors.date_of_birth} />
              </Field>
            </div>

            <Field label="Short Introduction" htmlFor="introduction" required error={errors.introduction} hint="Who you are, in your own words.">
              <Textarea id="introduction" name="introduction" rows={4} value={form.introduction} onChange={onChange} error={errors.introduction} />
            </Field>

            <Field label="Why do you want to join?" htmlFor="motivation" required error={errors.motivation} hint="Be specific. This is read carefully.">
              <Textarea id="motivation" name="motivation" rows={5} value={form.motivation} onChange={onChange} error={errors.motivation} />
            </Field>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-silver-300">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={form.terms_accepted}
                  onChange={onChange}
                  className="mt-1 h-4 w-4 shrink-0 accent-gold-500"
                />
                <span>
                  I accept the{' '}
                  <Link to="/membership" className="text-gold-400 link-underline">
                    terms and conditions
                  </Link>{' '}
                  of Gangsters Club and confirm my application is truthful.
                </span>
              </label>
              {errors.terms_accepted && <p className="mt-2 text-xs text-danger">{errors.terms_accepted}</p>}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">
              <Button type="submit" size="lg" isLoading={submitting} className="w-full sm:w-auto">
                Submit Application
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}

function StatusCard({ icon: Icon, eyebrow, title, body, action }) {
  return (
    <section className="container-page flex min-h-[70vh] items-center py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center border border-gold-500/30 bg-gold-500/5">
          <Icon className="h-7 w-7 text-gold-300" />
        </span>
        <p className="mt-6 font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-silver-400">{body}</p>
        <div className="mt-8 flex justify-center">{action}</div>
      </div>
    </section>
  );
}

function AuthGate() {
  const { signIn, signUp, refresh } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (mode === 'signup' && form.full_name.trim().length < 2) next.full_name = 'Full name is required';
    if (mode === 'signup' && form.username.trim().length < 3) next.username = 'At least 3 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'At least 8 characters';
    if (Object.keys(next).length) return setErrors(next);

    try {
      setLoading(true);
      if (mode === 'signup') {
        const { session: newSession } = await signUp(form);
        if (!newSession) {
          // The project requires email confirmation: signUp() returns no
          // session, so the applicant must confirm before continuing.
          setConfirmEmail(true);
          return;
        }
        toast.success('Account created. Complete your application.');
      } else {
        await signIn(form.email, form.password);
        toast.success('Signed in.');
      }
      await refresh();
    } catch (err) {
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmEmail) {
    return (
      <StatusCard
        icon={CheckCircle2}
        eyebrow="Confirm your email"
        title="Check your inbox"
        body={`We sent a confirmation link to ${form.email}. Confirm it, then sign in to complete your membership application.`}
        action={<Button to="/login">Go to Sign In</Button>}
      />
    );
  }

  return (
    <section className="container-page flex min-h-[70vh] items-center py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Membership Application</p>
          <h1 className="mt-3 font-display text-2xl sm:text-3xl">Create your account</h1>
          <p className="mt-3 text-sm text-silver-400">An account is required before you can apply.</p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 border border-white/10">
            {[
              { key: 'signup', label: 'Register', icon: UserPlus },
              { key: 'login', label: 'Sign in', icon: LogIn },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 font-mono text-2xs uppercase tracking-[0.15em] transition-colors',
                  mode === tab.key ? 'bg-gold-500/10 text-gold-300' : 'text-silver-400 hover:text-silver-100'
                )}
              >
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            {mode === 'signup' && (
              <div className="grid gap-5">
                <Field label="Full Name" htmlFor="ag-name" required error={errors.full_name}>
                  <Input id="ag-name" name="full_name" value={form.full_name} onChange={onChange} error={errors.full_name} />
                </Field>
                <Field label="Username" htmlFor="ag-username" required error={errors.username}>
                  <Input id="ag-username" name="username" value={form.username} onChange={onChange} error={errors.username} />
                </Field>
              </div>
            )}
            <Field label="Email" htmlFor="ag-email" required error={errors.email}>
              <Input id="ag-email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} />
            </Field>
            <Field label="Password" htmlFor="ag-password" required error={errors.password} hint="Minimum 8 characters">
              <Input id="ag-password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} />
            </Field>
            <Button type="submit" size="lg" isLoading={loading} className="w-full">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
