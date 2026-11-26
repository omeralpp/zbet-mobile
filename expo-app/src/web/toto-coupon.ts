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
  /** The live provisional result (btb-toto-live.v1) while no official result exists. */
  provisional: boolean;
};

export type CouponRowInput = {
  mainPick: string;
  coverage: string;
  actualResult: string | null;
  live?: { provisionalResult: string | null } | null | undefined;
};

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toUpperCase();
}

export function couponCells(row: CouponRowInput): CouponCell[] {
  const main = normalize(row.mainPick);
  const coverage = normalize(row.coverage);
  const actual = normalize(row.actualResult);
  const provisional = actual ? "" : normalize(row.live?.provisionalResult);
  return totoOutcomes.map((outcome) => ({
    outcome,
    main: main === outcome,
    // The main pick is always on the coupon even if a payload omits it.
    covered: coverage.includes(outcome) || main === outcome,
    actual: actual === outcome,
    provisional: provisional === outcome
  }));
}

/** Column count the coupon spends on this row (1 single, 2 double, 3 triple). */
export function couponWidth(row: CouponRowInput): number {
  return couponCells(row).filter((cell) => cell.covered).length;
}

export type TotoLiveInput = {
  status: string;
  minute: number | null;
  homeScore: number | null;
  awayScore: number | null;
  provisionalResult: string | null;
};

export type TotoLiveLabel = { text: string; inPlay: boolean };

/**
 * Where a match without an official result stands on the live feed: finished
 * with a provisional 1/X/2, in play, or neither (owner 2026-11-26: a finished
 * match must not read as waiting). Official results always win.
 */
export function totoLiveState(row: { actualResult: string | null; live?: TotoLiveInput | null | undefined }): "PROVISIONAL" | "IN_PLAY" | null {
  const live = row.live;
  if (!live || row.actualResult) return null;
  if (live.provisionalResult && (live.status === "FINISHED" || live.status === "EXTRA_TIME")) return "PROVISIONAL";
  return live.status === "LIVE" || live.status === "HALF_TIME" || live.status === "EXTRA_TIME" ? "IN_PLAY" : null;
}

/**
 * One-line live state of a Toto match for both surfaces (btb-toto-live.v1).
 * Null when there is nothing to add to the kickoff time: no live data, not
 * started, unknown, or an official result already shown.
 */
export function totoLiveLabel(row: { actualResult: string | null; live?: TotoLiveInput | null | undefined }): TotoLiveLabel | null {
  const live = row.live;
  if (!live || row.actualResult) return null;
  const score = live.homeScore !== null && live.awayScore !== null ? `${live.homeScore}-${live.awayScore}` : null;
  const provisional = live.provisionalResult ? ` · geçici ${live.provisionalResult}` : "";
  switch (live.status) {
    case "LIVE":
      return { text: ["Canlı", live.minute !== null ? `${live.minute}'` : null].filter(Boolean).join(" ") + (score ? ` · ${score}` : ""), inPlay: true };
    case "HALF_TIME":
      return { text: `Devre arası${score ? ` · ${score}` : ""}`, inPlay: true };
    case "EXTRA_TIME":
      // The score is the regulation result once proven; Toto settles on 90 minutes.
      return { text: provisional ? `Normal süre ${score ?? "—"}${provisional}` : `Uzatmalar${score ? ` · ${score}` : ""}`, inPlay: !provisional };
    case "FINISHED":
      return { text: `Bitti${score ? ` ${score}` : ""}${provisional}`, inPlay: false };
    case "SUSPENDED":
      return { text: `Durduruldu${score ? ` · ${score}` : ""}`, inPlay: false };
    default:
      return null;
  }
}
