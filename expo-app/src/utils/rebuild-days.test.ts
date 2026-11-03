import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import firstFixture from "../api/fixtures/btb-rebuild-v1.json";
import reportFixture from "../api/fixtures/btb-rebuild-report-v1.json";
import { rebuildMatchSchema, rebuildReportSchema, type RebuildCohortsReport } from "../api/rebuild-schemas";
import { createRequestLimiter } from "../api/request-limiter";
import { composeDays, dailyDay, periodDays } from "./rebuild-days";

// NXT-OBS-244: 7/30-day Karar günlüğü read one Istanbul day at a time.
const base = rebuildReportSchema.parse(reportFixture), template = base.periods[0]!;
const first = rebuildMatchSchema.parse(firstFixture).history[0]!;
const cohort = "A".repeat(64);
type Row = { stars: number; market: string; net: string; state: "WIN" | "LOSS" | "PENDING" };

function dayReport(day: string, rows: (Row & { id: string; match: string; at: string })[]): RebuildCohortsReport {
  const agg = (list: typeof rows) => {
    const wins = list.filter((r) => r.state === "WIN").length, losses = list.filter((r) => r.state === "LOSS").length, settled = wins + losses;
    const net = list.filter((r) => r.state !== "PENDING").reduce((sum, r) => sum + Number(r.net), 0).toFixed(2);
    return { ...template, recommendations: list.length, matches: new Set(list.map((r) => r.match)).size, settled, wins, losses, voids: 0,
      pending: list.filter((r) => r.state === "PENDING").length, unresolved: 0, net, risk: settled, totalRisk: list.length,
      roi: settled ? Number(net) / settled : null, hitRate: settled ? wins / settled : null, uncertainty: null, byMatch: undefined };
  };
  const period = { ...agg(rows), days: 1 as const, from: day, through: day, key: undefined,
    byStar: [1, 2, 3, 4, 5].map((stars) => ({ stars, ...agg(rows.filter((r) => r.stars === stars)) })),
    byMarket: [...new Set(rows.map((r) => r.market))].sort().map((market) => ({ market, ...agg(rows.filter((r) => r.market === market)) })) };
  return { contractVersion: "btb-rebuild-report.v2", modelRegime: base.modelRegime, asOf: `${day}T20:00:00Z`, timeZone: base.timeZone,
    availability: "AVAILABLE", reason: "", accounting: base.accounting, actualBetsAssumed: false, periods: [period], learning: null,
    cohorts: [{ id: cohort, label: "77A · havuz yolu", current: true, firstDecisionAt: rows[0]?.at ?? null, periods: [period], learning: null }],
    recommendations: rows.map((r) => ({ ...first, decisionId: r.id.padEnd(32, "0"), matchKey: r.match, publishedAt: r.at, stars: r.stars, market: r.market,
      result: r.state === "PENDING" ? { state: "PENDING", revision: 1, net: null } : { state: r.state, revision: 2, net: r.net }, cohortId: cohort })) } as RebuildCohortsReport;
}

// A match kicking off late on 1 Nov has decisions on both sides of Istanbul midnight.
const nov1 = dayReport("2026-11-01", [
  { id: "A1", match: "2026-11-01:9:23:30:00", at: "2026-11-01T20:50:00Z", stars: 3, market: "Ms15a", net: "0.40", state: "WIN" },
  { id: "A2", match: "2026-11-01:8:20:00:00", at: "2026-11-01T18:10:00Z", stars: 2, market: "Ms2", net: "-1", state: "LOSS" }
]);
const nov2 = dayReport("2026-11-02", [
  { id: "B1", match: "2026-11-01:9:23:30:00", at: "2026-11-01T21:20:00Z", stars: 3, market: "MsX2", net: "0.15", state: "WIN" },
  { id: "B2", match: "2026-11-02:7:19:00:00", at: "2026-11-02T16:00:00Z", stars: 5, market: "Ms15a", net: "0", state: "PENDING" }
]);

