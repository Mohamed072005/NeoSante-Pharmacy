export function getChangedProperties<T>(existing: T, updates: Partial<T>): Partial<T> {
  const changes: Partial<T> = {};
  for (const key in updates) {
    if (updates[key] !== undefined && updates[key] !== existing[key]) {
      changes[key] = updates[key];
    }
  }
  return changes;
}