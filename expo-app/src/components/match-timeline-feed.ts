import type { SuperLog } from "@/src/api/schemas";
import type { VisibleEvent } from "./live-context-view";

export type MatchTimelineEntry =
  | {
      kind: "EVENT";
      key: string;
      minute: number;
      event: VisibleEvent;
      isLatestEvent: boolean;
      sharesMinute: boolean;
    }
  | {
      kind: "SUPER";
      key: string;
      minute: number;
      decision: SuperLog;
      isCurrent: boolean;
      sharesMinute: boolean;
    };

type PendingEntry =
  | (Omit<
      Extract<MatchTimelineEntry, { kind: "EVENT" }>,
      "sharesMinute"
    > & { sourceOrder: number })
  | (Omit<
      Extract<MatchTimelineEntry, { kind: "SUPER" }>,
      "sharesMinute"
    > & { sourceOrder: number });

function eventMinute(event: VisibleEvent): number {
  return typeof event.minute === "number" && Number.isFinite(event.minute)
    ? event.minute
    : Number.MAX_SAFE_INTEGER;
}

/**
 * Merges two independently truthful sources only for presentation.
 *
 * Goal/red-card rows remain provider events and Super rows remain historical
 * decisions. Sharing a minute never establishes causality or a second-level
 * ordering; callers announce that ambiguity through `sharesMinute`.
 */
export function buildMatchTimelineFeed(
  events: readonly VisibleEvent[],
  decisions: readonly SuperLog[],
  currentDecisionKey?: string | null
): MatchTimelineEntry[] {
  const eventRows = events
    .map((event, sourceOrder) => ({ event, sourceOrder }))
    .sort(
      (left, right) =>
        eventMinute(left.event) - eventMinute(right.event) ||
        left.sourceOrder - right.sourceOrder
    );
  const latestEventKey = eventRows.at(-1)?.event.eventKey ?? null;
  const pending: PendingEntry[] = [
    ...eventRows.map(({ event, sourceOrder }) => ({
      kind: "EVENT" as const,
      key: `event:${event.eventKey}`,
      minute: eventMinute(event),
      event,
      isLatestEvent: event.eventKey === latestEventKey,
      sourceOrder
    })),
    ...decisions.map((decision, sourceOrder) => ({
      kind: "SUPER" as const,
      key: `super:${decision.key}`,
      minute: decision.elapsed,
      decision,
      isCurrent: decision.key === currentDecisionKey,
      sourceOrder: events.length + sourceOrder
    }))
  ];

  pending.sort((left, right) => {
    const byMinute = left.minute - right.minute;
    if (byMinute !== 0) {
      return byMinute;
    }
    if (left.kind === "SUPER" && right.kind === "SUPER") {
      return (
        left.decision.createdAt.localeCompare(right.decision.createdAt) ||
        left.sourceOrder - right.sourceOrder
      );
    }
    return left.sourceOrder - right.sourceOrder;
  });

  const minuteCounts = new Map<number, number>();
  for (const row of pending) {
    minuteCounts.set(row.minute, (minuteCounts.get(row.minute) ?? 0) + 1);
  }

  return pending.map(({ sourceOrder: _sourceOrder, ...row }) => ({
    ...row,
    sharesMinute: (minuteCounts.get(row.minute) ?? 0) > 1
  })) as MatchTimelineEntry[];
}
