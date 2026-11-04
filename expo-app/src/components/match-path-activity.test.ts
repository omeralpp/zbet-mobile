import assert from "node:assert/strict";
import test from "node:test";
import history from "@/src/api/fixtures/btb-pressure-history-v1.json";
import { rebuildPressureHistorySchema } from "@/src/api/rebuild-statistics-schemas";
import { activityAt, activityHeadline, activityMoment, activitySummary, activityTeamReading, activityWindowDuration, matchActivity } from "./match-path-activity";

const native = rebuildPressureHistorySchema.parse(history);
const match = { key: native.matchKey, homeTeam: "Ev", awayTeam: "Deplasman", status: "LIVE", elapsed: 70 };
const intervals = [{ key: "a", startMinute: 61, endMinute: 62, windowStartMinute: 57, windowSeconds: 300, home: 2, away: 0.5, homeText: "2", awayText: "0,5", estimated: true, connects: false, score: "" },
  { key: "b", startMinute: 64, endMinute: 65, windowStartMinute: 60, windowSeconds: 300, home: 0.2, away: 3, homeText: "0,2", awayText: "3", estimated: true, connects: false, score: "" }];

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
  assert.match(activityMoment(intervals, 63, match).lines.join(" "), /ölçümü yok/);
  assert.equal(activityMoment(intervals, 63, match).record, null);
});

test("activity inspection does not invent a goal, a score, model pressure or a BTB decision", () => {
  const moment = activityMoment(intervals, 62, match);
  assert.equal(moment.kind, "ACTIVITY"); assert.equal(moment.score, null); assert.equal(moment.record, null);
  assert.match(moment.lines.join(" "), /57–62′/);
  assert.match(moment.lines.join(" "), /katılmaz/);
  assert.equal(activityMoment(intervals, 65, match).minute, 65);
});

test("the summary calls an old point the last measured interval, with actual duration and per-minute units", () => {
  for (const seconds of [240, 360]) {
    const point = { ...intervals[0]!, windowSeconds: seconds };
    const summary = activitySummary([point], { ...match, elapsed: 90 }, false, false);
    assert.equal(summary.eyebrow, "SON ÖLÇÜLEN ARALIK");
    assert.match(summary.headline, /57–62′/);
    assert.match(summary.note!, seconds === 240 ? /4 dk ölçüm/ : /6 dk ölçüm/);
    assert.match(summary.note!, /hareketlilik \/ dk/);
    assert.doesNotMatch(`${summary.eyebrow} ${summary.note}`, /SON 5|Son 5|5 dakikalık/);
    const moment = activityMoment([point], 62, match);
    assert.match(moment.label, seconds === 240 ? /4 dk ölçüm/ : /6 dk ölçüm/);
    assert.match(moment.lines.join(" "), /dakika başına/);
    assert.equal(moment.railSub, seconds === 240 ? "4 dk" : "6 dk");
  }
  assert.match(activitySummary(intervals, match, true, false).note!, /Yenileme başarısız · son kayıt gösteriliyor/);
  assert.equal(activityTeamReading("Ev", "0"), "Ev: dakikada 0 tahmini hareketlilik birimi.");
});

test("empty, loading, ended and failed states retain one honest missing-measurement statement", () => {
  const waiting = activitySummary([], match, false, false);
  assert.equal(waiting.last, undefined);assert.equal(waiting.note, null);
  assert.equal(waiting.headline, "Henüz doğrulanmış hareketlilik ölçümü yok.");
  assert.equal(activitySummary([], match, false, true).headline, "Hareketlilik yükleniyor…");
  const ended = activitySummary([], { ...match, status: "FINISHED" }, false, false);
  assert.equal(ended.headline, "Bu maç için doğrulanmış hareketlilik ölçümü yok.");
  assert.doesNotMatch(ended.headline, /Henüz/);assert.equal(ended.note, null);
  const failed = activitySummary([], match, true, false);
  assert.equal(failed.note, "Yenileme başarısız. Yeni ölçüm alınamadı.");
  assert.doesNotMatch(failed.note!, /kayıtlı geçmiş|son kayıt gösteriliyor/);
});

test("a display interval without source duration or baseline does not imply five measured minutes", () => {
  const { windowSeconds: _seconds, windowStartMinute: _minute, ...unknown } = intervals[0]!;
  assert.equal(activityWindowDuration(unknown), null);
  assert.equal(activityWindowDuration({ ...unknown, windowSeconds: NaN }), null);
  assert.match(activityHeadline(unknown, match), /62′ gözlemi/);
  assert.doesNotMatch(activitySummary([unknown], match, false, false).note!, /5 dk/);
});
