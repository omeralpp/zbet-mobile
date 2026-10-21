import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";

/**
 * A published decision as the match flow draws it: a star mark at its minute
 * on Maçın yolu and in the event list. Only these five facts are read, so the
 * same mark serves the RB1 record that replaced the A3 Super log.
 */
export interface SuperMark {
  key: string;
  elapsed: number;
  selectedOdd: string;
  rating: number;
  createdAt: string;
}

/** The match's RB1 published records as flow marks (owner decision 2026-10-21). */
export function rebuildMarks(history: readonly RebuildRecommendation[]): SuperMark[] {
  return history
    .map((record) => ({
      key: record.decisionId,
      elapsed: record.minute,
      selectedOdd: record.market,
      rating: record.stars,
      createdAt: record.publishedAt
    }))
    .sort((left, right) => right.elapsed - left.elapsed || right.createdAt.localeCompare(left.createdAt));
}
