/**
 * Cell model of the desktop Toto coupon grid: for each 1/X/2 outcome of a
 * prediction row, whether it is the main pick, whether the coupon covers it,
 * and whether it is the settled result. Pure, so the grid is tested.
 */
export const totoOutcomes = ["1", "X", "2"] as const;
export type TotoOutcome = (typeof totoOutcomes)[number];

export type CouponCell = {
  outcome: TotoOutcome;
  main: boolean;
  covered: boolean;
  actual: boolean;
};

export type CouponRowInput = {
  mainPick: string;
  coverage: string;
  actualResult: string | null;
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toUpperCase();
}

export function couponCells(row: CouponRowInput): CouponCell[] {
  const main = normalize(row.mainPick);
  const coverage = normalize(row.coverage);
  const actual = normalize(row.actualResult);
  return totoOutcomes.map((outcome) => ({
    outcome,
    main: main === outcome,
    // The main pick is always on the coupon even if a payload omits it.
    covered: coverage.includes(outcome) || main === outcome,
    actual: actual === outcome
  }));
}

/** Column count the coupon spends on this row (1 single, 2 double, 3 triple). */
export function couponWidth(row: CouponRowInput): number {
  return couponCells(row).filter((cell) => cell.covered).length;
}
