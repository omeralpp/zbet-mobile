import assert from "node:assert/strict";
import test from "node:test";
import { teamFormContextSchema, type TeamFormSide } from "@/src/api/schemas";
import {
  comparisonWidths,
  describeSideForAccessibility,
  formatRowValue,
  formRecord,
  isSmallSample,
  originNotice,
  resolveTeamFormState,
  sampleLabel,
  smallSampleNotice,
  teamFormRows
} from "./team-form-view";

function side(overrides: Partial<TeamFormSide> = {}): TeamFormSide {
  return {
    side: "HOME",
    wins: 3,
    draws: 1,
    losses: 1,
    matchesSampled: 5,
    formPpg: 2,
    venuePpg: 2.2,
    goalsForPerMatch: 1.8,
    goalsAgainstPerMatch: 0.8,
    bttsPercent: 40,
    over25Percent: 60,
    restDays: 4,
    ...overrides
  };
}

function context(overrides: Record<string, unknown> = {}) {
  return teamFormContextSchema.parse({
    matchKey: "2026-07-28:472910:20:45:00",
    contractVersion: "team-form.v1",
    origin: "SYNTHETIC",
    availability: "OK",
    minimumReliableSample: 5,
    home: side(),
    away: side({ side: "AWAY" as const }),
    ...overrides
  });
}

/* ---------------------------------------------------------------- *
 * State
 * ---------------------------------------------------------------- */

test("a populated payload is READY", () => {
  assert.equal(resolveTeamFormState(context()), "READY");
});

test("loading outranks every other state", () => {
  assert.equal(resolveTeamFormState(context(), true), "LOADING");
});

test("a missing payload is unavailable, never empty", () => {
  const state = resolveTeamFormState(undefined);
  assert.equal(state, "UNAVAILABLE");
  assert.notEqual(state, "EMPTY");
});

test("both sides absent is unavailable rather than empty", () => {
  assert.equal(
    resolveTeamFormState(context({ home: null, away: null })),
    "UNAVAILABLE"
  );
});

test("a retrieved payload where nobody has played yet is EMPTY", () => {
  const empty = context({
    home: side({ wins: 0, draws: 0, losses: 0, matchesSampled: 0 }),
    away: null
  });
  assert.equal(resolveTeamFormState(empty), "EMPTY");
});

test("an UNAVAILABLE availability is unavailable even with sides present", () => {
  assert.equal(
    resolveTeamFormState(context({ availability: "UNAVAILABLE" })),
    "UNAVAILABLE"
  );
});

/* ---------------------------------------------------------------- *
 * Small samples are stated, not smoothed over
 * ---------------------------------------------------------------- */

test("a declared LOW_SAMPLE payload is a small sample", () => {
  assert.equal(isSmallSample(context({ availability: "LOW_SAMPLE" })), true);
});

test("a side under the payload's own threshold is a small sample", () => {
  const thin = context({ home: side({ matchesSampled: 2 }) });
  assert.equal(isSmallSample(thin), true);
});

test("a full sample is not flagged", () => {
  assert.equal(isSmallSample(context()), false);
});

test("a zero sample is not mistaken for a thin one", () => {
  // Nothing played is an EMPTY state, not a caveat about reliability.
  const empty = context({
    home: side({ matchesSampled: 0 }),
    away: side({ side: "AWAY", matchesSampled: 0 })
  });
  assert.equal(isSmallSample(empty), false);
});

test("the notice names the real counts rather than saying limited data", () => {
  const thin = context({ home: side({ matchesSampled: 2 }) });
  const notice = smallSampleNotice(thin);
  assert.ok(notice);
  assert.match(notice, /2 maç/);
  assert.match(notice, /5 maç/);
});

test("no notice is produced for a full sample", () => {
  assert.equal(smallSampleNotice(context()), null);
});

/* ---------------------------------------------------------------- *
 * Synthetic data always says so
 * ---------------------------------------------------------------- */

test("synthetic data is labelled", () => {
  assert.match(String(originNotice("SYNTHETIC")), /Örnek veri/);
});

test("live data carries no badge, so the badge stays meaningful", () => {
  assert.equal(originNotice("LIVE"), null);
});

test("an unparseable origin degrades to synthetic rather than to live", () => {
  // The fail-safe direction: an unknown origin may never claim to be evidence.
  const parsed = context({ origin: "WHATEVER" });
  assert.equal(parsed.origin, "SYNTHETIC");
  assert.ok(originNotice(parsed.origin));
});

/* ---------------------------------------------------------------- *
 * Missing values are dropped, never printed as zero
 * ---------------------------------------------------------------- */

test("a row neither side can answer is omitted entirely", () => {
  const partial = context({
    home: side({ bttsPercent: null }),
    away: side({ side: "AWAY", bttsPercent: null })
  });
  assert.equal(
    teamFormRows(partial).some((row) => row.key === "btts"),
    false
  );
});

test("a row only one side can answer is still shown", () => {
  const partial = context({
    home: side({ bttsPercent: 40 }),
    away: side({ side: "AWAY", bttsPercent: null })
  });
  const row = teamFormRows(partial).find((entry) => entry.key === "btts");
  assert.ok(row);
  assert.equal(row.home, 40);
  assert.equal(row.away, null);
});

test("a null value renders as a dash, never as zero", () => {
  assert.equal(formatRowValue(null, "RATE"), "—");
  assert.notEqual(formatRowValue(null, "RATE"), "0.00");
});

test("a real zero still renders as zero", () => {
  assert.equal(formatRowValue(0, "RATE"), "0.00");
});

test("a side with no value gets no bar at all", () => {
  const widths = comparisonWidths({
    key: "btts",
    label: "KG Var",
    home: 40,
    away: null,
    format: "PERCENT",
    lowerIsBetter: false
  });
  assert.equal(widths.away, 0);
  assert.ok(widths.home > 0);
});

test("two equal values split the bar evenly", () => {
  const widths = comparisonWidths({
    key: "formPpg",
    label: "Form puanı",
    home: 2,
    away: 2,
    format: "RATE",
    lowerIsBetter: false
  });
  assert.equal(widths.home, 50);
  assert.equal(widths.away, 50);
});

test("two zeroes do not divide by zero", () => {
  const widths = comparisonWidths({
    key: "formPpg",
    label: "Form puanı",
    home: 0,
    away: 0,
    format: "RATE",
    lowerIsBetter: false
  });
  assert.ok(Number.isFinite(widths.home));
  assert.ok(Number.isFinite(widths.away));
});

/* ---------------------------------------------------------------- *
 * Wording
 * ---------------------------------------------------------------- */

test("the record reads in the app's own shorthand", () => {
  assert.equal(formRecord(side()), "3G 1B 1M");
});

test("a single-match sample is not pluralised wrongly", () => {
  assert.equal(sampleLabel(side({ matchesSampled: 1 })), "son 1 maç");
});

test("the accessible label names the team and the sample", () => {
  const label = describeSideForAccessibility(side(), "Brøndby");
  assert.match(label, /Brøndby/);
  assert.match(label, /son 5 maç/);
  assert.match(label, /3 galibiyet/);
});

test("an absent side still produces an honest accessible label", () => {
  assert.match(
    describeSideForAccessibility(null, "Brøndby"),
    /form bilgisi yok/
  );
});

test("percent and day formats carry their own unit", () => {
  assert.equal(formatRowValue(40, "PERCENT"), "%40");
  assert.equal(formatRowValue(4, "COUNT"), "4 gün");
});
