// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFilled<T extends Record<string, any>>(obj: T): boolean {
  return Object.values(obj).every(
    (v) => v !== null && v !== undefined && v !== "",
  );
}
