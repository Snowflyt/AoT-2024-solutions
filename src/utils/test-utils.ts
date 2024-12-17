/**
 * A helper function that works similar to `as const` in TypeScript.
 * @param value The value to pin.
 * @returns
 */
export function pin<const T>(value: T): T {
  return value;
}
