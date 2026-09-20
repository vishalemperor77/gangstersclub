import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

function Bomb({ message }) {
  throw new Error(message);
}

// Wrapped in MemoryRouter: the fallback's "Back to Home" is a router <Link>.
function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React logs every caught render error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing crashes', () => {
    renderWithRouter(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('all good')).toBeInTheDocument();
  });

  it('shows the branded fallback instead of a blank screen on crash', () => {
    renderWithRouter(
      <ErrorBoundary>
        <Bomb message="deliberate crash" />
      </ErrorBoundary>
    );
    expect(screen.getByText('This section failed to load')).toBeInTheDocument();
    expect(screen.getByText(/deliberate crash/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
  });

  it('never leaves the fallback without a way back (Home link)', () => {
    renderWithRouter(
      <ErrorBoundary>
        <Bomb message="boom" />
      </ErrorBoundary>
    );
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });
});
