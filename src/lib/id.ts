import { randomUUID } from 'expo-crypto';

/** Globally unique id for local rows, so books created offline on different devices never clash. */
export function createId() {
  return randomUUID();
}
