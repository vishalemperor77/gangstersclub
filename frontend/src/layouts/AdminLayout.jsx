import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  IdCard,
  Newspaper,
  Megaphone,
  CalendarDays,
  Vault as VaultIcon,
  Bell,
  ScanLine,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/id-cards', label: 'ID Cards', icon: IdCard },
  { to: '/admin/news', label: 'News', icon: Newspaper },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/vault', label: 'Vault', icon: VaultIcon },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/verification', label: 'Verification', icon: ScanLine },
  { to: '/admin/activity', label: 'Activity Logs', icon: History },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#07080a] lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] bg-[#0b0d10] lg:flex lg:flex-col">
        <SidebarContent profile={profile} onSignOut={handleSignOut} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-white/10 bg-[#0b0d10]">
            <SidebarContent profile={profile} onSignOut={handleSignOut} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[80] flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#07080a]/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-white/10 text-silver-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center border border-gold-500/40 bg-ink-900">
                <span className="font-display text-2xs font-bold text-metal">GC</span>
              </span>
              <span className="font-mono text-2xs uppercase tracking-[0.25em] text-silver-400">
                Control Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/members')}
              className="flex h-9 w-9 items-center justify-center border border-white/10 text-silver-400 transition-colors hover:border-gold-500/40 hover:text-gold-300"
              aria-label="Search members"
            >
              <Search className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-2 sm:pl-3">
              <Avatar src={profile?.avatar_url} name={profile?.full_name} size={32} />
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-silver-200">{profile?.full_name}</p>
                <p className="font-mono text-2xs text-gold-400">ADMIN</p>
              </div>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="flex-1 p-4 animate-fade-in sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ profile, onSignOut, onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
        <Link to="/admin" className="font-display text-sm font-semibold tracking-[0.25em]">
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

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <p className="px-3 py-2 font-mono text-2xs uppercase tracking-[0.25em] text-silver-600">
          Management
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 text-sm transition-all',
                    isActive
                      ? 'bg-gold-500/[0.08] text-gold-200 shadow-[inset_2px_0_0_0_rgba(212,175,69,0.8)]'
                      : 'text-silver-400 hover:bg-white/[0.03] hover:text-silver-100'
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-silver-400 transition-colors hover:text-danger"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
