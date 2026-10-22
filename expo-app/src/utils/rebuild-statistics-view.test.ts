import assert from "node:assert/strict";
import test from "node:test";
import statistics from "@/src/api/fixtures/btb-match-statistics-v1.json";
import stale from "@/src/api/fixtures/btb-match-statistics-stale-v1.json";
import { rebuildStatisticsSchema } from "@/src/api/rebuild-statistics-schemas";
import { statisticsRows, statisticsStatus } from "./rebuild-statistics-view";

const live = rebuildStatisticsSchema.parse(statistics);

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
