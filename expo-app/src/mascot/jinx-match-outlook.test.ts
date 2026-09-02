import assert from "node:assert/strict";
import test from "node:test";
import { jinxMatchOutlookSchema } from "@/src/api/schemas";
import {
  acceptBody,
  acceptHeadline,
  acceptUncertaintyNote,
  confidenceBand,
  confidenceLabels,
  informativeOnlyNotice,
  outlookFreshnessNotice,
  outlookSignals,
  resolveOutlookState
} from "./jinx-match-outlook";

function outlook(overrides: Record<string, unknown> = {}) {
  return jinxMatchOutlookSchema.parse({
    matchKey: "2026-07-28:472910:20:45:00",
    contractVersion: "jinx-match-outlook.v1",
    origin: "SYNTHETIC",
    availability: "OK",
    headline: "Ev sahibi baskısı sürüyor.",
    body: null,
    confidence: 0.58,
    uncertaintyNote: "Kadro ve sakatlık bilgisi görünmüyor.",
    signals: null,
    ...overrides
  });
}

/* ---------------------------------------------------------------- *
 * Nothing is volunteered
 * ---------------------------------------------------------------- */

test("an unasked surface is IDLE, even with an outlook already in hand", () => {
  assert.equal(
    resolveOutlookState(outlook(), { asked: false }),
    "IDLE"
  );
});

test("asking moves the surface off IDLE", () => {
  assert.equal(resolveOutlookState(outlook(), { asked: true }), "READY");
});

test("loading is only reachable after asking", () => {
  assert.equal(
    resolveOutlookState(undefined, { asked: false, isLoading: true }),
    "IDLE"
  );
  assert.equal(
    resolveOutlookState(undefined, { asked: true, isLoading: true }),
    "LOADING"
  );
});

test("an error is unavailable rather than a blank reading", () => {
  assert.equal(
    resolveOutlookState(outlook(), { asked: true, isError: true }),
    "UNAVAILABLE"
  );
});

test("partial material reports DEGRADED rather than passing as a full reading", () => {
  assert.equal(
    resolveOutlookState(outlook({ availability: "DEGRADED" }), { asked: true }),
    "DEGRADED"
  );
});

test("an unparseable availability degrades to unavailable", () => {
  const parsed = outlook({ availability: "SOMETHING_NEW" });
  assert.equal(parsed.availability, "UNAVAILABLE");
  assert.equal(resolveOutlookState(parsed, { asked: true }), "UNAVAILABLE");
});

/* ---------------------------------------------------------------- *
 * The surface refuses advice, certainty and borrowed authority
 * ---------------------------------------------------------------- */

const refused = [
  "Ev sahibine oynamanı tavsiye ederim.",
  "Bu maça bahis yapılabilir.",
  "Kuponuna banko yazabilirsin.",
  "Kesinlikle gol gelir.",
  "Ev sahibi mutlaka kazanır.",
  "Tahminim ev sahibi yönünde.",
  "Model bu maçta ev sahibini seçti.",
  "Super kararı bu yönde."
];

for (const candidate of refused) {
  test(`refused: ${candidate}`, () => {
    assert.equal(acceptHeadline(candidate), null);
  });
}

test("a plain description survives the guard", () => {
  const line = "Ev sahibi topu daha çok elinde tutuyor.";
  assert.equal(acceptHeadline(line), line);
});

test("the guard is diacritic-blind, so a folded spelling cannot slip past", () => {
  assert.equal(acceptHeadline("Kesinlikle gol gelir."), null);
  assert.equal(acceptHeadline("Kesınlıkle gol gelir."), null);
});

test("an over-long line is refused on shape before wording", () => {
  assert.equal(acceptHeadline("a".repeat(400)), null);
});

test("a body may be longer than a headline", () => {
  const long = "Ev sahibi baskısı sürüyor. ".repeat(6).trim();
  assert.equal(acceptHeadline(long), null);
  assert.equal(acceptBody(long), long);
});

test("a non-string candidate is refused rather than coerced", () => {
  assert.equal(acceptHeadline(undefined), null);
  assert.equal(acceptHeadline(null), null);
});

