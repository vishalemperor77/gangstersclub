import { Outlet, ScrollRestoration } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <PublicNavbar />
      <main className="flex-1 pt-16 lg:pt-20">
        <Outlet />
      </main>
      <PublicFooter />
      <ScrollRestoration />
    </div>
  );
}
