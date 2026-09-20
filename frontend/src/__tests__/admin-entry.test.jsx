import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

/**
 * Admin entry points.
 *
 * A real Supabase session cannot exist in jsdom, so the client is replaced: the
 * app must boot as an authenticated user, and /auth/me decides whether that
 * user is an administrator. These tests pin the bug where an admin sign-in
 * looked like a member sign-in (landed on /member with no route back to /admin).
 */
const { mockSession } = vi.hoisted(() => ({
  mockSession: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: 'user-1', email: 'owner@gangstersclub.com', user_metadata: {} },
  },
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: mockSession }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
    },
  },
}));

/** Answers /auth/me with the given identity; everything else stays empty. */
function stubIdentity({ role, membership = null, application = null, status = 'active' }) {
  globalThis.fetch = async (url) => {
    const body = String(url).includes('/auth/me')
      ? {
          user: { id: 'user-1', email: 'owner@gangstersclub.com' },
          profile: { id: 'user-1', username: 'owner', full_name: 'Club Owner', role, status },
          membership,
          application,
        }
      : { items: [], total: 0, unread: 0 };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <App />
    </MemoryRouter>
  );
}

describe('admin entry points', () => {
  afterEach(cleanup);

  it('lets an administrator into the admin console', async () => {
    stubIdentity({ role: 'admin' });
    renderApp('/admin');
    expect(await screen.findByRole('navigation', { name: /admin navigation/i })).toBeInTheDocument();
  });

  it('gives an administrator in the member shell a link to the console', async () => {
    stubIdentity({ role: 'admin', membership: { status: 'active', member_id: 'GC-2026-000002' } });
    renderApp('/member');
    await screen.findByRole('navigation', { name: /member navigation/i });
    expect(screen.getByRole('link', { name: /control center/i })).toHaveAttribute('href', '/admin');
  });

  it('does not show the console link to a plain member', async () => {
    stubIdentity({ role: 'member', membership: { status: 'active', member_id: 'GC-2026-000003' } });
    renderApp('/member');
    await screen.findByRole('navigation', { name: /member navigation/i });
    expect(screen.queryByRole('link', { name: /control center/i })).not.toBeInTheDocument();
  });
});
