import assert from "node:assert/strict";
import test from "node:test";
import {
  mainTabTransitionSpec,
  mainTabTranslationRange
} from "./screen-transitions";

test("moves adjacent tab scenes across the full viewport", () => {
  assert.deepEqual(mainTabTranslationRange(360), [-360, 0, 360]);
});

test("keeps invalid dimensions safe and uses the shared screen duration", () => {
  assert.deepEqual(mainTabTranslationRange(Number.NaN), [-1, 0, 1]);
  assert.equal(mainTabTransitionSpec.config.duration, 280);
});
