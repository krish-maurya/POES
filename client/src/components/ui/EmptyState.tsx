import { MdInbox } from 'react-icons/md';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-hover">
        <MdInbox className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
