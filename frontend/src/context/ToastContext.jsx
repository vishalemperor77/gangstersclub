import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'border-success/40', text: 'text-success' },
  error: { icon: XCircle, ring: 'border-danger/40', text: 'text-danger' },
  info: { icon: Info, ring: 'border-silver-500/40', text: 'text-silver-200' },
  warning: { icon: AlertTriangle, ring: 'border-warning/40', text: 'text-warning' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = 'info', { duration = 4200 } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast,
      success: (m, o) => toast(m, 'success', o),
      error: (m, o) => toast(m, 'error', { duration: 6000, ...o }),
      info: (m, o) => toast(m, 'info', o),
      warning: (m, o) => toast(m, 'warning', o),
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          const Icon = v.icon;
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 border bg-ink-800/95 px-4 py-3 shadow-card backdrop-blur-md animate-scale-in',
                v.ring
              )}
            >
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', v.text)} aria-hidden="true" />
              <p className="flex-1 text-sm text-silver-100">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-silver-400 transition-colors hover:text-silver-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