test("a refused headline leaves the surface unavailable, not blank", () => {
  assert.equal(
    resolveOutlookState(outlook({ headline: "Kesinlikle gol gelir." }), {
      asked: true
    }),
    "UNAVAILABLE"
  );
});

test("a null headline is unavailable rather than an empty bubble", () => {
  assert.equal(
    resolveOutlookState(outlook({ headline: null }), { asked: true }),
    "UNAVAILABLE"
  );
});

/* ---------------------------------------------------------------- *
 * The caveat fails closed
 * ---------------------------------------------------------------- */

test("a refused uncertainty note falls back to the standing disclaimer", () => {
  // Dropping a caveat would make the reading look more certain than it is, so
  // this is the one guarded string that must never resolve to nothing.
  assert.equal(
    acceptUncertaintyNote("Kesinlikle doğrudur."),
    informativeOnlyNotice
  );
});

test("a missing uncertainty note still yields a caveat", () => {
  assert.equal(acceptUncertaintyNote(null), informativeOnlyNotice);
});

test("an acceptable uncertainty note is kept as written", () => {
  const note = "Kadro ve sakatlık bilgisi görünmüyor.";
  assert.equal(acceptUncertaintyNote(note), note);
});

test("the standing disclaimer itself passes its own guard", () => {
  assert.equal(acceptBody(informativeOnlyNotice), informativeOnlyNotice);
});

/* ---------------------------------------------------------------- *
 * Confidence is a band, not arithmetic
 * ---------------------------------------------------------------- */

test("confidence resolves to three bands", () => {
  assert.equal(confidenceBand(0.2), "LOW");
  assert.equal(confidenceBand(0.5), "MEDIUM");
  assert.equal(confidenceBand(0.9), "HIGH");
});

test("band boundaries are stable", () => {
  assert.equal(confidenceBand(0.35), "MEDIUM");
  assert.equal(confidenceBand(0.65), "HIGH");
});

test("absent confidence yields no band rather than a low one", () => {
  assert.equal(confidenceBand(null), null);
  assert.equal(confidenceBand(undefined), null);
  assert.notEqual(confidenceBand(null), "LOW");
});

test("every band has wording", () => {
  assert.ok(confidenceLabels.LOW);
  assert.ok(confidenceLabels.MEDIUM);
  assert.ok(confidenceLabels.HIGH);
});

/* ---------------------------------------------------------------- *
 * Signals and freshness
 * ---------------------------------------------------------------- */

test("signals keep the contract's own order rather than being ranked here", () => {
  const ordered = outlook({
    signals: [
      { signalKey: "a", label: "İlk", direction: "OPPOSING", strength: "WEAK" },
      {
        signalKey: "b",
        label: "İkinci",
        direction: "SUPPORTING",
        strength: "STRONG"
      }
    ]
  });
  assert.deepEqual(
    outlookSignals(ordered).map((signal) => signal.signalKey),
    ["a", "b"]
  );
});

test("an unseen direction degrades to neutral instead of failing", () => {
  const parsed = outlook({
    signals: [
      { signalKey: "a", label: "İlk", direction: "SIDEWAYS", strength: "WEAK" }
    ]
  });
  const [first] = outlookSignals(parsed);
  assert.ok(first);
  assert.equal(first.direction, "NEUTRAL");
});

test("absent signals yield an empty list rather than throwing", () => {
  assert.deepEqual(outlookSignals(outlook({ signals: null })), []);
});

test("a current reading carries no freshness note", () => {
  assert.equal(
    outlookFreshnessNotice(outlook({ freshness: { ageSeconds: 20, stale: false } })),
    null
  );
});

test("a stale reading says how old it is", () => {
  assert.equal(
    outlookFreshnessNotice(outlook({ freshness: { ageSeconds: 900, stale: true } })),
    "15 dk önceki okuma"
  );
});

test("a stale reading of unknown age still says it may not be current", () => {
  assert.match(
    String(outlookFreshnessNotice(outlook({ freshness: { stale: true } }))),
    /güncel olmayabilir/
  );
});

test("seconds are used below a minute", () => {
  assert.equal(
    outlookFreshnessNotice(outlook({ freshness: { ageSeconds: 30, stale: true } })),
    "30 sn önceki okuma"
  );
});
