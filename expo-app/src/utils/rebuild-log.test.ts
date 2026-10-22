import assert from "node:assert/strict";
import test from "node:test";
import { rebuildCohortsReportSchema, type RebuildCohortsReport, type RebuildRecommendation } from "@/src/api/rebuild-schemas";
import {
  addDecimals,
  combinedReport,
  defaultLogSort,
  evidenceLine,
  filterLog,
  logSummary,
  nextLogSort,
  periodRecords,
  sortLog,
  teamInitials,
  type RebuildPeriod
} from "./rebuild-log";

function record(overrides: Partial<RebuildRecommendation> & { id: string }): RebuildRecommendation {
  const { id, ...rest } = overrides;
  return {
    market: "MS1",
    admitted: true,
    selected: true,
    reason: "SELECTED",
    quote: "1.50",
    quoteAt: "2026-10-21T10:00:00Z",
    consistencyScore: "80",
    stars: 3,
    poolWins: 30,
    poolTotal: 40,
    votesSupport: 2,
    votesUsed: 2,
    directionConflict: false,
    dissent: false,
    votes: [],
    caps: { sample: 5, direction: 5, timing: 5, xg: 5, time_goals: 5 },
    decisionId: id.padEnd(32, "0"),
    previousDecisionId: null,
    episodeId: id.padEnd(32, "1"),
    matchKey: "M1",
    homeTeam: "Inter Turku",
    awayTeam: "Gnistan",
    publishedAt: "2026-10-21T10:00:00Z",
    minute: 61,
    homeScore: 1,
    awayScore: 0,
    leaders: [],
    countUnit: "ONE_HYPOTHETICAL_UNIT",
    physicalUniqueness: "UNVERIFIED",
    result: { state: "PENDING", revision: 1, net: null },
    ...rest
  };
}

const aggregate = {
  matches: 1,
  settled: 0,
  risk: 0,
  totalRisk: 0,
  roi: null,
  hitRate: null,
  evidenceNote: "PILOT_MATCH_CLUSTERED" as const,
  uncertainty: null,
  byMatch: []
};

const period: RebuildPeriod = {
  ...aggregate,
  days: 7,
  from: "2026-10-15",
  through: "2026-10-21",
  recommendations: 4,
  wins: 1,
  losses: 2,
  voids: 0,
  pending: 1,
  unresolved: 0,
  net: "-1.14",
  byStar: [
    { ...aggregate, stars: 2, recommendations: 1, wins: 0, losses: 1, voids: 0, pending: 0, unresolved: 0, net: "-1" },
    { ...aggregate, stars: 3, recommendations: 2, wins: 1, losses: 1, voids: 0, pending: 0, unresolved: 0, net: "-0.14" },
    { ...aggregate, stars: 4, recommendations: 1, wins: 0, losses: 0, voids: 0, pending: 1, unresolved: 0, net: "0" }
  ],
  byMarket: []
};

test("a star scope adds the report's own per-star rows exactly", () => {
  assert.deepEqual(logSummary(period, 3), {
    recommendations: 3,
    wins: 1,
    losses: 1,
    pending: 1,
    unresolved: 0,
    voids: 0,
    net: "-0.14"
  });
});

test("no scope (or one star) is the period total as delivered", () => {
  assert.equal(logSummary(period, null).net, "-1.14");
  assert.equal(logSummary(period, 1).recommendations, 4);
});

test("decimal strings add without floating point drift", () => {
  assert.equal(addDecimals(["0.1", "0.2"]), "0.3");
  assert.equal(addDecimals(["-1", "0.86", "1.14"]), "1.00");
  assert.equal(addDecimals(["-0.5", "0.25"]), "-0.25");
  assert.equal(addDecimals(["2", "3"]), "5");
});

test("a period lists only records inside its Istanbul day bounds, newest first", () => {
  const recommendations = [
    record({ id: "A", publishedAt: "2026-10-14T20:59:00Z" }),
    record({ id: "B", publishedAt: "2026-10-14T21:00:00Z" }),
    record({ id: "C", publishedAt: "2026-10-21T20:59:00Z" }),
    record({ id: "D", publishedAt: "2026-10-21T21:00:00Z" })
  ];
  assert.deepEqual(periodRecords({ recommendations }, period).map((r) => r.decisionId[0]), ["C", "B"]);
});

test("filters by star floor and pending result", () => {
  const records = [
    record({ id: "A", stars: 2 }),
    record({ id: "B", stars: 4, result: { state: "WIN", revision: 1, net: "0.5" } }),
    record({ id: "C", stars: 5 })
  ];
  assert.deepEqual(filterLog(records, { minStars: 3, pendingOnly: false }).map((r) => r.decisionId[0]), ["B", "C"]);
  assert.deepEqual(filterLog(records, { minStars: null, pendingOnly: true }).map((r) => r.decisionId[0]), ["A", "C"]);
});

