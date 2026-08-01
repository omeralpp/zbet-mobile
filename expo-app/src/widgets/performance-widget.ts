import { mobileApi } from "@/src/api";
import { updateWidgetsFromData } from "./btb-widget";
import { buildPerformanceWidgetPayload } from "./performance-widget-data";
import {
  readSuperStarFilter
} from "@/src/preferences/SuperStarFilterProvider";
import type { StarDecisionFilter } from "@/src/utils/decision-filters";

export async function refreshPerformanceWidgetFromApi(
  filterOverride?: StarDecisionFilter
): Promise<boolean> {
  const [dashboard, superKpis, programs, storedFilter] = await Promise.all([
    mobileApi.getDashboard(),
    mobileApi.getSuperKpis(),
    mobileApi.getTotoPrograms(),
    filterOverride ? Promise.resolve(filterOverride) : readSuperStarFilter()
  ]);
  return updateWidgetsFromData(
    buildPerformanceWidgetPayload(
      dashboard,
      superKpis,
      storedFilter,
      programs
    )
  );
}
