import assert from "node:assert/strict";
import test from "node:test";
import type { RebuildReport } from "@/src/api/rebuild-schemas";
import { mockDashboard } from "@/src/api/mock-data";
import {
  buildRebuildWidgetPayload,
  hasPerformanceWidgetData,
  withoutSuperKpiData
} from "./performance-widget-data";

test("dashboard aktif programdayken son sonuçlanan programı widgetta kullanır", () => {
  const settled = {
    ...mockDashboard.latestTotoProgram!,
    gcNo: 349,
    key: "349:1",
    coverageHits: 2
  };
  const active = {
    ...mockDashboard.latestTotoProgram!,
    gcNo: 351,
    key: "351:1",
    status: "ACTIVE" as const,
    coverageHits: null,
    mainHits: null,
    predictions: mockDashboard.latestTotoProgram!.predictions.map(
      (prediction) => ({ ...prediction, result: "OPEN" as const })
    )
  };
  // The Toto half does not depend on the Super report being available.
  const report = { availability: "UNAVAILABLE", periods: [] } as unknown as RebuildReport;

  const payload = buildRebuildWidgetPayload(report, "STAR_3_PLUS", [active, settled]);
  assert.equal(payload.toto_coverage_hits, 2);
  assert.equal(payload.toto_coverage_total, 3);
  assert.equal(payload.toto_program_gc_no, 349);
  assert.equal(payload.toto_program_version, 1);
  assert.equal(payload.super_available, false);
});

test("bildirim payloadında Performans KPI alanını ayırt eder", () => {
  assert.equal(
    hasPerformanceWidgetData({ notification_title: "BTB" }),
    false
  );
  assert.equal(hasPerformanceWidgetData({ super_min_rating: "3" }), true);
  assert.equal(hasPerformanceWidgetData({ totoCoverageHits: 4 }), true);
});

test("bildirim jobı sabit Super KPI ile cihaz seçimini ezmez", () => {
  assert.deepEqual(
    withoutSuperKpiData({
      notification_title: "BTB",
      toto_coverage_hits: "12",
      super_min_rating: "3",
      super_wins: "5",
      super_losses: "8",
      super_profit: "-3.77"
    }),
    {
      notification_title: "BTB",
      toto_coverage_hits: "12"
    }
  );
});
