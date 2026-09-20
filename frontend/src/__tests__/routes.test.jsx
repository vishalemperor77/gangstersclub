import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

/**
 * Smoke-renders the whole app at a given URL. Uses the real App (providers,
 * ErrorBoundary, lazy routes, guards). fetch is stubbed in src/test/setup.js, so
 * pages render offline-safe against empty API payloads.
 */
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]} future={routerFuture}>
      <App />
    </MemoryRouter>
  );
}

/**
 * `<nav aria-label="Primary">` is rendered by PublicLayout, so finding it proves
 * the providers -> layout -> lazy page chain mounted (and not just the Suspense
 * fallback). It is deliberately a role query: the brand text "GANGSTERS CLUB"
 * appears in the navbar, footer, hero and body copy, so a text query matches
 * many elements and throws "Found multiple elements".
 */
async function expectPublicShell() {
  await screen.findByRole('navigation', { name: /primary/i });
}

describe('route smoke tests (unauthenticated visitor)', () => {
  afterEach(cleanup);

  it('renders the home page with the brand and the public shell', async () => {
    renderApp('/');
    await expectPublicShell();
    expect((await screen.findAllByText(/gangsters/i)).length).toBeGreaterThan(0);
  });

  // Public pages are wrapped in <Titled>, which sets the tab title (see
  // src/hooks/usePageTitle.js -> `${title} — GANGSTERS CLUB`).
  const publicPages = [
    ['/about', 'About — GANGSTERS CLUB'],
    ['/membership', 'Membership — GANGSTERS CLUB'],
    ['/news', 'News — GANGSTERS CLUB'],
    ['/events', 'Events — GANGSTERS CLUB'],
    ['/verify', 'Verify Membership — GANGSTERS CLUB'],
    ['/apply', 'Apply — GANGSTERS CLUB'],
    ['/login', 'Sign In — GANGSTERS CLUB'],
  ];

  it.each(publicPages)('renders %s without a blank root', async (path) => {
    renderApp(path);
    await expectPublicShell();
    // Something beyond the shell painted.
    expect(document.body.textContent.trim().length).toBeGreaterThan(0);
  });

  it.each(publicPages)('sets the tab title for %s', async (path, title) => {
    renderApp(path);
    await expectPublicShell();
    // /login sits behind RedirectAuthenticated, which paints a loader first, so
    // the title lands one tick later than the shell. Wait for it instead of
    // racing the lazy page + auth reset.
    await waitFor(() => expect(document.title).toBe(title));
  });

  it('renders the 404 page with its title for unknown paths', async () => {
    renderApp('/nonsense-404');
    // The catch-all route sits outside PublicLayout, so use its own heading.
    expect(await screen.findByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(document.title).toBe('Not Found — GANGSTERS CLUB');
  });

  it('redirects /member to /login when not authenticated', async () => {
    renderApp('/member');
    await screen.findByRole('heading', { name: /members?.?.?\s*entrance/i });
    expect(document.title).toBe('Sign In — GANGSTERS CLUB');
  });

  it('redirects /admin to /login when not authenticated', async () => {
    renderApp('/admin');
    await screen.findByRole('heading', { name: /members?.?.?\s*entrance/i });
    expect(document.title).toBe('Sign In — GANGSTERS CLUB');
  });

  it('keeps an anonymous visitor on /login (RedirectAuthenticated no-op)', async () => {
    renderApp('/login');
    await screen.findByRole('heading', { name: /members?.?.?\s*entrance/i });
    expect(document.title).toBe('Sign In — GANGSTERS CLUB');
  });
});
