import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const base =
  'w-full bg-ink-900 border px-3.5 py-2.5 text-sm text-silver-100 placeholder:text-silver-500/60 ' +
  'transition-all duration-200 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30';

export const Input = forwardRef(function Input({ className, type = 'text', error, ...props }, ref) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative">
      <input
        ref={ref}
        type={isPassword ? (show ? 'text' : 'password') : type}
        className={cn(base, error ? 'border-danger/60' : 'border-white/10', isPassword && 'pr-10', className)}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-silver-400 transition-colors hover:text-silver-100"
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(base, 'resize-y', error ? 'border-danger/60' : 'border-white/10', className)}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(base, 'appearance-none', error ? 'border-danger/60' : 'border-white/10', className)}
      {...props}
    >
      {children}
    </select>
  );
});

export function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block font-mono text-2xs uppercase tracking-[0.2em] text-silver-300">
          {label}
          {required && <span className="ml-1 text-gold-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-silver-500">{hint}</p>
      )}
    </div>
  );
}
