import { initials } from '../../lib/utils';
import { cn } from '../../lib/utils';

export function Avatar({ src, name = '', size = 40, className, square = false }) {
  const style = { width: size, height: size };
  const classes = cn(
    'shrink-0 overflow-hidden bg-ink-700 border border-white/10',
    square ? '' : 'rounded-full',
    className
  );

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn('object-cover', classes)}
      />
    );
  }

  return (
    <span
      style={style}
      className={cn('flex items-center justify-center font-mono text-xs uppercase text-gold-300', classes)}
      aria-hidden="true"
    >
      {initials(name) || '—'}
    </span>
  );
}
