import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ShieldX, Clock, Ban } from 'lucide-react';

const COPY = {
  default: {
    icon: ShieldX,
    eyebrow: '403 — Forbidden',
    title: 'Access denied',
    body: 'You do not have permission to view this page.',
  },
  pending: {
    icon: Clock,
    eyebrow: 'Membership Pending',
    title: 'Your application is under review',
    body: 'Access to member areas unlocks once an administrator approves your application. You will be notified.',
  },
  rejected: {
    icon: ShieldX,
    eyebrow: 'Application Not Approved',
    title: 'Membership was not granted',
    body: 'Your application was reviewed and not approved at this time. Please contact the club.',
  },
  suspended: {
    icon: Ban,
    eyebrow: 'Membership Suspended',
    title: 'Your membership is suspended',
    body: 'Member access has been revoked. Please contact the club to resolve this.',
  },
};

export default function Unauthorized({ status = 'default' }) {
  const copy = COPY[status] || COPY.default;
  const Icon = copy.icon;

  return (
    <section className="container-page flex min-h-[80vh] items-center py-16">
      <div className="mx-auto max-w-lg text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center border border-gold-500/30 bg-gold-500/5">
          <Icon className="h-7 w-7 text-gold-300" />
        </span>
        <p className="mt-6 font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">{copy.eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-silver-400">{copy.body}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button to="/" variant="outline">
            Back to Home
          </Button>
          {status === 'pending' && (
            <Button to="/apply" variant="ghost">
              View Application
            </Button>
          )}
          {status === 'default' && (
            <Button to="/member" variant="ghost">
              Go to Dashboard
            </Button>
          )}
        </div>
        <p className="mt-10 text-xs text-silver-600">
          <Link to="/verify" className="link-underline">
            Verify a member instead
          </Link>
        </p>
      </div>
    </section>
  );
}
