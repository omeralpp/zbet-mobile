import type { SuperLog } from "@/src/api/schemas";

export function relatedSuperDecisions(
  logs: SuperLog[],
  matchKey: string
): SuperLog[] {
  const unique = new Map<string, SuperLog>();
  for (const log of logs) {
    if (log.matchKey === matchKey && !unique.has(log.key)) {
      unique.set(log.key, log);
    }
  }
  return [...unique.values()].sort(
    (left, right) =>
      right.elapsed - left.elapsed ||
      right.createdAt.localeCompare(left.createdAt)
  );
}
