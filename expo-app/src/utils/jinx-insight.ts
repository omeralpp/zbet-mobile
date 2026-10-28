import type { RebuildRecommendation } from "../api/rebuild-schemas";

const capLabels = { sample: "Havuz kapsamı", direction: "Yön tutarlılığı", timing: "Ölçüm zamanı",
  xg: "xG kapsamı", time_goals: "Dakika ve gereken gol" } as const;

export function jinxQualityLimit(record: RebuildRecommendation): string | null {
  const caps = Object.entries(capLabels).map(([key, label]) => ({
    label, value: record.caps[key as keyof typeof capLabels]
  }));
  const lowest = Math.min(...caps.map(cap => cap.value));
  if (lowest < record.stars) return "Kayıtlı kalite tavanı, gösterilen yıldız sayısının altında.";
  if (lowest < 5) {
    const limiting = caps.filter(cap => cap.value === lowest);
    const labels = limiting.length <= 2 ? limiting.map(cap => cap.label).join(" ve ") : "Birden fazla kanıt alanı";
    return `${labels}, kalite tavanını ${lowest} yıldızla sınırlamış.`;
  }
  return null;
}

/** One useful reading of the frozen decision, never another prediction. */
export function jinxInsight(record: RebuildRecommendation): string {
  const support = record.directionConflict ? "Seçim kanıtında yön çelişkisi kaydedilmiş."
    : record.votesUsed === 0 ? "Baskı teyidi kaydedilmemiş."
      : record.votesSupport === 0 ? "Baskı aralıkları seçimi desteklememiş."
        : record.votesSupport < record.votesUsed || record.dissent ? "Baskı aralıkları seçimi bütünüyle desteklememiş."
          : "Baskı aralıkları seçimi aynı yönde desteklemiş.";
  const limit = jinxQualityLimit(record);
  if (limit) return `${support} ${limit}`;
  if (record.poolWins < record.poolTotal) return `${support} Referans havuzu seçimi bütünüyle desteklememiş.`;
  // No stock confidence, result or probability sentence just to fill the card.
  return support;
}
