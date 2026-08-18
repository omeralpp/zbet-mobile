import assert from "node:assert/strict";
import test from "node:test";
import { resolveBubblePosition } from "./bubble-position";

const phone = {
  anchorSize: 58,
  bubbleWidth: 300,
  estimatedHeight: 176,
  viewportWidth: 393,
  viewportHeight: 852,
  insetTop: 48,
  insetBottom: 34,
  insetLeft: 0,
  insetRight: 0,
  edgeMargin: 10
};

/** Window coordinates of the bubble, which is what the clamp is about. */
function windowRect(options: Parameters<typeof resolveBubblePosition>[0]) {
  const { left, top } = resolveBubblePosition(options);
  return { left: left + options.anchorX, top: top + options.anchorY };
}

test("centres a guide bubble under the element it points at", () => {
  const rect = windowRect({
    ...phone,
    anchorX: 20,
    anchorY: 600,
    target: { x: 40, y: 200, width: 313, height: 120 }
  });
  assert.equal(rect.left, 40 + 313 / 2 - 300 / 2);
  assert.equal(rect.top, 200 + 120 + 12);
});

test("flips above the target when there is no room below", () => {
  const rect = windowRect({
    ...phone,
    anchorX: 20,
    anchorY: 700,
    target: { x: 40, y: 700, width: 313, height: 120 }
  });
  assert.equal(rect.top, 700 - 176 - 12);
});

test("never opens past the safe area, however the target sits", () => {
  const offLeft = windowRect({
    ...phone,
    anchorX: 20,
    anchorY: 300,
    insetLeft: 24,
    target: { x: 0, y: 200, width: 40, height: 40 }
  });
  assert.equal(offLeft.left, 24 + 10);

  const offRight = windowRect({
    ...phone,
    anchorX: 20,
    anchorY: 300,
    insetRight: 24,
    target: { x: 353, y: 200, width: 40, height: 40 }
  });
  assert.equal(offRight.left, 393 - 24 - 10 - 300);
});

test("a bubble with no target sits against Bibi herself", () => {
  const rect = windowRect({
    ...phone,
    anchorX: 30,
    anchorY: 300,
    estimatedHeight: 150,
    target: null
  });
  assert.equal(rect.left, 30);
  assert.equal(rect.top, 300 + 58 + 8);
});

test("a targetless bubble is clamped when Bibi is dragged into a corner", () => {
  // The discovery hint has no measured element to centre on, so this clamp is
  // the only thing keeping it on screen when the mascot sits at the edge.
  const rect = windowRect({
    ...phone,
    anchorX: 325,
    anchorY: 300,
    estimatedHeight: 150,
    target: null
  });
  assert.equal(rect.left, 393 - 10 - 300);

  const low = windowRect({
    ...phone,
    anchorX: 30,
    anchorY: 780,
    estimatedHeight: 150,
    target: null
  });
  assert.equal(low.top, 780 - 150 - 8);
});

test("a bubble taller than the screen still starts inside the safe area", () => {
  const rect = windowRect({
    ...phone,
    anchorX: 30,
    anchorY: 100,
    estimatedHeight: 4000,
    target: null
  });
  assert.equal(rect.top, 48 + 10);
});
