import assert from "node:assert/strict";
import test from "node:test";
import { mockMatches, mockSuperLogs } from "@/src/api/mock-data";
import type { MatchDetail, MatchInsight, LiveContext } from "@/src/api/schemas";
import { appendJourney, favouriteSide, journeyDecisions, journeyEvents, journeyHeightAt, journeyMatchMinute, journeyMinute, journeyRuns, sampleJourney, scoreAnchor } from "./match-journey-v2";

const start = Date.parse("2026-09-06T15:00:00Z");
const distribution = [
  { rank: 1, score: "0-0", probability: 0.4 },
  { rank: 2, score: "1-0", probability: 0.3 },
  { rank: 3, score: "0-1", probability: 0.1 }
];
const insight: MatchInsight = { key: mockMatches[0]!.key, homeRedCards: 0, awayRedCards: 0,
  homeStandingPosition: null, awayStandingPosition: null,
  marketRates: [{ sort: 1, betType: "Ms1", kickoffRate: 1.5, liveRate: 1.7 }, { sort: 2, betType: "Ms2", kickoffRate: 4, liveRate: 3 }] };
function match(overrides: Partial<MatchDetail> = {}): MatchDetail {
  return { ...mockMatches[0]!, homeScore: 0, awayScore: 0, elapsed: 50, status: "LIVE",
    pressureSnapshotAt: new Date(start).toISOString(), totalPressure: 100, pressureDiff: 50,
    scoreDistribution: distribution, ...overrides };
}
function sample(minute: number, overrides: Partial<MatchDetail> = {}) {
  return sampleJourney(match({ elapsed: minute, ...overrides }), insight, start + (minute - 50) * 60_000)!;
}

