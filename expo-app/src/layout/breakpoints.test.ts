import assert from "node:assert/strict";
import test from "node:test";
import {
  cardColumns,
  isAtLeast,
  moduleColumns,
  resolveBreakpoint,
  wideContentMaxWidth
} from "./breakpoints";

test("phones and narrow windows keep the compact mobile layout", () => {
  assert.equal(resolveBreakpoint(360), "compact");
  assert.equal(resolveBreakpoint(767), "compact");
  assert.equal(resolveBreakpoint(Number.NaN), "compact");
});

test("desktop widths resolve at their documented edges", () => {
  assert.equal(resolveBreakpoint(768), "medium");
  assert.equal(resolveBreakpoint(1199), "medium");
  assert.equal(resolveBreakpoint(1200), "wide");
  assert.equal(resolveBreakpoint(1599), "wide");
  assert.equal(resolveBreakpoint(1600), "ultra");
  assert.equal(resolveBreakpoint(2560), "ultra");
});

test("ordering and column counts follow the width classes", () => {
  assert.equal(isAtLeast("wide", "medium"), true);
  assert.equal(isAtLeast("medium", "wide"), false);
  assert.equal(isAtLeast("compact", "compact"), true);
  assert.deepEqual(
    (["compact", "medium", "wide", "ultra"] as const).map(moduleColumns),
    [1, 1, 2, 3]
  );
  assert.deepEqual(
    (["compact", "medium", "wide", "ultra"] as const).map(wideContentMaxWidth),
    [720, 960, 1280, 1560]
  );
  assert.deepEqual(
    (["compact", "medium", "wide", "ultra"] as const).map(cardColumns),
    [1, 2, 2, 3]
  );
});
