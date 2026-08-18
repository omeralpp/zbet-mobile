import assert from "node:assert/strict";
import test from "node:test";
import {
  allowsAmbientMotion,
  durations,
  emphasis,
  motionDuration
} from "./motion";

test("reduced motion removes the travel instead of shortening it", () => {
  assert.equal(motionDuration("reveal", true), 0);
  assert.equal(motionDuration("ambient", true), 0);
  assert.equal(motionDuration("instant", true), 0);
});

test("normal playback returns the named duration", () => {
  assert.equal(motionDuration("reveal", false), durations.reveal);
  assert.equal(motionDuration("transition", false), durations.transition);
});

test("ambient loops stop first under reduced motion", () => {
  assert.equal(allowsAmbientMotion(false), true);
  assert.equal(allowsAmbientMotion(true), false);
});

test("durations rise with the distance they cover", () => {
  assert.ok(durations.instant < durations.fast);
  assert.ok(durations.fast < durations.reveal);
  assert.ok(durations.reveal < durations.transition);
  assert.ok(durations.transition < durations.ambient);
});

test("an alert is more assertive than an arrival", () => {
  assert.ok(emphasis.alert.duration > emphasis.arrive.duration);
  assert.ok(emphasis.alert.scaleFrom > 1);
  assert.ok(emphasis.arrive.scaleFrom < 1);
  assert.equal(emphasis.arrive.opacityFrom, 0);
  assert.equal(emphasis.alert.opacityFrom, 1);
});
