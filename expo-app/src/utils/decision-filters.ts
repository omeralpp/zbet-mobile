import type { MatchSummary, SuperLog } from "@/src/api/schemas";

export type StarDecisionFilter =
  | "STAR_1_PLUS"
  | "STAR_2_PLUS"
  | "STAR_3_PLUS"
  | "STAR_4_PLUS";

export type DecisionFilter = "ALL" | "SELECTED" | StarDecisionFilter;
export type SuperStarSort = "DEFAULT" | "RATING_DESC" | "RATING_ASC";

export const superStarSortOptions: {
  value: SuperStarSort;
  label: string;
}[] = [
  { value: "DEFAULT", label: "Varsayılan" },
  { value: "RATING_DESC", label: "Yıldız: yüksekten düşüğe" },
  { value: "RATING_ASC", label: "Yıldız: düşükten yükseğe" }
];

export const starFilterOptions: {
  value: StarDecisionFilter;
  label: string;
  accessibilityLabel: string;
}[] = [
  { value: "STAR_1_PLUS", label: "★+", accessibilityLabel: "1 yıldız ve üzeri" },
  { value: "STAR_2_PLUS", label: "★★+", accessibilityLabel: "2 yıldız ve üzeri" },
  { value: "STAR_3_PLUS", label: "★★★+", accessibilityLabel: "3 yıldız ve üzeri" },
  { value: "STAR_4_PLUS", label: "★★★★+", accessibilityLabel: "4 yıldız ve üzeri" }
];

const starDecisionFilters = new Set<StarDecisionFilter>(
  starFilterOptions.map((option) => option.value)
);

export function isStarDecisionFilter(
  value: unknown
): value is StarDecisionFilter {
  return (
    typeof value === "string" &&
    starDecisionFilters.has(value as StarDecisionFilter)
  );
}

export function normalizeStoredStarDecisionFilter(
  value: unknown
): StarDecisionFilter | null {
  if (isStarDecisionFilter(value)) {
    return value;
  }
  switch (value) {
    case "ALL":
    case "STAR_1":
      return "STAR_1_PLUS";
    case "STAR_2":
      return "STAR_2_PLUS";
    case "STAR_3":
      return "STAR_3_PLUS";
    case "STAR_4":
    case "STAR_5":
      return "STAR_4_PLUS";
    default:
      return null;
  }
}

export function decisionFilterLabel(value: DecisionFilter): string {
  if (value === "SELECTED") {
    return "Seçili";
  }
  return (
    starFilterOptions.find((option) => option.value === value)?.label ??
    "Hepsi"
  );
}

export function starMetricLabel(value: StarDecisionFilter): string {
  return `${starFilterMinRating(value)}+ yıldız`;
}

export function starFilterMinRating(
  filter: StarDecisionFilter
): 1 | 2 | 3 | 4 {
  return Number(filter.match(/STAR_([1-4])_PLUS/)?.[1] ?? 3) as
    | 1
    | 2
    | 3
    | 4;
}

type LiveStarCounts = {
  ALL: number;
  STAR_1: number;
  STAR_2: number;
  STAR_3: number;
  STAR_4: number;
  STAR_5: number;
};

export function liveStarMetricCount(
  counts: LiveStarCounts,
  filter: StarDecisionFilter
): number {
  const minimum = starFilterMinRating(filter);
  if (minimum === 1) {
    return counts.ALL;
  }
  return [1, 2, 3, 4, 5]
    .filter((rating) => rating >= minimum)
    .reduce(
      (total, rating) =>
        total + counts[`STAR_${rating}` as keyof LiveStarCounts],
      0
    );
}

function ratingMatches(rating: number, filter: DecisionFilter): boolean {
  if (filter === "ALL" || filter === "SELECTED") {
    return true;
  }
  return rating >= starFilterMinRating(filter) && rating <= 5;
}

export function matchDecisionFilter(
  match: MatchSummary,
  filter: DecisionFilter
): boolean {
  if (filter === "SELECTED") {
    return Boolean(match.selectedOdd) && match.rating >= 1;
  }
  if (filter === "ALL") {
    return true;
  }
  return Boolean(match.selectedOdd) && ratingMatches(match.rating, filter);
}

export function superDecisionFilter(
  log: SuperLog,
  filter: DecisionFilter
): boolean {
  return ratingMatches(log.rating, filter);
}

export function sortSuperLogs(
  logs: SuperLog[],
  sort: SuperStarSort
): SuperLog[] {
  if (sort === "DEFAULT") {
    return logs;
  }
  return logs
    .map((log, index) => ({ log, index }))
    .sort((left, right) => {
      const ratingOrder =
        sort === "RATING_DESC"
          ? right.log.rating - left.log.rating
          : left.log.rating - right.log.rating;
      if (ratingOrder !== 0) {
        return ratingOrder;
      }
      const dateOrder =
        new Date(right.log.createdAt).getTime() -
        new Date(left.log.createdAt).getTime();
      return dateOrder || left.index - right.index;
    })
    .map(({ log }) => log);
}
