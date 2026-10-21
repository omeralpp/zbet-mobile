import type { TotoProgram } from "@/src/api/schemas";
import {
  starFilterMinRating,
  type StarDecisionFilter
} from "@/src/utils/decision-filters";
import type {
  BtbWidgetPayload,
  WidgetInputData
} from "./widget-payload";
import type { RebuildReport } from "@/src/api/rebuild-schemas";

export function buildRebuildWidgetPayload(report: RebuildReport, filter: StarDecisionFilter, programs: TotoProgram[] = []): BtbWidgetPayload {
  const minimum = starFilterMinRating(filter), period = report.periods.find(p => p.days === 7);
  const buckets = period?.byStar.filter(b => b.stars >= minimum) || [];
  const settled = buckets.reduce((sum, b) => sum + b.settled, 0);
  // Exact canonical net strings are added without a JS floating-point round trip.
  const add = (left: string, right: string) => {
    const places = Math.max((left.split(".")[1] || "").length, (right.split(".")[1] || "").length);
    const units = (value: string) => { const negative = value.startsWith("-"); const [whole, fraction = ""] = value.replace(/^-/, "").split(".");
      return BigInt(whole + fraction.padEnd(places, "0")) * (negative ? -1n : 1n); };
    const total = units(left) + units(right), digits = (total < 0n ? -total : total).toString().padStart(places + 1, "0");
    return (total < 0n ? "-" : "") + (places ? digits.slice(0, -places) + "." + digits.slice(-places) : digits);
  };
  const payload: BtbWidgetPayload = { super_model_regime: "BTB_RB1_20261018", super_days: 7, super_available: report.availability === "AVAILABLE" && settled > 0,
    ...(report.availability === "AVAILABLE" && settled > 0 ? { super_min_rating: minimum,
      super_wins: buckets.reduce((n, b) => n + b.wins, 0), super_losses: buckets.reduce((n, b) => n + b.losses, 0),
      super_profit: buckets.reduce((n, b) => add(n, b.net), "0") } : {}),
    super_pending: buckets.reduce((n, b) => n + b.pending, 0), super_unresolved: buckets.reduce((n, b) => n + b.unresolved, 0),
    super_voids: buckets.reduce((n, b) => n + b.voids, 0) };
  const program = programs.find(p => p.coverageHits !== null && p.predictions.some(prediction => prediction.result !== "OPEN"));
  const completed = program?.predictions.filter(prediction => prediction.result !== "OPEN").length || 0;
  if (program && program.coverageHits !== null && program.coverageHits <= completed && completed > 0) {
    payload.toto_coverage_hits = program.coverageHits; payload.toto_coverage_total = completed;
    payload.toto_program_gc_no = program.gcNo; payload.toto_program_version = program.version;
  }
  return payload;
}

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
