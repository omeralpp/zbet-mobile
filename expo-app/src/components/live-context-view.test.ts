import assert from "node:assert/strict";
import test from "node:test";
import { liveContextSchema } from "@/src/api/schemas";
import {
  describeEvent,
  describeEventForAccessibility,
  minuteLabel,
  resolveFreshnessNotice,
  resolveTimelineState,
  unavailableMessage,
  visibleEvents,
  type VisibleEvent
} from "./live-context-view";

const teams = { home: "Brøndby", away: "Sønderjyske" };

function context(overrides: Record<string, unknown> = {}) {
  return liveContextSchema.parse({
    matchKey: "2026-08-17:3059015:20:00:00",
    availability: "OK",
    timeline: [],
    ...overrides
  });
}

function goal(overrides: Record<string, unknown> = {}): VisibleEvent {
  return {
    eventKey: "GOAL|FIRST_HALF|23|HOME|odegaard",
    kind: "GOAL",
    minute: 23,
    minuteLabel: "23'",
    side: "HOME",
    period: { normalized: "FIRST_HALF" },
    goalKind: "GOAL",
    scorer: { rawName: "Ødegaard, Martin", comparisonForm: "martin-odegaard", isIdentified: false },
    scoreAfter: { home: 1, away: 0 },
    ...overrides
  } as VisibleEvent;
}

/* ---------------------------------------------------------------- *
 * The null / [] distinction
 * ---------------------------------------------------------------- */

test("a retrieved empty timeline is EMPTY, not unavailable", () => {
  assert.equal(resolveTimelineState(context({ timeline: [] })), "EMPTY");
});

test("an unretrieved timeline is UNAVAILABLE, never empty", () => {
  const state = resolveTimelineState(context({ timeline: null }));
  assert.equal(state, "UNAVAILABLE");
  assert.notEqual(state, "EMPTY");
});

test("a missing context is unavailable, never empty", () => {
  assert.equal(resolveTimelineState(undefined), "UNAVAILABLE");
});

test("loading outranks every other timeline state", () => {
  assert.equal(resolveTimelineState(context({ timeline: null }), true), "LOADING");
  assert.equal(resolveTimelineState(context({ timeline: [] }), true), "LOADING");
});

test("a populated timeline renders events", () => {
  assert.equal(
    resolveTimelineState(context({ timeline: [goal()] })),
    "EVENTS"
  );
});

/* ---------------------------------------------------------------- *
 * Availability copy
 * ---------------------------------------------------------------- */

test("provider-disabled and failed read identically to the user", () => {
  assert.equal(
    unavailableMessage("UNAVAILABLE"),
    "Gol ve kırmızı kart bilgisi şu anda kullanılamıyor."
  );
  assert.equal(unavailableMessage("FAILED"), unavailableMessage("UNAVAILABLE"));
  assert.equal(unavailableMessage(undefined), unavailableMessage("UNAVAILABLE"));
});

test("a degraded response says only part is missing", () => {
  assert.equal(
    unavailableMessage("DEGRADED"),
    "Maç olaylarının bir bölümü şu anda alınamadı."
  );
});

test("no user-facing copy names the provider or an error code", () => {
  const copy = [
    unavailableMessage("UNAVAILABLE"),
    unavailableMessage("DEGRADED"),
    unavailableMessage("FAILED"),
    resolveFreshnessNotice({ stale: true, ageSeconds: 120 }).message ?? "",
    resolveFreshnessNotice({ refreshFailed: true }).message ?? ""
  ].join(" ").toLowerCase();

  for (const leak of [
    "bilyoner", "provider", "http", "503", "404", "api", "json", "betradar", "sap"
  ]) {
    assert.equal(copy.includes(leak), false, `copy must not mention ${leak}`);
  }
});

/* ---------------------------------------------------------------- *
 * Event rendering
 * ---------------------------------------------------------------- */

