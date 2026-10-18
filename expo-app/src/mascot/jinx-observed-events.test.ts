import assert from "node:assert/strict";
import test from "node:test";
import type { AnalysisContext, MatchJourneyPoint } from "@/src/api/schemas";
import { mockMatches, mockRetainedJourney } from "@/src/api/mock-data";
import { createJinxMotionState, jinxMotionReducer } from "./jinx-motion";
import { observedJinxEvent } from "./jinx-observed-events";

const matchKey = "observed-match";
const epoch = Date.parse("2026-10-18T12:00:00Z");
const at = (seconds: number) => new Date(epoch + seconds * 1000).toISOString();
const now = epoch + 60_000;
const seedJourney = mockRetainedJourney(matchKey);
function point(key: string, captured: number, kind: MatchJourneyPoint["kind"] = "STATE", home = 0, away = 0,
  status = "LIVE"): MatchJourneyPoint {
  return { ...seedJourney.points[0]!, key, capturedAt: at(captured), kind, home, away, status };
}
function fixture(points: MatchJourneyPoint[], options: {
  acquired?: number; expires?: number; home?: number; away?: number;
  status?: AnalysisContext["sources"]["matchDetail"]["status"]; revision?: string; key?: string;
} = {}): AnalysisContext {
  const acquired = options.acquired ?? 50, key = options.key ?? matchKey;
  return {
    contractVersion: "btb-analysis-context.v1", matchKey: key, snapshotId: `snapshot-${acquired}`,
    evidenceRevision: options.revision ?? `revision-${acquired}`, selectionKey: "selection",
    acquiredAt: at(acquired), expiresAt: at(options.expires ?? acquired + 120), valueEvidence: null,
    sourceAvailability: { matchDetail: "OK", matchJourney: "OK", insight: "UNAVAILABLE", periodScore: "UNAVAILABLE",
      leagueContext: "UNAVAILABLE", superLogs: "UNAVAILABLE", liveContext: "UNAVAILABLE", teamForm: "UNAVAILABLE", matchPath: "UNAVAILABLE" },
    sources: {
      matchDetail: { ...mockMatches[0]!, key, homeScore: options.home ?? 0, awayScore: options.away ?? 0,
        status: options.status ?? "LIVE", currentMatchRecord: true },
      matchJourney: { ...seedJourney, matchKey: key, origin: "LIVE", availability: "OK", capturedAt: at(acquired), points },
      insight: null, periodScore: null, leagueContext: null, superLogs: null, liveContext: null, teamForm: null, matchPath: null
    }
  };
}
const baseline = () => fixture([point("state", 20)], { acquired: 30 });
const goal = () => fixture([point("state", 20), point("goal-1", 45, "GOAL", 1)], { home: 1 });

test("first snapshot and navigation never replay retained goals", () => {
  assert.equal(observedJinxEvent(undefined, goal(), now), undefined);
  assert.equal(observedJinxEvent(baseline(), fixture(goal().sources.matchJourney!.points, { key: "other", home: 1 }), now), undefined);
  assert.equal(observedJinxEvent(baseline(), undefined, now), undefined);
});

test("a newly captured explicit goal must agree with the core and carries stable context and identity", () => {
  const action = observedJinxEvent(baseline(), goal(), now);
  assert.deepEqual(action, { type: "event", context: { matchKey, revision: "revision-50" }, eventId: "goal-1", kind: "GOAL", verified: true });
  const current = goal();
  assert.equal(observedJinxEvent(current, { ...current, snapshotId: "poll", evidenceRevision: "poll-revision" }, now), undefined);
  const state = createJinxMotionState(action!.context);
  const reacted = jinxMotionReducer(state, action!);
  assert.equal(reacted.scene, "goal");
  assert.equal(jinxMotionReducer(reacted, action!), reacted);
});

test("score movement, new state rows and same-score relabelled goals cannot manufacture a reaction", () => {
  assert.equal(observedJinxEvent(baseline(), fixture([point("state", 20), point("new-state", 45, "STATE", 1)], { home: 1 }), now), undefined);
  const sameScore = fixture([point("state", 20), point("claimed-goal", 45, "GOAL")]);
  assert.equal(observedJinxEvent(baseline(), sameScore, now), undefined);
  const wrongScore = goal();
  wrongScore.sources.matchDetail.homeScore = 2;
  assert.equal(observedJinxEvent(baseline(), wrongScore, now), undefined);
});

test("expired, future, invalid and unverified snapshots are refused on either side", () => {
  for (const patch of [
    { expiresAt: at(60) }, { acquiredAt: at(61) }, { acquiredAt: "bad" }, { evidenceRevision: "" }
  ]) {
    assert.equal(observedJinxEvent(baseline(), { ...goal(), ...patch }, now), undefined);
    assert.equal(observedJinxEvent({ ...baseline(), ...patch }, goal(), now), undefined);
  }
  const unverified = goal(); unverified.sources.matchDetail.currentMatchRecord = false;
  assert.equal(observedJinxEvent(baseline(), unverified, now), undefined);
  const oldBaseline = baseline(); oldBaseline.sources.matchDetail.currentMatchRecord = false;
  assert.equal(observedJinxEvent(oldBaseline, goal(), now), undefined);
});

