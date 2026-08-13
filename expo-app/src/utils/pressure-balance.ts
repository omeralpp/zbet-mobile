export type PressureDirection = "HOME" | "AWAY" | "BALANCED";

export type PressureBalance = {
  direction: PressureDirection;
  magnitudeRatio: number;
  hasData: boolean;
};

export function derivePressureBalance(
  totalPressure: number | null,
  pressureDiff: number | null
): PressureBalance {
  const safeTotal = Math.max(0, totalPressure ?? 0);
  const safeDiff = pressureDiff ?? 0;
  const denominator = Math.max(safeTotal, Math.abs(safeDiff));
  const hasData = totalPressure !== null && pressureDiff !== null && denominator > 0;

  return {
    direction:
      safeDiff > 0
        ? "HOME"
        : safeDiff < 0
          ? "AWAY"
          : "BALANCED",
    magnitudeRatio: hasData
      ? Math.min(1, Math.abs(safeDiff) / denominator)
      : 0,
    hasData
  };
}
