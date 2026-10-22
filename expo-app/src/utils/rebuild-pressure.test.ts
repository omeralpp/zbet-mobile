import assert from "node:assert/strict";
import test from "node:test";
import history from "@/src/api/fixtures/btb-pressure-history-v1.json";
import statistics from "@/src/api/fixtures/btb-match-statistics-v1.json";
import { rebuildPressureHistorySchema, rebuildStatisticsSchema, type RebuildObservation } from "@/src/api/rebuild-statistics-schemas";
import { currentPressureView, latestIntervalReading, observedChanges, observedHalfTimeScore, pressureIntervals, pressureRuns } from "./rebuild-pressure";

const real = rebuildPressureHistorySchema.parse(history);
const teams = { homeTeam: "Bayern Münih", awayTeam: "Arsenal" };

test("every verified interval keeps its own span and only backend-joined runs connect", () => {
  const intervals = pressureIntervals(real);
  assert.equal(intervals.length, 13);
  assert.deepEqual([intervals[0]?.startMinute, intervals[0]?.endMinute], [21, 22]);
  assert.equal(intervals[0]?.awayText, "1");
  const runs = pressureRuns(intervals);
  assert.equal(runs.flat().length, 13);
  assert.equal(runs.length, real.samples.filter((sample) => !sample.connects).length);
  assert.deepEqual(pressureIntervals({ ...real, availability: "UNAVAILABLE" }), []);
});

test("the latest interval reads as who pressed, with the delivered values", () => {
  const reading = latestIntervalReading(pressureIntervals(real), teams);
  assert.equal(reading?.range, "73–75′");
  assert.equal(reading?.headline, "Arsenal baskın");
  assert.equal(reading?.homeText, "0");
});

test("observations give the real score story and half-time state", () => {
  const goals = observedChanges(real.observations).filter((change) => change.kind === "GOAL");
  assert.deepEqual(goals.map((goal) => [goal.minute, goal.side, goal.score]),
    [[25, "AWAY", "0–1"], [35, "HOME", "1–1"], [61, "HOME", "2–1"], [82, "AWAY", "2–2"]]);
  assert.equal(observedHalfTimeScore(real.observations), "1–1");
});

test("a lower score is a correction and a red card is its own change", () => {
  const base = real.observations[0]!;
  const at = (minute: number, patch: Partial<RebuildObservation>): RebuildObservation =>
    ({ ...base, captureId: `C${minute}`, minute, ...patch });
  const changes = observedChanges([at(10, {}), at(20, { homeScore: 1 }), at(22, { homeScore: 0 }), at(30, { awayRedCards: 1 })]);
  assert.deepEqual(changes.map((change) => [change.kind, change.side]), [["GOAL", "HOME"], ["CORRECTION", "HOME"], ["RED_CARD", "AWAY"]]);
});

test("the current 74A interval shows base and capped extra exactly as delivered", () => {
  const view = currentPressureView(rebuildStatisticsSchema.parse(statistics).pressure);
  assert.equal(view?.homeText, "1,08");
  assert.equal(view?.extended?.baseHome, "0,8");
  assert.equal(view?.extended?.extraHome, "0,28");
  assert.deepEqual(view?.extended?.optional.map((item) => item.used), [true, false, true]);
  assert.match(view?.range ?? "", /^\d\d:\d\d–\d\d:\d\d$/);
  assert.equal(currentPressureView(null), null);
});
