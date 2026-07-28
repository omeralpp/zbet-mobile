import type { WidgetInputData } from "@/src/widgets/widget-payload";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function extractRemoteNotificationData(
  value: unknown
): WidgetInputData | null {
  if (!isRecord(value) || "actionIdentifier" in value) {
    return null;
  }

  const nested = value.data;
  if (isRecord(nested)) {
    const dataString = nested.dataString;
    if (
      typeof dataString === "string" &&
      dataString.trim().startsWith("{")
    ) {
      try {
        const parsed = JSON.parse(dataString) as unknown;
        if (isRecord(parsed)) {
          return parsed;
        }
      } catch {
        // The current CAP contract carries plain FCM data fields.
      }
    }
    return nested;
  }

  return value;
}
