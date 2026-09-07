import type {
  MatchPathContext,
  MatchPathPoint,
  MatchPathPointKind
} from "@/src/api/schemas";

/**
 * Geometry and presentation for the Match Path normality chart
 * (M15 / TASK-0045).
 *
 * The chart answers one question: as this match acquired events, how did the
 * cohort of similar matches narrow, and was the narrowing ordinary?
 *
 * Two signals, two different shapes
 * ---------------------------------
 * `stateNormality` is a running state - it exists at every point, including
 * points where nothing happened - so it is drawn as a continuous line.
 * `eventSurprise` belongs to a discrete event, and the contract says so by
 * leaving it `null` at kick-off and at plain state samples, so it is drawn as
 * a marker on that line rather than as a second series. Drawing both as
 * parallel meters made them look like the same kind of measurement, which is
 * exactly the confusion this feature exists to prevent.
 *
 * That shape also lets the chart answer the question the owner actually asked:
 * a goal can be surprising at 60' and the match can still settle back into an
 * ordinary state afterwards. On a line that is one glance; across separate
 * columns it is invisible.
 *
 * What is never done
 * ------------------
 * Nothing here derives, infers or backfills a signal from `cohortSize`. A
 * cohort always shrinks - that is what a cohort does as constraints
 * accumulate - so shrinkage on its own carries no information about whether
 * anything surprising happened. The cohort is drawn as a row of counts beneath
 * the axis, deliberately not as the loudest mark on the card.
 *
 * Real cohort computation is TASK-0044 under M9. This module renders whatever
 * that contract carries and adds no analysis of its own.
 */

export type MatchPathState = "LOADING" | "UNAVAILABLE" | "EMPTY" | "READY";

export function resolveMatchPathState(
  context: MatchPathContext | undefined,
  isLoading?: boolean
): MatchPathState {
  if (isLoading) {
    return "LOADING";
  }
  const points = context?.points ?? null;
  if (!context || points === null) {
    // Not retrieved. Deliberately never "EMPTY".
    return "UNAVAILABLE";
  }
  return points.length === 0 ? "EMPTY" : "READY";
}

export interface MatchPathNode {
  pointKey: string;
  label: string;
  /** `60'`, or empty where the contract gave no minute. */
  minuteLabel: string;
  kind: MatchPathPointKind;
  cohortSize: number;
  /** True where this point's own cohort is under the published threshold. */
  belowReliableCohort: boolean;
  confidence: number | null;
  /** Straight from the contract. Never synthesised from the cohort. */
  stateNormality: number | null;
  /** Straight from the contract. Never synthesised from the cohort. */
  eventSurprise: number | null;
  /** Horizontal position, 0-1 across the plot. */
  x: number;
  /**
   * Vertical position, 0-1, with 0 at the top of the plot.
   *
   * `null` where the contract gave no normality: an unmeasured state has no
   * position, and the line breaks rather than being interpolated across it.
   */
  y: number | null;
}

function minuteLabel(point: MatchPathPoint): string {
  return point.minute === null ? "" : `${point.minute}'`;
}

/**
 * Turns the contract's points into plottable nodes.
 *
 * Nodes are spaced evenly by sequence rather than positioned by minute. The
 * chart is a record of steps, not a timeline, and `minute` is nullable - laying
 * it out as a time axis would either drop the unminuted points or place them
 * somewhere they did not happen.
 */
export function matchPathNodes(
  context: MatchPathContext | undefined
): MatchPathNode[] {
  const points = context?.points ?? null;
  if (!context || !points || points.length === 0) {
    return [];
  }

  const lastIndex = points.length - 1;
  return points.map((point, index) => ({
    pointKey: point.pointKey,
    label: point.label,
    minuteLabel: minuteLabel(point),
    kind: point.kind,
    cohortSize: point.cohortSize,
    belowReliableCohort: point.cohortSize < context.minimumReliableCohort,
    // Surviving count is the explicit display denominator, including when an
    // older BFF still sends confidence based on the larger pre-event count.
    confidence: point.confidence === null ? null : Math.min(1, point.cohortSize / context.minimumReliableCohort),
    stateNormality: point.stateNormality,
    eventSurprise: point.eventSurprise,
    x: lastIndex === 0 ? 0.5 : index / lastIndex,
    y:
      point.stateNormality === null
        ? null
        : clampUnit(1 - point.stateNormality)
  }));
}

