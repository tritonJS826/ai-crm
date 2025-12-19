export function filterBySearch<ItemType>(
  items: ReadonlyArray<ItemType>,
  searchQuery: string,
  getField: (item: ItemType) => string,
): ItemType[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (!normalizedQuery) {
    return items.slice();
  }

  return items.filter(item =>
    getField(item).toLowerCase().includes(normalizedQuery),
  );
}
