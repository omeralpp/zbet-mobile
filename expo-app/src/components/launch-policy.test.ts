import assert from "node:assert/strict";
import test from "node:test";
import {
  createLaunchCompletion,
  crestBall,
  launchBrandCapMs,
  launchChoreography,
  launchExitDuration,
  launchExitMs,
  launchMinimumIntroMs,
  launchRevealFallbackMs,
  resolveLaunchReveal,
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

test("the reveal continues the native splash, then commits to one presentation", () => {
  const normal = { ready: true, reduceMotion: false };
  const base = { current: "PENDING" as const, layoutReady: true, preference: normal, elapsedMs: 16 };
  assert.equal(resolveLaunchReveal(base), "INTRO");
  assert.equal(resolveLaunchReveal({ ...base, preference: { ready: true, reduceMotion: true } }), "STATIC");
  // No answer yet: background only, then the static brand after the fallback.
  assert.equal(resolveLaunchReveal({ ...base, preference: { ready: false, reduceMotion: true } }), "PENDING");
  assert.equal(resolveLaunchReveal({ ...base, preference: { ready: false, reduceMotion: true }, elapsedMs: launchRevealFallbackMs }), "STATIC");
  assert.equal(resolveLaunchReveal({ ...base, layoutReady: false, elapsedMs: launchRevealFallbackMs }), "STATIC");
  // Too little of the window left for a believable fall.
  assert.equal(resolveLaunchReveal({ ...base, elapsedMs: launchIntroWindowMs - launchMinimumIntroMs + 1 }), "STATIC");
  // A decided reveal never changes, so the brand cannot appear twice.
  assert.equal(resolveLaunchReveal({ ...base, current: "STATIC" }), "STATIC");
  assert.equal(resolveLaunchReveal({ ...base, current: "INTRO", preference: { ready: true, reduceMotion: true } }), "INTRO");
});

test("the landing keeps its shape and ends inside the intro duration", () => {
  assert.equal(launchChoreography(0), null);
  assert.equal(launchChoreography(launchMinimumIntroMs - 1), null);
  assert.equal(launchChoreography(Number.NaN), null);
  for (const duration of [launchMinimumIntroMs, 520, launchIntroDurationMs]) {
    const plan = launchChoreography(duration);
    assert.ok(plan);
    assert.equal(plan.dropAt + plan.dropMs, plan.impactAt, "the fall ends exactly at impact");
    assert.ok(plan.entrance <= plan.impactAt, "the crest is in place before the ball meets it");
    assert.ok(plan.impactAt + plan.rippleMs <= duration);
    assert.ok(plan.impactAt + plan.haloRiseMs + plan.haloSettleMs <= duration);
    assert.ok(plan.impactAt + plan.squashMs + plan.settleMs <= plan.mergeAt, "the ball is seated before it merges");
    assert.ok(plan.mergeAt + plan.mergeMs <= duration);
    assert.ok(plan.wordmarkAt + plan.wordmarkMs <= duration);
    assert.ok(plan.dropMs >= 160, "a fall shorter than this reads as a jump cut");
  }
});

test("the hand-off fades only for a known normal-motion preference", () => {
  assert.equal(launchExitDuration({ ready: true, reduceMotion: false }), launchExitMs);
  assert.equal(launchExitDuration({ ready: true, reduceMotion: true }), 0);
  assert.equal(launchExitDuration({ ready: false, reduceMotion: false }), 0);
  // Brand window plus the fade stays close to one second.
  assert.ok(launchIntroWindowMs + launchExitMs <= 1_050);
});

test("the landing target sits on the crest's own ball", () => {
  assert.ok(crestBall.centerY > 0.5 && crestBall.centerY < 0.9);
  assert.equal(crestBall.centerX, 0.5);
  assert.ok(crestBall.diameter > 0.1 && crestBall.diameter < 0.25);
});
