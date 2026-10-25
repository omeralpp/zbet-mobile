import assert from "node:assert/strict";
import test from "node:test";
import type { PathMoment } from "./match-path-model";
import { journeyNavigation } from "./match-path-navigation";

const moments = [
  { key: "goal", minute: 47, kind: "GOAL" },
  { key: "decision-a", minute: 52, kind: "BTB" },
  { key: "decision-b", minute: 52, kind: "BTB" },
  { key: "final-goal", minute: 88, kind: "GOAL" }
] as PathMoment[];

test("event navigation reaches same-minute decisions individually and stops at the ends", () => {
  const first = journeyNavigation(moments, "goal", 47);
  assert.equal(first.previous, undefined);
  assert.equal(first.next?.key, "decision-a");
  assert.equal(journeyNavigation(moments, "decision-a", 52).next?.key, "decision-b");
  assert.equal(journeyNavigation(moments, "decision-b", 52).previous?.key, "decision-a");
  assert.equal(journeyNavigation(moments, "final-goal", 88).next, undefined);
});

test("sampled minutes offer nearby retained events without skipping exact-minute events", () => {
  const between = journeyNavigation(moments, "activity:58", 58);
  assert.equal(between.index, -1);
  assert.equal(between.previous?.key, "decision-b");
  assert.equal(between.next?.key, "final-goal");
  const sameMinute = journeyNavigation(moments, "activity:52", 52);
  assert.equal(sameMinute.previous?.key, "decision-b");
  assert.equal(sameMinute.next?.key, "decision-a");
  assert.equal(journeyNavigation([], null, undefined).next, undefined);
});
