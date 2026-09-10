import assert from "node:assert/strict";
import test from "node:test";
import type { LiveContext, MatchPathContext } from "@/src/api/schemas";
import {
  latestMatchPathSignal,
  matchAnalysisEvents
} from "./match-analysis-events";

const path = {
  contractVersion: "match-path.v1",
  origin: "LIVE",
  availability: "OK",
  minimumReliableCohort: 30,
  initialCohortSize: 140,
  points: [
    {
      pointKey: "kickoff",
      label: "Başlangıç",
      kind: "KICK_OFF",
      minute: 0,
      cohortSize: 140,
      eventSurprise: null,
      stateNormality: 0.8,
      confidence: 0.8
    },
    {
      pointKey: "red-38",
      label: "Kırmızı kart",
      kind: "RED_CARD",
      minute: 38,
      cohortSize: 41,
      eventSurprise: 0.88,
      stateNormality: 0.27,
      confidence: 0.7
    }
  ]
} satisfies MatchPathContext;

const context = {
  availability: "OK",
  timeline: [
    {
      eventKey: "red-card",
      kind: "RED_CARD",
      minute: 38,
      side: "HOME",
      redCardType: "DIRECT_RED",
      player: { rawName: "Rice" }
    }
  ]
} as LiveContext;

test("a red card shared by both feeds becomes one scored analytical event", () => {
  const events = matchAnalysisEvents(path, context);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.kind, "RED_CARD");
  assert.equal(events[0]?.eventSurprise, 0.88);
  assert.equal(events[0]?.player, "Rice");
  assert.equal(events[0]?.side, "HOME");
});

test("a live red card remains visible when Match Path did not score it", () => {
  const events = matchAnalysisEvents(undefined, context);
  assert.equal(events.length, 1);
  assert.equal(events[0]?.kind, "RED_CARD");
  assert.equal(events[0]?.eventSurprise, null);
  assert.equal(events[0]?.stateNormality, null);
});

test("the latest measured Match Path point supplies the current normality summary", () => {
  const signal = latestMatchPathSignal(path);
  assert.equal(signal?.pointKey, "red-38");
  assert.equal(signal?.stateNormality, 0.27);
  assert.equal(signal?.cohortSize, 41);
});
