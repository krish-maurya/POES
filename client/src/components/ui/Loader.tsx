interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function Loader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 flex-1 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </div>
      ))}
    </div>
  );
}
