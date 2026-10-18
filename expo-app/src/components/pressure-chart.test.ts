import assert from "node:assert/strict";
import test from "node:test";
import { mockMatches, mockRetainedJourney } from "../api/mock-data";
import { decisionContextSchema, type MatchDetail, type MatchJourney, type MatchJourneyPoint } from "../api/schemas";
import { readFile } from "node:fs/promises";
import { edgeSafeLabel, pressureHeadline, pressureLeader, pressureSeries } from "./pressure-chart";

const now = Date.parse("2026-10-18T14:39:00Z");
const pressure = (home: number, away: number, observedAt: string) => decisionContextSchema.parse({
  contractVersion: "decision-context.v2",
  recentPressure: { availability: "AVAILABLE", reason: null, units: "EST_SAMPLED_ACTIVITY_PER_MIN", policyId: "OBSERVED_PILOT_V1",
    estimated: true, observedEpoch: "E1", home, away, total: home + away, difference: home - away, intervalSeconds: 180,
    observedAt, sourceTimingKnown: false, xgCovered: false, stateRevision: null },
  decisionCoherence: { availability: "UNAVAILABLE", reason: "NOT_CAPTURED", stateRevision: null, quoteRevision: null } });
const match: MatchDetail = { ...mockMatches[0]!, homeTeam: "Kocaelispor", awayTeam: "Göztepe", elapsed: 79, status: "LIVE",
  homeScore: 0, awayScore: 2 };
const base = mockRetainedJourney(match.key);
const point = (patch: Partial<MatchJourneyPoint>): MatchJourneyPoint => ({ ...base.points[0]!, ...patch });
const journey = (points: MatchJourneyPoint[]): MatchJourney => ({ ...base, matchKey: match.key, points });

test("one bar per measured interval; repeated captures of the same observation collapse", () => {
  const series = pressureSeries(journey([
    point({ key: "a", plotMinute: 20, kind: "STATE", home: 0, away: 0, decisionContext: pressure(0.4, 0.2, "2026-10-18T13:20:00Z") }),
    point({ key: "b", plotMinute: 21, kind: "STATE", home: 0, away: 0, decisionContext: pressure(0.4, 0.2, "2026-10-18T13:20:00Z") }),
    point({ key: "c", plotMinute: 56, kind: "STATE", home: 0, away: 1, decisionContext: pressure(0.15, 0.7, "2026-10-18T13:56:00Z") }),
    point({ key: "d", plotMinute: 60, kind: "STATE", home: 0, away: 1 })
  ]), match, now);
  assert.deepEqual(series.samples.map(s => [s.minute, s.home, s.away]), [[21, 0.4, 0.2], [56, 0.15, 0.7]]);
  assert.equal(series.peak, 0.7);
  assert.equal(series.balance?.leader, "AWAY");
});

test("the fresh current interval joins a live match; stale or finished ones do not", () => {
  const live = { ...match, decisionContext: pressure(0.1, 0.5, "2026-10-18T14:38:00Z") };
  assert.deepEqual(pressureSeries(journey([]), live, now).latest, { key: "2026-10-18T14:38:00Z", minute: 79, home: 0.1, away: 0.5 });
  assert.equal(pressureSeries(journey([]), { ...live, status: "FINISHED" }, now).samples.length, 0);
  assert.equal(pressureSeries(journey([]), live, now + 241_000).samples.length, 0);
  assert.equal(pressureSeries({ ...journey([point({ key: "x", plotMinute: 10, decisionContext: pressure(1, 1, "2026-10-18T13:10:00Z") })]),
    matchKey: "other" }, match, now).samples.length, 0);
});

test("goals are marked on the scoring side's half", () => {
  const series = pressureSeries(journey([
    point({ key: "p0", plotMinute: 30, kind: "STATE", home: 0, away: 0 }),
    point({ key: "g1", plotMinute: 31, kind: "GOAL", home: 0, away: 1 }),
    point({ key: "g2", plotMinute: 70, kind: "GOAL", home: 1, away: 1 })
  ]), match, now);
  assert.deepEqual(series.goals.map(g => [g.minute, g.side]), [[31, "AWAY"], [70, "HOME"]]);
});

test("a mark's label flips inward instead of running past the chart edge", () => {
  assert.deepEqual(edgeSafeLabel(100, 8, 312, 22), { x: 108, anchor: "start" });
  assert.deepEqual(edgeSafeLabel(300, 8, 312, 22), { x: 292, anchor: "end" });
  assert.deepEqual(edgeSafeLabel(20, 8, 40, 22), { x: 28, anchor: "start" });
});

test("chart labels above or beside the plot stay inside their SVG", async () => {
  // Owner, 2026-10-18: the "Yeni havuz" label was cut by the top of Maçın Yolu.
  const journey = await readFile(new URL("./MatchJourneyChart.tsx", import.meta.url), "utf8");
  const top = Number(/const TOP=(\d+)/.exec(journey)?.[1]);
  assert.ok(top - 12 >= 12, "a 12px label baseline needs a full line of room above the plot");
  assert.match(journey, /y=\{journeyTopLabelY\}[^>]*>Yeni havuz/);
  const pressure = await readFile(new URL("./PressureChart.tsx", import.meta.url), "utf8");
  const lanes = /HOME_GOAL_Y = (\d+), TOP = (\d+), PLOT_BOTTOM = (\d+), AWAY_GOAL_Y = (\d+), AXIS_Y = (\d+)/.exec(pressure)!.slice(1).map(Number);
  const height = Number(/const HEIGHT = (\d+)/.exec(pressure)?.[1]);
  const [homeGoal, plotTop, plotBottom, awayGoal, axis] = lanes as [number, number, number, number, number];
  assert.ok(homeGoal - 5 >= 0 && homeGoal + 5 < plotTop, "home goals sit above the bars");
  assert.ok(awayGoal - 5 > plotBottom && awayGoal + 5 < axis - 9, "away goals sit between the bars and the minute axis");
  assert.ok(axis <= height - 4, "minute labels stay inside the SVG");
});

test("the headline names the pressing side in plain shares", () => {
  assert.equal(pressureHeadline(pressureLeader(0.15, 0.7), match), "Göztepe baskın · %82");
  assert.equal(pressureHeadline(pressureLeader(0.7, 0.1), match), "Kocaelispor baskın · %88");
  assert.equal(pressureHeadline(pressureLeader(0.53, 0.47), match), "Dengede · ev %53 · deplasman %47");
  assert.equal(pressureHeadline(pressureLeader(0, 0), match), "Belirgin baskı yok");
  assert.equal(pressureHeadline(null, match), null);
});
