import assert from "node:assert/strict";
import test from "node:test";
import type { SuperLog } from "@/src/api/schemas";
import { relatedSuperDecisions } from "./related-super-decisions";

function decision(overrides: Partial<SuperLog> = {}): SuperLog {
  return {
    key: "decision-1",
    matchKey: "match-1",
    matchName: "Ev - Deplasman",
    createdAt: "2026-08-04T10:00:00.000Z",
    elapsed: 52,
    selectedOdd: "Ms1",
    rating: 3,
    reason: "SCORE_CHANGED",
    liveRate: 1.8,
    currentRate: null,
    result: "OPEN",
    profit: null,
    finalScore: "",
    pressureAdjustment: 0,
    stateAdjustment: 0,
    ...overrides
  };
}

test("keeps only unique Super decisions for the opened match", () => {
  const first = decision();
  const later = decision({
    key: "decision-2",
    createdAt: "2026-08-04T10:10:00.000Z",
    elapsed: 61,
    selectedOdd: "Ms1X",
    rating: 4
  });

  const result = relatedSuperDecisions(
    [first, later, first, decision({ key: "other", matchKey: "match-2" })],
    "match-1"
  );

  assert.deepEqual(result.map((row) => row.key), ["decision-2", "decision-1"]);
});
