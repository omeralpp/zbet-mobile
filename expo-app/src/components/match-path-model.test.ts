import assert from "node:assert/strict";
import test from "node:test";
import history from "@/src/api/fixtures/btb-pressure-history-v1.json";
import decision from "@/src/api/fixtures/btb-rebuild-v1.json";
import { rebuildPressureHistorySchema } from "@/src/api/rebuild-statistics-schemas";
import { rebuildMatchSchema, type RebuildRecommendation } from "@/src/api/rebuild-schemas";
import type { MatchJourneyPoint } from "@/src/api/schemas";
import type { VisibleEvent } from "./live-context-view";
import { buildMatchPath, type PathInput } from "./match-path-model";

const observations = rebuildPressureHistorySchema.parse(history).observations;
const template = rebuildMatchSchema.parse(decision).history[0]!;
const record: RebuildRecommendation = { ...template, minute: 64, homeScore: 2, awayScore: 1, stars: 1, quote: "1.12",
  result: { state: "LOSS", revision: 2, net: "-1" } };
const finished = { homeTeam: "Bayern Münih", awayTeam: "Arsenal", status: "FINISHED", elapsed: 90, homeScore: 2, awayScore: 2 };

function input(patch: Partial<PathInput>): PathInput {
  return { match: finished, isRebuild: true, events: [], observations, records: [record], journeyPoints: [],
    halfTimeScore: "1–1", latestReading: null, ...patch };
}

test("an RB1 match tells its score story from observations and never draws a pool line", () => {
  const path = buildMatchPath(input({}));
  assert.deepEqual(path.chips.map((chip) => chip.label), ["0–0", "0–1", "1–1", "2–1", "2–2"]);
  assert.equal(path.chips.at(-1)?.current, true);
  assert.deepEqual(path.line, []);
  assert.match(path.lineNotice?.body ?? "", /henüz sunulmuyor/);
  assert.deepEqual(path.moments.filter((moment) => moment.kind === "GOAL").map((moment) => [moment.minute, moment.side]),
    [[25, "AWAY"], [35, "HOME"], [61, "HOME"], [82, "AWAY"]]);
  assert.equal(path.defaultKey, `btb:${record.decisionId}`);
  assert.equal(path.halfTimeLabel, "İY 1–1");
  const btb = path.moments.find((moment) => moment.kind === "BTB");
  assert.match(btb?.railSub ?? "", /★ · 1,12 · Kaybetti/);
  assert.match(btb?.lines.join(" ") ?? "", /-1,00 birim/);
});

test("provider events win over observations and are never doubled", () => {
  const goal = (eventKey: string, minute: number, side: "HOME" | "AWAY", home: number | null, away: number | null): VisibleEvent =>
    ({ eventKey, kind: "GOAL", minute, side, scoreAfter: home === null || away === null ? null : { home, away }, scorer: { rawName: "Oyuncu" } } as VisibleEvent);
  const path = buildMatchPath(input({ events: [goal("a", 24, "AWAY", 0, 1), goal("b", 34, "HOME", null, null)] }));
  const goals = path.moments.filter((moment) => moment.kind === "GOAL");
  assert.deepEqual(goals.map((moment) => [moment.minute, moment.key.split(":")[0]]),
    [[24, "event"], [34, "event"], [61, "observed"], [82, "observed"]]);
  assert.match(goals[2]?.lines.join(" ") ?? "", /sağlayıcıdan gelmedi/);
  assert.equal(goals[0]?.lines[0], "Oyuncu · Arsenal");
});

test("a live match selects its latest record at the current minute", () => {
  const path = buildMatchPath(input({ match: { ...finished, status: "LIVE", elapsed: 67, homeScore: 2, awayScore: 1 }, observations: observations.slice(0, 8),
    latestReading: { range: "62–64′", leader: "HOME", headline: "Bayern Münih baskın", homeText: "0,25", awayText: "0" } }));
  assert.equal(path.defaultKey, "latest");
  assert.equal(path.nowMinute, 67);
  const latest = path.moments.find((moment) => moment.key === "latest");
  assert.match(latest?.lines.join(" ") ?? "", /62–64′ · Bayern Münih baskın/);
  assert.equal(path.chips.at(-1)?.label, "2–1");
});

test("a legacy synthetic journey keeps its line and half-time pool step", () => {
  const point = (key: string, minute: number, level: number, referenceChange = false) =>
    ({ key, plotMinute: minute, level, referenceChange, kind: "SAMPLE", home: 0, away: 0 } as unknown as MatchJourneyPoint);
  const path = buildMatchPath(input({ isRebuild: false, observations: [], records: [], halfTimeScore: "0–0",
    journeyPoints: [point("p1", 0, 0.84), point("p2", 44, 0.62), point("p3", 45, 0.8, true), point("p4", 70, 0.55)] }));
  assert.equal(path.lineNotice, null);
  assert.ok(path.line.length >= 4);
  assert.equal(path.referenceMinute, 45);
  assert.ok(path.moments.some((moment) => moment.kind === "POOL"));
  assert.equal(path.headline, "Beklentiden uzaklaşıyor");
});

test("a match that has not started has nothing to select", () => {
  const path = buildMatchPath(input({ match: { ...finished, status: "NOT_STARTED", elapsed: 0, homeScore: 0, awayScore: 0 }, observations: [], records: [] }));
  assert.equal(path.defaultKey, null);
  assert.deepEqual(path.chips.map((chip) => chip.label), ["0–0"]);
  assert.equal(path.chips[0]?.current, false);
});
