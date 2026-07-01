import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-white placeholder:text-muted/60 transition focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
