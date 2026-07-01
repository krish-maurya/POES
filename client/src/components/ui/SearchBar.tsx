import { MdSearch } from 'react-icons/md';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface-raised py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
