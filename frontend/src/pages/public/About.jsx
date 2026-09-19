import { Reveal } from '../../components/ui/Reveal';
import { Eyebrow, SectionHeading } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, Compass, Shield, Infinity as InfinityIcon } from 'lucide-react';

const VALUES = [
  {
    icon: Eye,
    title: 'Discretion',
    body: 'What is shared inside stays inside. Privacy is not a feature here — it is the founding agreement.',
  },
  {
    icon: Compass,
    title: 'Direction',
    body: 'Members are selected for clarity of intent. The club does not collect; it curates.',
  },
  {
    icon: Shield,
    title: 'Verification',
    body: 'Every membership is reviewed by hand and publicly verifiable. Trust is engineered, not assumed.',
  },
  {
    icon: InfinityIcon,
    title: 'Compounding',
    body: 'Access compounds. One introduction made here can rearrange a decade of trajectory.',
  },
];

export default function About() {
  return (
    <>
      <section className="container-page py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow className="mb-5">Established 2019</Eyebrow>
            <h1 className="display-2 text-balance">
              A private club for people who <span className="text-metal">move quietly</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-8 text-base leading-relaxed text-silver-400 sm:text-lg">
              Gangsters Club exists for a specific kind of person — one who values signal over
              noise, relationships over transactions, and access over attention. We are not a
              networking group. We are a room.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-ink-900">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28 lg:gap-20">
          <Reveal>
            <Eyebrow className="mb-4">Our Identity</Eyebrow>
            <h2 className="display-2 text-balance">Who we are</h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-silver-400 sm:text-base">
              <p>
                The name is deliberate. A "gangster", in the original sense, is someone who
                operates with total ownership — of their work, their word and their circle. That
                standard is what the club was named for. Nothing less.
              </p>
              <p>
                Our members are founders, investors, artists and operators. What unites them is
                not an industry but a disposition: they build, they keep their word, and they do
                not need an audience to do either.
              </p>
            </div>
          </Reveal>
          <Reveal delay={150} className="border border-white/[0.06] bg-ink-850 p-8">
            <Eyebrow className="mb-4">Membership Philosophy</Eyebrow>
            <p className="text-sm leading-relaxed text-silver-400">
              We do not sell access. We grant it — after review.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                'Applications are read individually by the club.',
                'Approval is the only path to membership.',
                'Every member holds a unique, verifiable Member ID.',
                'Misconduct forfeits membership.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3 text-sm text-silver-300">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-gold-400" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <SectionHeading eyebrow="Our Values" title="What we are built on" align="center" className="mb-12" />
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 90}>
              <div className="group h-full border border-white/[0.06] bg-ink-850 p-7 transition-all duration-300 hover:border-gold-500/25">
                <span className="flex h-11 w-11 items-center justify-center border border-gold-500/30 bg-gold-500/5">
                  <v.icon className="h-5 w-5 text-gold-300" />
                </span>
                <h3 className="mt-5 font-display text-lg">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-silver-400">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-ink-900">
        <div className="container-page py-24 text-center lg:py-32">
          <Reveal>
            <h2 className="display-2 text-balance">
              The room is <span className="text-metal">open</span>
            </h2>
            <div className="mt-8">
              <Button to="/apply" size="lg">
                Apply for Membership
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
