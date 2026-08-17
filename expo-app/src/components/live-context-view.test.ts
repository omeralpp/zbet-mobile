import assert from "node:assert/strict";
import test from "node:test";
import { liveContextSchema } from "@/src/api/schemas";
import {
  benchCount,
  describeEvent,
  groupStarters,
  minuteLabel,
  resolveFreshnessNotice,
  resolveLineupsState,
  resolveTimelineState,
  unavailableMessage
} from "./live-context-view";

function context(overrides: Record<string, unknown> = {}) {
  return liveContextSchema.parse({
    matchKey: "2026-08-17:3059015:20:00:00",
    availability: "OK",
    timeline: [],
    lineups: null,
    ...overrides
  });
}

function goal(overrides: Record<string, unknown> = {}) {
  return {
    eventKey: "GOAL|FIRST_HALF|23|HOME|odegaard",
    kind: "GOAL",
    minute: 23,
    minuteLabel: "23'",
    side: "HOME",
    period: { normalized: "FIRST_HALF" },
    goalKind: "GOAL",
    scorer: { rawName: "Ødegaard, Martin", comparisonForm: "martin-odegaard", isIdentified: false },
    assist: { rawName: "Player B" },
    scoreAfter: { home: 1, away: 0 },
    ...overrides
  };
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
    "Canlı maç olayları şu anda kullanılamıyor."
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

test("a goal shows scorer, assist and running score", () => {
  const display = describeEvent(goal() as never);

  assert.equal(display.kind, "GOAL");
  assert.equal(display.minute, "23'");
  assert.equal(display.primary, "Ødegaard, Martin");
  assert.equal(display.secondary, "Asist: Player B");
  assert.equal(display.score, "1-0");
  assert.equal(display.side, "HOME");
});

test("a goal without an assist omits the assist line", () => {
  const display = describeEvent(goal({ assist: null }) as never);

  assert.equal(display.secondary, null);
  assert.equal(display.primary, "Ødegaard, Martin");
});

test("a goal without a running score shows no score", () => {
  assert.equal(describeEvent(goal({ scoreAfter: null }) as never).score, null);
});

test("yellow and red cards render their own labels", () => {
  const yellow = describeEvent({
    eventKey: "c1", kind: "CARD", minute: 41, side: "AWAY",
    cardKind: "YELLOW", player: { rawName: "Player C" }
  } as never);
  const red = describeEvent({
    eventKey: "c2", kind: "CARD", minute: 77, side: "HOME",
    cardKind: "RED", player: { rawName: "Player D" }
  } as never);

  assert.equal(yellow.primary, "Player C");
  assert.equal(yellow.secondary, "Sarı kart");
  assert.equal(red.secondary, "Kırmızı kart");
  assert.equal(red.score, null);
});

test("an unknown card kind still renders a row", () => {
  const display = describeEvent({
    eventKey: "c3", kind: "CARD", minute: 12, cardKind: "UNKNOWN",
    player: { rawName: "Player E" }
  } as never);

  assert.equal(display.secondary, "Kart");
});

test("a substitution shows both players in and out", () => {
  const display = describeEvent({
    eventKey: "s1", kind: "SUBSTITUTION", minute: 58, side: "HOME",
    playerOn: { rawName: "Player D" }, playerOff: { rawName: "Player E" }
  } as never);

  assert.equal(display.primary, "Player D");
  assert.equal(display.secondary, "Çıkan: Player E");
});

test("a substitution with an unknown outgoing player degrades", () => {
  const display = describeEvent({
    eventKey: "s2", kind: "SUBSTITUTION", minute: 60,
    playerOn: { rawName: "Player F" }, playerOff: null
  } as never);

  assert.equal(display.secondary, "Çıkan: —");
});

test("a status marker renders as a period divider", () => {
  const display = describeEvent({
    eventKey: "m1", kind: "STATUS_MARKER",
    period: { normalized: "HALF_TIME" },
    displayText: "İlk Yarı Sonucu 2 - 0"
  } as never);

  assert.equal(display.isMarker, true);
  assert.equal(display.primary, "Devre arası");
});

test("status marker score text is never parsed into values", () => {
  const display = describeEvent({
    eventKey: "m2", kind: "STATUS_MARKER",
    period: { normalized: "FULL_TIME" },
    displayText: "Maç Sonucu 3 - 0"
  } as never);

  assert.equal(display.score, null, "no score is derived from display text");
  assert.equal(display.primary, "Maç sonu");
});

test("an unknown event kind still renders rather than disappearing", () => {
  const display = describeEvent({
    eventKey: "u1", kind: "UNKNOWN", minute: 61, displayText: "VAR incelemesi"
  } as never);

  assert.equal(display.primary, "VAR incelemesi");
  assert.equal(display.isMarker, false);
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
  const display = describeEvent(goal() as never);

  assert.equal(display.primary.includes("martin-odegaard"), false);
  assert.equal(JSON.stringify(display).includes("comparisonForm"), false);
  assert.equal(JSON.stringify(display).includes("isIdentified"), false);
});

test("no display object carries a player identifier", () => {
  const display = describeEvent(goal() as never) as unknown as Record<string, unknown>;

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
 * Lineups
 * ---------------------------------------------------------------- */

test("missing lineups are unavailable, not an empty squad", () => {
  assert.equal(resolveLineupsState(context({ lineups: null })), "UNAVAILABLE");
  assert.equal(resolveLineupsState(undefined), "UNAVAILABLE");
  assert.equal(resolveLineupsState(context({ lineups: null }), true), "LOADING");
});

test("present lineups group starters by position", () => {
  const parsed = context({
    lineups: {
      home: {
        manager: { rawName: "Mikel Arteta" },
        formation: { label: "4 - 2 - 3 - 1", lines: [4, 2, 3, 1] },
        starters: [
          { player: { rawName: "GK" }, positionGroup: "GOALKEEPER" },
          { player: { rawName: "DF" }, positionGroup: "DEFENCE" },
          { player: { rawName: "MF" }, positionGroup: "MIDFIELD" }
        ],
        substitutes: [{ player: { rawName: "Sub" }, positionGroup: "BENCH" }]
      },
      away: null
    }
  });

  assert.equal(resolveLineupsState(parsed), "PRESENT");
  const groups = groupStarters(parsed.lineups?.home ?? null);
  assert.deepEqual(groups.map((g) => g.group), ["GOALKEEPER", "DEFENCE", "MIDFIELD"]);
  assert.equal(groups[0]?.label, "Kaleci");
  assert.equal(benchCount(parsed), 1);
});

test("one side missing does not hide the other", () => {
  const parsed = context({
    lineups: {
      home: { starters: [{ player: { rawName: "A" }, positionGroup: "DEFENCE" }], substitutes: [] },
      away: null
    }
  });

  assert.equal(resolveLineupsState(parsed), "PRESENT");
  assert.equal(groupStarters(parsed.lineups?.home ?? null).length, 1);
  assert.deepEqual(groupStarters(parsed.lineups?.away ?? null), []);
});

test("a missing formation or manager does not break the side", () => {
  const parsed = context({
    lineups: {
      home: {
        manager: null,
        formation: null,
        starters: [{ player: { rawName: "A" }, positionGroup: "ATTACK" }],
        substitutes: []
      },
      away: null
    }
  });

  assert.equal(parsed.lineups?.home?.manager ?? null, null);
  assert.equal(parsed.lineups?.home?.formation ?? null, null);
  assert.equal(groupStarters(parsed.lineups?.home ?? null).length, 1);
});

test("an unknown position group falls back without dropping the player", () => {
  const parsed = context({
    lineups: {
      home: {
        starters: [{ player: { rawName: "X" }, positionGroup: "SWEEPER" }],
        substitutes: []
      },
      away: null
    }
  });

  const groups = groupStarters(parsed.lineups?.home ?? null);
  assert.equal(groups.length, 1);
  assert.equal(groups[0]?.group, "UNKNOWN");
  assert.equal(groups[0]?.players[0]?.player?.rawName, "X");
});

/* ---------------------------------------------------------------- *
 * Contract tolerance
 * ---------------------------------------------------------------- */

test("an unknown availability degrades instead of throwing", () => {
  const parsed = liveContextSchema.parse({
    availability: "SOMETHING_NEW",
    timeline: null,
    lineups: null
  });

  assert.equal(parsed.availability, "FAILED");
  assert.equal(resolveTimelineState(parsed), "UNAVAILABLE");
});

test("an unknown period degrades to UNKNOWN", () => {
  const parsed = liveContextSchema.parse({
    availability: "OK",
    period: { normalized: "SUDDEN_DEATH" },
    timeline: [],
    lineups: null
  });

  assert.equal(parsed.period?.normalized, "UNKNOWN");
});

test("the provider-disabled shape parses and resolves honestly", () => {
  const parsed = liveContextSchema.parse({
    matchKey: "2026-08-17:1:20:00:00",
    availability: "UNAVAILABLE",
    timeline: null,
    lineups: null,
    freshness: { stale: true, refreshFailed: true }
  });

  assert.equal(resolveTimelineState(parsed), "UNAVAILABLE");
  assert.equal(resolveLineupsState(parsed), "UNAVAILABLE");
  assert.equal(resolveFreshnessNotice(parsed.freshness).visible, true);
});