test("rank one at 40% anchors at ordinary; share alone is not the axis", () => {
  assert.equal(scoreAnchor(distribution, 0, 0)?.level, 0.7);
  assert.equal(scoreAnchor(distribution, 1, 0)?.level, 0.4);
  assert.ok(scoreAnchor(distribution, 0, 1)!.level < 0.4);
});
test("hidden, missing, unranked, duplicate and impossible distributions are unknown", () => {
  assert.equal(scoreAnchor(distribution, 3, 0), null);
  assert.equal(scoreAnchor([], 0, 0), null);
  assert.equal(scoreAnchor([{ score: "0-0", probability: 0.4 }], 0, 0), null);
  assert.equal(scoreAnchor([...distribution, distribution[0]!], 0, 0), null);
  assert.equal(scoreAnchor([{ rank: 1, score: "0-0", probability: 0.9 }, { rank: 2, score: "1-0", probability: 0.8 }], 0, 0), null);
  assert.equal(scoreAnchor([{ rank: 1, score: "0-0", probability: 0.1 }, { rank: 2, score: "1-0", probability: 0.4 }], 0, 0), null);
});
test("absolute SORT is retained across hidden rows and rates are not renormalised", () => {
  const anchor = scoreAnchor([{ rank: 3, score: "0-0", probability: 0.2 }], 0, 0)!;
  assert.equal(anchor.rank, 3);
  assert.equal(anchor.probability, 0.2);
});
test("favourite pressure leaves baseline unchanged; underdog pressure only bends subsequent trend", () => {
  const first = sample(50, { pressureDiff: -50 });
  assert.equal(first.level, 0.7);
  const fav = appendJourney([first], sample(51));
  const under = appendJourney([first], sample(51, { pressureDiff: -50 }));
  assert.equal(fav.at(-1)!.level, 0.7);
  assert.ok(under.at(-1)!.level! < 0.7 && under.at(-1)!.level! >= 0.65);
});
test("changing card counts cannot add another pressure penalty", () => {
  assert.deepEqual(sample(50, { homeRedCards: 1 }), sample(50, { homeRedCards: 0 }));
});
test("missing, stale, zero-total and historical pressure never enters the trend", () => {
  for (const overrides of [{ pressureSnapshotAt: null }, { totalPressure: 0 }, { pressureSource: null },
    { status: "FINISHED" as const, elapsed: 90 }, { pressureSnapshotAt: "2026-09-01T00:00:00Z" }]) {
    assert.equal(sample(50, overrides).underdogPressure, null);
  }
  assert.equal(favouriteSide(undefined), null);
  assert.equal(favouriteSide({ ...insight, marketRates: insight.marketRates.map((rate) => ({ ...rate, kickoffRate: 2 })) }), null);
});
test("minute zero axis never invents observations before opening the screen", () => {
  const samples = appendJourney([], sample(50));
  assert.equal(samples.length, 1);
  assert.equal(journeyHeightAt(samples, 0), null);
  assert.equal(journeyHeightAt(samples, 49), null);
});
test("finished Portland-style 2-1 with cleared clock cannot be plotted at kickoff", () => {
  const finished = match({ status: "FINISHED", elapsed: 0, homeScore: 2, awayScore: 1,
    scoreDistribution: [{ rank: 1, score: "2-1", probability: 0.1833 }] });
  assert.equal(journeyMatchMinute(finished), null);
  assert.equal(sampleJourney(finished, insight, start), null);
  assert.equal(journeyMatchMinute({ ...finished, elapsed: 94 }), 94);
  assert.equal(journeyMatchMinute(match({ elapsed: 0, homeScore: 1 })), null);
  assert.equal(journeyMatchMinute(match({ elapsed: 0 })), 0);
  assert.equal(journeyMatchMinute(match({ status: "NOT_STARTED" })), null);
});
test("minute observations form one advancing line with Super positions on its segments", () => {
  let samples: ReturnType<typeof sample>[] = [];
  for (let minute = 50; minute <= 72; minute += 1) samples = appendJourney(samples, sample(minute));
  assert.equal(journeyRuns(samples).length, 1);
  assert.equal(journeyRuns(samples)[0]!.length, 23);
  const decisions = journeyDecisions([{ ...mockSuperLogs[0]!, matchKey: match().key, elapsed: 60 }], match().key, samples);
  assert.equal(decisions[0]!.level, samples[10]!.level);
  assert.equal(samples.at(-1)!.minute, 72);
});
test("refreshes, missing scores, clock/score corrections and long pauses preserve gaps", () => {
  const first = sample(50);
  assert.equal(appendJourney([first], first).length, 1);
  assert.equal(appendJourney([first], sample(51)).at(-1)!.connects, true);
  assert.equal(appendJourney([first], sample(54)).at(-1)!.connects, false);
  const missing = appendJourney([first], sample(51, { scoreDistribution: [] }));
  const recovered = appendJourney(missing, sample(52));
  assert.equal(journeyHeightAt(recovered, 51), null);
  assert.equal(journeyRuns(recovered).length, 2);
  assert.equal(appendJourney([sample(50, { homeScore: 1 })], sample(51)).at(-1)!.connects, false);
  assert.equal(appendJourney([first], { ...sample(49), observedAt: start + 1000 }).length, 1);
});
test("switching match resets all session samples", () => {
  const changed = appendJourney([sample(50)], sample(51, { key: "another-match" }));
  assert.equal(changed.length, 1);
  assert.equal(changed[0]!.connects, false);
});
test("Super markers retain star/market, share minutes, exclude invalid and other matches", () => {
  const log = { ...mockSuperLogs[0]!, matchKey: match().key };
  const decisions = journeyDecisions([
    { ...log, key: "old", elapsed: 46 }, { ...log, key: "one", elapsed: 50, rating: 3, selectedOdd: "Ms1" },
    { ...log, key: "two", elapsed: 50, rating: 5, selectedOdd: "Ms15a" },
    { ...log, key: "unknown", elapsed: Number.NaN }, { ...log, key: "other", matchKey: "other", elapsed: 50 }
  ], match().key, [sample(50)]);
  assert.equal(decisions.length, 3);
  assert.equal(decisions[0]!.level, null);
  assert.deepEqual(decisions.slice(1).map((decision) => [decision.rating, decision.market, decision.level]), [[3, "Ms1", 0.7], [5, "Ms15a", 0.7]]);
  assert.equal(journeyMinute(null), null);
  assert.equal(journeyMinute(90), 90);
});
test("events use PRE-event distribution and never retrofit the latest distribution", () => {
  const context = { availability: "OK", timeline: [{ eventKey: "goal", kind: "GOAL", minute: 51, side: "AWAY", scoreAfter: { home: 0, away: 1 } }] } as LiveContext;
  const before = sample(50);
  assert.equal(journeyEvents(context, [before])[0]!.direction, "AGAINST");
  assert.equal(journeyEvents(context, [sample(52)])[0]!.direction, "UNKNOWN");
  assert.equal(journeyEvents({ ...context, freshness: { stale: true } }, [before]).length, 0);
  assert.equal(journeyEvents(context, [before])[0]!.bucket, "50–54′");
});
test("a goal toward the high-rate outcome is not surprising; a favourite red adds no curve force", () => {
  const rows = [{ rank: 1, score: "1-0", probability: 0.6 }, { rank: 2, score: "0-0", probability: 0.2 }];
  const before = sample(50, { scoreDistribution: rows });
  const context = { availability: "OK", timeline: [
    { eventKey: "goal", kind: "GOAL", minute: 51, side: "HOME", scoreAfter: { home: 1, away: 0 } },
    { eventKey: "red", kind: "RED_CARD", minute: 51, side: "HOME" }
  ] } as LiveContext;
  assert.deepEqual(journeyEvents(context, [before]).map((event) => event.direction), ["TOWARD", "AGAINST"]);
  assert.equal(before.level, before.anchor!.level);
});
