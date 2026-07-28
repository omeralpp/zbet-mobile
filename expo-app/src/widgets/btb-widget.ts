import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";
import {
  buildWidgetPayload,
  type BtbWidgetPayload,
  type WidgetInputData
} from "./widget-payload";

type WidgetStatus = {
  available: boolean;
  notificationWidgetCount: number;
  performanceWidgetCount: number;
};

type NativeBtbWidgetModule = {
  update(payload: BtbWidgetPayload): Promise<void>;
  clear(): Promise<void>;
  getStatus(): Promise<WidgetStatus>;
};

const nativeWidget =
  Platform.OS === "android"
    ? requireOptionalNativeModule<NativeBtbWidgetModule>("BtbWidget")
    : null;

export async function updateWidgetsFromData(
  data: WidgetInputData
): Promise<boolean> {
  const payload = buildWidgetPayload(data);
  if (!payload || !nativeWidget) {
    return false;
  }
  await nativeWidget.update(payload);
  return true;
}

export async function getWidgetStatus(): Promise<WidgetStatus> {
  if (!nativeWidget) {
    return {
      available: false,
      notificationWidgetCount: 0,
      performanceWidgetCount: 0
    };
  }
  return nativeWidget.getStatus();
}

export async function seedWidgetPreview(): Promise<void> {
  if (!nativeWidget) {
    throw new Error("Android widget modülü bu uygulama paketinde bulunamadı.");
  }

  await nativeWidget.update({
    title: "Yeni Super kupon",
    body: "Inter Turku – Gnistan: Ms1X seçildi.",
    route: "btb",
    rating: 4,
    match_id: "472910",
    match_date: "2026-07-28",
    match_time: "20:45:00",
    toto_coverage_hits: 12,
    toto_coverage_total: 15,
    toto_program_gc_no: 350,
    toto_program_version: 1,
    super_min_rating: 3,
    super_wins: 5,
    super_losses: 3,
    super_profit: 1.06
  });
}
