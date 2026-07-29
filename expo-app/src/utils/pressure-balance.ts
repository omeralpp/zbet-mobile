export type PressureDirection = "HOME" | "AWAY" | "BALANCED";

export type PressureBalance = {
  direction: PressureDirection;
  magnitudeRatio: number;
  hasData: boolean;
};

export function derivePressureBalance(
  totalPressure: number,
  pressureDiff: number
): PressureBalance {
  const safeTotal = Math.max(0, totalPressure);
  const denominator = Math.max(safeTotal, Math.abs(pressureDiff));
  const hasData = denominator > 0;

  return {
    direction:
      pressureDiff > 0
        ? "HOME"
        : pressureDiff < 0
          ? "AWAY"
          : "BALANCED",
    magnitudeRatio: hasData
      ? Math.min(1, Math.abs(pressureDiff) / denominator)
      : 0,
    hasData
  };
}
