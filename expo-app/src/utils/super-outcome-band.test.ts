import assert from "node:assert/strict";
import test from "node:test";
import { deriveSuperOutcomeBand } from "./super-outcome-band";

test("shows a current live score without confusing it with the decision score", () => {
  assert.deepEqual(
    deriveSuperOutcomeBand(
      { finalScore: "", result: "OPEN" },
      { awayScore: 2, elapsed: 78, homeScore: 1, status: "LIVE" }
    ),
    {
      accessibilityLabel: "Canlı skor 1 - 2, dakika 78",
      kind: "LIVE",
      label: "78' canlı",
      score: "1 - 2"
    }
  );
});

test("keeps half-time explicit while retaining the current minute", () => {
  const band = deriveSuperOutcomeBand(
    { finalScore: "", result: "OPEN" },
    { awayScore: 1, elapsed: 45, homeScore: 1, status: "HALF_TIME" }
  );
  assert.equal(band.kind, "LIVE");
  assert.equal(band.label, "45' · devre arası");
});

test("settled final score outranks a current-match snapshot", () => {
  const band = deriveSuperOutcomeBand(
    { finalScore: "2-1", result: "WON" },
    { awayScore: 0, elapsed: 70, homeScore: 1, status: "LIVE" }
  );
  assert.equal(band.kind, "SETTLED");
  assert.equal(band.score, "2 - 1");
  assert.equal(band.label, "biten skor");
});

test("does not invent a live result from a missing or non-live snapshot", () => {
  assert.equal(
    deriveSuperOutcomeBand({ finalScore: "", result: "OPEN" }).kind,
    "PENDING"
  );
  assert.equal(
    deriveSuperOutcomeBand(
      { finalScore: "", result: "OPEN" },
      { awayScore: 2, elapsed: 90, homeScore: 1, status: "FINISHED" }
    ).kind,
    "PENDING"
  );
});
