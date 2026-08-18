import assert from "node:assert/strict";
import test from "node:test";
import { bibiPresence } from "./bibi-presence";
import {
  defaultDiscoveryState,
  discoveryDayStamp,
  discoveryHints,
  discoveryPacing,
  featureDiscoveryStorageKey,
  nextDiscoveryHint,
  parseDiscoveryState,
  recordDiscoveryShown,
  setDiscoveryPace,
  shownToday,
  type DiscoveryState
} from "./feature-discovery";
import { tutorialStorageKey } from "@/src/tutorial/tutorial-state";

// Local rather than UTC: the daily cap is a local-calendar promise, so a UTC
// anchor would put the offsets below on either side of midnight depending on
// where the test runs.
const now = new Date(2026, 7, 18, 9, 0, 0).getTime();
const hour = 60 * 60 * 1000;
const ambient = { presence: "FULL", tutorialActive: false } as const;

function state(overrides: Partial<DiscoveryState> = {}): DiscoveryState {
  return { ...defaultDiscoveryState(), ...overrides };
}

test("discovery keeps its own store, separate from the tutorial", () => {
  assert.notEqual(featureDiscoveryStorageKey, tutorialStorageKey);
});

test("every hint points at a route that carries ambient Bibi", () => {
  // A hint on a GUIDE_ONLY surface could never be shown, so one added there
  // would be dead copy that still reads like a shipped feature.
  for (const hint of discoveryHints) {
    assert.equal(
      bibiPresence(hint.route),
      "FULL",
      `${hint.id} sits on ${hint.route}`
    );
  }
});

test("hint ids are unique", () => {
  const ids = discoveryHints.map((hint) => hint.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("offers the hint that belongs to the current surface", () => {
  const hint = nextDiscoveryHint("/", state(), now, ambient);
  assert.equal(hint?.id, "overview-reorder");
  assert.equal(nextDiscoveryHint("/live", state(), now, ambient)?.id, "detail-panels");
});

test("offers nothing on a surface with no hint of its own", () => {
  assert.equal(nextDiscoveryHint("/toto", state(), now, ambient), null);
});

test("never repeats a hint that was already offered", () => {
  const seen = state({ seenHintIds: ["overview-reorder"] });
  assert.equal(nextDiscoveryHint("/", seen, now, ambient), null);
});

test("a hint is retired the moment it is shown, not when it is acknowledged", () => {
  const next = recordDiscoveryShown(state(), "overview-reorder", now);
  assert.deepEqual(next.seenHintIds, ["overview-reorder"]);
  assert.equal(nextDiscoveryHint("/", next, now + 5 * hour, ambient), null);
});

test("holds the cooldown after a hint", () => {
  const shown = recordDiscoveryShown(state(), "overview-reorder", now);
  assert.equal(
    nextDiscoveryHint("/live", shown, now + discoveryPacing.cooldownMs - 1, ambient),
    null
  );
  assert.equal(
    nextDiscoveryHint("/live", shown, now + discoveryPacing.cooldownMs, ambient)?.id,
    "detail-panels"
  );
});

test("stops at the daily cap however long the app stays open", () => {
  let current = state();
  for (let index = 0; index < discoveryPacing.maxPerDay; index += 1) {
    current = recordDiscoveryShown(current, `filler-${index}`, now);
  }
  assert.equal(shownToday(current, now), discoveryPacing.maxPerDay);
  // Past the cooldown and still the same day: the cap, not the cooldown, is
  // what holds here.
  const later = now + 5 * hour;
  assert.ok(later - now > discoveryPacing.cooldownMs);
  assert.equal(discoveryDayStamp(later), discoveryDayStamp(now));
  assert.equal(nextDiscoveryHint("/", current, later, ambient), null);
});

test("the daily counter belongs to a day, not to a session", () => {
  const capped = recordDiscoveryShown(
    recordDiscoveryShown(state(), "a", now),
    "b",
    now
  );
  const nextDay = now + 24 * hour;
  assert.notEqual(discoveryDayStamp(nextDay), discoveryDayStamp(now));
  assert.equal(shownToday(capped, nextDay), 0);
  assert.equal(nextDiscoveryHint("/", capped, nextDay, ambient)?.id, "overview-reorder");
});

test("the guide the user opened outranks anything the product volunteered", () => {
  assert.equal(
    nextDiscoveryHint("/", state(), now, {
      presence: "FULL",
      tutorialActive: true
    }),
    null
  );
});

test("a suppressed hint does not spend a slot", () => {
  // Blocked by the tutorial, then offered intact once the guide is done.
  const blocked = state();
  assert.equal(
    nextDiscoveryHint("/", blocked, now, { presence: "FULL", tutorialActive: true }),
    null
  );
  assert.equal(nextDiscoveryHint("/", blocked, now, ambient)?.id, "overview-reorder");
  assert.equal(shownToday(blocked, now), 0);
});

test("dense analytical surfaces never carry a discovery hint", () => {
  assert.equal(
    nextDiscoveryHint("/", state(), now, {
      presence: "GUIDE_ONLY",
      tutorialActive: false
    }),
    null
  );
});

test("QUIET silences discovery and nothing else", () => {
  const quiet = setDiscoveryPace(state(), "QUIET");
  assert.equal(nextDiscoveryHint("/", quiet, now, ambient), null);
  // The tutorial store is untouched by pace; this is the seam that keeps a
  // user's "stop interrupting me" from also closing the guide they can open.
  assert.equal(quiet.seenHintIds.length, 0);
  assert.equal(
    nextDiscoveryHint("/", setDiscoveryPace(quiet, "NORMAL"), now, ambient)?.id,
    "overview-reorder"
  );
});

test("restores a stored state and drops hints that no longer exist", () => {
  const stored = JSON.stringify({
    version: 1,
    pace: "QUIET",
    seenHintIds: ["overview-reorder", "retired-hint", "overview-reorder"],
    lastShownAt: now,
    dayStamp: discoveryDayStamp(now),
    shownOnDay: 1
  });
  const parsed = parseDiscoveryState(stored);
  assert.equal(parsed.pace, "QUIET");
  assert.deepEqual(parsed.seenHintIds, ["overview-reorder"]);
  assert.equal(parsed.lastShownAt, now);
  assert.equal(parsed.shownOnDay, 1);
});

test("a corrupted or outdated store never silently disables discovery", () => {
  for (const raw of [
    null,
    "",
    "{oops",
    JSON.stringify({ version: 0, pace: "QUIET" }),
    JSON.stringify(["nope"])
  ]) {
    const parsed = parseDiscoveryState(raw);
    assert.equal(parsed.pace, "NORMAL", `raw: ${String(raw)}`);
    assert.deepEqual(parsed.seenHintIds, []);
    assert.equal(parsed.shownOnDay, 0);
  }
});

test("a hint shown twice is still one entry", () => {
  const once = recordDiscoveryShown(state(), "overview-reorder", now);
  const twice = recordDiscoveryShown(once, "overview-reorder", now);
  assert.deepEqual(twice.seenHintIds, ["overview-reorder"]);
});
