import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import firstFixture from "../api/fixtures/btb-rebuild-v1.json";
import reportFixture from "../api/fixtures/btb-rebuild-report-v1.json";
import { rebuildCohortsReportSchema, rebuildMatchSchema, rebuildReportSchema } from "../api/rebuild-schemas";
import {
  canStepDay,
  choiceForDay,
  evidenceCompact,
  finalScoreText,
  fixtureLine,
  leagueText,
  logSummary,
  namesUnverified,
  needsWindow,
  periodTitle,
  resolvePeriod,
  sharedCohort,
  shiftDay
} from "../utils/rebuild-log";

// NXT-OBS-242: Super · Karar günlüğü batch (periods, frozen facts, summary, report details).
const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const today = "2026-11-03";

function cohortsReport(match?: unknown, state: "WIN" | "PENDING" = "WIN") {
  const base = rebuildReportSchema.parse(reportFixture), first = rebuildMatchSchema.parse(firstFixture).history[0]!;
  const result = state === "WIN" ? { state, revision: 2, net: "1.12" } : { state, revision: 1, net: null };
  return { ...base, contractVersion: "btb-rebuild-report.v2", cohorts: [{ id: "A".repeat(64), label: "77A · havuz yolu", current: true,
    firstDecisionAt: first.publishedAt, periods: base.periods, learning: null }],
  recommendations: [{ ...first, result, cohortId: "A".repeat(64), ...(match === undefined ? {} : { match }) }] };
}

test("report records accept the opt-in frozen facts, and a BFF without them still parses", () => {
  const facts = { names: "SETTLEMENT_EVIDENCE", league: "İspanya La Liga", kickoff: "23:00", finalScore: { home: 2, away: 1 } };
  assert.deepEqual(rebuildCohortsReportSchema.parse(cohortsReport(facts)).recommendations[0]?.match, facts);
  assert.equal(rebuildCohortsReportSchema.parse(cohortsReport()).recommendations[0]?.match, undefined);
  for (const bad of [{ ...facts, names: "GUESSED" }, { ...facts, kickoff: "23:00:00" }, { ...facts, extra: true }, { ...facts, finalScore: { home: -1, away: 0 } }])
    assert.equal(rebuildCohortsReportSchema.safeParse(cohortsReport(bad)).success, false, JSON.stringify(bad));
  // A settled score belongs to a won or lost result only.
  assert.equal(rebuildCohortsReportSchema.safeParse(cohortsReport(facts, "PENDING")).success, false);
  assert.equal(rebuildCohortsReportSchema.safeParse(cohortsReport({ ...facts, finalScore: null }, "PENDING")).success, true);
});

test("the summary carries the report's own ROI and hit rate, and a star scope applies the same definitions", () => {
  const period = rebuildReportSchema.parse(reportFixture).periods[0]!;
  const star = (stars: number, wins: number, losses: number, net: string) => ({ ...period, stars, wins, losses, settled: wins + losses, net, pending: 0, recommendations: wins + losses });
  const scoped = { ...period, roi: -0.25, hitRate: 0.5, byStar: [star(2, 1, 1, "-0.5"), star(3, 2, 1, "0.5"), star(4, 0, 1, "-1")] };
  const whole = logSummary(scoped, null);
  assert.equal(whole.roi, -0.25); assert.equal(whole.hitRate, 0.5);
  const threePlus = logSummary(scoped, 3);
  assert.deepEqual([threePlus.wins, threePlus.losses, threePlus.settled, threePlus.net], [2, 2, 4, "-0.5"]);
  assert.equal(threePlus.roi, -0.125); assert.equal(threePlus.hitRate, 0.5);
  const empty = logSummary({ ...scoped, byStar: [star(3, 0, 0, "0")] }, 3);
  assert.equal(empty.roi, null); assert.equal(empty.hitRate, null);
});

