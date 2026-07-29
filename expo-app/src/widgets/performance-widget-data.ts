import type { Dashboard, TotoProgram } from "@/src/api/schemas";
import type {
  BtbWidgetPayload,
  WidgetInputData
} from "./widget-payload";

const defaultSuperMinRating = 3;

export function hasPerformanceWidgetData(
  data: WidgetInputData
): boolean {
  return [
    "toto_coverage_hits",
    "totoCoverageHits",
    "toto_coverage_total",
    "totoCoverageTotal",
    "super_min_rating",
    "superMinRating"
  ].some((key) => data[key] !== undefined && data[key] !== null);
}

export function buildPerformanceWidgetPayload(
  dashboard: Dashboard,
  programs: TotoProgram[] = dashboard.latestTotoProgram
    ? [dashboard.latestTotoProgram]
    : []
): BtbWidgetPayload {
  const payload: BtbWidgetPayload = {
    super_min_rating: defaultSuperMinRating,
    super_wins: dashboard.todayHighStarSuperWon,
    super_losses: dashboard.todayHighStarSuperLost,
    super_profit: dashboard.todayHighStarSuperProfit
  };
  const program = programs.find(
    (candidate) =>
      candidate.coverageHits !== null &&
      candidate.predictions.some(
        (prediction) => prediction.result !== "OPEN"
      )
  );
  const settledPredictionCount =
    program?.predictions.filter(
      (prediction) => prediction.result !== "OPEN"
    ).length ?? 0;

  if (
    program &&
    program.coverageHits !== null &&
    program.coverageHits <= settledPredictionCount &&
    settledPredictionCount > 0
  ) {
    payload.toto_coverage_hits = program.coverageHits;
    payload.toto_coverage_total = settledPredictionCount;
    payload.toto_program_gc_no = program.gcNo;
    payload.toto_program_version = program.version;
  }

  return payload;
}
