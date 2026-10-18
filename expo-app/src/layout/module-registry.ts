import type { ModuleAnchor, ModuleLayoutSurface } from "./module-layout";

/**
 * Canonical BTB module order per customizable surface.
 *
 * These arrays are the product's opinionated default. A user preference only
 * reorders them; adding an id here automatically reaches existing installs
 * through layout reconciliation.
 */
export const overviewModules = [
  "metrics",
  "featured",
  "recentSuper",
  "toto"
] as const;

export const liveDetailModules = [
  "matchPath",
  "decision",
  "teamForm",
  "standings",
  "odds",
  "statistics",
  "scoreDistribution"
] as const;

export const superDetailModules = [
  "decisionSummary",
  "decisionField",
  "similarity",
  "standings"
] as const;

export type OverviewModuleId = (typeof overviewModules)[number];
export type LiveDetailModuleId = (typeof liveDetailModules)[number];
export type SuperDetailModuleId = (typeof superDetailModules)[number];

export const moduleLayoutDefaults: Record<
  ModuleLayoutSurface,
  readonly string[]
> = {
  overview: overviewModules,
  liveDetail: liveDetailModules,
  superDetail: superDetailModules
};

export const moduleLayoutLabels: Record<ModuleLayoutSurface, string> = {
  overview: "Özet düzeni",
  liveDetail: "Canlı detay düzeni",
  superDetail: "Super detay düzeni"
};

/**
 * Placement for modules introduced after a surface's layout first shipped.
 *
 * `matchPath`, `askJinx` and `teamForm` arrived with the M15 Mobile
 * Intelligence Foundation lane. Existing installs have a persisted
 * `liveDetail` order that predates them, so without these anchors they would
 * be appended below the score distribution.
 *
 * Retired ids are dropped from persisted layouts by reconciliation alone:
 * `lineups` and `relatedSuper` earlier, then `gamePulse` (Maçın Nabzı) and
 * `timeline` by owner decision on 2026-10-16. The score and star flow that
 * `timeline` carried now lives inside `matchPath`, so every anchor that used
 * to name a retired id points at `decision` or `matchPath` instead.
 */
export const moduleLayoutAnchors: Record<
  ModuleLayoutSurface,
  readonly ModuleAnchor[]
> = {
  overview: [],
  liveDetail: [
    { id: "matchPath", after: "decision" },
    { id: "teamForm", after: "matchPath" }
  ],
  superDetail: []
};

/** Live-detail module ids that existed once and are dropped on reconcile. */
export const retiredLiveDetailModules = [
  "lineups",
  "relatedSuper",
  "gamePulse",
  "timeline",
  "askJinx"
] as const;

export const moduleCollapseDefaults: Record<ModuleLayoutSurface, readonly string[]> = {
  overview: [],
  liveDetail: liveDetailModules.filter((id) => id !== "matchPath"),
  superDetail: ["decisionField", "similarity", "standings"]
};
