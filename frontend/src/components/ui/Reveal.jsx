import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Reveals children with a subtle fade/slide once they scroll into view.
 * Respects prefers-reduced-motion (handled in CSS).
 */
export function Reveal({ as: Tag = 'div', className, delay = 0, children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn('transition-none', !visible && 'opacity-0', visible && 'animate-fade-up', className)}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
