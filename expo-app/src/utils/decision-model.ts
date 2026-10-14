import type { MatchSummary } from "../api/schemas";
import { currentIntervalPressure } from "./recent-pressure";

type Context = MatchSummary["decisionContext"];

export function decisionModel(context: Context) {
  return context?.contractVersion === "decision-context.v3" ? context.model : null;
}

export function decisionModelLabel(context: Context) {
  const model = decisionModel(context);
  if (model?.kind === "PRESSURE_PATH_PILOT") return `Yeni baskı cutover’ı · ${model.cutoverId}`;
  if (model?.kind === "LEGACY") return "Önceki modelde kaydedilmiş karar";
  return "Model sürüm bilgisi kaydedilmemiş";
}

export function recordedSelection(selectedOdd: string, currentRate: number | null, context: Context, now = Date.now()) {
  const model = decisionModel(context);
  return Boolean(selectedOdd) && (currentRate === null || (model !== null &&
    (model.recommendation !== "CURRENT" || !currentIntervalPressure(context, now).measured)));
}
