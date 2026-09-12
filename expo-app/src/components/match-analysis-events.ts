import type {
  LiveContext,
  MatchPathContext,
  MatchPathPointKind
} from "@/src/api/schemas";
import { visibleEvents } from "./live-context-view";
import { matchPathNodes } from "./match-path-chart";

export interface MatchAnalysisEvent {
  key: string;
  kind: "RED_CARD" | "SURPRISE";
  /**
   * The contract's own kind, kept unnarrowed.
   *
   * `minute` is nullable and a HALF_TIME or FULL_TIME point routinely has none,
   * so a minute axis has nowhere to put it. Before this was carried, the chart
   * filtered every such event out and the pool events the card exists to show
   * never appeared on it at all. The renderer derives their position from this
   * rather than from parsing the label.
   */
  pathKind: MatchPathPointKind | null;
  /**
   * Whether this row is a thing that happened, or a scoreline assessed at the
   * end of a period.
   *
   * A HALF_TIME or FULL_TIME point carries `eventSurprise = 1 - p(score)`: the
   * improbability of the scoreline itself within the cohort. That is not an
   * event going against the expected score, it is the expected score being
   * graded, and presenting the two under one heading told the reader the whistle
   * was a surprising occurrence.
   */
  group: "EVENT" | "PERIOD";
  label: string;
  minute: number | null;
  minuteLabel: string;
  player: string | null;
  side: "HOME" | "AWAY" | null;
  eventSurprise: number | null;
  stateNormality: number | null;
  cohortSize: number | null;
  confidence: number | null;
  /**
   * True where this event's own cohort is under the contract's published
   * threshold. Carried from `MatchPathNode` rather than recomputed, so the
   * view never invents a threshold of its own.
   */
  belowReliableCohort: boolean;
}

/**
 * One analytical event rail for the retained journey chart.
 *
 * Match Path owns surprise, normality, cohort and confidence. Live Context
 * owns the proven red-card event and its player/side attribution. A red card
 * present in both feeds is merged by minute instead of rendered twice; a live
 * card without a Match Path score stays visible and explicitly unmeasured.
 */
export function matchAnalysisEvents(
  path: MatchPathContext | undefined,
  context: LiveContext | undefined
): MatchAnalysisEvent[] {
  const redCards = visibleEvents(context?.timeline).filter(
    (event) => event.kind === "RED_CARD"
  );
  const claimedRedCards = new Set<string>();
  const pathEvents = matchPathNodes(path)
    .filter((node) => node.kind === "RED_CARD" || node.eventSurprise !== null)
    .map((node): MatchAnalysisEvent => {
      const matchingCard =
        node.kind === "RED_CARD"
          ? redCards.find(
              (event) =>
                !claimedRedCards.has(event.eventKey) &&
                event.minute !== null &&
                event.minute !== undefined &&
                node.minuteLabel === `${event.minute}'`
            )
          : undefined;
      if (matchingCard) {
        claimedRedCards.add(matchingCard.eventKey);
      }
      return {
        key: `path:${node.pointKey}`,
        kind: node.kind === "RED_CARD" ? "RED_CARD" : "SURPRISE",
        pathKind: node.kind,
        group: node.kind === "HALF_TIME" || node.kind === "FULL_TIME" ? "PERIOD" : "EVENT",
        label: node.label,
        minute: node.minuteLabel ? Number.parseInt(node.minuteLabel, 10) : null,
        minuteLabel: node.minuteLabel,
        player: matchingCard?.player?.rawName ?? null,
        side: matchingCard?.side ?? null,
        eventSurprise: node.eventSurprise,
        stateNormality: node.stateNormality,
        cohortSize: node.cohortSize,
        confidence: node.confidence,
        belowReliableCohort: node.belowReliableCohort
      };
    });

  const unmatchedCards = redCards
    .filter((event) => !claimedRedCards.has(event.eventKey))
    .map(
      (event): MatchAnalysisEvent => ({
        key: `live:${event.eventKey}`,
        kind: "RED_CARD",
        pathKind: null,
        group: "EVENT",
        label:
          event.redCardType === "SECOND_YELLOW_RED"
            ? "İkinci sarıdan kırmızı"
            : "Kırmızı kart",
        minute: event.minute ?? null,
        minuteLabel:
          event.minuteLabel ??
          (event.minute === null || event.minute === undefined
            ? ""
            : `${event.minute}'`),
        player: event.player?.rawName ?? null,
        side: event.side ?? null,
        eventSurprise: null,
        stateNormality: null,
        cohortSize: null,
        confidence: null,
        belowReliableCohort: false
      })
    );

  return [...pathEvents, ...unmatchedCards].sort((left, right) => {
    if (left.minute === null && right.minute === null) return 0;
    if (left.minute === null) return 1;
    if (right.minute === null) return -1;
    return left.minute - right.minute;
  });
}

export function latestMatchPathSignal(path: MatchPathContext | undefined) {
  return matchPathNodes(path).findLast(
    (node) => node.stateNormality !== null
  );
}