test("source-state conflicts, foreign identities, unavailable journeys and synthetic origins are refused", () => {
  const packets = [goal(), goal(), goal(), goal(), goal(), goal()];
  packets[0]!.sourceAvailability.matchJourney = "UNAVAILABLE";
  packets[1]!.sourceAvailability.insight = "OK"; // Null source cannot claim to be available.
  packets[2]!.sources.matchJourney!.matchKey = "foreign";
  packets[3]!.sources.matchJourney!.availability = "UNAVAILABLE";
  packets[4]!.sources.matchJourney!.origin = "SYNTHETIC";
  packets[5]!.sources.matchDetail.key = "foreign";
  for (const packet of packets) assert.equal(observedJinxEvent(baseline(), packet, now), undefined);
});

test("capture freshness follows the snapshot's own TTL, with no fixed event-age threshold", () => {
  const shortTtl = goal(); shortTtl.acquiredAt = at(50); shortTtl.expiresAt = at(65);
  // The 45-second capture is exactly 15 seconds old at now: within this TTL.
  assert.equal(observedJinxEvent(baseline(), shortTtl, now)?.kind, "GOAL");
  shortTtl.sources.matchJourney!.points[1]!.capturedAt = at(44);
  assert.equal(observedJinxEvent(baseline(), shortTtl, now), undefined);
  for (const capture of [null, "invalid", at(51), at(19), at(20)]) {
    const packet = goal(); packet.sources.matchJourney!.points[1]!.capturedAt = capture;
    assert.equal(observedJinxEvent(baseline(), packet, now), undefined);
  }
});

test("ambiguous keys, out-of-order records and a baseline that conflicts with the previous core are refused", () => {
  const duplicate = goal(); duplicate.sources.matchJourney!.points[1]!.key = "state";
  assert.equal(observedJinxEvent(baseline(), duplicate, now), undefined);
  const reversed = goal(); reversed.sources.matchJourney!.points.reverse();
  assert.equal(observedJinxEvent(baseline(), reversed, now), undefined);
  const conflict = baseline(); conflict.sources.matchDetail.awayScore = 1;
  assert.equal(observedJinxEvent(conflict, goal(), now), undefined);
  const olderResponse = goal(); olderResponse.acquiredAt = at(25);
  assert.equal(observedJinxEvent(baseline(), olderResponse, now), undefined);
});

test("a core score decrease cancels even before the journey captures the corrected score", () => {
  const previous = fixture([point("state", 20, "STATE", 2)], { acquired: 30, home: 2 });
  const current = fixture([point("state", 20, "STATE", 2)], { home: 1 });
  const action = observedJinxEvent(previous, current, now);
  assert.equal(action?.kind, "SCORE_CORRECTION");
  assert.equal(action?.eventId, "correction:revision-50:1-0");
  assert.deepEqual(action, observedJinxEvent(previous, { ...current, snapshotId: "different-response" }, now));
  const reaction = jinxMotionReducer(createJinxMotionState(action!.context), action!);
  assert.equal(reaction.scene, "waiting");
});

test("a fresh explicit correction takes precedence over a goal and does not repeat on polling", () => {
  const current = fixture([point("state", 20), point("goal-1", 40, "GOAL", 1), point("correction-1", 45, "CORRECTION", 1)], { home: 1 });
  assert.equal(observedJinxEvent(baseline(), current, now)?.kind, "SCORE_CORRECTION");
  assert.equal(observedJinxEvent(current, { ...current, evidenceRevision: "next-poll" }, now), undefined);
  const intermediate = fixture([point("state", 20), point("correction-before-goal", 40, "CORRECTION"),
    point("goal-after-correction", 45, "GOAL", 1)], { home: 1 });
  assert.equal(observedJinxEvent(baseline(), intermediate, now)?.kind, "SCORE_CORRECTION");
});

test("half time requires a newly captured explicit matching point and a live-to-half-time transition", () => {
  const current = fixture([point("state", 20), point("half-time-1", 45, "HALF_TIME", 0, 0, "HALF_TIME")], { status: "HALF_TIME" });
  const action = observedJinxEvent(baseline(), current, now);
  assert.equal(action?.kind, "HALF_TIME"); assert.equal(action?.eventId, "half-time-1");
  assert.equal(observedJinxEvent(current, { ...current, evidenceRevision: "poll" }, now), undefined);
  assert.equal(observedJinxEvent(baseline(), fixture([point("state", 20)], { status: "HALF_TIME" }), now), undefined);
  current.sources.matchDetail.status = "LIVE";
  assert.equal(observedJinxEvent(baseline(), current, now), undefined);
});
