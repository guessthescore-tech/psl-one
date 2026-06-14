/**
 * Parse and bound a user-supplied limit query parameter.
 * Prevents unbounded database queries from user input.
 */
export function parseBoundedLimit(
  raw: string | undefined,
  defaultVal: number,
  max: number,
): number {
  if (raw === undefined || raw === '') return defaultVal;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return defaultVal;
  return Math.min(parsed, max);
}

/**
 * Parse and bound a user-supplied offset/skip query parameter.
 */
export function parseBoundedOffset(raw: string | undefined, defaultVal = 0): number {
  if (raw === undefined || raw === '') return defaultVal;
  const parsed = parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return defaultVal;
  return parsed;
}
