import assert from "node:assert/strict";
import test from "node:test";
import {
  shouldActivateTabSwipe,
  shouldCommitTabSwipe,
  tabSwipe,
  tabSwipeTranslation
} from "./tab-swipe";

test("activates only for a clearly horizontal gesture", () => {
  assert.equal(shouldActivateTabSwipe(40, 4), true);
  assert.equal(shouldActivateTabSwipe(-40, 4), true);
  assert.equal(shouldActivateTabSwipe(6, 0), false);
  assert.equal(shouldActivateTabSwipe(30, 40), false);
  assert.equal(shouldActivateTabSwipe(30, 20), false);
});

test("follows the finger from the first pixel and stays bounded", () => {
  const width = 400;
  assert.equal(tabSwipeTranslation(0, width, true), 0);
  assert.ok(tabSwipeTranslation(10, width, true) > 8);
  assert.ok(tabSwipeTranslation(10, width, true) < 10);
  assert.ok(
    tabSwipeTranslation(4000, width, true) <= width * tabSwipe.peekRatio
  );
  assert.equal(tabSwipeTranslation(-60, width, true) < 0, true);
  assert.equal(
    tabSwipeTranslation(-60, width, true),
    -tabSwipeTranslation(60, width, true)
  );
});

test("resists instead of peeking when the tab has no neighbour", () => {
  const width = 400;
  const resisted = tabSwipeTranslation(500, width, false);
  assert.ok(resisted > 0);
  assert.ok(resisted <= width * tabSwipe.resistanceRatio);
  assert.ok(resisted < tabSwipeTranslation(500, width, true));
});

test("stays inert for a degenerate viewport", () => {
  assert.equal(tabSwipeTranslation(80, 0, true), 0);
  assert.equal(tabSwipeTranslation(Number.NaN, 400, true), 0);
});

test("commits on a long drag or a consistent fling", () => {
  assert.equal(shouldCommitTabSwipe(-80, -0.1, true), true);
  assert.equal(shouldCommitTabSwipe(-30, -0.9, true), true);
  assert.equal(shouldCommitTabSwipe(80, 0.1, true), true);
  assert.equal(shouldCommitTabSwipe(-30, -0.1, true), false);
});

test("never commits against the drag direction or without a target", () => {
  assert.equal(shouldCommitTabSwipe(-80, 1.2, true), false);
  assert.equal(shouldCommitTabSwipe(80, -1.2, true), false);
  assert.equal(shouldCommitTabSwipe(-200, -2, false), false);
});
