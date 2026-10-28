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
 * Istanbul reporting period in neutral words. The numbers are the report's own; no
 * mood, no wallet jokes, nothing read into whether the net is up or down.
 */
export function jinxWeekQuip(period: RebuildReport["periods"][number] | undefined): JinxWeekQuip | null {
  if (!period) {
    return null;
  }
  const signature = [period.from, period.through, period.recommendations, period.wins, period.losses, period.pending, period.unresolved, period.voids, period.net].join(":");
  const label = period.key === "today" ? "Bugün" : period.key === "yesterday" ? "Dün" : `Son ${period.days} gün`;
  if (period.recommendations === 0) {
    return { signature, title: `${label}${period.key ? "" : "de"} öneri yok`, body: "BTB bir öneri yayımladığında seçim oranıyla burada sayılır." };
  }
  const outcomes = [`${period.wins} kazandı`, `${period.losses} kaybetti`, `${period.pending} bekliyor`];
  if (period.unresolved) outcomes.push(`${period.unresolved} çözülemedi`);
  if (period.voids) outcomes.push(`${period.voids} iptal`);
  return {
    signature,
    title: `${label}: ${period.recommendations} öneri`,
    body: `${outcomes.join(" · ")} · ${formatUnits(period.net)} birim (varsayımsal).`
  };
}
