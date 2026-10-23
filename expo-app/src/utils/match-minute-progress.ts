import type { MatchStatus, MatchSummary } from "@/src/api/schemas";
import { formatElapsed } from "./format";

export type MatchMinuteProgress = {
  label: string;
  minute: number;
  ratio: number;
  visible: boolean;
};

export function deriveMatchMinuteProgress(
  status: MatchStatus,
  elapsed: number,
  clock?: MatchSummary["clock"]
): MatchMinuteProgress {
  // NOT_PLAYED joins NOT_STARTED here: a postponed or cancelled match has no
  // minute to show, and any elapsed value SAP still carries on the row would
  // render as a running clock for a game that is not being played.
  if (status === "NOT_STARTED" || status === "NOT_PLAYED") {
    return { label: "", minute: 0, ratio: 0, visible: false };
  }

  const safeElapsed = Number.isFinite(elapsed)
    ? Math.max(0, Math.round(elapsed))
    : 0;
  const minute =
    status === "HALF_TIME"
      ? Math.max(45, safeElapsed)
      : status === "FINISHED"
        ? Math.max(90, safeElapsed)
        : safeElapsed;
  const suffix =
    status === "HALF_TIME" ? " · DEVRE" : status === "FINISHED" ? " · MS" : "";

  return {
    label: status === "LIVE" && clock ? `${formatElapsed(status,minute,clock)}${clock.period === "ET" ? " · UZATMA" : ""}` : `${minute}'${suffix}`,
    minute,
    ratio: Math.min(1, minute / 90),
    visible: true
  };
}
