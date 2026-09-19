import { cn } from '../../lib/utils';

export function Card({ className, children, hover = false, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cn(
        'relative overflow-hidden border border-white/[0.06] bg-ink-850',
        hover && 'transition-all duration-300 hover:border-gold-500/25 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Badge({ status, className, children }) {
  const tones = {
    active: 'border-success/30 bg-success/10 text-success',
    approved: 'border-success/30 bg-success/10 text-success',
    published: 'border-success/30 bg-success/10 text-success',
    pending: 'border-warning/30 bg-warning/10 text-warning',
    draft: 'border-silver-500/30 bg-silver-500/10 text-silver-300',
    suspended: 'border-danger/30 bg-danger/10 text-danger',
    rejected: 'border-danger/30 bg-danger/10 text-danger',
    inactive: 'border-silver-500/30 bg-silver-500/10 text-silver-300',
    unpublished: 'border-silver-500/30 bg-silver-500/10 text-silver-300',
    high: 'border-danger/30 bg-danger/10 text-danger',
    normal: 'border-silver-500/30 bg-silver-500/10 text-silver-200',
    low: 'border-silver-500/20 bg-silver-500/5 text-silver-400',
  };
  const tone = tones[String(status || '').toLowerCase()] || tones.normal;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-0.5 font-mono text-2xs uppercase tracking-[0.15em]',
        tone,
        className
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ className, children }) {
  return <p className={cn('font-mono text-2xs uppercase tracking-[0.35em] text-gold-400', className)}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, description, align = 'left', className }) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-3xl leading-tight sm:text-4xl lg:text-5xl text-balance">{title}</h2>
      {description && <p className="mt-4 text-sm leading-relaxed text-silver-400 sm:text-base">{description}</p>}
    </div>
  );
}
