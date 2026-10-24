import assert from "node:assert/strict";
import test from "node:test";
import history from "@/src/api/fixtures/btb-pressure-history-v1.json";
import { rebuildPressureHistorySchema } from "@/src/api/rebuild-statistics-schemas";
import { activityAt, activityHeadline, activityMoment, matchActivity } from "./match-path-activity";

const native = rebuildPressureHistorySchema.parse(history);
const match = { key: native.matchKey, homeTeam: "Ev", awayTeam: "Deplasman", status: "LIVE", elapsed: 70 };
const intervals = [{ key: "a", startMinute: 61, endMinute: 62, windowStartMinute: 57, home: 2, away: 0.5, homeText: "2", awayText: "0,5", estimated: true, connects: false, score: "" },
  { key: "b", startMinute: 64, endMinute: 65, windowStartMinute: 60, home: 0.2, away: 3, homeText: "0,2", awayText: "3", estimated: true, connects: false, score: "" }];

test("a missing rolling series stays empty even when native model-pressure intervals exist", () => {
  assert.ok(native.samples.length > 0);
  assert.deepEqual(matchActivity(native, match), []);
  assert.deepEqual(matchActivity(undefined, match), []);
});

test("only this fixture's delivered activity is drawn, and a live clock cannot reveal future bars", () => {
  const baseline = { ...native.observations[0]!, captureId: "baseline", minute: 57, phase: "2H" as const, observedAt: "2026-10-24T12:00:00.000Z", observedAtExact: "20261024120000" };
  const endpoint = { ...baseline, captureId: "endpoint", minute: 62, observedAt: "2026-10-24T12:05:00.000Z", observedAtExact: "20261024120500" };
  const packet = rebuildPressureHistorySchema.parse({ ...native, availability: "PARTIAL", samples: [], observations: [baseline, endpoint],
    activity: { contractVersion: "btb-pressure-activity.v1", method: "OBSERVED_ROLLING_5M_BASE_V1", windowMinutes: 5,
      units: "WEIGHTED_ACTIVITY_PER_MINUTE", displayOnly: true, affectsSelection: false, estimated: true, availability: "AVAILABLE", reason: "AVAILABLE",
      points: [{ captureId: "endpoint", baselineCaptureId: "baseline", minute: 62, phase: "2H", observedAt: endpoint.observedAt,
        startsAt: baseline.observedAt, endsAt: endpoint.observedAt, home: 2, away: 0.5, reason: "AVAILABLE", connects: false }] } });
  assert.deepEqual(matchActivity(packet, match).map(point => [point.home, point.away, point.windowStartMinute]), [[2, 0.5, 57]]);
  assert.deepEqual(matchActivity(packet, { ...match, elapsed: 61 }), []);
  assert.deepEqual(matchActivity(packet, { ...match, key: "another-fixture" }), []);
  assert.deepEqual(matchActivity(packet, { ...match, status: "NOT_STARTED" }), []);
});

test("scrubbing selects that minute only; a gap never borrows an earlier or future measurement", () => {
  assert.equal(activityAt(intervals, 62)?.home, 2);
  assert.equal(activityAt(intervals, 63), null);
  assert.equal(activityAt(intervals, 64), null);
  assert.equal(activityAt(intervals, 65)?.away, 3);
  assert.equal(activityAt(intervals, 0), null);
  assert.match(activityHeadline(activityAt(intervals, 65), match), /60–65′ · Deplasman daha hareketli/);
  assert.match(activityMoment(intervals, 63, match).lines.join(" "), /pencere yok/);
  assert.equal(activityMoment(intervals, 63, match).record, null);
});

test("activity inspection does not invent a goal, a score, model pressure or a BTB decision", () => {
  const moment = activityMoment(intervals, 62, match);
  assert.equal(moment.kind, "ACTIVITY"); assert.equal(moment.score, null); assert.equal(moment.record, null);
  assert.match(moment.lines.join(" "), /57–62′/);
  assert.match(moment.lines.join(" "), /katılmaz/);
  assert.equal(activityMoment(intervals, 65, match).minute, 65);
});
