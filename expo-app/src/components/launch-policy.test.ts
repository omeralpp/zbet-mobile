import assert from "node:assert/strict";
import test from "node:test";
import { createLaunchCompletion, launchIntroDuration, launchIntroDurationMs, launchIntroWindowMs } from "./launch-policy";

const pending = { ready: false, layoutReady: true, preference: { ready: true, reduceMotion: false }, alreadyStarted: false, elapsedMs: 0 };

test("a short normal intro uses only the initial preparation window", () => {
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

test("fast readiness cuts the intro immediately, independent of motion-preference latency", () => {
  assert.equal(launchIntroDuration({ ...pending, ready: true, elapsedMs: 20 }), 0);
  const completion = createLaunchCompletion();
  let calls = 0;
  assert.equal(completion.complete(true, true, () => calls++), true);
  assert.equal(calls, 1);
});

test("completion waits for actual initialization and the first layout, never a decorative duration", () => {
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
