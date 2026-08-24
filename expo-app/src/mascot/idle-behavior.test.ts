import assert from "node:assert/strict";
import test from "node:test";
import {
  bibiIdleBehaviors,
  bibiIdleDurations,
  bibiIdleRest,
  jinxSleepDelayMs,
  nextIdleDelayMs,
  pickIdleBehavior,
  resolveMascotMotionState
} from "./idle-behavior";

test("rests within the quiet window for every random draw", () => {
  for (const random of [0, 0.25, 0.5, 0.75, 0.999999, 1, -1, Number.NaN]) {
    const delay = nextIdleDelayMs(random);
    assert.ok(delay >= bibiIdleRest.minDelayMs, `${random} -> ${delay}`);
    assert.ok(delay <= bibiIdleRest.maxDelayMs, `${random} -> ${delay}`);
  }
  assert.equal(nextIdleDelayMs(0), bibiIdleRest.minDelayMs);
  assert.ok(nextIdleDelayMs(0.9) > nextIdleDelayMs(0.1));
});

test("keeps every idle behaviour short so Bibi stays non-intrusive", () => {
  for (const behavior of bibiIdleBehaviors) {
    const duration = bibiIdleDurations[behavior];
    assert.ok(duration > 0, behavior);
    assert.ok(duration <= 1000, `${behavior} -> ${duration}`);
    assert.ok(duration < bibiIdleRest.minDelayMs, behavior);
  }
});

test("never repeats the previous behaviour", () => {
  for (const previous of bibiIdleBehaviors) {
    for (const random of [0, 0.2, 0.4, 0.6, 0.8, 0.999999]) {
      assert.notEqual(pickIdleBehavior(random, previous), previous);
    }
  }
});

test("can reach every behaviour from a cold start", () => {
  const reached = new Set(
    [0, 0.2, 0.4, 0.6, 0.8, 0.999999].map((random) =>
      pickIdleBehavior(random, null)
    )
  );
  assert.deepEqual([...reached].sort(), [...bibiIdleBehaviors].sort());
});

test("stays deterministic and in-vocabulary for degenerate randomness", () => {
  assert.equal(pickIdleBehavior(0, null), pickIdleBehavior(0, null));
  assert.ok(bibiIdleBehaviors.includes(pickIdleBehavior(Number.NaN, null)));
  assert.ok(bibiIdleBehaviors.includes(pickIdleBehavior(5, "bob")));
  assert.ok(bibiIdleBehaviors.includes(pickIdleBehavior(-5, "bob")));
});

test("motion state gives interaction and accessibility one deterministic owner", () => {
  const ambient = {
    active: true,
    ambient: true,
    reduceMotion: false,
    dragging: false,
    menuOpen: false,
    guideActive: false,
    sleeping: false,
    reactionActive: false
  };

  assert.equal(resolveMascotMotionState(ambient), "AMBIENT");
  assert.equal(
    resolveMascotMotionState({ ...ambient, menuOpen: true }),
    "MENU"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, guideActive: true, menuOpen: true }),
    "GUIDING"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, reactionActive: true }),
    "REACTING"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, sleeping: true }),
    "SLEEPING"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, sleeping: true, reduceMotion: true }),
    "SLEEPING"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, dragging: true, guideActive: true }),
    "DRAGGING"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, reduceMotion: true }),
    "SUSPENDED"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, active: false }),
    "SUSPENDED"
  );
  assert.equal(
    resolveMascotMotionState({ ...ambient, ambient: false }),
    "SUSPENDED"
  );
  assert.equal(jinxSleepDelayMs, 30_000);
});
