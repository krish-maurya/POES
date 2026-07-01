import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Button } from './Button';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, total, onPageChange, className }: PaginationProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 text-sm text-muted', className)}>
      <span>
        {total} record{total !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <MdChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[80px] text-center text-white">
          {page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <MdChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
