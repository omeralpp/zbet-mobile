import type { RebuildPoolPath } from "@/src/api/rebuild-statistics-schemas";

type Match = { status: string; elapsed: number; homeScore: number; awayScore: number; phase?: string | undefined };
/** Display period comes from verified pool provenance; full-time rows never become half-time rows. */
export function historicalScoreView(match: Match, pool: RebuildPoolPath | undefined, now: number) {
  const source = pool?.availability === "AVAILABLE" ? pool.scoreDistribution : null;
  const firstHalf = match.status === "HALF_TIME" || (match.status === "LIVE" && (match.phase === "1H" || (!match.phase && match.elapsed < 45)));
  const age = source ? now - Date.parse(source.observedAt) : NaN;
  const sameScore = source?.homeScore === match.homeScore && source.awayScore === match.awayScore;
  const fresh = age >= 0 && age <= 120_000;
  const live = match.status === "LIVE";
  const valid = Boolean(source && sameScore && (!live || (fresh && source.minute <= match.elapsed && match.elapsed - source.minute <= 2)) &&
    (!firstHalf || source.period === "1H") && (match.phase !== "2H" || source.period === "2H") && (match.status !== "FINISHED" || source.period === "2H") &&
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
