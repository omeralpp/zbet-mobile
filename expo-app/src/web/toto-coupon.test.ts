import assert from "node:assert/strict";
import test from "node:test";
import { couponCells, couponWidth } from "./toto-coupon";

test("a single, double and triple row mark main, covered and actual cells", () => {
  assert.deepEqual(couponCells({ mainPick: "1", coverage: "1", actualResult: null }), [
    { outcome: "1", main: true, covered: true, actual: false },
    { outcome: "X", main: false, covered: false, actual: false },
    { outcome: "2", main: false, covered: false, actual: false }
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
