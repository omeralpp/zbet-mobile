import type { MatchSummary } from "@/src/api/schemas";
import { formatFixtureDateTime } from "./format";

export type MatchSection = {
  key: string;
  title: string;
  data: MatchSummary[];
};

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupMatchesByKickoff(
  matches: MatchSummary[],
  now = new Date()
): MatchSection[] {
  const groups = new Map<string, MatchSummary[]>();
  for (const match of matches) {
    const hasKickoff = Boolean(match.matchDate && match.matchTime);
    const key = hasKickoff
      ? `${match.matchDate}T${match.matchTime}`
      : "9999-99-99T99:99";
    const current = groups.get(key) ?? [];
    current.push(match);
    groups.set(key, current);
  }

  const today = localDateKey(now);
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, data]) => {
      const first = data[0]!;
      let title = "Saat bilgisi yok";
      if (first.matchDate && first.matchTime) {
        const formatted = formatFixtureDateTime(
          first.matchDate,
          first.matchTime
        );
        title = first.matchDate === today
          ? `Bugün · ${first.matchTime.slice(0, 5)}`
          : formatted;
      }
      return { key, title, data };
    });
}
