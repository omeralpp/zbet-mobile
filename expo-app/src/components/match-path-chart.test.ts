import assert from "node:assert/strict";
import test from "node:test";
import { matchPathContextSchema } from "@/src/api/schemas";
import {
  clampUnit,
  cohortNarrowingSummary,
  describeNodeForAccessibility,
  isNotableSurprise,
  lowCohortNotice,
  matchPathNodes,
  mostSurprisingEvent,
  normalityRuns,
  notableSurpriseThreshold,
  pathVerdict,
  resolveMatchPathState,
  surpriseEvents,
  surpriseHeadline,
  verdictLabels,
  type MatchPathNode
} from "./match-path-chart";

/**
 * Indexed access under `noUncheckedIndexedAccess`.
 *
 * Asserting presence here rather than at every call site keeps each test about
 * the rule it is checking instead of about array bounds.
 */
function at(nodes: MatchPathNode[], index: number): MatchPathNode {
  const node = nodes[index];
  assert.ok(node, `expected a node at index ${index}`);
  return node;
}

function point(overrides: Record<string, unknown> = {}) {
  return {
    pointKey: "kickoff",
    label: "Başlangıç",
    kind: "KICK_OFF",
    minute: 0,
    cohortSize: 200,
    eventSurprise: null,
    stateNormality: 0.86,
    confidence: 0.82,
    ...overrides
  };
}

function context(overrides: Record<string, unknown> = {}) {
  return matchPathContextSchema.parse({
    matchKey: "2026-07-28:472910:20:45:00",
    contractVersion: "match-path.v1",
    origin: "SYNTHETIC",
    availability: "OK",
    minimumReliableCohort: 30,
    initialCohortSize: 200,
    points: [point()],
    ...overrides
  });
}

/** The owner's worked example, as the fixture serves it. */
function workedExample() {
  return context({
    points: [
      point({ cohortSize: 200, stateNormality: 0.86, eventSurprise: null }),
      point({
        pointKey: "ht",
        label: "Devre arası",
        kind: "HALF_TIME",
        minute: 45,
        cohortSize: 100,
        eventSurprise: 0.18,
        stateNormality: 0.74,
        confidence: 0.7
      }),
      point({
        pointKey: "away-goal-60",
        label: "Deplasman golü",
        kind: "GOAL",
        minute: 60,
        cohortSize: 30,
        eventSurprise: 0.79,
        stateNormality: 0.31,
        confidence: 0.44
      }),
      point({
        pointKey: "state-75",
        label: "Maç durumu",
        kind: "STATE",
        minute: 75,
        cohortSize: 24,
        eventSurprise: null,
        stateNormality: 0.35,
        confidence: 0.38
      })
    ]
  });
}

/* ---------------------------------------------------------------- *
 * The null / [] distinction, as elsewhere in this app
 * ---------------------------------------------------------------- */

test("an unretrieved path is UNAVAILABLE, never empty", () => {
  const state = resolveMatchPathState(context({ points: null }));
  assert.equal(state, "UNAVAILABLE");
  assert.notEqual(state, "EMPTY");
});

test("a retrieved empty path is EMPTY, not unavailable", () => {
  assert.equal(resolveMatchPathState(context({ points: [] })), "EMPTY");
});

test("a missing payload is unavailable", () => {
  assert.equal(resolveMatchPathState(undefined), "UNAVAILABLE");
});

test("loading outranks every other state", () => {
  assert.equal(resolveMatchPathState(context({ points: null }), true), "LOADING");
});

/* ---------------------------------------------------------------- *
 * A shrinking cohort is not a surprise signal
 *
 * This is the rule the module exists to enforce, so it is tested from several
 * directions rather than once.
 * ---------------------------------------------------------------- */

test("a point given no surprise value never acquires one from the cohort drop", () => {
  const nodes = matchPathNodes(
    context({
      points: [
        point({ cohortSize: 200 }),
        point({
          pointKey: "ht",
          label: "Devre arası",
          kind: "HALF_TIME",
          minute: 45,
          // The cohort halves here, and the contract reports no surprise at all.
          cohortSize: 100,
          eventSurprise: null
        })
      ]
    })
  );
  assert.equal(at(nodes, 1).cohortSize, 100);
  assert.equal(at(nodes, 1).eventSurprise, null);
});

