import assert from "node:assert/strict";
import test from "node:test";
import history from "./fixtures/btb-pressure-history-v1.json";
import statistics from "./fixtures/btb-match-statistics-v1.json";
import stale from "./fixtures/btb-match-statistics-stale-v1.json";
import { rebuildPressureHistorySchema, rebuildStatisticsSchema } from "./rebuild-statistics-schemas";

test("the delivered statistics DTO keeps measured zero apart from missing values", () => {
  const parsed = rebuildStatisticsSchema.parse(statistics);
  assert.equal(parsed.statistics.homeRedCards, 0);
  assert.equal(parsed.statistics.awayBlockedShots, null);
  assert.equal(parsed.pressure?.components?.cappedExtraHome, "0.275");
  const old = rebuildStatisticsSchema.parse(stale);
  assert.equal(old.availability, "UNAVAILABLE");
  assert.equal(old.reason, "STATISTICS_STALE");
  assert.ok(Object.values(old.statistics).every((value) => value === null));
});

test("the real Bayern–Arsenal history parses with its gaps and an unexposed pool path", () => {
  const parsed = rebuildPressureHistorySchema.parse(history);
  assert.equal(parsed.samples.length, 13);
  assert.equal(parsed.fullMatchCoverageProven, false);
  assert.deepEqual(parsed.poolPath, { availability: "UNAVAILABLE", reason: "RB1_POOL_PATH_NOT_EXPOSED" });
  assert.ok(parsed.samples.some((sample) => sample.connects) && parsed.samples.some((sample) => !sample.connects));
});

test("unknown versions, extra fields and negative pressure fail closed", () => {
  for (const value of [
    { ...statistics, contractVersion: "btb-match-statistics.v2" },
    { ...statistics, legacyHomeXg: 0 },
    { ...statistics, pressure: { ...statistics.pressure, home: "-1" } }
  ]) assert.equal(rebuildStatisticsSchema.safeParse(value).success, false);
  const sample = history.samples[0]!;
  for (const value of [
    { ...history, historical: false },
    { ...history, samples: [{ ...sample, endMinute: sample.startMinute - 1 }] },
    { ...history, poolPath: { availability: "AVAILABLE", reason: "X", levels: [] } }
  ]) assert.equal(rebuildPressureHistorySchema.safeParse(value).success, false);
});
