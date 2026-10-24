import assert from "node:assert/strict";
import test from "node:test";
import decision from "./fixtures/btb-rebuild-v1.json";
import report from "./fixtures/btb-rebuild-report-v1.json";
import { rebuildMatchSchema, rebuildReportSchema, rebuildQuotesSchema } from "./rebuild-schemas";
import { currentRebuild, rebuildCalendarDay } from "../utils/rebuild-current";
import { buildRebuildWidgetPayload } from "../widgets/performance-widget-data";
import { buildWidgetPayload } from "../widgets/widget-payload";
import { notificationDataToPath } from "../notifications/routing";

test("the exact BFF DTO is accepted by the shared Android/web contract without price rounding", () => {
  const parsed = rebuildMatchSchema.parse(decision);
  const first = parsed.history[0]; assert.ok(first);
  assert.equal(first.quote, "2.123456789012345678901234567890123");
  assert.equal(parsed.current?.quote, "2.25"); assert.equal(parsed.jinx.source, "BACKEND");
  const period = rebuildReportSchema.parse(report).periods[0]; assert.ok(period); assert.equal(period.roi, null);
});

test("summary reports may omit match rows without losing the required accounting or uncertainty", () => {
  const compact = JSON.parse(JSON.stringify(report, (key, value) => key === "byMatch" ? undefined : value));
  const parsed = rebuildReportSchema.parse(compact);
  assert.equal(parsed.periods[0]?.byMatch, undefined);
  assert.deepEqual(parsed.periods.map(p => p.net), rebuildReportSchema.parse(report).periods.map(p => p.net));
  delete compact.periods[0].uncertainty;
  assert.equal(rebuildReportSchema.safeParse(compact).success, false);
});
test("unsupported contracts, missing first records and duplicate identities fail closed", () => {
  for (const value of [{ ...decision, contractVersion: "unknown" }, { ...decision, history: [] }, { ...decision, history: [...decision.history, ...decision.history] },
    { ...decision, history: [{ ...decision.history[0], stars: 0 }] }]) assert.equal(rebuildMatchSchema.safeParse(value).success, false);
});
test("native model admission retains its expiry independently of display playability", () => {
  const parsed = rebuildMatchSchema.parse(decision), now = Date.parse(parsed.asOf);
  assert.ok(currentRebuild(parsed, now)); assert.equal(currentRebuild(parsed, now + 20_000), null);
  assert.equal(currentRebuild({ ...parsed, availability: "WAITING_DATA", current: null }, now), null);
});

test("display v2 requires explicit market state while preserving v1 quote payloads",()=>{
  const quote={market:"Ms1",admitted:false,reason:"PRESSURE_FAILED",quote:"1.75",quoteAt:decision.asOf};
  const packet={contractVersion:"btb-market-quotes.v2",matchKey:decision.matchKey,asOf:decision.asOf,candidates:[quote]};
  assert.equal(rebuildQuotesSchema.safeParse(packet).success,false);
  for(const marketOpen of [true,false,null])
    assert.equal(rebuildQuotesSchema.safeParse({...packet,candidates:[{...quote,marketOpen}]}).success,true);
  assert.equal(rebuildQuotesSchema.safeParse({...packet,contractVersion:"btb-market-quotes.v1"}).success,true);
});
test("the report and displayed history use the same Istanbul calendar boundary", () => {
  assert.equal(rebuildCalendarDay("2026-10-13T21:00:00Z"), "2026-10-14");
  assert.equal(rebuildCalendarDay("2026-10-13T20:59:59Z"), "2026-10-13");
});
test("a report with no settled risk clears the old widget cohort instead of manufacturing zero ROI", () => {
  const value = buildRebuildWidgetPayload(rebuildReportSchema.parse(report), "STAR_1_PLUS");
  assert.equal(value.super_available, false); assert.equal(value.super_profit, undefined); assert.equal(value.super_model_regime, "BTB_RB1_20261018");
  assert.equal(buildWidgetPayload(value)?.super_available, false);
  const notification = buildWidgetPayload({ title: "New", body: "Selection", model_regime: "BTB_RB1_20261018", super_min_rating: 3, super_wins: 99 });
  assert.equal(notification?.super_wins, undefined);
});
test("an RB1 push opens the frozen recommendation identity within its match", () => {
  assert.equal(notificationDataToPath({ matchId: "17", matchDate: "20261020", matchTime: "130000", modelRegime: "BTB_RB1_20261018", decisionId: "1".repeat(32) }),
    "/match/2026-10-20%3A17%3A13%3A00%3A00?decision=" + "1".repeat(32));
});