test("identical surprise survives wildly different cohort sizes", () => {
  const wide = matchPathNodes(
    context({ points: [point({ cohortSize: 500, eventSurprise: 0.4 })] })
  );
  const narrow = matchPathNodes(
    context({
      initialCohortSize: 12,
      points: [point({ cohortSize: 3, eventSurprise: 0.4 })]
    })
  );
  assert.equal(at(wide, 0).eventSurprise, at(narrow, 0).eventSurprise);
});

test("the half-time cohort halves while its surprise stays low", () => {
  // The owner's example in one assertion: narrowing and surprise are unrelated.
  const nodes = matchPathNodes(workedExample());
  assert.equal(at(nodes, 1).cohortSize, 100);
  assert.equal(at(nodes, 1).eventSurprise, 0.18);
  assert.equal(isNotableSurprise(at(nodes, 1)), false);
});

test("the away goal is the surprising step, and it is the goal that says so", () => {
  const nodes = matchPathNodes(workedExample());
  assert.equal(at(nodes, 2).eventSurprise, 0.79);
  assert.equal(isNotableSurprise(at(nodes, 2)), true);
});

test("the low-cohort caveat says shrinkage alone is not a surprise", () => {
  const notice = lowCohortNotice(
    context({ points: [point({ cohortSize: 8, pointKey: "late" })] })
  );
  assert.ok(notice);
  assert.match(notice, /sürpriz anlamına gelmez/);
});

test("the surprise headline reports the cohort without blaming the event for it", () => {
  const headline = surpriseHeadline(workedExample());
  assert.ok(headline);
  assert.match(headline, /Deplasman golü/);
  assert.match(headline, /200 benzer maçtan 30/);
  assert.doesNotMatch(headline, /çünkü|nedeniyle|yüzünden/);
});

/* ---------------------------------------------------------------- *
 * State is a line, surprise is a marker
 * ---------------------------------------------------------------- */

test("normality drives the vertical position, with normal at the top", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ stateNormality: 1 })] })
  );
  assert.equal(at(nodes, 0).y, 0);
});

test("an entirely unusual state sits at the bottom", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ stateNormality: 0 })] })
  );
  assert.equal(at(nodes, 0).y, 1);
});

test("an unmeasured state has no position at all", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ stateNormality: null })] })
  );
  assert.equal(at(nodes, 0).y, null);
});

test("the line breaks across an unmeasured point rather than bridging it", () => {
  const nodes = matchPathNodes(
    context({
      points: [
        point({ pointKey: "a", stateNormality: 0.9 }),
        point({ pointKey: "b", stateNormality: null }),
        point({ pointKey: "c", stateNormality: 0.4 })
      ]
    })
  );
  const runs = normalityRuns(nodes);
  assert.equal(runs.length, 2);
  assert.deepEqual(
    runs.map((run) => run.map((node) => node.pointKey)),
    [["a"], ["c"]]
  );
});

test("a fully measured path is one unbroken run", () => {
  const runs = normalityRuns(matchPathNodes(workedExample()));
  assert.equal(runs.length, 1);
  assert.equal(runs[0]?.length, 4);
});

test("only scored points become surprise markers", () => {
  const events = surpriseEvents(matchPathNodes(workedExample()));
  assert.deepEqual(
    events.map((node) => node.pointKey),
    ["ht", "away-goal-60"]
  );
});

test("nodes are spaced evenly across the plot", () => {
  const nodes = matchPathNodes(workedExample());
  assert.equal(at(nodes, 0).x, 0);
  assert.equal(at(nodes, 3).x, 1);
  assert.ok(Math.abs(at(nodes, 1).x - 1 / 3) < 1e-9);
});

test("a single point is centred rather than pinned to the left edge", () => {
  assert.equal(at(matchPathNodes(context()), 0).x, 0.5);
});

/* ---------------------------------------------------------------- *
 * The verdict
 * ---------------------------------------------------------------- */

test("a path with a notable event reads as a surprise", () => {
  assert.equal(pathVerdict(matchPathNodes(workedExample())), "SURPRISE");
});

