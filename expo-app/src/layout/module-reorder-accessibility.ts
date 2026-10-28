const moduleNames: Record<string, string> = {
  metrics: "Günlük özet ve Jinx",
  featured: "Maç görünümü",
  recentSuper: "Son Super kararları",
  toto: "Toto programı",
  matchPath: "Maçın yolu",
  pressure: "Baskı grafiği",
  decision: "Karar özeti",
  teamForm: "Takım formu",
  standings: "Lig sıralaması",
  odds: "Oran sonuçları",
  statistics: "Canlı saha dengesi",
  scoreDistribution: "Tarihsel skor dağılımı",
  decisionSummary: "Karar kanıtı",
  decisionField: "Karar anındaki baskı",
  similarity: "Havuz ve yıldız tavanları",
  matchHistory: "Maç boyunca öneriler"
};

export function moduleReorderLabel(id: string): string {
  return moduleNames[id] ?? "Bölüm";
}

/** Resolve against the currently visible ids, never a stale rendered index. */
export function resolveModuleStep(
  ids: readonly string[],
  id: string,
  direction: -1 | 1
): { from: number; to: number; announcement: string } | null {
  const from = ids.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) {
    return null;
  }
  return {
    from,
    to,
    announcement: `${moduleReorderLabel(id)}, toplam ${ids.length} bölümün ${to + 1}. sırasına taşındı.`
  };
}
