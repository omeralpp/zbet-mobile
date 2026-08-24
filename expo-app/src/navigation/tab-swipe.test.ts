import assert from "node:assert/strict";
import test from "node:test";
import {
  edgeSwipe,
  shouldActivateEdgeSwipe,
  shouldCommitEdgeSwipe
} from "./tab-swipe";

test("activates edge-back only from the leading edge and for rightward motion", () => {
  assert.equal(shouldActivateEdgeSwipe(edgeSwipe.startWidth, 20, 2), true);
  assert.equal(
    shouldActivateEdgeSwipe(edgeSwipe.startWidth + 1, 20, 2),
    false
  );
  assert.equal(shouldActivateEdgeSwipe(10, -20, 2), false);
  assert.equal(shouldActivateEdgeSwipe(10, 20, 20), false);
});

test("commits edge-back by distance or matching fling velocity", () => {
  assert.equal(shouldCommitEdgeSwipe(edgeSwipe.commitDx + 1, 0), true);
  assert.equal(shouldCommitEdgeSwipe(20, edgeSwipe.commitVx + 0.01), true);
  assert.equal(shouldCommitEdgeSwipe(20, -1), false);
});
