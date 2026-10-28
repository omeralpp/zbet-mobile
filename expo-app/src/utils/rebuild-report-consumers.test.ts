import assert from "node:assert/strict";
import test from "node:test";
import firstFixture from "../api/fixtures/btb-rebuild-v1.json";
import reportFixture from "../api/fixtures/btb-rebuild-report-v1.json";
import { rebuildCohortsReportSchema, rebuildMatchSchema, rebuildReportSchema } from "../api/rebuild-schemas";
import { jinxWeekQuip } from "../mascot/jinx-week";
import { combinedReport, periodRecords } from "./rebuild-log";
import { buildRebuildWidgetPayload } from "../widgets/performance-widget-data";
import { buildWidgetPayload } from "../widgets/widget-payload";

test("Jinx, the Super summary and the widget agree on seven all-cohort decisions and -1.11, not the current cohort's +0.28", () => {
  const base = rebuildReportSchema.parse(reportFixture), source = base.periods[0]!;
  const first = rebuildMatchSchema.parse(firstFixture).history[0]!;
  const aggregate = {...source,recommendations:7,settled:7,wins:4,losses:3,pending:0,net:"-1.11",risk:7,totalRisk:7,roi:-1.11/7,hitRate:4/7};
  const {days:_days,from:_from,through:_through,byStar:_byStar,byMarket:_byMarket,...bucket}=aggregate;
  aggregate.byStar=[{...bucket,stars:3}];
  const current = {...aggregate,recommendations:1,settled:1,wins:1,losses:0,net:"0.28",risk:1,totalRisk:1};
  const currentId="A".repeat(64),oldId="B".repeat(64);
  const nets=["0.28","0.56","1","-1","0.05","-1","-1"];
  const report=rebuildCohortsReportSchema.parse({...base,contractVersion:"btb-rebuild-report.v2",periods:[aggregate],
    cohorts:[{id:currentId,label:"Current",current:true,firstDecisionAt:first.publishedAt,periods:[current],learning:null},
      {id:oldId,label:"Previous",current:false,firstDecisionAt:first.publishedAt,periods:[{...aggregate,recommendations:6,net:"-1.39"}],learning:null}],
    recommendations:nets.map((net,i)=>({...first,decisionId:(i+1).toString(16).padStart(32,"0").toUpperCase(),cohortId:i===0?currentId:oldId,
      result:{state:net.startsWith("-")?"LOSS":"WIN",revision:2,net}}))});
  const before=JSON.stringify(report.cohorts);
  const jinx=jinxWeekQuip(report.periods.find(period=>period.days===7));
  assert.equal(jinx?.title,"Son 7 gün: 7 öneri");
  assert.match(jinx!.body,/4 kazandı · 3 kaybetti/);
  assert.match(jinx!.body,/-1,11 birim/);
  assert.equal(combinedReport(report).periods[0]!.net,"-1.11");
  assert.equal(combinedReport(report).recommendations.length,7);
  const widget=buildRebuildWidgetPayload(report,"STAR_1_PLUS");
  assert.equal(widget.super_wins,4); assert.equal(widget.super_losses,3);
  assert.equal(widget.super_profit,"-1.11");
  assert.equal(JSON.stringify(report.cohorts),before); // cohort learning/evidence is not merged or mutated
  assert.equal(report.cohorts[0]!.periods[0]!.net,"0.28");
});

test("daily log, Jinx and native widget use today's totals without mixing yesterday or changing exact net", () => {
  const base = rebuildReportSchema.parse(reportFixture), source = base.periods[0]!;
  const currentId = "A".repeat(64), first = rebuildMatchSchema.parse(firstFixture).history[0]!;
  const today = { ...source, key: "today" as const, days: 1 as const, from: "2026-10-21", through: "2026-10-21",
    recommendations: 1, settled: 1, wins: 1, losses: 0, net: "0.1234567890123456789",
    byStar: [{ ...source.byStar[0]!, stars: 3, settled: 1, wins: 1, losses: 0, net: "0.1234567890123456789" }] };
  const yesterday = { ...today, key: "yesterday" as const, from: "2026-10-20", through: "2026-10-20", net: "99" };
  const report = rebuildCohortsReportSchema.parse({ ...base, contractVersion: "btb-rebuild-report.v2", asOf: "2026-10-21T12:00:00Z",
    periods: [today, yesterday], learning: null, cohorts: [{ id: currentId, label: "Current", current: true, firstDecisionAt: null, periods: [today, yesterday], learning: null }],
    recommendations: [{ ...first, cohortId: currentId, publishedAt: "2026-10-20T21:00:00Z" },
      { ...first, decisionId: "2".repeat(32), cohortId: currentId, publishedAt: "2026-10-20T20:59:59Z" }] });
  assert.equal(jinxWeekQuip(today)?.title, "Bugün: 1 öneri");
  assert.equal(jinxWeekQuip({ ...today, recommendations: 0 })?.title, "Bugün öneri yok");
  assert.equal(jinxWeekQuip(yesterday)?.title, "Dün: 1 öneri");
  assert.deepEqual(periodRecords(report, today).map(r => r.decisionId), [first.decisionId]);
  assert.deepEqual(periodRecords(report, yesterday).map(r => r.decisionId), ["2".repeat(32)]);
  const widget = buildRebuildWidgetPayload(report, "STAR_1_PLUS");
  assert.equal(widget.super_days, 1); assert.equal(widget.super_profit, "0.1234567890123456789");
  assert.equal(buildWidgetPayload(widget)?.super_days, 1);
  assert.equal(combinedReport(report).learning, null);
});
