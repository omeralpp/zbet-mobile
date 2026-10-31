import type { TotoFixture, TotoPayout, TotoPrediction, TotoProgram } from "../api/schemas";
import { summarizeTotoResults } from "./toto-results";

type Program = Pick<TotoProgram, "status" | "columns" | "singleCount" | "doubleCount" | "tripleCount" | "fixtures" | "predictions"> & Partial<Pick<TotoProgram, "payinEndsAt">>;
type Row = Pick<TotoFixture, "matchNo" | "matchName" | "matchDate" | "matchTime" | "actualResult">;

/** Istanbul wall-clock kickoff (fixed +03:00, as formatFixtureDateTime); null when unknown. */
export function fixtureInstant(row: Pick<TotoFixture, "matchDate" | "matchTime">): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.matchDate) || !/^\d{2}:\d{2}$/.test(row.matchTime)) return null;
  const at = Date.parse(`${row.matchDate}T${row.matchTime}:00+03:00`);
  return Number.isFinite(at) ? at : null;
}

/** "8 tek · 7 üçlü": the coupon's shape, zero kinds omitted; null without a plan. */
export function couponStructure(program: Pick<TotoProgram, "singleCount" | "doubleCount" | "tripleCount">) {
  const parts = [[program.singleCount, "tek"], [program.doubleCount, "çift"], [program.tripleCount, "üçlü"]] as const;
  const text = parts.filter(([count]) => count > 0).map(([count, label]) => `${count} ${label}`).join(" · ");
  return text || null;
}

/** "2 gün sonra" / "5 saat sonra" / "40 dk sonra" / "başladı" for a future kickoff. */
export function kickoffCountdown(at: number, now: number) {
  const minutes = Math.floor((at - now) / 60_000);
  if (minutes <= 0) return "başladı";
  if (minutes >= 1440) return `${Math.floor(minutes / 1440)} gün sonra`;
  if (minutes >= 60) return `${Math.floor(minutes / 60)} saat sonra`;
  return `${minutes} dk sonra`;
}

const day = (at: number, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", ...options }).format(at);

/** "2 Kas Pzt 11:51 · 2 gün sonra", the countdown kept on one line. */
export function kickoffText(at: number, now: number) {
  return `${kickoffLabel(at)} · ${kickoffCountdown(at, now).replace(/ /g, "\u00a0")}`;
}

/** "2 Kas Pzt 11:51" for a kickoff instant. */
export function kickoffLabel(at: number) {
  return `${day(at, { day: "numeric", month: "short" })} ${day(at, { weekday: "short" })} ${day(at, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

/** "23–25 Eki" or "30 Eki – 2 Kas": the calendar span of a program's matches. */
export function dayRange(first: number, last: number) {
  const month = (at: number) => day(at, { month: "short" });
  const date = (at: number) => day(at, { day: "numeric" });
  if (date(first) === date(last) && month(first) === month(last)) return `${date(first)} ${month(first)}`;
  return month(first) === month(last) ? `${date(first)}–${date(last)} ${month(last)}` : `${date(first)} ${month(first)} – ${date(last)} ${month(last)}`;
}

/**
 * Lifecycle facts read only from the program DTO. `maxCoverage` is the most
 * coverage still reachable: settled misses can no longer be covered, every
 * other row still can. It is a ceiling, never a forecast or a coupon win.
 */
export function totoProgress(program: Program, now: number) {
  const summary = summarizeTotoResults(program.predictions);
  const rows: readonly Row[] = program.predictions.length ? program.predictions : program.fixtures;
  const isOpen = (row: Row) => "result" in row ? (row as TotoPrediction).result === "OPEN" : row.actualResult === null;
  const times = rows.map(fixtureInstant).filter((at): at is number => at !== null);
  const open = rows.filter(isOpen).map(row => ({ row, at: fixtureInstant(row) }))
    .sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity) || a.row.matchNo - b.row.matchNo);
  const next = open[0] ? { matchNo: open[0].row.matchNo, matchName: open[0].row.matchName, at: open[0].at,
    started: open[0].at !== null && open[0].at <= now } : null;
  const total = summary.total || program.fixtures.length;
  const closesAt = program.payinEndsAt ? Date.parse(program.payinEndsAt) : NaN;
  const firstKickoff = times.length ? Math.min(...times) : null;
  // SAP's coupon close is the real play deadline; the first kickoff stands in when it is unknown.
  const deadline = Number.isFinite(closesAt) ? { at: closesAt, label: "Kupon kapanışı" } : firstKickoff !== null ? { at: firstKickoff, label: "İlk maç" } : null;
  return {
    total, settled: summary.settled, mainHits: summary.mainHits, coverageHits: summary.coverageHits,
    misses: summary.misses, open: summary.open, coveredOnly: summary.coveredOnly,
    maxCoverage: summary.total ? summary.total - summary.misses : null,
    firstKickoff, lastKickoff: times.length ? Math.max(...times) : null, deadline,
    next, planned: program.columns > 0 && program.predictions.length > 0, structure: couponStructure(program)
  };
}

/** "12/15"; an unknown count is a dash and a count above the total (inconsistent payload) is shown bare. */
export function outOf(count: number | null, total: number) {
  return count === null ? "—" : count <= total ? `${count}/${total}` : String(count);
}

/** "₺21.870" with SAP's unit; a bare number when the unit is unknown, never an assumed currency. */
export function formatCost(cost: number, currency: string | null) {
  return currency ? new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: Number.isInteger(cost) ? 0 : 2 }).format(cost)
    : new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(cost);
}

/** SAP prize tiers, highest first, with how many of the coupon's columns each one pays. */
export function payoutRows(payouts: readonly TotoPayout[], currency: string) {
  const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  return [...payouts].sort((a, b) => b.correct - a.correct).map(tier => ({ key: tier.correct, label: `${tier.correct} bilen`,
    detail: `${new Intl.NumberFormat("tr-TR").format(tier.winners)} kazanan · kolon başı ${money(tier.amountPerColumn)}`,
    ours: tier.couponWinningColumns, oursLabel: tier.couponWinningColumns > 0 ? `kuponda ${tier.couponWinningColumns} kolon · ${money(tier.theoreticalTotal)}` : "kuponda yok" }));
}

/** Coverage of the newest resulted programs, newest first; programs without a value are skipped. */
export function coverageTrend(programs: readonly Pick<TotoProgram, "gcNo" | "status" | "coverageHits">[], count = 3) {
  return programs.filter(program => program.status === "RESULTED" && program.coverageHits !== null)
    .sort((a, b) => b.gcNo - a.gcNo).slice(0, count).map(program => program.coverageHits as number);
}

/** Where a program card leads, named by what the user will do there; an unplanned program has no coupon yet. */
export function programAction(status: TotoProgram["status"], planned = true) {
  return status === "ACTIVE" ? planned ? "Kuponu incele" : "Fikstürü incele" : status === "WAITING_RESULT" ? "Sonuç takibini aç" : status === "RESULTED" ? "Sonuçları incele" : "Programı incele";
}
