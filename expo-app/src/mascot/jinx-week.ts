import type { RebuildReport } from "@/src/api/rebuild-schemas";
import { formatUnits } from "@/src/utils/rebuild-display";

export interface JinxWeekQuip {
  /** Changes whenever a figure changes, so the bubble speaks once per change. */
  signature: string;
  title: string;
  body: string;
}

/**
 * Jinx's daily comment on RB1 (owner decision 2026-10-21): the report's last
 * seven Istanbul days in neutral words. The numbers are the report's own; no
 * mood, no wallet jokes, nothing read into whether the net is up or down.
 */
export function jinxWeekQuip(period: RebuildReport["periods"][number] | undefined): JinxWeekQuip | null {
  if (!period) {
    return null;
  }
  const signature = [period.from, period.through, period.recommendations, period.wins, period.losses, period.pending, period.unresolved, period.voids, period.net].join(":");
  if (period.recommendations === 0) {
    return { signature, title: "Son 7 günde öneri yok", body: "BTB bir öneri yayımladığında seçim oranıyla burada sayılır." };
  }
  const outcomes = [`${period.wins} kazandı`, `${period.losses} kaybetti`, `${period.pending} bekliyor`];
  if (period.unresolved) outcomes.push(`${period.unresolved} çözülemedi`);
  if (period.voids) outcomes.push(`${period.voids} iptal`);
  return {
    signature,
    title: `Son 7 gün: ${period.recommendations} öneri`,
    body: `${outcomes.join(" · ")} · ${formatUnits(period.net)} birim (varsayımsal).`
  };
}
