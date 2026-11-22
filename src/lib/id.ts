/** Short random id for local rows. Not cryptographically secure — it only needs to be unique per device. */
export function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
