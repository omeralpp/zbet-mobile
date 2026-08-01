import type { TotoPrediction } from "@/src/api/schemas";

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
