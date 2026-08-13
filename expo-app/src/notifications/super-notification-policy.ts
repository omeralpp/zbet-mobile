export type SuperNotificationMinimum = 1 | 2 | 3 | 4 | 5;

export const superNotificationMinimumOptions = [1, 2, 3, 4, 5] as const;

export function parseSuperNotificationMinimum(
  value: unknown
): SuperNotificationMinimum {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return parsed >= 1 && parsed <= 5
    ? (parsed as SuperNotificationMinimum)
    : 1;
}

export function shouldPresentSuperRating(
  rating: unknown,
  minimum: unknown
): boolean {
  const parsedRating = Number.parseInt(String(rating ?? ""), 10);
  if (
    !Number.isInteger(parsedRating) ||
    parsedRating < 1 ||
    parsedRating > 5
  ) {
    return true;
  }
  return parsedRating >= parseSuperNotificationMinimum(minimum);
}
