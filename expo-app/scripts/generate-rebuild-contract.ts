import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { rebuildSummarySchema, rebuildMatchSchema, rebuildReportSchema } from "../src/api/rebuild-schemas";
import { rebuildPressureHistorySchema, rebuildStatisticsSchema } from "../src/api/rebuild-statistics-schemas";

// Runtime refinements also check links and frozen facts; JSON Schema describes
// the wire shape. Keep the same runtime validators on Android and web.
for (const [name, schema] of Object.entries({
  "btb-rebuild-summary": rebuildSummarySchema,
  "btb-rebuild-match": rebuildMatchSchema,
  "btb-rebuild-report": rebuildReportSchema,
  "btb-match-statistics": rebuildStatisticsSchema,
  "btb-pressure-history": rebuildPressureHistorySchema
})) {
  const value = z.toJSONSchema(schema, { target: "draft-2020-12", unrepresentable: "throw" });
  writeFileSync(resolve("contracts", `${name}.schema.json`), `${JSON.stringify(value, null, 2)}\n`);
}
