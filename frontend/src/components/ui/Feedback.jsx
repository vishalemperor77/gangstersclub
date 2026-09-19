import { cn } from '../../lib/utils';

export function Spinner({ className, size = 16 }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-400', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <Spinner size={28} />
      <p className="font-mono text-2xs uppercase tracking-[0.3em] text-silver-500">{label}</p>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-ink-700', className)} aria-hidden="true" />;
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 border border-white/[0.06] bg-ink-850 p-4">
      <Skeleton className="aspect-[16/9] w-full" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border border-dashed border-white/10 bg-ink-850/50 px-6 py-16 text-center',
        className
      )}
    >
      {Icon && <Icon className="mb-4 h-8 w-8 text-silver-500" aria-hidden="true" />}
      <h3 className="font-display text-lg">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-silver-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center border border-danger/20 bg-danger/5 px-6 py-16 text-center">
      <h3 className="font-display text-lg text-danger">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm text-silver-400">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 font-mono text-2xs uppercase tracking-[0.2em] text-gold-400 link-underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const windowed =
    totalPages > 7
      ? [...pages.slice(0, 2), ...(page > 3 && page < totalPages - 2 ? ['…'] : []), ...(page > 2 ? pages.slice(Math.max(2, page - 1), Math.min(totalPages - 1, page + 1)) : []), ...(page < totalPages - 2 ? ['…'] : []), ...pages.slice(-2)].filter((v, i, arr) => arr.indexOf(v) === i)
      : pages;

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="border border-white/10 px-3 py-1.5 font-mono text-2xs text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-300 disabled:opacity-30"
        aria-label="Previous page"
      >
        PREV
      </button>
      {windowed.map((p) =>
        p === '…' ? (
          <span key={`ellipsis-${Math.random()}`} className="px-2 text-silver-500">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? 'border border-gold-500/60 bg-gold-500/10 px-3 py-1.5 font-mono text-2xs text-gold-300'
                : 'border border-white/10 px-3 py-1.5 font-mono text-2xs text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-300'
            }
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="border border-white/10 px-3 py-1.5 font-mono text-2xs text-silver-300 transition-colors hover:border-gold-500/40 hover:text-gold-300 disabled:opacity-30"
        aria-label="Next page"
      >
        NEXT
      </button>
    </nav>
  );
}
