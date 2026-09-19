import { Link } from 'react-router-dom';
import { Reveal } from '../../components/ui/Reveal';
import { Eyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { IdCard, LayoutDashboard, Megaphone, CalendarDays, Vault as VaultIcon, Newspaper } from 'lucide-react';

const STEPS = [
  { n: '01', title: 'Apply', body: 'Create an account and submit the membership application. Every field is validated.' },
  { n: '02', title: 'Application Review', body: 'The club reviews each application individually — background, intent and fit.' },
  { n: '03', title: 'Admin Approval', body: 'Only an administrator can approve membership. Nothing happens automatically.' },
  { n: '04', title: 'Receive Member ID', body: 'Approved members receive a unique Member ID and a QR-verifiable digital ID card.' },
  { n: '05', title: 'Enter the Club', body: 'The member dashboard, announcements, events and The Vault unlock.' },
];

const BENEFITS = [
  { icon: IdCard, title: 'Digital Member ID', body: 'A premium digital card with a unique QR code anyone can verify publicly.' },
  { icon: LayoutDashboard, title: 'Member Dashboard', body: 'Your membership status, ID card, events and notifications in one place.' },
  { icon: Megaphone, title: 'Club Announcements', body: 'Official club communications delivered directly to your inbox.' },
  { icon: CalendarDays, title: 'Events', body: 'Upcoming gatherings with RSVP access before anyone else hears about them.' },
  { icon: VaultIcon, title: 'The Vault', body: 'Members-only content, private documents and exclusive club material.' },
  { icon: Newspaper, title: 'Exclusive Content', body: 'Member-only articles and briefings that never appear on the public site.' },
];

export default function Membership() {
  return (
    <>
      <section className="container-page py-24 text-center lg:py-32">
        <Reveal>
          <Eyebrow className="mb-5">Membership</Eyebrow>
          <h1 className="display-2 text-balance">
            Five steps. <span className="text-metal">One door.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-silver-400 sm:text-base">
            There is no payment, no queue and no shortcut. Membership is granted by review — and
            revoked by the same standard.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-white/[0.06] bg-ink-900">
        <div className="container-page py-20 lg:py-28">
          <div className="space-y-px">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div className="group grid items-center gap-6 border-t border-white/[0.06] py-8 transition-colors hover:bg-white/[0.015] lg:grid-cols-[120px_1fr] lg:py-10">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-3xl text-metal sm:text-4xl">{step.n}</span>
                    {i < STEPS.length - 1 && <span className="hidden h-px flex-1 bg-white/10 lg:block" />}
                  </div>
                  <div>
                    <h3 className="font-display text-xl">{step.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-silver-400">{step.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <Eyebrow className="mb-4 text-center">Included</Eyebrow>
        <h2 className="text-center font-display text-3xl sm:text-4xl">What you receive</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <div className="group h-full border border-white/[0.06] bg-ink-850 p-7 transition-all duration-300 hover:border-gold-500/25 hover:shadow-glow">
                <b.icon className="h-6 w-6 text-gold-300" />
                <h3 className="mt-5 font-display text-base">{b.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-silver-400">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-ink-900">
        <div className="container-page py-24 text-center lg:py-32">
          <Reveal>
            <h2 className="display-2 text-balance">
              Ready to enter <span className="text-metal">the club?</span>
            </h2>
            <div className="mt-8">
              <Button to="/apply" size="lg">
                Apply for Membership
              </Button>
            </div>
            <p className="mt-6 text-xs text-silver-600">
              Already a member?{' '}
              <Link to="/login" className="text-gold-400 link-underline">
                Sign in
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
