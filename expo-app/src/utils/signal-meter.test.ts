import assert from "node:assert/strict";
import test from "node:test";
import {
  hasSignal,
  resolveSignalSegments,
  signalAccessibilityLabel,
  signalSegmentCount
} from "./signal-meter";

test("a rating lights that many segments from the left", () => {
  assert.deepEqual(resolveSignalSegments(3), [
    "LIT",
    "LIT",
    "LIT",
    "DIM",
    "DIM"
  ]);
  assert.deepEqual(resolveSignalSegments(5), Array(5).fill("LIT"));
});

test("the ceiling is always drawn, so the reader sees the scale", () => {
  for (const rating of [0, 1, 3, 5]) {
    assert.equal(resolveSignalSegments(rating).length, signalSegmentCount);
  }
});

test("a watching state dims the whole track rather than removing it", () => {
  assert.deepEqual(resolveSignalSegments(0), Array(5).fill("DIM"));
  assert.equal(hasSignal(0), false);
  assert.equal(hasSignal(1), true);
});

test("ratings outside the scale are clamped, never wrapped or dropped", () => {
  assert.deepEqual(resolveSignalSegments(9), Array(5).fill("LIT"));
  assert.deepEqual(resolveSignalSegments(-2), Array(5).fill("DIM"));
});

test("a missing or unusable rating reads as watching, not as an error", () => {
  for (const rating of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(resolveSignalSegments(rating), Array(5).fill("DIM"));
    assert.equal(hasSignal(rating), false);
  }
});

test("a fractional rating never lights a segment it has not reached", () => {
  assert.deepEqual(resolveSignalSegments(3.9), [
    "LIT",
    "LIT",
    "LIT",
    "DIM",
    "DIM"
  ]);
});

test("the meter is announced as a level, not as a count of shapes", () => {
  assert.equal(signalAccessibilityLabel(4), "BTB sinyali 4 / 5");
  assert.equal(signalAccessibilityLabel(0), "BTB izliyor, seçim yok");
  assert.equal(signalAccessibilityLabel(null), "BTB izliyor, seçim yok");
});