test("days are added exactly: counts and units from each day, a match spanning midnight counted once", () => {
  const composed = composeDays([{ day: "2026-11-02", report: nov2 }, { day: "2026-11-01", report: nov1 }], { days: 7, through: "2026-11-03" })!;
  const period = composed.periods[0]!;
  assert.deepEqual([period.days, period.from, period.through, period.key], [7, "2026-10-28", "2026-11-03", undefined]);
  assert.deepEqual([period.recommendations, period.settled, period.wins, period.losses, period.pending, period.net], [4, 3, 2, 1, 1, "-0.45"]);
  assert.equal(period.matches, 3); // not 4: the 1 Nov late match has a decision on each day
  assert.ok(Math.abs(period.roi! + 0.15) < 1e-12); assert.equal(period.hitRate, 2 / 3);
  assert.equal(period.uncertainty, null);
  const three = period.byStar.find((row) => row.stars === 3)!;
  assert.deepEqual([three.recommendations, three.wins, three.net, three.matches], [2, 2, "0.55", 1]);
  assert.deepEqual(period.byMarket.map((row) => [row.market, row.recommendations, row.net]), [["Ms15a", 2, "0.40"], ["Ms2", 1, "-1.00"], ["MsX2", 1, "0.15"]]);
  assert.deepEqual(composed.recommendations.map((r) => r.decisionId.slice(0, 2)), ["B2", "B1", "A1", "A2"]);
  assert.equal(composed.learning, null); assert.equal(composed.asOf, "2026-11-02T20:00:00Z");
  assert.deepEqual(composed.cohorts.map((c) => [c.id, c.label, c.firstDecisionAt]), [[cohort, "77A · havuz yolu", "2026-11-01T20:50:00Z"]]);
});

test("a partial view holds only its loaded days, and nothing loaded is no report", () => {
  const partial = composeDays([{ day: "2026-11-01", report: nov1 }], { days: 30, through: "2026-11-03" })!;
  assert.deepEqual([partial.periods[0]!.from, partial.periods[0]!.recommendations, partial.periods[0]!.net], ["2026-10-05", 2, "-0.60"]);
  assert.equal(composeDays([], { days: 7, through: "2026-11-03" }), null);
  // A day handed over twice (shared report and its own read) counts once.
  const twice = composeDays([{ day: "2026-11-01", report: nov1 }, { day: "2026-11-01", report: nov1 }], { days: 7, through: "2026-11-03" })!;
  assert.deepEqual([twice.recommendations.length, twice.periods[0]!.recommendations, twice.periods[0]!.net], [2, 2, "-0.60"]);
});

test("today and yesterday are sliced from the shared daily report; views list their days newest first", () => {
  const daily = { ...nov2, periods: [{ ...nov2.periods[0]!, key: "today" as const }, { ...nov1.periods[0]!, key: "yesterday" as const }],
    recommendations: [...nov2.recommendations, ...nov1.recommendations] } as RebuildCohortsReport;
  const day = dailyDay(daily, "2026-11-01")!;
  assert.deepEqual(day.periods.map((p) => p.through), ["2026-11-01"]);
  assert.deepEqual(day.recommendations.map((r) => r.decisionId.slice(0, 2)), ["A1", "A2"]);
  assert.equal(dailyDay(daily, "2026-10-31"), null);
  assert.equal(dailyDay({ ...daily, availability: "UNAVAILABLE" }, "2026-11-01"), null);
  assert.deepEqual(periodDays({ days: 7, through: "2026-11-01" }), ["2026-11-01", "2026-10-31", "2026-10-30", "2026-10-29", "2026-10-28", "2026-10-27", "2026-10-26"]);
});

test("window reads run three at a time in the order asked, and an aborted wait never starts", async () => {
  const run = createRequestLimiter(3), started: number[] = [], release: (() => void)[] = [];
  let active = 0, peak = 0;
  const task = (n: number) => () => new Promise<number>((resolve) => {
    started.push(n); active++; peak = Math.max(peak, active);
    release.push(() => { active--; resolve(n); });
  });
  const aborted = new AbortController();
  const jobs = [0, 1, 2, 3, 4].map((n) => run(task(n), n === 4 ? aborted.signal : undefined));
  const fifth = jobs[4]!.then(() => "resolved", () => "rejected");
  aborted.abort();
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(started, [0, 1, 2]);
  while (release.length) { release.shift()!(); await new Promise((resolve) => setTimeout(resolve, 0)); }
  assert.deepEqual(await Promise.all(jobs.slice(0, 4)), [0, 1, 2, 3]);
  assert.equal(await fifth, "rejected");
  assert.deepEqual(started, [0, 1, 2, 3]); assert.equal(peak, 3);
});

test("the log composes 7/30 days from single days, says how many it holds and never reads a 7/30-day window", async () => {
  const log = await readFile(new URL("../components/RebuildDecisionLog.tsx", import.meta.url), "utf8");
  assert.match(log, /rebuildReportWindowQuery\(1, period\.through/);
  assert.doesNotMatch(log, /rebuildReportWindowQuery\(period\.days/);
  assert.match(log, /useReportDays\(period, today, daily\.data, multiDay\)/);
  for (const text of ["Yüklenen gün:", "gün alınamadı", "Alınamayan günleri yeniden dene", "Kısmi toplam:"]) assert.ok(log.includes(text), text);
  const details = await readFile(new URL("../components/RebuildEvidencePanel.tsx", import.meta.url), "utf8");
  assert.ok(details.includes("Çok günlü görünüm günlük raporların toplamıdır"));
});
