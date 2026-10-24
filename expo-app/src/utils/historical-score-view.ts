import type { RebuildPoolPath } from "@/src/api/rebuild-statistics-schemas";

type Match = { status: string; elapsed: number; homeScore: number; awayScore: number; phase?: string | undefined; lastUpdatedAt?: string | undefined; clock?: { period: string } | undefined };
type Distribution = NonNullable<RebuildPoolPath["scoreDistribution"]>;
export type HistoricalReference = { period: "1H" | "2H"; source: Distribution | null };

function scorePeriod(match: Match) {
  if (match.status === "HALF_TIME") return "1H";
  const phase = match.clock?.period ?? match.phase;
  return phase === "1H" || phase === "2H" ? phase : undefined;
}

/** Keep one recorded comparison population per displayed half; never renormalize it after goals. */
export function retainHistoricalReference(previous: HistoricalReference, period: "1H" | "2H", source: Distribution | null): HistoricalReference {
  return previous.period !== period || (!previous.source && source) ? { period, source } : previous;
}

/** Missing/stale scores and a different period cannot prove an outcome unreachable. */
export function historicalScoreReachability(score: string, match: Match, period: "1H" | "2H", now: number) {
  const age = now - Date.parse(match.lastUpdatedAt ?? "");
  const phase = scorePeriod(match);
  if (!["LIVE", "HALF_TIME"].includes(match.status) || !(age >= 0 && age <= 120_000) ||
      period !== phase ||
      ![match.homeScore, match.awayScore].every(value => Number.isInteger(value) && value >= 0)) return "UNKNOWN";
  const parsed = /^(\d+)\s*[-–—:]\s*(\d+)$/.exec(score);
  if (!parsed) return "UNKNOWN";
  return Number(parsed[1]) < match.homeScore || Number(parsed[2]) < match.awayScore ? "UNREACHABLE" : "REACHABLE";
}
/** Display period comes from verified pool provenance; full-time rows never become half-time rows. */
export function historicalScoreView(match: Match, pool: RebuildPoolPath | undefined, now: number) {
  const source = pool?.availability === "AVAILABLE" ? pool.scoreDistribution : null;
  const phase = scorePeriod(match);
  const firstHalf = match.status === "HALF_TIME" || (match.status === "LIVE" && (phase === "1H" || (!phase && !match.clock && !match.phase && match.elapsed < 45)));
  const age = source ? now - Date.parse(source.observedAt) : NaN;
  const sameScore = source?.homeScore === match.homeScore && source.awayScore === match.awayScore;
  const fresh = age >= 0 && age <= 120_000;
  const live = match.status === "LIVE";
  const valid = Boolean(source && sameScore && (!live || (fresh && source.minute <= match.elapsed && match.elapsed - source.minute <= 2)) &&
    (!firstHalf || source.period === "1H") && (phase !== "2H" || source.period === "2H") && (match.status !== "FINISHED" || source.period === "2H") &&
    ["LIVE", "HALF_TIME", "FINISHED"].includes(match.status));
  const period = valid ? source!.period : firstHalf ? "1H" : "2H";
  return {
    period,
    label: period === "1H" ? "İlk yarı sonuçları" : "Maç sonu sonuçları",
    source: valid ? source! : null,
    message: live && source && !fresh ? "Son havuz kaydı güncel değil; dağılım gösterilmiyor." :
      source && !sameScore ? "Skor değişti; bu skora ait doğrulanmış havuz bekleniyor." :
      period === "1H" ? "Doğrulanmış ilk yarı skor havuzu henüz yok." : "Doğrulanmış maç sonu skor havuzu henüz yok."
  };
}
