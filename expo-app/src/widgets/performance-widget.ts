import { mobileApi } from "@/src/api";
import { updateWidgetsFromData } from "./btb-widget";
import { buildRebuildWidgetPayload } from "./performance-widget-data";
import {
  readSuperStarFilter
} from "@/src/preferences/SuperStarFilterProvider";
import type { StarDecisionFilter } from "@/src/utils/decision-filters";

export async function refreshPerformanceWidgetFromApi(
  filterOverride?: StarDecisionFilter
): Promise<boolean> {
  const [report, storedFilter, programs] = await Promise.all([
    mobileApi.getRebuildReport(),
    filterOverride ? Promise.resolve(filterOverride) : readSuperStarFilter(),
    mobileApi.getTotoPrograms().catch(() => [])
  ]);
  return updateWidgetsFromData(
    buildRebuildWidgetPayload(report, storedFilter, programs)
  );
}
