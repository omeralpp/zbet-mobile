const roots = new Set(["dashboard", "matches", "matchInsights", "superLogs", "superKpis", "totoPrograms", "analysisContext"]);

/** A general data refresh must never trigger a previously asked analyst query. */
export function canRefreshScreenQuery(key: readonly unknown[]) {
  return roots.has(String(key[0])) && !key.some(part => typeof part === "string" && /jinx/i.test(part));
}
