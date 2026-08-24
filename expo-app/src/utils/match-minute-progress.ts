import type { MatchStatus } from "@/src/api/schemas";

export type MatchMinuteProgress = {
  label: string;
  minute: number;
  ratio: number;
  visible: boolean;
};

export function deriveMatchMinuteProgress(
  status: MatchStatus,
  elapsed: number
): MatchMinuteProgress {
  if (status === "NOT_STARTED") {
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
    label: `${minute}'${suffix}`,
    minute,
    ratio: Math.min(1, minute / 90),
    visible: true
  };
}
