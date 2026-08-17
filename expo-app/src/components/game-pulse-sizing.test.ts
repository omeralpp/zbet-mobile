import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultPulseHeight,
  maxPulseHeight,
  minPulseHeight,
  parsePulseHeightMessage,
  pulseHeightProbe,
  resolvePulseHeight
} from "./game-pulse-sizing";

/* ---------------------------------------------------------------- *
 * Height resolution
 * ---------------------------------------------------------------- */

test("a short pre-match panel shrinks the card", () => {
  // The blank region came from the fixed 232pt box; a 120pt panel now uses 122.
  const height = resolvePulseHeight(120);
  assert.equal(height, 122);
  assert.ok(height < defaultPulseHeight, "unused space is removed");
});

test("a live tempo panel keeps its full height without clipping", () => {
  assert.equal(resolvePulseHeight(230), maxPulseHeight);
  assert.equal(resolvePulseHeight(400), maxPulseHeight);
});

test("the card never grows beyond the original fixed box", () => {
  for (const reported of [233, 500, 5000]) {
    assert.equal(resolvePulseHeight(reported), maxPulseHeight);
  }
});

test("a tiny measurement is floored so nothing is over-compressed", () => {
  assert.equal(resolvePulseHeight(10), minPulseHeight);
  assert.equal(resolvePulseHeight(90), minPulseHeight);
  // Just above the floor the measurement is honoured rather than clamped.
  assert.equal(resolvePulseHeight(95), 97);
});

test("an unusable measurement falls back to the fixed height", () => {
  // Nonsense is not evidence about the content, so it must not size the card.
  for (const bad of [0, -1, NaN, Infinity, null, undefined, "abc", {}, []]) {
    assert.equal(
      resolvePulseHeight(bad as unknown),
      defaultPulseHeight,
      `${String(bad)} must fall back`
    );
  }
});

test("a numeric string measurement is accepted", () => {
  assert.equal(resolvePulseHeight("150"), 152);
});

/* ---------------------------------------------------------------- *
 * Message parsing - the frame is untrusted input
 * ---------------------------------------------------------------- */

test("a bare numeric message is accepted", () => {
  assert.equal(parsePulseHeightMessage("184"), 184);
  assert.equal(parsePulseHeightMessage("  184  "), 184);
  assert.equal(parsePulseHeightMessage("184.5"), 184.5);
});

test("a structured message is accepted", () => {
  assert.equal(parsePulseHeightMessage('{"pulseHeight":150}'), 150);
});

test("anything else leaves the current height untouched", () => {
  for (const bad of [
    "", "abc", "-5", "0", "{}", "[]", '{"pulseHeight":"x"}',
    '{"other":10}', "null", null, undefined, 184, {}, "x".repeat(300)
  ]) {
    assert.equal(
      parsePulseHeightMessage(bad as unknown),
      null,
      `${String(bad)} must be rejected`
    );
  }
});

test("a malformed JSON payload does not throw", () => {
  assert.doesNotThrow(() => parsePulseHeightMessage('{"pulseHeight":'));
  assert.equal(parsePulseHeightMessage('{"pulseHeight":'), null);
});

/* ---------------------------------------------------------------- *
 * Probe safety
 * ---------------------------------------------------------------- */

test("the probe only measures and reports", () => {
  // It must read layout and post a number - never touch frame content or state.
  assert.ok(pulseHeightProbe.includes("scrollHeight"));
  assert.ok(pulseHeightProbe.includes("ReactNativeWebView.postMessage"));
  for (const forbidden of ["cookie", "localStorage", "sessionStorage", "fetch(", "XMLHttpRequest"]) {
    assert.equal(
      pulseHeightProbe.includes(forbidden),
      false,
      `probe must not reference ${forbidden}`
    );
  }
});

test("the probe stops polling once the height settles", () => {
  assert.ok(pulseHeightProbe.includes("clearInterval"));
});

test("the probe measures the widget root, never the document", () => {
  // Measuring the document would form a feedback loop: the frame's content
  // fills its container, so document height simply reports back the height the
  // card already has and the box can never shrink. Observed on device - a
  // document-based probe reported exactly 232 forever. The widget root sizes to
  // its own content, so it is the only honest signal.
  assert.ok(pulseHeightProbe.includes("getElementById('sr-widget')"));
  for (const selfReferential of [
    "document.body.scrollHeight",
    "document.documentElement.scrollHeight",
    "document.body.getBoundingClientRect"
  ]) {
    assert.equal(
      pulseHeightProbe.includes(selfReferential),
      false,
      `probe must not measure ${selfReferential}`
    );
  }
});

test("the probe stays silent until the widget has rendered", () => {
  // A zero measurement means "nothing yet", not "the content is empty", so the
  // card keeps its current height instead of collapsing and springing back.
  assert.ok(pulseHeightProbe.includes("if (!height) { return; }"));
});
