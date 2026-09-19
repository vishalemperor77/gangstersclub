import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

/**
 * Catches render-time crashes anywhere below it and shows a branded fallback
 * instead of a blank black page. Without this, a single failing component (or a
 * failed lazy chunk fetch) unmounts the whole tree and the user sees nothing.
 *
 * Mounted with `key={location.pathname}` in App so navigating away resets the
 * boundary, and a crash on one route cannot trap the rest of the app.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced in the browser console; wire to a reporting service if added.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <section className="container-page flex min-h-[70vh] items-center py-16">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center border border-danger/30 bg-danger/5">
            <AlertTriangle className="h-7 w-7 text-danger" aria-hidden="true" />
          </span>
          <p className="mt-6 font-mono text-2xs uppercase tracking-[0.3em] text-gold-400">Unexpected error</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">This section failed to load</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-silver-400">
            Reloading usually fixes it. If it keeps happening, contact the club and we will look into it.
          </p>

          <pre className="mt-8 overflow-x-auto border border-white/[0.06] bg-ink-900 p-4 text-left font-mono text-2xs leading-relaxed text-silver-500">
            {String(error?.message || error)}
          </pre>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reload
            </Button>
            <Button to="/" variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    );
  }
}