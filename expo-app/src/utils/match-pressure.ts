import type { MatchSummary } from "@/src/api/schemas";
import { derivePressureBalance, type PressureDirection } from "./pressure-balance";
import { currentIntervalPressure } from "./recent-pressure";

/**
 * Which side the pressure mark belongs to, shared by the match card and the
 * match detail hero so both always point at the same team. The recent decision
 * interval wins when it exists; otherwise only the current match's own reading.
 */
export function matchPressureSide(match: Pick<MatchSummary, "decisionContext" | "pressureSource" | "totalPressure" | "pressureDiff">): {
  direction: Exclude<PressureDirection, "BALANCED"> | undefined;
  estimated: boolean;
  hasData: boolean;
} {
  const interval = currentIntervalPressure(match.decisionContext);
  const balance = derivePressureBalance(
    match.decisionContext ? interval.total : match.pressureSource === "CURRENT_MATCH" ? match.totalPressure : null,
    match.decisionContext ? interval.difference : match.pressureSource === "CURRENT_MATCH" ? match.pressureDiff : null,
    interval.measured
  );
  return {
    direction: balance.hasData && balance.direction !== "BALANCED" ? balance.direction : undefined,
    estimated: Boolean(match.decisionContext?.recentPressure.estimated),
    hasData: balance.hasData
  };
}
