import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import Login from '../pages/auth/Login';

/**
 * Where a sign-in lands.
 *
 * Every login used to navigate to /member regardless of role, so an
 * administrator signing in looked exactly like a member signing in. Login now
 * loads the identity for the fresh session and routes by role.
 */
const { authMock } = vi.hoisted(() => ({
  authMock: {
    signIn: async () => ({}),
    refresh: async () => ({ profile: { role: 'admin' } }),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    loading: false,
    session: null,
    profile: null,
    membership: null,
    application: null,
    isAdmin: false,
    isActiveMember: false,
    isAuthenticated: false,
    signIn: authMock.signIn,
    signUp: async () => ({}),
    signOut: async () => {},
    refresh: authMock.refresh,
  }),
  AuthProvider: ({ children }) => children,
}));

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderLogin() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/login']} future={routerFuture}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<p>admin console</p>} />
          <Route path="/member" element={<p>member home</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>
  );
}

async function submitCredentials(user) {
  await user.type(screen.getByLabelText(/^email/i), 'owner@gangstersclub.com');
  // Anchored: the password field also has a "Show password" toggle button.
  await user.type(screen.getByLabelText(/^password/i), 'secret-password');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
}

describe('sign-in redirect', () => {
  afterEach(cleanup);

  it('sends an administrator to the admin console', async () => {
    authMock.refresh = async () => ({ profile: { role: 'admin' } });
    const user = userEvent.setup();
    renderLogin();
    await submitCredentials(user);
    expect(await screen.findByText('admin console')).toBeInTheDocument();
  });

  it('sends a member to the member dashboard', async () => {
    authMock.refresh = async () => ({ profile: { role: 'member' } });
    const user = userEvent.setup();
    renderLogin();
    await submitCredentials(user);
    expect(await screen.findByText('member home')).toBeInTheDocument();
  });
});
