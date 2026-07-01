import { type SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-white transition focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  ),
);

Select.displayName = 'Select';
