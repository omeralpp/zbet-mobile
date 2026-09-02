import { useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";
import type { MatchPathContext } from "@/src/api/schemas";
import {
  colors,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { CaveatLine, OriginBadge } from "./IntelligenceNotice";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { SystemState } from "./StateView";
import {
  cohortNarrowingSummary,
  describeNodeForAccessibility,
  isNotableSurprise,
  lowCohortNotice,
  matchPathNodes,
  normalAxisLabel,
  normalityLabel,
  normalityRuns,
  pathVerdict,
  resolveMatchPathState,
  surpriseEvents,
  surpriseHeadline,
  surpriseLabel,
  unusualAxisLabel,
  verdictLabels,
  type MatchPathNode
} from "./match-path-chart";

/** Plot height. Tall enough to read a slope, short enough to sit in a card. */
const plotHeight = 132;
/** Inset so a marker on the top or bottom edge is not clipped by the frame. */
const plotInset = 12;
/**
 * Column width for the label and cohort rows beneath the plot.
 *
 * Sized so the common four-point path fits a phone without scrolling; a longer
 * path scrolls sideways rather than compressing its labels to nothing.
 */
const columnWidth = 78;

/**
 * Match Path normality chart (M15 / TASK-0045).
 *
 * Draws the match's path through its similar-match cohort as one trajectory:
 * a continuous line for the running state, and markers on that line for the
 * discrete events the contract scored for surprise.
 *
 * The two are drawn differently because they are different kinds of thing. A
 * state exists at every point; a surprise belongs to an event, and the
 * contract leaves it null everywhere else. That is also what lets the chart
 * show a goal being surprising at 60' while the match settles back toward an
 * ordinary state afterwards - the shape a reader is actually asking about.
 *
 * The cohort is a row of counts under the axis rather than the loudest mark on
 * the card, because a shrinking cohort is what happens in every match and
 * carries no information about surprise on its own.
 *
 * Real cohort computation is TASK-0044 under M9; this renders the contract.
 */
export function MatchPathChart({
  context,
  isLoading
}: {
  context: MatchPathContext | undefined;
  isLoading?: boolean;
}) {
  const [plotWidth, setPlotWidth] = useState(0);
  const state = resolveMatchPathState(context, isLoading);

  if (state === "LOADING") {
    return <SystemState kind="LOADING" />;
  }

  if (state === "UNAVAILABLE") {
    return (
      <SystemState
        kind="UNAVAILABLE"
        message="Benzer maç yolu şu anda kullanılamıyor. Maç detayının geri kalanı etkilenmez."
      />
    );
  }

  if (state === "EMPTY") {
    return (
      <SystemState
        kind="EMPTY"
        message="Bu maç henüz benzer maç yolu oluşturmadı."
      />
    );
  }

  const nodes = matchPathNodes(context);
  const verdict = verdictLabels[pathVerdict(nodes)];
  const headline = surpriseHeadline(context);
  // The plot is as wide as its label columns so the axis and the rows beneath
  // it stay aligned when a long path scrolls sideways.
  const trackWidth = Math.max(plotWidth, nodes.length * columnWidth);

  return (
    <View style={styles.card} onLayout={onPlotLayout(setPlotWidth)}>
      <SurfaceMaterial radius={radii.lg} />

      <View style={styles.header}>
        <Text style={styles.summary}>{cohortNarrowingSummary(context)}</Text>
        {verdict ? (
          <View style={styles.verdictPill}>
            <Text style={styles.verdictText}>{verdict}</Text>
          </View>
        ) : null}
      </View>

      <OriginBadge origin={context?.origin} />

      <View style={styles.legend}>
        <LegendItem color={semantic.intelligence} label={normalityLabel} shape="LINE" />
        <LegendItem color={semantic.surprise} label={surpriseLabel} shape="DOT" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroller}
      >
        <View>
          <View style={styles.plotRow}>
            <View style={styles.axis}>
              <Text style={styles.axisLabel}>{normalAxisLabel}</Text>
              <Text style={styles.axisLabel}>{unusualAxisLabel}</Text>
            </View>
            {trackWidth > 0 ? (
              <PathPlot nodes={nodes} width={trackWidth} />
            ) : null}
          </View>

          <View style={[styles.labelRow, { width: trackWidth }]}>
            {nodes.map((node) => (
              <NodeLabel key={node.pointKey} node={node} />
            ))}
          </View>

          <View style={[styles.cohortRow, { width: trackWidth }]}>
            {nodes.map((node) => (
              <Text
                key={node.pointKey}
                style={[
                  styles.cohortValue,
                  node.belowReliableCohort && styles.cohortValueThin
                ]}
              >
                {node.cohortSize}
              </Text>
            ))}
          </View>
          <Text style={[styles.cohortCaption, { width: trackWidth }]}>
            Benzer maç
          </Text>
        </View>
      </ScrollView>

      {headline ? (
        <View style={styles.alert}>
          <View style={styles.alertMark} />
          <Text style={styles.alertText}>{headline}</Text>
        </View>
      ) : null}

      <CaveatLine text={lowCohortNotice(context)} />
    </View>
  );
}

function onPlotLayout(setWidth: (width: number) => void) {
  return (event: LayoutChangeEvent) => {
    // The axis gutter and the card padding are not part of the plot.
    const next = event.nativeEvent.layout.width - spacing.lg * 2 - 46;
    setWidth(next > 0 ? next : 0);
  };
}

/**
 * The trajectory itself.
 *
 * Everything is positioned from the normalised geometry, so the rules about
 * where a line may and may not be drawn live in the tested module rather than
 * in this renderer.
 */
function PathPlot({
  nodes,
  width
}: {
  nodes: MatchPathNode[];
  width: number;
}) {
  // Each node sits at the centre of its own label column, so a marker and the
  // text naming it line up exactly. Anchoring the plot to its own inset instead
  // would drift the two apart by half a column at the right-hand end.
  const cellWidth = width / Math.max(nodes.length, 1);
  const usableHeight = plotHeight - plotInset * 2;
  const toX = (x: number) => cellWidth / 2 + x * (width - cellWidth);
  const toY = (y: number) => plotInset + y * usableHeight;
  const runs = normalityRuns(nodes);
  const events = surpriseEvents(nodes);
  const midY = toY(0.5);

  return (
    <Svg height={plotHeight} width={width}>
      {/* The unusual half, tinted rather than filled: the categorical read is
          worth having, but a solid band would spend more colour than one
          module on one screen is entitled to. */}
      <Rect
        fill={semantic.surprise}
        fillOpacity={0.07}
        height={plotHeight - midY}
        width={width}
        x={0}
        y={midY}
      />
      <Line
        stroke={colors.borderSoft}
        strokeDasharray="3 4"
        strokeWidth={1}
        x1={0}
        x2={width}
        y1={midY}
        y2={midY}
      />

      {/* A dashed drop at every scored event, so the line's shape can be read
          against what happened rather than as an unexplained bend. */}
      {events.map((node) => (
        <Line
          key={`marker-${node.pointKey}`}
          stroke={isNotableSurprise(node) ? semantic.surprise : colors.border}
          strokeDasharray="2 4"
          strokeWidth={1}
          x1={toX(node.x)}
          x2={toX(node.x)}
          y1={plotInset / 2}
          y2={plotHeight - plotInset / 2}
        />
      ))}

      {runs.map((run) => {
        const drawn = run.filter(
          (node): node is MatchPathNode & { y: number } => node.y !== null
        );
        if (drawn.length < 2) {
          return null;
        }
        return (
          <Polyline
            key={`run-${drawn[0]?.pointKey}`}
            fill="none"
            points={drawn
              .map((node) => `${toX(node.x)},${toY(node.y)}`)
              .join(" ")}
            stroke={semantic.intelligence}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        );
      })}

      {nodes.map((node) => {
        if (node.y === null) {
          return null;
        }
        const scored = node.eventSurprise !== null;
        const notable = isNotableSurprise(node);
        return (
          <Circle
            key={`node-${node.pointKey}`}
            cx={toX(node.x)}
            cy={toY(node.y)}
            fill={
              notable
                ? semantic.surprise
                : scored
                  ? colors.backgroundElevated
                  : semantic.intelligence
            }
            r={notable ? 6 : 4}
            stroke={scored ? semantic.surprise : semantic.intelligence}
            strokeWidth={2}
          />
        );
      })}
    </Svg>
  );
}

function NodeLabel({ node }: { node: MatchPathNode }) {
  return (
    <View
      accessibilityLabel={describeNodeForAccessibility(node)}
      accessible
      style={styles.labelCell}
    >
      <Text
        numberOfLines={3}
        style={[styles.label, isNotableSurprise(node) && styles.labelNotable]}
      >
        {[node.minuteLabel, node.label].filter(Boolean).join(" ")}
      </Text>
      <Text style={styles.confidence}>
        {node.confidence === null
          ? "güven yok"
          : `%${Math.round(node.confidence * 100)} güven`}
      </Text>
    </View>
  );
}

function LegendItem({
  color,
  label,
  shape
}: {
  color: string;
  label: string;
  shape: "LINE" | "DOT";
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          shape === "LINE" ? styles.legendLine : styles.legendDot,
          { backgroundColor: color }
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  summary: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18
  },
  verdictPill: {
    backgroundColor: colors.surfaceStrong,
    borderColor: semantic.surprise,
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  verdictText: {
    color: semantic.surprise,
    ...typeScale.label
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  legendLine: {
    borderRadius: 1,
    height: 2,
    width: 14
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10
  },
  legendText: {
    color: colors.textMuted,
    ...typeScale.label
  },
  scroller: {
    paddingRight: spacing.sm
  },
  plotRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  axis: {
    height: plotHeight,
    justifyContent: "space-between",
    paddingVertical: plotInset / 2,
    width: 38
  },
  axisLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  labelRow: {
    flexDirection: "row",
    paddingLeft: 46
  },
  labelCell: {
    alignItems: "center",
    flex: 1,
    gap: 1,
    paddingHorizontal: 2
  },
  label: {
    color: colors.textMuted,
    textAlign: "center",
    ...typeScale.label
  },
  labelNotable: {
    color: semantic.surprise,
    fontWeight: "800"
  },
  confidence: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  cohortRow: {
    flexDirection: "row",
    paddingLeft: 46,
    paddingTop: spacing.xs
  },
  cohortValue: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  cohortValueThin: {
    color: colors.textSubtle
  },
  cohortCaption: {
    color: colors.textSubtle,
    paddingLeft: 46,
    paddingTop: 1,
    ...typeScale.label
  },
  alert: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm
  },
  alertMark: {
    backgroundColor: semantic.surprise,
    borderRadius: 2,
    marginTop: 3,
    width: 3,
    alignSelf: "stretch"
  },
  alertText: {
    color: colors.textMuted,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17
  }
});
