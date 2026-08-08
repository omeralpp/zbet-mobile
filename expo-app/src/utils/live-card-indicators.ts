export type LiveRateTrend = "UP" | "DOWN" | "STABLE" | "UNAVAILABLE";

export function deriveLiveRateTrend(
  selectionRate: number | null,
  currentRate: number | null
): LiveRateTrend {
  if (
    selectionRate === null ||
    currentRate === null ||
    !Number.isFinite(selectionRate) ||
    !Number.isFinite(currentRate) ||
    selectionRate <= 1 ||
    currentRate <= 1
  ) {
    return "UNAVAILABLE";
  }

  const difference = currentRate - selectionRate;
  if (Math.abs(difference) < 0.005) {
    return "STABLE";
  }
  return difference > 0 ? "UP" : "DOWN";
}
