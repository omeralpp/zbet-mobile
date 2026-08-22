import type { ModuleAnchor, ModuleLayoutSurface } from "./module-layout";

/**
 * Canonical BTB module order per customizable surface.
 *
 * These arrays are the product's opinionated default. A user preference only
 * reorders them; adding an id here automatically reaches existing installs
 * through layout reconciliation.
 */
export const overviewModules = [
  "featured",
  "metrics",
  "recentSuper",
  "toto",
  "hero"
] as const;

export const liveDetailModules = [
  "decision",
  "gamePulse",
  "timeline",
  "standings",
  "odds",
  "statistics",
  "pressure",
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
 * `timeline` arrived with Live Context v1. Existing installs have a persisted
 * `liveDetail` order that predates it, so without this anchor it would be
 * appended below the score distribution instead of sitting with the other
 * live-context material.
 *
 * `lineups` and, later, `relatedSuper` were retired. Super decisions now live
 * inside `timeline`; reconciliation drops both old ids from persisted layouts.
 */
export const moduleLayoutAnchors: Record<
  ModuleLayoutSurface,
  readonly ModuleAnchor[]
> = {
  overview: [],
  liveDetail: [{ id: "timeline", after: "gamePulse" }],
  superDetail: []
};
