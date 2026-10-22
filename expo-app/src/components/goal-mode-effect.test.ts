import assert from "node:assert/strict";
import test from "node:test";
import retained from "../api/fixtures/match-journey-v4.json";
import { matchJourneySchema } from "../api/schemas";

test("V4 parses the authentic goal boundary with measured zero", () => {
  const journey = matchJourneySchema.parse(retained), goal = journey.points.at(-1)!;
  assert.equal(goal.eventEffect?.beforeCount, 11);
  assert.equal(goal.eventEffect?.afterCount, 8);
  assert.deepEqual(goal.eventEffect?.preModes, ["3-2", "4-1"]);
  assert.equal(goal.eventEffect?.blockedModeShare, 0);
});
test("V4 requires explicit effect fields and refuses invented event probabilities", () => {
  const mutate = (change: (copy: typeof retained) => void) => {
    const copy = structuredClone(retained); change(copy); return copy;
  };
  assert.equal(matchJourneySchema.safeParse(mutate(copy => { delete (copy.points[1] as {eventEffect?: unknown}).eventEffect; })).success, false);
  assert.equal(matchJourneySchema.safeParse(mutate(copy => { copy.points[1]!.eventEffect!.eventSurprise = .8 as never; })).success, false);
  assert.equal(matchJourneySchema.safeParse(mutate(copy => { copy.points[1]!.eventEffect!.blockedModeShare = .8; })).success, false);
  assert.equal(matchJourneySchema.safeParse(mutate(copy => { copy.points[1]!.eventEffect!.beforeSampleKey = "wrong"; })).success, false);
  assert.equal(matchJourneySchema.safeParse(mutate(copy => { copy.points[0]!.eventEffect = copy.points[1]!.eventEffect; })).success, false);
  assert.equal(matchJourneySchema.safeParse({...retained, contractVersion: "match-journey.v3"}).success, false);
});
test("unmeasured boundaries carry a reason and null arithmetic", () => {
  const copy = structuredClone(retained), point = copy.points[1]!;
  point.eventEffect = {...point.eventEffect!, measurementStatus: "UNMEASURED", missingReason: "CAPTURE_ORDER_UNPROVEN",
    preModes: [], postModes: [], beforeCount: null, afterCount: null,
    preModeCount: null, blockedModeCount: null, blockedModeShare: null} as never;
  const journey = matchJourneySchema.parse(copy);
  assert.equal(journey.points[1]?.eventEffect?.beforeCount, null);
  const invalid = structuredClone(journey);
  invalid.points[1]!.eventEffect!.blockedModeShare = 0;
  assert.equal(matchJourneySchema.safeParse(invalid).success, false);
});