test("a goal shows the team, the scorer and the running score", () => {
  const display = describeEvent(goal(), teams);

  assert.equal(display.kind, "GOAL");
  assert.equal(display.minute, "23'");
  assert.equal(display.team, "Brøndby");
  assert.equal(display.player, "Ødegaard, Martin");
  assert.equal(display.score, "1-0");
});

test("the away side resolves to the away team", () => {
  const display = describeEvent(goal({ side: "AWAY" }), teams);

  assert.equal(display.team, "Sønderjyske");
});

test("a goal without a running score shows no score", () => {
  assert.equal(describeEvent(goal({ scoreAfter: null }), teams).score, null);
});

test("an unknown side leaves the team null rather than guessing", () => {
  const display = describeEvent(goal({ side: null }), teams);

  assert.equal(display.team, null);
  assert.equal(display.player, "Ødegaard, Martin");
});

test("a goal with no scorer degrades without inventing a name", () => {
  const display = describeEvent(goal({ scorer: null }), teams);

  assert.equal(display.player, null);
  assert.equal(display.team, "Brøndby");
});

/* ------------------------------------------------------------------ *
 * Red cards
 * ------------------------------------------------------------------ */

function redCard(overrides: Record<string, unknown> = {}): VisibleEvent {
  return {
    eventKey: "RED_CARD|SECOND_HALF|72|HOME|rice",
    kind: "RED_CARD",
    minute: 72,
    minuteLabel: "72'",
    side: "HOME",
    period: { normalized: "SECOND_HALF" },
    redCardType: "DIRECT_RED",
    player: { rawName: "Rice, Declan" },
    ...overrides
  } as VisibleEvent;
}

test("a red card shows the team and the player, never a score", () => {
  const display = describeEvent(redCard(), teams);

  assert.equal(display.kind, "RED_CARD");
  assert.equal(display.team, "Brøndby");
  assert.equal(display.player, "Rice, Declan");
  assert.equal(display.score, null);
});

test("every proven dismissal renders as a red card", () => {
  // UNKNOWN here means "dismissal proven, subtype not stated" - an
  // unclassifiable card never reaches the app as a red card at all.
  for (const redCardType of ["DIRECT_RED", "SECOND_YELLOW_RED", "UNKNOWN"]) {
    const display = describeEvent(redCard({ redCardType }), teams);
    assert.equal(display.kind, "RED_CARD");
    assert.equal(display.redCardType, redCardType);
  }
});

test("the dismissal type is spoken, so it is not colour-only", () => {
  const direct = describeEventForAccessibility(redCard(), teams);
  const second = describeEventForAccessibility(
    redCard({ redCardType: "SECOND_YELLOW_RED" }),
    teams
  );

  assert.match(direct, /Kırmızı kart/);
  assert.match(second, /İkinci sarıdan kırmızı/);
  assert.notEqual(direct, second);
});

test("an own goal is spoken as one only when the contract says so", () => {
  assert.match(
    describeEventForAccessibility(goal({ goalKind: "OWN_GOAL" }), teams),
    /kendi kalesine/
  );
  assert.doesNotMatch(
    describeEventForAccessibility(goal(), teams),
    /kendi kalesine/
  );
});

/* ------------------------------------------------------------------ *
 * Scope
 * ------------------------------------------------------------------ */

test("only goals and red cards are rendered", () => {
  const events = visibleEvents([
    goal(),
    redCard(),
    { eventKey: "x", kind: "UNKNOWN" } as never
  ]);

  assert.equal(events.length, 2);
  assert.deepEqual(events.map((event) => event.kind), ["GOAL", "RED_CARD"]);
});

test("a timeline of only unrenderable events is EMPTY, not EVENTS", () => {
  // An unrecognised kind is a contract change, not an event to draw.
  const parsed = context({
    timeline: [{ eventKey: "x", kind: "SUBSTITUTION" }]
  });

  assert.equal(resolveTimelineState(parsed), "EMPTY");
});