export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

export function clampPercentage(value: number): number {
  return clampUnit(value / 100) * 100;
}

/**
 * The line, split into the stretches that can honestly be drawn.
 *
 * A point with no normality breaks the line instead of being bridged: joining
 * across it would draw a state the contract never reported. A stretch of one
 * node is kept rather than dropped so the renderer can still mark it.
 */
export function normalityRuns(nodes: MatchPathNode[]): MatchPathNode[][] {
  const runs: MatchPathNode[][] = [];
  let current: MatchPathNode[] = [];
  for (const node of nodes) {
    if (node.y === null) {
      if (current.length) {
        runs.push(current);
        current = [];
      }
      continue;
    }
    current.push(node);
  }
  if (current.length) {
    runs.push(current);
  }
  return runs;
}

/** Nodes the contract gave a surprise value for. Never inferred. */
export function surpriseEvents(nodes: MatchPathNode[]): MatchPathNode[] {
  return nodes.filter((node) => node.eventSurprise !== null);
}


/**
 * The narrowing, stated in words above the chart.
 *
 * Purely descriptive. It says how many similar matches are left, and says
 * nothing about whether that is a lot, a little, or a sign of anything.
 */
export function cohortNarrowingSummary(
  context: MatchPathContext | undefined
): string | null {
  const nodes = matchPathNodes(context);
  const opening = nodes[0];
  const closing = nodes[nodes.length - 1];
  if (!context || !opening || !closing) {
    return null;
  }
  const first = context.initialCohortSize || opening.cohortSize;
  return `${first} benzer maçtan ${closing.cohortSize} tanesi bu yolu izledi`;
}

/**
 * Caveat shown when the cohort is too small to be characteristic.
 *
 * Raised by either ground: the payload said `LOW_SAMPLE`, or the final cohort
 * has fallen under the published threshold. The wording deliberately does not
 * call a small cohort a surprise, because it is not one.
 */
export function lowCohortNotice(
  context: MatchPathContext | undefined
): string | null {
  const nodes = matchPathNodes(context);
  const last = nodes[nodes.length - 1];
  if (!context || !last) {
    return null;
  }
  if (context.availability !== "LOW_SAMPLE" && !last.belowReliableCohort) {
    return null;
  }
  return (
    `Kalan kohort ${last.cohortSize} maç; geçici yeterlilik eşiği ` +
    `${context.minimumReliableCohort} maç. Kohortun daralması ` +
    `tek başına sürpriz anlamına gelmez.`
  );
}

export const surpriseLabel = "Olay sürprizi";
export const normalityLabel = "Durum normalliği";
export const normalAxisLabel = "Olağan";
export const unusualAxisLabel = "Sıra dışı";

/** Spoken description of one node, used only as the accessibility label. */
export function describeNodeForAccessibility(node: MatchPathNode): string {
  return [
    [node.minuteLabel, node.label].filter(Boolean).join(" "),
    `${node.cohortSize} benzer maç`,
    node.eventSurprise === null
      ? null
      : `${surpriseLabel} ${Math.round(node.eventSurprise * 100)}%`,
    node.stateNormality === null
      ? `${normalityLabel} ölçülmedi`
      : `${normalityLabel} ${Math.round(node.stateNormality * 100)}%`,
    node.confidence === null
      ? null
      : `örneklem yeterliliği ${Math.round(node.confidence * 100)}%`
  ]
    .filter(Boolean)
    .join(", ");
}
