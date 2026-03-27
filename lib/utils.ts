export function isFilled(value: Record<string, unknown>) {
  return Object.values(value).every((item) => {
    if (typeof item === "string") {
      return item.trim().length > 0;
    }
    return item !== null && item !== undefined;
  });
}
