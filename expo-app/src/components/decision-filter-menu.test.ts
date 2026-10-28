import assert from "node:assert/strict";
import test from "node:test";
import { decisionFilterMenuLayout } from "./decision-filter-menu";

const noInsets = { top: 0, right: 0, bottom: 0, left: 0 };

test("long sort menu flips above its trigger and scrolls within a short window", () => {
  const layout = decisionFilterMenuLayout({ anchor: { x: 290, y: 230, width: 84, height: 44 },
    window: { width: 390, height: 320 }, insets: noInsets, contentHeight: 387 });
  assert.deepEqual(layout, { left: 94, top: 16, width: 280, height: 210 });
  assert.ok(layout.top + layout.height <= 304);
});

test("a normal phone window leaves room below and right-aligns the menu", () => {
  assert.deepEqual(decisionFilterMenuLayout({ anchor: { x: 190, y: 180, width: 84, height: 44 },
    window: { width: 390, height: 844 }, insets: noInsets, contentHeight: 387 }),
  { left: 16, top: 228, width: 280, height: 387 });
});

test("notches and gesture areas remain outside the scroll viewport after resize", () => {
  for (const window of [{ width: 320, height: 390 }, { width: 844, height: 390 }]) {
    const layout = decisionFilterMenuLayout({ anchor: { x: 900, y: 360, width: 84, height: 44 },
      window, insets: { top: 24, right: 44, bottom: 34, left: 44 }, contentHeight: 680 });
    assert.ok(layout.left >= 60);
    assert.ok(layout.left + layout.width <= window.width - 60);
    assert.ok(layout.top >= 40);
    assert.ok(layout.top + layout.height <= window.height - 50);
  }
});

test("an extreme short window uses all safe space instead of an unusable anchor gap", () => {
  assert.deepEqual(decisionFilterMenuLayout({ anchor: { x: 40, y: 40, width: 80, height: 44 },
    window: { width: 320, height: 110 }, insets: noInsets, contentHeight: 387 }),
  { left: 16, top: 16, width: 280, height: 78 });
});
