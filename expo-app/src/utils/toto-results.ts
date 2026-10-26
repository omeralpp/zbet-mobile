import type { TotoPrediction } from "@/src/api/schemas";

export type TotoResultFilter = "ALL" | "OPEN" | "COVERAGE" | "MISS";

/** Filter the existing result DTOs only; coverage includes main hits. */
export function filterTotoResults(predictions: readonly TotoPrediction[], filter: TotoResultFilter): TotoPrediction[] {
  return predictions.filter((prediction) => filter === "ALL" || (filter === "COVERAGE"
    ? prediction.result === "MAIN_HIT" || prediction.result === "COVERED"
    : prediction.result === filter));
}

export function summarizeTotoResults(predictions: TotoPrediction[]) {
  const mainHits = predictions.filter(
    (prediction) => prediction.result === "MAIN_HIT"
  ).length;
  const coveredOnly = predictions.filter(
    (prediction) => prediction.result === "COVERED"
  ).length;
  const misses = predictions.filter(
    (prediction) => prediction.result === "MISS"
  ).length;
  const open = predictions.filter(
    (prediction) => prediction.result === "OPEN"
  ).length;

  return {
    total: predictions.length,
    settled: predictions.length - open,
    mainHits,
    coveredOnly,
    coverageHits: mainHits + coveredOnly,
    misses,
    open
  };
}
