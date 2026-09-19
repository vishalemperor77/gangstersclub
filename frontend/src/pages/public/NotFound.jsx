import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(200,162,75,0.08),transparent_55%)]" />
      <div className="container-page relative z-10 text-center">
        <p className="font-mono text-2xs uppercase tracking-[0.35em] text-gold-400">Error 404</p>
        <h1 className="mt-5 font-display text-7xl text-metal sm:text-9xl">404</h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-silver-400">
          This page doesn't exist — or it's behind a door you haven't been invited through yet.
        </p>
        <div className="mt-10">
          <Button to="/">Back to Home</Button>
        </div>
        <p className="mt-8 text-xs text-silver-600">
          <Link to="/verify" className="link-underline">
            Verify a member
          </Link>
          <span className="mx-3">·</span>
          <Link to="/apply" className="link-underline">
            Apply for membership
          </Link>
        </p>
      </div>
    </section>
  );
}