test("periods follow the Istanbul calendar: relative choices roll over, stepped days stay, windows read their own report", () => {
  assert.deepEqual(resolvePeriod({ kind: "today" }, today), { days: 1, through: today });
  assert.deepEqual(resolvePeriod({ kind: "yesterday" }, today), { days: 1, through: "2026-11-02" });
  assert.deepEqual(resolvePeriod({ kind: "last", days: 30 }, today), { days: 30, through: today });
  assert.deepEqual(resolvePeriod({ kind: "day", date: "2026-10-31" }, today), { days: 1, through: "2026-10-31" });
  assert.deepEqual(choiceForDay(today, today), { kind: "today" });
  assert.deepEqual(choiceForDay("2026-11-02", today), { kind: "yesterday" });
  assert.deepEqual(choiceForDay("2026-11-01", today), { kind: "day", date: "2026-11-01" });
  assert.equal(shiftDay("2026-01-01", -1), "2025-12-31"); assert.equal(shiftDay("2026-10-31", 1), "2026-11-01");
  assert.equal(needsWindow({ days: 1, through: today }, today), false);
  assert.equal(needsWindow({ days: 1, through: "2026-11-02" }, today), false);
  assert.equal(needsWindow({ days: 1, through: "2026-11-01" }, today), true);
  assert.equal(needsWindow({ days: 7, through: today }, today), true);
  assert.equal(canStepDay({ days: 1, through: today }, today, 1), false);
  assert.equal(canStepDay({ days: 1, through: today }, today, -1), true);
  assert.equal(canStepDay({ days: 1, through: shiftDay(today, -365) }, today, -1), false);
  assert.equal(canStepDay({ days: 7, through: today }, today, -1), false);
  assert.equal(periodTitle({ days: 1, through: today }, today), "Bugün");
  assert.equal(periodTitle({ days: 1, through: "2026-11-02" }, today), "Dün");
  assert.equal(periodTitle({ days: 1, through: "2026-10-31" }, today), "31 Eki Cmt"); // 3 Nov 2026 is a Tuesday
  assert.equal(periodTitle({ days: 7, through: today }, today), "Son 7 gün");
});

test("match facts read plainly: cut league names stay cut, the settled score is labelled, unverified names are flagged", () => {
  assert.equal(leagueText("İngiltere Premier Li"), "İngiltere Premier Li…");
  assert.equal(leagueText("İspanya La Liga"), "İspanya La Liga");
  const facts = { names: "DECISION_EVIDENCE" as const, league: "İspanya La Liga", kickoff: "23:00", finalScore: { home: 2, away: 1 } };
  assert.equal(fixtureLine(facts), "İspanya La Liga · 23:00 başlama");
  assert.equal(fixtureLine({ ...facts, league: null, kickoff: null }), null);
  assert.equal(fixtureLine(undefined), null);
  assert.equal(finalScoreText(facts), "MS 2–1");
  assert.equal(finalScoreText({ ...facts, finalScore: null }), null);
  assert.equal(namesUnverified({ ...facts, names: "UNAVAILABLE" }), true);
  assert.equal(namesUnverified(undefined), false);
  assert.equal(evidenceCompact({ votesSupport: 2, votesUsed: 2, poolWins: 12, poolTotal: 22 }), "2/2 · 12/22");
  const labels = new Map([["a", "77A · havuz yolu"], ["b", "77A · havuz yolu"], ["c", "178 · kırmızı kart"]]);
  assert.equal(sharedCohort([{ decisionId: "a" }, { decisionId: "b" }], labels), "77A · havuz yolu");
  assert.equal(sharedCohort([{ decisionId: "a" }, { decisionId: "c" }], labels), null);
  assert.equal(sharedCohort([], labels), null);
});

test("both report reads ask for the frozen facts, and the window has its own path", async () => {
  const source = await read("../api/http-mobile-api.ts");
  assert.match(source, /"X-BTB-Report-Facts": "match-facts\.v1"/);
  assert.match(source, /\/v1\/btb\/rebuild\/v2\/report\/window\/\$\{encodeURIComponent\(through\)\}\/\$\{days\}/);
  assert.match(source, /"X-BTB-Report-Periods": "recent-days\.v1"/);
});

test("desktop rows are table rows whose match name is the link; the log offers 7/30 days and day steps", async () => {
  const source = await read("./RebuildDecisionLog.tsx");
  assert.doesNotMatch(source, /accessibilityRole="link"[\s\S]{0,200}role="row"/);
  // The row stays out of the tab order (react-native-web honours tabIndex, not focusable); the link is the stop.
  assert.match(source, /tabIndex=\{-1\}[\s\S]{0,120}role="row"/);
  assert.match(source, /role="link"/);
  for (const label of ["Son 7 gün", "Son 30 gün", "Önceki gün", "Sonraki gün", "güncellendi", "MS: normal sürede kesinleşen skor"])
    assert.ok(source.includes(label), label);
});

test("report details open from one disclosure and never show 0,00 for a group without results", async () => {
  const source = await read("./RebuildEvidencePanel.tsx");
  assert.ok(!source.includes("Kırılımları gizle"));
  assert.ok(!source.includes("Toplam risk"));
  assert.match(source, /row\.settled \? formatUnits\(row\.net\) : "—"/);
  assert.match(source, /rows\.filter\(row => row\.recommendations > 0\)/);
});

test("the period menu opens from the control's outer edge, so a 7/30-day phone view keeps it on screen", async () => {
  const source = await read("./RebuildDecisionLog.tsx");
  assert.match(source, /align=\{wide \? "right" : "left"\}/);
  assert.match(source, /periodMenuLeft: \{ left: 0 \}/);
  assert.doesNotMatch(source, /periodMenu: \{[^}]*right: 0/);
});