test("an unretrieved timeline stays UNAVAILABLE even so", () => {
  assert.equal(resolveTimelineState(context({ timeline: null })), "UNAVAILABLE");
});

test("a minute label falls back to the numeric minute", () => {
  assert.equal(minuteLabel({ minute: 45 } as never), "45'");
  assert.equal(minuteLabel({ minuteLabel: "45+2'", minute: 45 } as never), "45+2'");
  assert.equal(minuteLabel({ minute: null } as never), "");
});

/* ---------------------------------------------------------------- *
 * Player names are display data only
 * ---------------------------------------------------------------- */

test("the comparison form never reaches the rendered output", () => {
  const display = describeEvent(goal(), teams);

  assert.equal(display.player?.includes("martin-odegaard"), false);
  assert.equal(JSON.stringify(display).includes("comparisonForm"), false);
  assert.equal(JSON.stringify(display).includes("isIdentified"), false);
});

test("no display object carries a player identifier", () => {
  const display = describeEvent(goal(), teams) as unknown as Record<string, unknown>;

  for (const key of ["playerId", "id", "scorerId", "comparisonForm"]) {
    assert.equal(key in display, false, `display must not expose ${key}`);
  }
});

/* ---------------------------------------------------------------- *
 * Freshness
 * ---------------------------------------------------------------- */

test("fresh confirmed data shows no freshness notice", () => {
  assert.deepEqual(
    resolveFreshnessNotice({ stale: false, refreshFailed: false }),
    { visible: false, message: null }
  );
  assert.equal(resolveFreshnessNotice(undefined).visible, false);
});

test("stale data is marked as possibly outdated", () => {
  const notice = resolveFreshnessNotice({ stale: true, ageSeconds: 180 });

  assert.equal(notice.visible, true);
  assert.equal(notice.message, "3 dk önceki veri olabilir");
});

test("a failed refresh is reported distinctly from age", () => {
  const notice = resolveFreshnessNotice({
    stale: false, refreshFailed: true, ageSeconds: 45
  });

  assert.equal(notice.visible, true);
  assert.equal(notice.message, "Güncellenemedi · 45 sn önceki veri");
});

test("a failed refresh with unknown age still warns", () => {
  assert.equal(
    resolveFreshnessNotice({ refreshFailed: true }).message,
    "Güncellenemedi · veri doğrulanmadı"
  );
});

test("stale data is never presented as confirmed current", () => {
  const messages = [
    resolveFreshnessNotice({ stale: true, ageSeconds: 300 }).message,
    resolveFreshnessNotice({ refreshFailed: true, ageSeconds: 300 }).message
  ];

  for (const message of messages) {
    assert.ok(message);
    assert.equal(/güncel veri|canlı|şu an/i.test(message), false);
  }
});

/* ---------------------------------------------------------------- *
 * Contract tolerance
 * ---------------------------------------------------------------- */

test("an unknown availability degrades instead of throwing", () => {
  const parsed = liveContextSchema.parse({
    availability: "SOMETHING_NEW",
    timeline: null
  });

  assert.equal(parsed.availability, "FAILED");
  assert.equal(resolveTimelineState(parsed), "UNAVAILABLE");
});

test("an unknown period degrades to UNKNOWN", () => {
  const parsed = liveContextSchema.parse({
    availability: "OK",
    period: { normalized: "SUDDEN_DEATH" },
    timeline: []
  });

  assert.equal(parsed.period?.normalized, "UNKNOWN");
});

test("the provider-disabled shape parses and resolves honestly", () => {
  const parsed = liveContextSchema.parse({
    matchKey: "2026-08-17:1:20:00:00",
    availability: "UNAVAILABLE",
    timeline: null,
    freshness: { stale: true, refreshFailed: true }
  });

  assert.equal(resolveTimelineState(parsed), "UNAVAILABLE");
  assert.equal(resolveFreshnessNotice(parsed.freshness).visible, true);
});
