import assert from "node:assert/strict";
import test from "node:test";
import { mockDashboard } from "@/src/api/mock-data";
import {
  buildPerformanceWidgetPayload,
  hasPerformanceWidgetData
} from "./performance-widget-data";

test("dashboard özetini Performans widget KPI snapshotına dönüştürür", () => {
  const dashboard = {
    ...mockDashboard,
    todaySuperWon: 5,
    todaySuperLost: 8,
    todaySuperProfit: -3.77,
    latestTotoProgram: mockDashboard.latestTotoProgram
      ? { ...mockDashboard.latestTotoProgram, coverageHits: 2 }
      : null
  };

  assert.deepEqual(buildPerformanceWidgetPayload(dashboard), {
    toto_coverage_hits: 2,
    toto_coverage_total: 3,
    toto_program_gc_no: 350,
    toto_program_version: 1,
    super_min_rating: 3,
    super_wins: 1,
    super_losses: 1,
    super_profit: 0.14
  });
});

test("sonuç kapsamı olmayan Toto programını widgeta taşımaz", () => {
  const dashboard = {
    ...mockDashboard,
    latestTotoProgram: mockDashboard.latestTotoProgram
      ? {
          ...mockDashboard.latestTotoProgram,
          coverageHits: null,
          predictions: mockDashboard.latestTotoProgram.predictions.map(
            (prediction) => ({ ...prediction, result: "OPEN" as const })
          )
        }
      : null
  };

  assert.deepEqual(buildPerformanceWidgetPayload(dashboard), {
    super_min_rating: 3,
    super_wins: 1,
    super_losses: 1,
    super_profit: 0.14
  });
});

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

  assert.deepEqual(
    buildPerformanceWidgetPayload(
      { ...mockDashboard, latestTotoProgram: active },
      [active, settled]
    ),
    {
      toto_coverage_hits: 2,
      toto_coverage_total: 3,
      toto_program_gc_no: 349,
      toto_program_version: 1,
      super_min_rating: 3,
      super_wins: 1,
      super_losses: 1,
      super_profit: 0.14
    }
  );
});

test("bildirim payloadında Performans KPI alanını ayırt eder", () => {
  assert.equal(
    hasPerformanceWidgetData({ notification_title: "BTB" }),
    false
  );
  assert.equal(hasPerformanceWidgetData({ super_min_rating: "3" }), true);
  assert.equal(hasPerformanceWidgetData({ totoCoverageHits: 4 }), true);
});
