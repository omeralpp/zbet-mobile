import type { z } from "zod";
import type { decisionContextSchema } from "../api/schemas";

export function currentIntervalPressure(
  context: z.infer<typeof decisionContextSchema> | undefined,
  now = Date.now()
) {
  const pressure = context?.recentPressure;
  const age = pressure?.observedAt ? now - Date.parse(pressure.observedAt) : NaN;
  if (!pressure || pressure.availability !== "AVAILABLE" || !Number.isFinite(age) || age < 0 || age > 240_000)
    return { total: null, difference: null, measured: false };
  return { total: pressure.total, difference: pressure.difference, measured: true };
}

export function capturedIntervalPressure(
  context: z.infer<typeof decisionContextSchema> | undefined,
  capturedAt: string | null
) {
  return currentIntervalPressure(context, capturedAt ? Date.parse(capturedAt) : NaN);
}
