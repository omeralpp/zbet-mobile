/**
 * Which side an event belongs to, made visible without relying on the team name.
 *
 * Physical use surfaced the real problem: a column of rows reading
 * `16' ⚽ Puebla`, `33' ⚽ Puebla`, `42' ⚽ Pachuca` is legible but not
 * *scannable*. Working out home from away meant reading and comparing club
 * names against the header on every row, which is exactly the cognitive work a
 * timeline exists to remove.
 *
 * The side is already in the contract — `describeEvent` returns it — so nothing
 * new is derived here. This module decides how it is expressed.
 *
 * Three cues, deliberately none of them colour:
 *
 * **Spatial.** Away rows are indented and their rail sits inset, so consecutive
 * same-side goals form a visible column and an alternating sequence reads as a
 * staircase. Position is the fastest cue a list can offer.
 *
 * **Explicit.** A short side chip (`EV` / `DEP`) states the side in words that
 * are not the club's name, reusing the vocabulary the standings module already
 * uses so the app keeps one home/away language.
 *
 * **Structural.** A neutral rail marks the row's side edge.
 *
 * Colour is avoided on purpose. Home and away are not semantic states in this
 * product's palette, and borrowing the intelligence blue or the positive green
 * for them would spend a meaning on something that has none. Team colours are
 * not used either: no reliable team-colour data exists in the contract.
 */

export type EventSide = "HOME" | "AWAY" | null;

/** Row treatment for one event. */
export type SideAlignment = "HOME" | "AWAY" | "UNKNOWN";

export function resolveSideAlignment(side: EventSide): SideAlignment {
  if (side === "HOME") {
    return "HOME";
  }
  if (side === "AWAY") {
    return "AWAY";
  }
  return "UNKNOWN";
}

/**
 * Short side label.
 *
 * `null` when the feed did not say. An unattributed event must stay
 * unattributed: guessing a side would be inventing the one fact the row exists
 * to report.
 */
export function resolveSideLabel(side: EventSide): string | null {
  if (side === "HOME") {
    return "EV";
  }
  if (side === "AWAY") {
    return "DEP";
  }
  return null;
}

/** Whether the row carries the inset treatment reserved for away events. */
export function isInset(side: EventSide): boolean {
  return resolveSideAlignment(side) === "AWAY";
}

/**
 * Screen-reader wording for the side.
 *
 * Spoken in full, because a chip reading "DEP" is an abbreviation a sighted
 * reader resolves from context that a listener does not have.
 */
export function spokenSide(side: EventSide): string | null {
  if (side === "HOME") {
    return "ev sahibi";
  }
  if (side === "AWAY") {
    return "deplasman";
  }
  return null;
}
