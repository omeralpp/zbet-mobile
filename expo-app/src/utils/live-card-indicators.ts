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

/** Which of the live card's footer metrics have something to report. */
export type LiveCardFooter = {
  showsRate: boolean;
  showsPressure: boolean;
};

/**
 * Decides what the live card's footer says when BTB has not decided yet.
 *
 * A decided card reports its market and its pressure even when either is empty:
 * `market kapalı` and `güncel veri bekleniyor` are real answers about a
 * selection the user is holding, and suppressing them would hide the state of a
 * decision rather than tidy the layout.
 *
 * An undecided card is a different situation. The decision block already says
 * `Aday bekleniyor`; a rate block that can only repeat `oran bekleniyor` and a
 * pressure block that can only say `güncel veri bekleniyor` are a second and
 * third way of saying the same nothing. On a 360dp phone that is not merely
 * redundant — four long Turkish labels are what push this row past the card
 * edge, and the three that carry no information are the ones that should go.
 *
 * Real values are never suppressed. A rate that exists is reported even without
 * a selection, so this drops duplicates rather than data.
 */
export function deriveLiveCardFooter(
  selectedOdd: string,
  currentRate: number | null,
  hasPressureData: boolean
): LiveCardFooter {
  if (selectedOdd) {
    return { showsRate: true, showsPressure: true };
  }
  return { showsRate: currentRate !== null, showsPressure: hasPressureData };
}

/**
 * Longest caption the live card footer may place beside a real number.
 *
 * Not a guess: `market kapalı` is the longest footer caption the physical
 * Xiaomi round accepted on that 360dp row, and `güncel baskı farkı` at eighteen
 * characters is the one it rejected. Thirteen is therefore the widest caption
 * this row is known to carry, and anything wider has to justify itself as a
 * waiting caption that is allowed to wrap.
 */
export const maxLiveCardValueCaption = 13;

/**
 * What the pressure block calls itself.
 *
 * The card says `baskı farkı` rather than `güncel baskı farkı` because the
 * surface already carries the tense. A number only ever reaches this block when
 * `pressureSource === "CURRENT_MATCH"`, so the currency of the figure is
 * enforced in code rather than asserted in a caption, and the Super decision
 * screen already names the same quantity `baskı farkı` under its own
 * `karar anı` framing. Dropping the adjective removes a claim the reader cannot
 * act on differently — not information.
 *
 * The waiting caption keeps `güncel`, where the word is the whole point: the
 * match has pressure history but no current reading, which is exactly the
 * distinction `NXT-OBS-092` was opened for. It is longer than the ceiling above
 * and wraps to a controlled second line instead of being shortened into a lie.
 */
export function pressureFooterCaption(hasPressureData: boolean): string {
  return hasPressureData ? "baskı farkı" : "güncel veri bekleniyor";
}
