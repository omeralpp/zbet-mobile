import type { RebuildStatistics } from "../api/rebuild-statistics-schemas";

export type PossessionMatch = { key: string; status: string; elapsed: number; homeScore: number; awayScore: number };
/** Current supporting context, never a frozen decision input or a pressure value. */
export function possessionContext(statistics: RebuildStatistics | undefined, match: PossessionMatch, now: number) {
  if (!statistics || !["LIVE","HALF_TIME"].includes(match.status) || statistics.matchKey !== match.key ||
    !["AVAILABLE","PARTIAL"].includes(statistics.availability) || !statistics.observedAt || statistics.elapsed === null ||
    statistics.homeScore !== match.homeScore || statistics.awayScore !== match.awayScore || Math.abs(statistics.elapsed - match.elapsed) > 2) return null;
  const age = now - Date.parse(statistics.observedAt);
  const home = statistics.statistics.homeBallPossession, away = statistics.statistics.awayBallPossession;
  if (!Number.isFinite(age) || age < 0 || age > 120_000 || home === null || away === null || home > 100 || away > 100 || home + away !== 100) return null;
  return { home, away, minute: statistics.elapsed, label: `Topla oynama %${home} · %${away} · ${statistics.elapsed}′` };
}
