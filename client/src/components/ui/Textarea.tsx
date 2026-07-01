import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-white placeholder:text-muted/60 transition focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px] resize-y',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
