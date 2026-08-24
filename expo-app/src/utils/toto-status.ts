import type { TotoProgram } from "@/src/api/schemas";

/**
 * Semantic tone for a Toto program's lifecycle status.
 *
 * The card previously coloured `ACTIVE` green and everything else gold, which
 * collapsed three unrelated situations into one and — more seriously — dressed
 * `ERROR` as a mild warning. A program that failed looked the same as a program
 * quietly waiting for results.
 *
 * The mapping reuses conventions the rest of the product already established
 * rather than inventing a Toto-specific language, which is what keeps Toto
 * looking like part of BTB instead of a second app:
 *
 * - `ACTIVE`         in progress and still able to change — the same meaning a
 *                    live match carries, so the same signature.
 * - `WAITING_RESULT` open and pending, exactly as an undecided Super decision
 *                    is, so it takes the analytical accent rather than a
 *                    caution it has not earned.
 * - `RESULTED`       history. Settled rows recede everywhere else too.
 * - `ERROR`          the only one that is actually wrong.
 *
 * This is presentation only. The statuses arrive from the backend unchanged and
 * nothing here decides, derives or reorders them.
 */
export type TotoStatusTone = "LIVE" | "OPEN" | "SETTLED" | "PROBLEM";

export function totoProgramTone(
  status: TotoProgram["status"]
): TotoStatusTone {
  if (status === "ACTIVE") {
    return "LIVE";
  }
  if (status === "WAITING_RESULT") {
    return "OPEN";
  }
  if (status === "ERROR") {
    return "PROBLEM";
  }
  return "SETTLED";
}

/** Whether a program is still able to change. */
export function isProgramInPlay(status: TotoProgram["status"]): boolean {
  const tone = totoProgramTone(status);
  return tone === "LIVE" || tone === "OPEN";
}

/** Whether the resulted program carries a positive theoretical return. */
export function hasTheoreticalPrize(
  program: Pick<TotoProgram, "status" | "theoreticalPrize">
): boolean {
  return (
    program.status === "RESULTED" &&
    program.theoreticalPrize !== null &&
    program.theoreticalPrize > 0
  );
}
