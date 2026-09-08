import type { MatchJourneyPoint } from "@/src/api/schemas";

export function retainedJourneyRuns(points: MatchJourneyPoint[]) {
  const runs: MatchJourneyPoint[][] = [];
  let run: MatchJourneyPoint[] = [];
  for (const point of points) {
    if (point.level === null || point.plotMinute === null) {run = [];continue;}
    if (!point.connects || !run.length || point.referenceChange) {
      run = [];runs.push(run);
    }
    run.push(point);
  }
  return runs;
}

export function journeyPointLabel(point: MatchJourneyPoint) {
  const reason: Record<string, string> = {
    KICK_OFF: "Başlama düdüğü · olağan başlangıç",
    KICK_OFF_BASELINE: "Başlangıç referansı · ilk golsüz güncelleme 1–2. dakikada",
    CAPTURE_STARTED: "Akış kaydı burada başladı",
    JOB_UPDATE: "Skor değişmedi · akış devam ediyor",
    PRESSURE_TOWARD: "Baskı beklenen skor yönünde · hafif olağana",
    PRESSURE_AGAINST: "Baskı beklenen skora karşı · hafif sıra dışına",
    LEADING_SCORE_REACHED: "Gol · en olası skora ulaşıldı",
    OUTCOMES_ELIMINATED: "Gol · olası sonuçlar elendi",
    FIRST_HALF_ENDED: "İlk yarı sona erdi",
    SECOND_HALF_POOL: "İkinci yarı · devre skoruna göre yeni havuz",
    SCORE_OR_CLOCK_CORRECTION: "Skor veya dakika düzeltmesi · yeni parça",
    CAPTURE_GAP: "Arada güncelleme kaydı yok",
    MULTIPLE_GOALS_UNOBSERVED: "Arada birden fazla gol · tek gol etkisi bilinmiyor",
    REFERENCE_CHANGED: "Referans havuzu değişti",
    CLOCK_UNKNOWN: "Geçerli maç dakikası yok",
    OUTSIDE_REGULATION: "Normal süre dışı",
    POOL_OR_CAPTURE_MISSING: "Havuz veya güncelleme verisi eksik"
  };
  return reason[point.reason] ?? "Maç güncellemesi";
}
