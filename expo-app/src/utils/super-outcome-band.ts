import type { MatchDetail, SuperLogDetail } from "@/src/api/schemas";

export type SuperOutcomeBand = {
  kind: "LIVE" | "PENDING" | "SETTLED";
  score: string;
  label: string;
  accessibilityLabel: string;
};

type OutcomeSource = Pick<SuperLogDetail, "finalScore" | "result">;
type CurrentMatchSource = Pick<
  MatchDetail,
  "awayScore" | "elapsed" | "homeScore" | "status"
>;

/**
 * Keeps three different times honest on Super Detail:
 * decision score, current live score, and settled final score.
 */
export function deriveSuperOutcomeBand(
  outcome: OutcomeSource,
  currentMatch?: CurrentMatchSource | null
): SuperOutcomeBand {
  if (
    (outcome.result === "WON" || outcome.result === "LOST") &&
    outcome.finalScore.trim()
  ) {
    const score = outcome.finalScore.replace("-", " - ");
    return {
      kind: "SETTLED",
      score,
      label: "biten skor",
      accessibilityLabel: `Biten skor ${score}`
    };
  }

  if (
    outcome.result === "OPEN" &&
    currentMatch &&
    (currentMatch.status === "LIVE" || currentMatch.status === "HALF_TIME")
  ) {
    const score = `${currentMatch.homeScore} - ${currentMatch.awayScore}`;
    const label =
      currentMatch.status === "HALF_TIME"
        ? `${currentMatch.elapsed}' · devre arası`
        : `${currentMatch.elapsed}' canlı`;
    return {
      kind: "LIVE",
      score,
      label,
      accessibilityLabel: `Canlı skor ${score}, dakika ${currentMatch.elapsed}`
    };
  }

  return {
    kind: "PENDING",
    score: "—",
    label: "sonuç bekleniyor",
    accessibilityLabel: "Sonuç bekleniyor"
  };
}
