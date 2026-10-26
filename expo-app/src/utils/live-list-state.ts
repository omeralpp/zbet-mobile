import type { LiveMatchTab } from "./live-match-tabs";

export type LiveEmptyKind = "LOADING" | "UNAVAILABLE" | "SEARCH" | "NO_SELECTION" | "NO_FIXTURE" | "NO_LIVE";

/** Missing selection evidence takes precedence over an apparent empty search. */
export function liveEmptyKind(
  tab: LiveMatchTab,
  hasSearch: boolean,
  selectionPending: boolean,
  selectionUnavailable: boolean
): LiveEmptyKind {
  if (tab === "STAR" && selectionPending) return "LOADING";
  if (tab === "STAR" && selectionUnavailable) return "UNAVAILABLE";
  if (hasSearch) return "SEARCH";
  if (tab === "STAR") return "NO_SELECTION";
  return tab === "FIXTURE" ? "NO_FIXTURE" : "NO_LIVE";
}
