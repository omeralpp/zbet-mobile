import type { SuperLog } from "@/src/api/schemas";
import {
  superDecisionFilter,
  type StarDecisionFilter
} from "./decision-filters";

export type SuperLogTab = "ALL" | "STAR";

export function matchSuperLogTab(
  log: SuperLog,
  tab: SuperLogTab,
  starFilter: StarDecisionFilter,
  onlyOpen = false
): boolean {
  if (onlyOpen && log.result !== "OPEN") {
    return false;
  }
  if (tab === "STAR") {
    return superDecisionFilter(log, starFilter);
  }
  return true;
}
