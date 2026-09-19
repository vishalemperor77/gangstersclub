import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-ink-950">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-gold-500/40 bg-ink-900">
                <span className="font-display text-sm font-bold text-metal">GC</span>
              </span>
              <span className="font-display text-sm font-semibold tracking-[0.3em]">
                GANGSTERS <span className="text-metal">CLUB</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver-500">
              A private members' club for those who operate differently. Membership is by application
              and invitation only.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-2xs uppercase tracking-[0.25em] text-silver-400">Club</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-silver-500">
              <li><Link to="/about" className="transition-colors hover:text-gold-300">About</Link></li>
              <li><Link to="/membership" className="transition-colors hover:text-gold-300">Membership</Link></li>
              <li><Link to="/apply" className="transition-colors hover:text-gold-300">Apply</Link></li>
              <li><Link to="/verify" className="transition-colors hover:text-gold-300">Verify a Member</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-2xs uppercase tracking-[0.25em] text-silver-400">Content</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-silver-500">
              <li><Link to="/news" className="transition-colors hover:text-gold-300">Club News</Link></li>
              <li><Link to="/events" className="transition-colors hover:text-gold-300">Events</Link></li>
              <li><Link to="/member/vault" className="transition-colors hover:text-gold-300">The Vault</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-6 sm:flex-row">
          <p className="text-xs text-silver-600">
            © {new Date().getFullYear()} Gangsters Club. All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-xs text-silver-600">
            <ShieldCheck className="h-3.5 w-3.5" /> No payments. Membership by approval only.
          </p>
        </div>
      </div>
    </footer>
  );
}