test("a path scored throughout with low surprise reads as typical", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ eventSurprise: 0.2 })] })
  );
  assert.equal(pathVerdict(nodes), "TYPICAL");
});

test("a path nobody scored is unmeasured, never quietly called typical", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ eventSurprise: null })] })
  );
  assert.equal(pathVerdict(nodes), "UNMEASURED");
  assert.notEqual(pathVerdict(nodes), "TYPICAL");
});

test("an unmeasured path carries no reassuring badge", () => {
  assert.equal(verdictLabels.UNMEASURED, null);
  assert.ok(verdictLabels.SURPRISE);
  assert.ok(verdictLabels.TYPICAL);
});

test("the notable threshold is inclusive at its boundary", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ eventSurprise: notableSurpriseThreshold })] })
  );
  assert.equal(isNotableSurprise(at(nodes, 0)), true);
});

test("an unscored node is never notable", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ eventSurprise: null })] })
  );
  assert.equal(isNotableSurprise(at(nodes, 0)), false);
});

test("the most surprising event wins, and a tie resolves to the later one", () => {
  const nodes = matchPathNodes(
    context({
      points: [
        point({ pointKey: "a", eventSurprise: 0.7 }),
        point({ pointKey: "b", eventSurprise: 0.7 })
      ]
    })
  );
  assert.equal(mostSurprisingEvent(nodes)?.pointKey, "b");
});

test("no headline is produced when nothing crossed the threshold", () => {
  assert.equal(
    surpriseHeadline(context({ points: [point({ eventSurprise: 0.2 })] })),
    null
  );
});

/* ---------------------------------------------------------------- *
 * Cohort presentation
 * ---------------------------------------------------------------- */

test("points under the published threshold are marked, not hidden", () => {
  const nodes = matchPathNodes(workedExample());
  assert.equal(at(nodes, 0).belowReliableCohort, false);
  assert.equal(at(nodes, 3).belowReliableCohort, true);
  assert.equal(at(nodes, 3).cohortSize, 24);
});

test("the summary describes the narrowing without judging it", () => {
  assert.equal(
    cohortNarrowingSummary(workedExample()),
    "200 benzer maçtan 24 tanesi bu yolu izledi"
  );
});

test("no summary is invented for an unretrieved path", () => {
  assert.equal(cohortNarrowingSummary(context({ points: null })), null);
});

test("a healthy cohort raises no caveat", () => {
  assert.equal(lowCohortNotice(context()), null);
});

test("a declared LOW_SAMPLE payload raises the caveat even above the threshold", () => {
  assert.ok(lowCohortNotice(context({ availability: "LOW_SAMPLE" })));
});

test("an unseen point kind degrades to UNKNOWN instead of failing the screen", () => {
  const nodes = matchPathNodes(
    context({ points: [point({ kind: "TELEPORT" })] })
  );
  assert.equal(at(nodes, 0).kind, "UNKNOWN");
});

test("unit values are clamped rather than allowed to escape the plot", () => {
  assert.equal(clampUnit(1.4), 1);
  assert.equal(clampUnit(-0.2), 0);
  assert.equal(clampUnit(Number.NaN), 0);
});

/* ---------------------------------------------------------------- *
 * Accessibility
 * ---------------------------------------------------------------- */

test("the accessible label carries both signals and the cohort", () => {
  const nodes = matchPathNodes(workedExample());
  const label = describeNodeForAccessibility(at(nodes, 2));
  assert.match(label, /Deplasman golü/);
  assert.match(label, /30 benzer maç/);
  assert.match(label, /Olay sürprizi 79%/);
  assert.match(label, /Durum normalliği 31%/);
  assert.match(label, /güven 44%/);
});

test("an unscored node mentions no surprise at all", () => {
  const nodes = matchPathNodes(workedExample());
  assert.doesNotMatch(describeNodeForAccessibility(at(nodes, 3)), /sürprizi/);
});

test("an unmeasured state says so rather than being omitted", () => {
  // Silence would read as "ordinary". It is not; it was never measured.
  const nodes = matchPathNodes(
    context({ points: [point({ stateNormality: null })] })
  );
  assert.match(describeNodeForAccessibility(at(nodes, 0)), /ölçülmedi/);
});
