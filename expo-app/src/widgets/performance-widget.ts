import { mobileApi } from "@/src/api";
import { updateWidgetsFromData } from "./btb-widget";
import { buildPerformanceWidgetPayload } from "./performance-widget-data";

export async function refreshPerformanceWidgetFromApi(): Promise<boolean> {
  const [dashboard, programs] = await Promise.all([
    mobileApi.getDashboard(),
    mobileApi.getTotoPrograms()
  ]);
  return updateWidgetsFromData(
    buildPerformanceWidgetPayload(dashboard, programs)
  );
}
