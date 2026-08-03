/**
 * Normalize a `createdAt`/`updatedAt` value read from Firestore to an ISO string.
 *
 * Since newsletter and referral writes use `serverTimestamp()`, successful cloud
 * rows come back as Firestore `Timestamp` objects, while localStorage/legacy rows
 * are ISO strings. Downstream code renders and sorts these with `new Date(...)`,
 * which yields `Invalid Date`/`NaN` for a raw `Timestamp`. Normalizing at the read
 * boundary keeps rendering and sorting consistent regardless of the source.
 */
export function toIsoDate(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return new Date().toISOString();
  }
  // Firestore Timestamp (duck-typed to avoid importing the SDK type here).
  if (typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return String(value);
}
