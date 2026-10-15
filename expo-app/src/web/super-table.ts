import type { SuperLog } from "@/src/api/schemas";

/**
 * Sorting model for the desktop Super decision table. Pure so it can be
 * tested; the table shows the same rows as the phone's card list, only
 * denser and re-orderable.
 */
export type SuperColumn =
  | "createdAt"
  | "match"
  | "elapsed"
  | "market"
  | "rating"
  | "rate"
  | "reason"
  | "result"
  | "profit";

export type SortDirection = "asc" | "desc";

export type SuperSort = { column: SuperColumn; direction: SortDirection };

/** Newest decision first, as on the phone. */
export const defaultSuperSort: SuperSort = { column: "createdAt", direction: "desc" };

// Open decisions are the live ones, so they lead an ascending result sort.
const resultOrder: Record<SuperLog["result"], number> = { OPEN: 0, WON: 1, LOST: 2, VOID: 3 };

function sortValue(log: SuperLog, column: SuperColumn): string | number | null {
  switch (column) {
    case "createdAt":
      return Date.parse(log.createdAt);
    case "match":
      return log.matchName.toLocaleLowerCase("tr-TR");
    case "elapsed":
      return log.elapsed;
    case "market":
      return log.selectedOdd.toLocaleLowerCase("tr-TR");
    case "rating":
      return log.rating;
    case "rate":
      return log.liveRate;
    case "reason":
      return log.reason;
    case "result":
      return resultOrder[log.result];
    case "profit":
      return log.profit;
  }
}

/** Stable sort; missing values (no rate, unsettled profit) always sort last. */
export function sortSuperLogs(logs: readonly SuperLog[], sort: SuperSort): SuperLog[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return logs
    .map((log, index) => ({ log, index, value: sortValue(log, sort.column) }))
    .sort((a, b) => {
      const aMissing = a.value === null || (typeof a.value === "number" && Number.isNaN(a.value));
      const bMissing = b.value === null || (typeof b.value === "number" && Number.isNaN(b.value));
      if (aMissing || bMissing) {
        return aMissing === bMissing ? a.index - b.index : aMissing ? 1 : -1;
      }
      const order =
        typeof a.value === "number" && typeof b.value === "number"
          ? a.value - b.value
          : String(a.value).localeCompare(String(b.value), "tr-TR");
      return order === 0 ? a.index - b.index : order * factor;
    })
    .map(({ log }) => log);
}

/** Clicking the active column flips it; a new column starts with its natural order. */
export function nextSuperSort(current: SuperSort, column: SuperColumn): SuperSort {
  if (current.column === column) {
    return { column, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  const descendingFirst: readonly SuperColumn[] = ["createdAt", "rating", "rate", "profit", "elapsed"];
  return { column, direction: descendingFirst.includes(column) ? "desc" : "asc" };
}
