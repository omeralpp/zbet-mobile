import assert from "node:assert/strict";
import test from "node:test";
import { createJinxMotionState, designLabAvailable, jinxMotionReducer, resolveJinxMotion } from "./jinx-motion";

const context = { matchKey: "demo-match", revision: "score-1-0" };
const goal = { type: "event", context, eventId: "goal-18", kind: "GOAL", verified: true } as const;

test("only verified events for the exact visible match and revision can react", () => {
  const initial = createJinxMotionState(context);
  for (const event of [{ ...goal, verified: false }, { ...goal, eventId: " " }, { ...goal, context: { ...context, matchKey: "other" } }, { ...goal, context: { ...context, revision: "old" } }]) {
    assert.equal(jinxMotionReducer(initial, event), initial);
  }
  assert.equal(jinxMotionReducer(initial, goal).scene, "goal");
});

test("polling and stale completion cannot replay or interrupt a newer scene", () => {
  const reacted = jinxMotionReducer(createJinxMotionState(context), goal);
  assert.equal(jinxMotionReducer(reacted, goal), reacted);
  const next = jinxMotionReducer(reacted, { type: "scene", scene: "thinking" });
  assert.equal(jinxMotionReducer(next, { type: "finish", sequence: reacted.sequence }), next);
});

test("context changes and score corrections cancel the previous reaction", () => {
  const reacted = jinxMotionReducer(createJinxMotionState(context), goal);
  const nextContext = { ...context, revision: "score-0-0" };
  const changed = jinxMotionReducer(reacted, { type: "context", context: nextContext });
  assert.equal(changed.scene, "idle");
  assert.equal(jinxMotionReducer(changed, { ...goal, context: nextContext }), changed);
  const corrected = jinxMotionReducer(reacted, { ...goal, eventId: "correction-18", kind: "SCORE_CORRECTION" });
  assert.equal(corrected.scene, "waiting");
});

test("background and user-owned motion consume events without later replay", () => {
  for (const action of [{ type: "active", active: false }, { type: "interaction", blocked: true }] as const) {
    const suspended = jinxMotionReducer(createJinxMotionState(context), action);
    const consumed = jinxMotionReducer(suspended, goal);
    assert.equal(consumed.scene, "idle");
    assert.deepEqual(consumed.seen, [goal.eventId]);
    const resumed = jinxMotionReducer(consumed, action.type === "active" ? { type: "active", active: true } : { type: "interaction", blocked: false });
    assert.equal(jinxMotionReducer(resumed, goal), resumed);
  }
});

test("WAIT is a neutral answer and expired evidence cannot be celebrated", () => {
  const initial = createJinxMotionState(context);
  const wait = jinxMotionReducer(initial, { type: "answer", context, verdict: "WAIT", current: true });
  assert.equal(wait.scene, "answer");
  assert.match(wait.message, /Bahis önerisi yok/);
  const stale = jinxMotionReducer(wait, { type: "answer", context, verdict: "FAVORABLE", current: false });
  assert.equal(stale.scene, "waiting");
  assert.equal(jinxMotionReducer(wait, { type: "answer", context: { ...context, matchKey: "other" }, verdict: "FAVORABLE", current: true }), wait);
});

test("the pilot lean chooses cheer, doubt or a neutral answer; stale leans never cheer", () => {
  const initial = createJinxMotionState(context);
  const answer = (lean: "FAVORABLE" | "NEUTRAL" | "UNFAVORABLE", current = true) =>
    jinxMotionReducer(initial, { type: "answer", context, verdict: "WAIT", current, lean });
  assert.equal(answer("FAVORABLE").scene, "cheer");
  assert.equal(answer("UNFAVORABLE").scene, "doubt");
  assert.equal(answer("NEUTRAL").scene, "answer");
  assert.equal(answer("FAVORABLE", false).scene, "waiting");
});

test("reduced motion, OFF and background win over the lively mode", () => {
  assert.equal(resolveJinxMotion("LIVE", true, true).enabled, false);
  assert.equal(resolveJinxMotion("OFF", false, true).amplitude, 0);
  assert.equal(resolveJinxMotion("LIVE", false, false).ambient, false);
  assert.equal(resolveJinxMotion("CALM", false, true).amplitude, 0.45);
  assert.ok(resolveJinxMotion("LIVE", false, true).amplitude > 1);
});

test("prototype route is limited to explicit mock preview builds", () => {
  for (const authMode of ["pilot", "edge", "oauth"]) assert.equal(designLabAvailable({ useMocks: true, authMode }), false);
  assert.equal(designLabAvailable({ useMocks: false, authMode: "preview" }), false);
  assert.equal(designLabAvailable({ useMocks: true, authMode: "preview" }), true);
});