test("sorting keeps records without a net last and breaks ties by recency", () => {
  const records = [
    record({ id: "A", publishedAt: "2026-10-20T10:00:00Z", result: { state: "LOSS", revision: 1, net: "-1" } }),
    record({ id: "B", publishedAt: "2026-10-21T10:00:00Z" }),
    record({ id: "C", publishedAt: "2026-10-19T10:00:00Z", result: { state: "WIN", revision: 1, net: "0.86" } })
  ];
  assert.deepEqual(sortLog(records, defaultLogSort).map((r) => r.decisionId[0]), ["B", "A", "C"]);
  assert.deepEqual(sortLog(records, { column: "net", direction: "desc" }).map((r) => r.decisionId[0]), ["C", "A", "B"]);
  assert.deepEqual(sortLog(records, { column: "net", direction: "asc" }).map((r) => r.decisionId[0]), ["A", "C", "B"]);
});

test("a header flips its own direction and a new header starts high to low", () => {
  assert.deepEqual(nextLogSort(defaultLogSort, "publishedAt"), { column: "publishedAt", direction: "asc" });
  assert.deepEqual(nextLogSort(defaultLogSort, "stars"), { column: "stars", direction: "desc" });
});

test("evidence reads as delivered counts", () => {
  assert.equal(evidenceLine({ votesSupport: 2, votesUsed: 2, poolWins: 36, poolTotal: 40 }), "2/2 baskı teyidi · 36/40 havuz");
});

test("initials take two words, or two letters of one word", () => {
  assert.equal(teamInitials("Inter Turku"), "IT");
  assert.equal(teamInitials("Gnistan"), "GN");
  assert.equal(teamInitials("Fatih Karagümrük Spor Kulübü"), "FK");
  assert.equal(teamInitials("VPS"), "VP");
  assert.equal(teamInitials("İstanbulspor"), "İS");
});

const NEW = "A".repeat(64);
const OLD = "B".repeat(64);
function cohortsReport(): RebuildCohortsReport {
  const emptyPeriod = { ...period, recommendations: 1, wins: 0, losses: 0, pending: 1, byStar: [], byMarket: [] };
  return rebuildCohortsReportSchema.parse({
    contractVersion: "btb-rebuild-report.v2", modelRegime: "BTB_RB1_20261018", asOf: "2026-10-21T20:00:00Z", timeZone: "Europe/Istanbul",
    availability: "AVAILABLE", reason: "", accounting: "ONE_HYPOTHETICAL_UNIT_AT_FIRST_QUOTE", actualBetsAssumed: false,
    periods: [period], learning: null,
    cohorts: [
      { id: NEW, label: "77A · havuz yolu", current: true, firstDecisionAt: "2026-10-21T19:00:00Z", periods: [emptyPeriod], learning: null },
      { id: OLD, label: "178 · kırmızı kart", current: false, firstDecisionAt: "2026-10-21T10:00:00Z", periods: [period], learning: null }
    ],
    recommendations: [
      { ...record({ id: "A1", publishedAt: "2026-10-21T19:00:00Z" }), cohortId: NEW },
      { ...record({ id: "B1", publishedAt: "2026-10-21T10:00:00Z" }), cohortId: OLD },
      { ...record({ id: "B2", publishedAt: "2026-10-21T11:00:00Z" }), cohortId: OLD }
    ]
  });
}

test("the combined report lists every cohort's records with the backend's all-cohort periods", () => {
  const full = cohortsReport();
  const combined = combinedReport(full);
  assert.equal(combined.contractVersion, "btb-rebuild-report.v1");
  assert.equal(combined.recommendations.length, 3);
  assert.equal("cohortId" in (combined.recommendations[0] ?? {}), false);
  assert.equal(combined.periods[0]?.recommendations, period.recommendations);
  assert.deepEqual(periodRecords(combined, period).map((r) => r.decisionId.slice(0, 2)), ["A1", "B2", "B1"]);
});

test("the v2 contract rejects a record outside its reported cohorts or two current cohorts", () => {
  const full = cohortsReport();
  assert.throws(() => rebuildCohortsReportSchema.parse({ ...full, recommendations: [{ ...full.recommendations[0], cohortId: "C".repeat(64) }] }));
  assert.throws(() => rebuildCohortsReportSchema.parse({ ...full, cohorts: full.cohorts.map((c) => ({ ...c, current: true })) }));
});
