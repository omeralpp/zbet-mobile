import type { Dashboard, SuperKpis, TotoProgram } from "@/src/api/schemas";
import {
  starFilterMinRating,
  type StarDecisionFilter
} from "@/src/utils/decision-filters";
import type {
  BtbWidgetPayload,
  WidgetInputData
} from "./widget-payload";

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
  superKpis: SuperKpis,
  superFilter: StarDecisionFilter,
  programs: TotoProgram[] = dashboard.latestTotoProgram
    ? [dashboard.latestTotoProgram]
    : []
): BtbWidgetPayload {
  const superBucket = superKpis.buckets[superFilter];
  const payload: BtbWidgetPayload = {
    super_min_rating: starFilterMinRating(superFilter),
    super_wins: superBucket.won,
    super_losses: superBucket.lost,
    super_profit: superBucket.profit
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

const superKpiKeys = new Set([
  "super_min_rating",
  "superMinRating",
  "super_wins",
  "superWins",
  "super_losses",
  "superLosses",
  "super_profit",
  "superProfit"
]);

export function withoutSuperKpiData(
  data: WidgetInputData
): WidgetInputData {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !superKpiKeys.has(key))
  );
}
