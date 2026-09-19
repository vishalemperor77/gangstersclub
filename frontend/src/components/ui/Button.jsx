import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:
    'bg-gradient-to-b from-gold-300 to-gold-600 text-ink-950 hover:from-gold-200 hover:to-gold-500 hover:shadow-glow-strong',
  outline:
    'border border-gold-500/40 text-gold-300 hover:border-gold-400 hover:bg-gold-500/5 hover:shadow-glow',
  ghost: 'text-silver-200 hover:bg-white/[0.05] hover:text-white',
  surface: 'border border-white/10 bg-ink-750 text-silver-100 hover:border-white/20 hover:bg-ink-700',
  danger: 'border border-danger/40 text-danger hover:bg-danger/10 hover:border-danger',
  dark: 'bg-ink-800 border border-white/10 text-silver-100 hover:border-gold-500/30',
};

const SIZES = {
  sm: 'px-3 py-2 text-2xs tracking-[0.18em]',
  md: 'px-5 py-2.5 text-xs tracking-[0.2em]',
  lg: 'px-7 py-3.5 text-sm tracking-[0.22em]',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', className, children, isLoading, disabled, ...props },
  ref
) {
  const classes = cn(
    'group relative inline-flex items-center justify-center gap-2 font-mono font-medium uppercase',
    'transition-all duration-300 ease-out select-none disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-gold-400',
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    className
  );

  const content = (
    <>
      {isLoading && (
        <span
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {content}
    </button>
  );
});
