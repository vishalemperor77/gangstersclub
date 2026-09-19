import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  IdCard,
  Megaphone,
  Newspaper,
  CalendarDays,
  Vault as VaultIcon,
  UserCircle,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';

const NAV = [
  { to: '/member', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/member/id-card', label: 'My ID Card', icon: IdCard },
  { to: '/member/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/member/events', label: 'Events', icon: CalendarDays },
  { to: '/member/vault', label: 'The Vault', icon: VaultIcon },
  { to: '/member/profile', label: 'Profile', icon: UserCircle },
];

export function MemberLayout() {
  const { profile, membership, signOut } = useAuth();
  const { unread } = useNotifications();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-ink-950 lg:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-ink-900 lg:flex lg:flex-col">
        <SidebarContent
          profile={profile}
          membership={membership}
          unread={unread}
          onSignOut={signOut}
        />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-ink-900 animate-fade-in">
            <SidebarContent
              profile={profile}
              membership={membership}
              unread={unread}
              onSignOut={signOut}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-[80] flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-ink-950/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-white/10 text-silver-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="font-display text-sm font-semibold tracking-[0.25em]">
              GANGSTERS <span className="text-metal">CLUB</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/member/announcements"
              className="relative flex h-9 w-9 items-center justify-center border border-white/10 text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-300"
              aria-label={`Announcements${unread ? ` (${unread} unread)` : ''}`}
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-gold-500 px-1 font-mono text-2xs text-ink-950">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size={34} />
          </div>
        </header>

        <main key={location.pathname} className="flex-1 p-4 animate-fade-in sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ profile, membership, unread, onSignOut, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
        <Link to="/" className="font-display text-sm font-semibold tracking-[0.25em]">
          GANGSTERS <span className="text-metal">CLUB</span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="text-silver-400 hover:text-silver-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="border-b border-white/[0.06] px-5 py-5">
        <div className="flex items-center gap-3">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size={44} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-silver-100">{profile?.full_name}</p>
            <p className="truncate font-mono text-2xs text-gold-400">{membership?.member_id || 'PENDING'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Member navigation">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-all',
                    isActive
                      ? 'border-gold-400 bg-gold-500/[0.07] text-gold-200'
                      : 'border-transparent text-silver-400 hover:bg-white/[0.03] hover:text-silver-100'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Announcements' && unread > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center bg-gold-500 px-1 font-mono text-2xs text-ink-950">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-silver-400 transition-colors hover:text-danger"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
