/**
 * How much of a phone list one screen shows (NXT-OBS-251).
 *
 * The accepted v40 cards stay the default. `COMPACT` swaps them for the app's
 * own shorter forms, the Özet match card and a three-line decision card, so a
 * long Canlı or Super day needs less scrolling.
 */
export type ListDensity = "COMFORTABLE" | "COMPACT";

export const listDensityStorageKey = "btb.mobile.list-density.v1";
export const defaultListDensity: ListDensity = "COMFORTABLE";

/** Anything but a stored `COMPACT` keeps the accepted comfortable cards. */
export function normalizeListDensity(stored: string | null | undefined): ListDensity {
  return stored === "COMPACT" ? "COMPACT" : "COMFORTABLE";
}

/**
 * Whether a list draws its short cards. The desktop split view and the desktop
 * decision table have their own layouts and ignore the preference.
 */
export function usesCompactCards(density: ListDensity, desktopLayout: boolean): boolean {
  return !desktopLayout && density === "COMPACT";
}
