import assert from "node:assert/strict";
import test from "node:test";
import type { SuperLog } from "@/src/api/schemas";
import type { VisibleEvent } from "./live-context-view";
import { buildMatchTimelineFeed } from "./match-timeline-feed";

function goal(minute: number, key = `goal-${minute}`): VisibleEvent {
  return {
    eventKey: key,
    kind: "GOAL",
    minute,
    minuteLabel: `${minute}'`,
    side: "HOME",
    scoreAfter: { home: 1, away: 0 }
  };
}

function decision(
  minute: number,
  key = `decision-${minute}`,
  createdAt = `2026-08-22T10:${String(minute).padStart(2, "0")}:00.000Z`
): SuperLog {
  return {
    key,
    matchKey: "match-1",
    matchName: "Ev - Deplasman",
    createdAt,
    elapsed: minute,
    selectedOdd: "Ms35a",
    rating: 2,
    reason: "SCORE_CHANGED",
    liveRate: 1.8,
    currentRate: null,
    result: "OPEN",
    profit: null,
    finalScore: "",
    pressureAdjustment: 0,
    stateAdjustment: 0
  };
}

test("interleaves match events and Super decisions by minute", () => {
  const result = buildMatchTimelineFeed(
    [goal(39), goal(43), goal(65)],
    [decision(66), decision(51)],
    "decision-66"
  );

  assert.deepEqual(
    result.map((row) => `${row.kind}:${row.minute}`),
    ["EVENT:39", "EVENT:43", "SUPER:51", "EVENT:65", "SUPER:66"]
  );
  assert.equal(result[3]?.kind === "EVENT" && result[3].isLatestEvent, true);
  assert.equal(result[4]?.kind === "SUPER" && result[4].isCurrent, true);
});

test("marks minute ties without inventing a second-level order", () => {
  const result = buildMatchTimelineFeed(
    [goal(51)],
    [
      decision(51, "later", "2026-08-22T10:51:20.000Z"),
      decision(51, "earlier", "2026-08-22T10:51:10.000Z")
    ]
  );

  assert.ok(result.every((row) => row.sharesMinute));
  assert.deepEqual(
    result.filter((row) => row.kind === "SUPER").map((row) => row.decision.key),
    ["earlier", "later"]
  );
});

test("keeps Super decisions visible when no live event source is available", () => {
  const result = buildMatchTimelineFeed([], [decision(51)]);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.kind, "SUPER");
});
