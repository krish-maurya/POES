import { useMemo, useState } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/constants';
import { filterItems, paginate, sortItems } from '@/utils/table';

export function useTableData<T>(
  data: T[] | undefined,
  searchKeys: (keyof T)[],
  defaultSortKey: keyof T,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T>(defaultSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const processed = useMemo(() => {
    const filtered = filterItems(data ?? [], search, searchKeys);
    const sorted = sortItems(filtered, sortKey, sortDir);
    return sorted;
  }, [data, search, searchKeys, sortKey, sortDir]);

  const paged = useMemo(() => paginate(processed, page, pageSize), [processed, page, pageSize]);
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  return {
    search,
    setSearch,
    page,
    setPage,
    sortKey,
    sortDir,
    toggleSort,
    paged,
    total: processed.length,
    totalPages,
  };
}
