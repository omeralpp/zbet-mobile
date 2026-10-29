import assert from "node:assert/strict";
import test from "node:test";
import {
  createLaunchCompletion,
  launchBrandCapMs,
  launchBrandHoldMs,
  launchIntroDuration,
  launchIntroDurationMs,
  launchIntroWindowMs,
  launchStaticHoldMs
} from "./launch-policy";

const pending = { layoutReady: true, preference: { ready: true, reduceMotion: false }, alreadyStarted: false, elapsedMs: 0 };

test("a short normal intro uses only the initial brand window", () => {
  assert.equal(launchIntroDuration(pending), launchIntroDurationMs);
  assert.equal(launchIntroDuration({ ...pending, elapsedMs: launchIntroWindowMs - 100 }), 100);
  assert.equal(launchIntroDuration({ ...pending, elapsedMs: launchIntroWindowMs }), 0);
  assert.equal(launchIntroDuration({ ...pending, elapsedMs: 5_000 }), 0);
});

test("unknown/reduced preference, no layout and a repeated intro never permit decorative motion", () => {
  assert.equal(launchIntroDuration({ ...pending, preference: { ready: false, reduceMotion: false } }), 0);
  assert.equal(launchIntroDuration({ ...pending, preference: { ready: true, reduceMotion: true } }), 0);
  assert.equal(launchIntroDuration({ ...pending, layoutReady: false }), 0);
  assert.equal(launchIntroDuration({ ...pending, alreadyStarted: true }), 0);
});

test("instant readiness still plays the brief landing (Android pilot cold start)", () => {
  // Pilot auth resolves on the first render and Android fonts are bundled, so
  // readiness is immediate; the brand must not vanish after one frame.
  assert.equal(launchIntroDuration({ ...pending, elapsedMs: 20 }), launchIntroDurationMs);
});

test("the brand hold is brief, bounded and never longer than the old 1.57 s floor", () => {
  assert.equal(launchBrandHoldMs({ ready: true, reduceMotion: false }), launchIntroWindowMs);
  assert.equal(launchBrandHoldMs({ ready: true, reduceMotion: true }), launchStaticHoldMs);
  assert.equal(launchBrandHoldMs({ ready: false, reduceMotion: true }), launchBrandCapMs);
  for (const hold of [launchIntroWindowMs, launchStaticHoldMs, launchBrandCapMs]) {
    assert.ok(hold >= 400 && hold < 1_000);
  }
  assert.ok(launchIntroDurationMs <= launchIntroWindowMs, "the landing ends inside the normal hold");
});

test("completion waits for initialization and the presented brand, never an animation callback", () => {
  const completion = createLaunchCompletion();
  let calls = 0;
  const done = () => calls++;
  assert.equal(completion.complete(false, false, done), false);
  assert.equal(completion.complete(true, false, done), false);
  assert.equal(completion.complete(false, true, done), false);
  assert.equal(calls, 0);
  assert.equal(completion.complete(true, true, done), true);
  assert.equal(calls, 1);
});

test("readiness/preference rerenders, callback replacement and reentry cannot complete twice", () => {
  const completion = createLaunchCompletion();
  let calls = 0;
  const done = () => {
    calls++;
    completion.complete(true, true, () => calls++);
  };
  completion.complete(false, true, done);
  completion.complete(true, true, done);
  completion.complete(false, true, done);
  completion.complete(true, true, () => calls++);
  assert.equal(calls, 1);
});
