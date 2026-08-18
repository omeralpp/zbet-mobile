/**
 * Which days the Karar günlüğü shows.
 *
 * `LATEST_DAY` is the newest match date present in the loaded decisions, not
 * the device's calendar date. That is what `Bugün` has always meant on this
 * screen and it is deliberately unchanged here: a user who opens the log after
 * midnight, or on a day with no fixtures yet, still wants the most recent day
 * BTB actually decided on rather than an empty list that is technically today.
 *
 * The scope lives in the route, not in storage. Nothing persists it across a
 * restart, so a fresh entry resolves to the default below.
 */
export type SuperDayScope = "LATEST_DAY" | "ALL";

export const superDayScopeLabels = {
  LATEST_DAY: "Bugün",
  ALL: "Tüm günler"
} as const;

export type SuperDayScopeLabel =
  (typeof superDayScopeLabels)[keyof typeof superDayScopeLabels];

/**
 * Where the screen starts.
 *
 * The log grows without bound, so opening on every day it has ever recorded
 * puts the decision a user came to check behind a scroll through history. The
 * newest day is what they are looking at the screen to find.
 */
export const defaultSuperDayScope: SuperDayScope = "LATEST_DAY";

/**
 * Resolves the scope from the route parameter.
 *
 * `ALL` has to be explicit. Before the default moved, "all days" was expressed
 * by clearing the parameter, and leaving it that way would make the choice
 * unreachable: the cleared route would immediately read back as the default and
 * snap the user to a single day the moment they asked for every day.
 *
 * Anything unrecognised resolves to the default rather than throwing, so a
 * stale deep link opens the screen instead of breaking it.
 */
export function resolveSuperDayScope(
  raw: string | null | undefined
): SuperDayScope {
  return raw === "ALL" ? "ALL" : defaultSuperDayScope;
}

/** The scope a menu label selects. */
export function superDayScopeForLabel(
  label: SuperDayScopeLabel
): SuperDayScope {
  return label === superDayScopeLabels.ALL ? "ALL" : "LATEST_DAY";
}

/** The label shown for the active scope. */
export function superDayScopeLabel(scope: SuperDayScope): SuperDayScopeLabel {
  return superDayScopeLabels[scope];
}
