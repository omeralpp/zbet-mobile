// RB1 replaced the A3 Super log and KPI roots on 2026-10-21.
const roots = new Set(["dashboard", "matches", "matchInsights", "rebuildReport", "rebuildCohortsReport", "rebuildMatch", "rebuildStatistics", "rebuildPressureHistory", "rebuildPoolPath", "totoPrograms", "analysisContext"]);

/** A general data refresh must never trigger a previously asked analyst query. */
export function canRefreshScreenQuery(key: readonly unknown[]) {
  return roots.has(String(key[0])) && !key.some(part => typeof part === "string" && /jinx/i.test(part));
}
