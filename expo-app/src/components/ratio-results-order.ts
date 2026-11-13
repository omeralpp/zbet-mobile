import type { RatioResult } from "@/src/api/schemas";

export type RatioShareField = keyof Pick<RatioResult, "kickOff" | "halfTime" | "live">;

export function orderRatioRows(rows: readonly RatioResult[], fields: readonly RatioShareField[], pinnedMarket?: string) {
  const selected = pinnedMarket?.trim().toLowerCase();
  const pinnedRow = selected ? rows.find(row => row.betType.trim().toLowerCase() === selected) : undefined;
  const newestFirst = [...fields].reverse();
  const orderedRows = rows.filter(row => row !== pinnedRow).sort((left, right) => {
    for (const field of newestFirst) {
      const leftShare = left[field];
      const rightShare = right[field];
      if (leftShare === null && rightShare === null) continue;
      // Measured zero ranks ahead of missing evidence for the same phase.
      return (rightShare ?? -1) - (leftShare ?? -1) || left.sort - right.sort;
    }
    return left.sort - right.sort;
  });
  if (pinnedRow) orderedRows.unshift(pinnedRow);
  return { orderedRows, pinnedRow };
}
