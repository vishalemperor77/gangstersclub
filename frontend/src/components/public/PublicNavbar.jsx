import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/membership', label: 'Membership' },
  { to: '/news', label: 'News' },
  { to: '/events', label: 'Events' },
  { to: '/verify', label: 'Verify' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[90] transition-all duration-500',
        scrolled ? 'border-b border-white/[0.06] bg-ink-950/85 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 lg:h-20" aria-label="Primary">
        <Link to="/" className="group flex items-center gap-3" aria-label="Gangsters Club home">
          <span className="flex h-9 w-9 items-center justify-center border border-gold-500/40 bg-ink-900 transition-all group-hover:shadow-glow">
            <span className="font-display text-sm font-bold text-metal">GC</span>
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-[0.3em] text-silver-100 sm:block">
            GANGSTERS <span className="text-metal">CLUB</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'link-underline font-mono text-2xs uppercase tracking-[0.2em] transition-colors',
                  isActive ? 'text-gold-300' : 'text-silver-300 hover:text-silver-100'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <Button to={isAdmin ? '/admin' : '/member'} variant="outline" size="sm">
              {isAdmin ? 'Admin' : 'Dashboard'}
            </Button>
          ) : (
            <Button to="/login" variant="ghost" size="sm">
              Sign in
            </Button>
          )}
          <Button to="/apply" size="sm">
            Become a Member
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 items-center justify-center border border-white/10 text-silver-100 lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/[0.06] bg-ink-950/97 backdrop-blur-xl lg:hidden">
          <div className="container-page flex flex-col py-4">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'border-b border-white/[0.04] py-3.5 font-mono text-xs uppercase tracking-[0.2em]',
                    isActive ? 'text-gold-300' : 'text-silver-300'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button to={isAdmin ? '/admin' : '/member'} variant="outline" size="md">
                  {isAdmin ? 'Admin Dashboard' : 'Member Dashboard'}
                </Button>
              ) : (
                <Button to="/login" variant="surface" size="md">
                  Sign in
                </Button>
              )}
              <Button to="/apply" size="md">
                Become a Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
