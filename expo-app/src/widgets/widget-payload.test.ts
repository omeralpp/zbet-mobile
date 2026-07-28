import assert from "node:assert/strict";
import test from "node:test";
import { buildWidgetPayload } from "./widget-payload";

test("Super bildirimini yıldız ve tam maç hedefiyle widget'a taşır", () => {
  assert.deepEqual(
    buildWidgetPayload({
      notification_title: "Super coupon created",
      notification_body:
        "Inter Turku - Gnistan : Ms1X selected ★★★.",
      widget_body: "Inter Turku - Gnistan : Ms1X selected.",
      rating: "3",
      route: "btb",
      match_id: "472910",
      match_date: "20260728",
      match_time: "204500"
    }),
    {
      title: "Super coupon created",
      body: "Inter Turku - Gnistan : Ms1X selected.",
      route: "btb",
      rating: 3,
      match_id: "472910",
      match_date: "2026-07-28",
      match_time: "20:45:00"
    }
  );
});

test("Toto ve Super KPI snapshot değerlerini birlikte doğrular", () => {
  assert.deepEqual(
    buildWidgetPayload({
      toto_coverage_hits: "3",
      toto_coverage_total: "4",
      toto_program_gc_no: "350",
      toto_program_version: "1",
      super_min_rating: "3",
      super_wins: "5",
      super_losses: "3",
      super_profit: "1.0600"
    }),
    {
      toto_coverage_hits: 3,
      toto_coverage_total: 4,
      toto_program_gc_no: 350,
      toto_program_version: 1,
      super_min_rating: 3,
      super_wins: 5,
      super_losses: 3,
      super_profit: 1.06
    }
  );
});

test("geçerli eşikte eksik günlük Super değerlerini sıfırlar", () => {
  assert.deepEqual(
    buildWidgetPayload({ super_min_rating: "3" }),
    {
      super_min_rating: 3,
      super_wins: 0,
      super_losses: 0,
      super_profit: 0
    }
  );
});

test("boş veya tutarsız widget payloadlarını reddeder", () => {
  assert.equal(buildWidgetPayload({}), null);
  assert.equal(
    buildWidgetPayload({
      toto_coverage_hits: "5",
      toto_coverage_total: "4",
      super_min_rating: "8"
    }),
    null
  );
});
