export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function sortItems<T>(
  items: T[],
  key: keyof T,
  direction: 'asc' | 'desc',
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterItems<T>(
  items: T[],
  search: string,
  keys: (keyof T)[],
): T[] {
  const term = search.trim().toLowerCase();
  if (!term) return items;
  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? '').toLowerCase().includes(term)),
  );
}
