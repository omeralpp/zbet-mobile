import assert from "node:assert/strict";
import test from "node:test";
import { paletteScrollOffset } from "./palette-visibility";

test("keyboard selection after the eighth row reveals its complete label", () => {
  assert.equal(paletteScrollOffset({ scrollTop: 0, viewportHeight: 420, itemTop: 416, itemHeight: 52 }), 48);
  assert.equal(paletteScrollOffset({ scrollTop: 48, viewportHeight: 420, itemTop: 520, itemHeight: 52 }), 152);
});

test("moving back to the first result resets scroll, while visible rows do not jump", () => {
  assert.equal(paletteScrollOffset({ scrollTop: 152, viewportHeight: 420, itemTop: 0, itemHeight: 52 }), 0);
  assert.equal(paletteScrollOffset({ scrollTop: 152, viewportHeight: 420, itemTop: 208, itemHeight: 52 }), 152);
});

test("a resized results viewport reveals the selected row without animated travel", () => {
  assert.equal(paletteScrollOffset({ scrollTop: 152, viewportHeight: 100, itemTop: 208, itemHeight: 52 }), 160);
  assert.equal(paletteScrollOffset({ scrollTop: 0, viewportHeight: 40, itemTop: 208, itemHeight: 52 }), 208);
});
