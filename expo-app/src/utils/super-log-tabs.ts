import type { SuperLog } from "@/src/api/schemas";
import {
  superDecisionFilter,
  type StarDecisionFilter
} from "./decision-filters";

export type SuperLogTab = "ALL" | "OPEN" | "STAR";

export function matchSuperLogTab(
  log: SuperLog,
  tab: SuperLogTab,
  starFilter: StarDecisionFilter
): boolean {
  if (tab === "OPEN") {
    return log.result === "OPEN";
  }
  if (tab === "STAR") {
    return superDecisionFilter(log, starFilter);
  }
  return true;
}
