import assert from "node:assert/strict";
import test from "node:test";
import { couponCells, couponWidth, totoLiveLabel, totoLiveState } from "./toto-coupon";

test("a single, double and triple row mark main, covered and actual cells", () => {
  assert.deepEqual(couponCells({ mainPick: "1", coverage: "1", actualResult: null }), [
    { outcome: "1", main: true, covered: true, actual: false, provisional: false },
    { outcome: "X", main: false, covered: false, actual: false, provisional: false },
    { outcome: "2", main: false, covered: false, actual: false, provisional: false }
  ]);
  const double = couponCells({ mainPick: "2", coverage: "21", actualResult: "1" });
  assert.deepEqual(double.map((c) => [c.outcome, c.main, c.covered, c.actual]), [
    ["1", false, true, true],
    ["X", false, false, false],
    ["2", true, true, false]
  ]);
  assert.equal(couponWidth({ mainPick: "1", coverage: "12X", actualResult: null }), 3);
});

test("inputs are normalized and a missing main pick is still on the coupon", () => {
  assert.deepEqual(
    couponCells({ mainPick: " x ", coverage: "", actualResult: "x" }).map((c) => [c.covered, c.actual]),
    [
      [false, false],
      [true, true],
      [false, false]
    ]
  );
  assert.equal(couponWidth({ mainPick: "", coverage: "", actualResult: null }), 0);
});

const live = (o: Partial<Parameters<typeof totoLiveLabel>[0]["live"] & object> = {}) =>
  ({ status: "LIVE", minute: 63, homeScore: 1, awayScore: 2, provisionalResult: null, ...o });

test("btb-toto-live.v1 labels: live, half time, finished, extra time and suspended", () => {
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live() }), { text: "Canlı 63' · 1-2", inPlay: true });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ minute: null }) }), { text: "Canlı · 1-2", inPlay: true });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ status: "HALF_TIME", minute: null }) }), { text: "Devre arası · 1-2", inPlay: true });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ status: "FINISHED", provisionalResult: "2" }) }), { text: "Bitti 1-2 · geçici 2", inPlay: false });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ status: "EXTRA_TIME", homeScore: 1, awayScore: 1, provisionalResult: "X" }) }),
    { text: "Normal süre 1-1 · geçici X", inPlay: false });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ status: "EXTRA_TIME" }) }), { text: "Uzatmalar · 1-2", inPlay: true });
  assert.deepEqual(totoLiveLabel({ actualResult: null, live: live({ status: "SUSPENDED" }) }), { text: "Durduruldu · 1-2", inPlay: false });
});

test("no live label without data, before kickoff, or once the official result is in", () => {
  assert.equal(totoLiveLabel({ actualResult: null }), null);
  assert.equal(totoLiveLabel({ actualResult: null, live: null }), null);
  assert.equal(totoLiveLabel({ actualResult: null, live: live({ status: "NOT_STARTED", homeScore: null, awayScore: null }) }), null);
  assert.equal(totoLiveLabel({ actualResult: "1", live: live({ status: "FINISHED", provisionalResult: "1" }) }), null);
});

test("the provisional cell yields to the official result", () => {
  const provisional = couponCells({ mainPick: "1", coverage: "1X", actualResult: null, live: { provisionalResult: "X" } });
  assert.deepEqual(provisional.map((c) => [c.outcome, c.actual, c.provisional]), [["1", false, false], ["X", false, true], ["2", false, false]]);
  const official = couponCells({ mainPick: "1", coverage: "1X", actualResult: "2", live: { provisionalResult: "X" } });
  assert.ok(official.every((c) => !c.provisional));
});

test("live state: finished with a provisional result, in play, or nothing; an official result wins", () => {
  const live = (status: string, provisionalResult: string | null) => ({ status, minute: null, homeScore: 2, awayScore: 1, provisionalResult });
  assert.equal(totoLiveState({ actualResult: null, live: live("FINISHED", "1") }), "PROVISIONAL");
  assert.equal(totoLiveState({ actualResult: null, live: live("EXTRA_TIME", "X") }), "PROVISIONAL");
  assert.equal(totoLiveState({ actualResult: null, live: live("EXTRA_TIME", null) }), "IN_PLAY");
  assert.equal(totoLiveState({ actualResult: null, live: live("HALF_TIME", null) }), "IN_PLAY");
  assert.equal(totoLiveState({ actualResult: null, live: live("FINISHED", null) }), null, "unproven final");
  assert.equal(totoLiveState({ actualResult: null, live: live("NOT_STARTED", null) }), null);
  assert.equal(totoLiveState({ actualResult: "1", live: live("FINISHED", "1") }), null);
  assert.equal(totoLiveState({ actualResult: null }), null);
});
