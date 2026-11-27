import assert from "node:assert/strict";
import test from "node:test";
import statistics from "@/src/api/fixtures/btb-match-statistics-v1.json";
import stale from "@/src/api/fixtures/btb-match-statistics-stale-v1.json";
import { rebuildStatisticsSchema } from "@/src/api/rebuild-statistics-schemas";
import { recordedProviderNote, statisticsMinute, statisticsRows, statisticsStatus } from "./rebuild-statistics-view";

const parsed = rebuildStatisticsSchema.parse(statistics);
if (parsed.source !== "VERIFIED_RB1_OBSERVATION") throw new Error("fixture must be a verified observation");
const live = parsed;

test("rows print null as a dash, measured zero as 0 and keep the delivered values", () => {
  const rows = Object.fromEntries(statisticsRows(live).map((row) => [row.metric, row]));
  assert.equal(rows.possession?.homeText, "%58");
  assert.equal(rows.xg?.homeText, "1,84");
  assert.equal(rows.blockedShots?.awayText, "—");
  assert.equal(rows.blockedShots?.away, null);
  assert.equal(rows.redCards?.homeText, "0");
  assert.equal(rows.goalkeeperSaves?.note, "Her takımın kendi kalecisinin kurtarışları.");
  assert.equal(statisticsRows(live).length, 10);
});

test("xG without a verified scope carries a note instead of being hidden", () => {
  const rows = statisticsRows({ ...live, xgScopeVerified: false });
  assert.equal(rows.find((row) => row.metric === "xg")?.note, "xG kapsamı doğrulanmadı.");
});

test("status names the measurement or the reason in plain words, never a code", () => {
  const partial = statisticsStatus(live);
  assert.equal(partial.tone, "partial");
  assert.match(partial.text, /67′/);
  assert.match(partial.text, /bazı ölçümler eksik/);
  const old = statisticsStatus(rebuildStatisticsSchema.parse(stale));
  assert.equal(old.values, false);
  assert.match(old.text, /iki dakikadan eski/);
  for (const reason of ["STATISTICS_STALE", "PRODUCER_UNSUPPORTED", "NOT_STARTED"]) {
    const text = statisticsStatus({ ...live, availability: reason === "NOT_STARTED" ? "NOT_STARTED" : "UNAVAILABLE", reason }).text;
    assert.doesNotMatch(text, /[A-Z_]{6,}/);
  }
});

test("a finished match says the live balance is over instead of calling it stale", () => {
  const ended = statisticsStatus(rebuildStatisticsSchema.parse(stale), true);
  assert.equal(ended.values, false);
  assert.match(ended.text, /Maç tamamlandı/);
  assert.doesNotMatch(ended.text, /iki dakikadan eski/);
});

// Owner report 2026-11-27: at a bare 90+ or at half time RB1 observes nothing;
// the opt-in recorded provider document keeps the balance visible and says so.
const { pressure: _pressure, pressurePolicy: _policy, ...base } = live;
const recorded = { ...base, source: "RB1_RECORDED_PROVIDER_DOCUMENT", availability: "PARTIAL", reason: "OPTIONAL_OR_METRIC_DATA_MISSING",
  modelReason: "STATISTICS_STALE", observedAt: "2026-11-27T18:49:57.904Z", captureId: "AA8B", pressurePolicy: null, pressure: null,
  phase: "2H", elapsed: 90, clockText: "90+", xgScopeVerified: false };

test("a recorded provider document is shown as a provider measurement, never as an RB1 observation", () => {
  const parsed = rebuildStatisticsSchema.parse(recorded);
  const status = statisticsStatus(parsed);
  assert.equal(status.values, true); assert.equal(status.tone, "partial");
  assert.match(status.text, /^Sağlayıcı ölçümü · 90\+′ · 21:49:57/);
  assert.match(recordedProviderNote(parsed) ?? "", /Uzatma dakikasında RB1 gözlem yapmadı/);
  assert.equal(statisticsMinute(rebuildStatisticsSchema.parse({ ...recorded, phase: "HT", elapsed: null, clockText: "İY" })), "Devre arası");
  assert.equal(recordedProviderNote(live), null);
  assert.equal(statisticsMinute(live), "67′");
});

test("the recorded variant fails closed: no pressure, no unverified xG scope, no stray fields", () => {
  assert.equal(rebuildStatisticsSchema.safeParse({ ...recorded, pressurePolicy: "RB1_OPT_STATS_74A_V1" }).success, false);
  assert.equal(rebuildStatisticsSchema.safeParse({ ...recorded, xgScopeVerified: true }).success, false);
  assert.equal(rebuildStatisticsSchema.safeParse({ ...recorded, availability: "UNAVAILABLE" }).success, false);
  assert.equal(rebuildStatisticsSchema.safeParse({ ...recorded, extra: 1 }).success, false);
  assert.equal(rebuildStatisticsSchema.safeParse({ ...live, clockText: "90+" }).success, false);
});
