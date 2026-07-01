import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Loader';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
  secondary: 'bg-surface-raised border border-border hover:bg-surface-hover text-white',
  ghost: 'hover:bg-surface-hover text-muted hover:text-white',
  danger: 'bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', loading, size = 'md', children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
