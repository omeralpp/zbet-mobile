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

test("a period scoreline is not classified as an event", () => {
  // match-path.js emits exactly three points - KICK_OFF, HALF_TIME, FULL_TIME -
  // and sets eventSurprise only on the last two, as 1 - p(score). That is the
  // improbability of the scoreline, not an occurrence that went against the
  // expected score, so it must never be listed under the event heading.
  const events = matchAnalysisEvents(
    {
      matchKey: "m",
      contractVersion: "match-path.v1",
      origin: "SYNTHETIC",
      availability: "OK",
      initialCohortSize: 200,
      minimumReliableCohort: 30,
      points: [
        { pointKey: "m:ko", label: "Başlangıç 0-0", kind: "KICK_OFF", minute: null, cohortSize: 200, eventSurprise: null, stateNormality: null, confidence: null },
        { pointKey: "m:ht", label: "İlk yarı 1-1", kind: "HALF_TIME", minute: null, cohortSize: 39, eventSurprise: 0.89, stateNormality: 0.11, confidence: 1 },
        { pointKey: "m:rc", label: "Kırmızı kart", kind: "RED_CARD", minute: 45, cohortSize: 39, eventSurprise: 0.5, stateNormality: 0.4, confidence: 1 }
      ]
    } as never,
    undefined
  );
  const halfTime = events.find((event) => event.pathKind === "HALF_TIME");
  const redCard = events.find((event) => event.pathKind === "RED_CARD");
  assert.equal(halfTime?.group, "PERIOD");
  assert.equal(redCard?.group, "EVENT");
  // The contract leaves period points without a minute, so the renderer needs
  // the kind to place them; it must never fall back to parsing the label.
  assert.equal(halfTime?.minute, null);
  assert.equal(halfTime?.pathKind, "HALF_TIME");
});
