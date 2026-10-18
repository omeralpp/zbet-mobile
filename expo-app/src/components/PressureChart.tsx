import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import type { MatchDetail, MatchJourney } from "@/src/api/schemas";
import { colors, radii, spacing, typeScale } from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { journeySvgAccessibility } from "./JourneyEventIcon";
import { edgeSafeLabel, pressureHeadline, pressureSeries } from "./pressure-chart";

// Goals ride their own lanes outside the bars (home above, away below), and the
// minute axis sits under the away lane, so no label is drawn over a bar or
// outside the SVG.
const HEIGHT = 192, LEFT = 8, RIGHT = 8;
const HOME_GOAL_Y = 12, TOP = 26, PLOT_BOTTOM = 150, AWAY_GOAL_Y = 164, AXIS_Y = 186;
const GOAL_LABEL_WIDTH = 22;
const svgLabel = { fontSize: 11, fontWeight: "600", fontFamily: "sans-serif" } as const;

/** Home pressure rises above the axis, away pressure falls below it. */
export function PressureChart({ match, journey }: { match: MatchDetail; journey: MatchJourney | undefined }) {
  const [width, setWidth] = useState(320);
  const series = useMemo(() => pressureSeries(journey, match), [journey, match]);
  const { samples, goals, latest, peak, balance } = series;
  const headline = pressureHeadline(balance, match);
  const plotWidth = Math.max(120, width - LEFT - RIGHT);
  const maxMinute = Math.max(90, match.elapsed, ...samples.map(s => s.minute));
  const x = (minute: number) => LEFT + minute / maxMinute * plotWidth;
  const mid = (TOP + PLOT_BOTTOM) / 2;
  const half = (PLOT_BOTTOM - TOP) / 2 - 2;
  const bar = Math.max(3, Math.min(9, plotWidth / Math.max(24, samples.length * 2.2)));
  const scale = (value: number) => peak > 0 ? value / peak * half : 0;
  const homeShare = balance?.homeShare ?? null;
  const spoken = headline ? `Baskı grafiği. ${latest ? `Son ölçüm ${Math.round(latest.minute)}. dakika: ` : ""}${headline}.` : "Baskı ölçümü yok.";

  if (!samples.length) {
    return <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <Text style={styles.empty}>Bu maç için baskı ölçümü yok.</Text>
    </View>;
  }
  return <View style={styles.card} accessible accessibilityLabel={spoken}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.summary}>
      <Text style={styles.headline}>{headline}</Text>
      {latest ? <Text style={styles.meta}>son ölçüm {Math.round(latest.minute)}′</Text> : null}
    </View>
    {homeShare !== null ? <View style={styles.split}>
      <View style={[styles.splitHome, { flex: Math.max(0.02, homeShare) }]} />
      <View style={[styles.splitAway, { flex: Math.max(0.02, 1 - homeShare) }]} />
    </View> : null}
    <View style={styles.teams}>
      <Text numberOfLines={1} style={[styles.team, { color: colors.blue }]}>▲ {match.homeTeam}{homeShare !== null ? ` %${Math.round(homeShare * 100)}` : ""}</Text>
      <Text numberOfLines={1} style={[styles.team, styles.teamAway, { color: colors.orange }]}>{homeShare !== null ? `%${100 - Math.round(homeShare * 100)} ` : ""}{match.awayTeam} ▼</Text>
    </View>
    <View onLayout={event => setWidth(Math.max(160, event.nativeEvent.layout.width))}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} {...journeySvgAccessibility}>
        {[0, 45, 90].filter(m => m <= maxMinute).map(m => <G key={m}>
          <Line x1={x(m)} x2={x(m)} y1={TOP} y2={PLOT_BOTTOM} stroke={colors.borderSoft} strokeDasharray="2 5" />
          <SvgText x={x(m)} y={AXIS_Y} textAnchor={m === 0 ? "start" : m >= maxMinute ? "end" : "middle"} fill={colors.textMuted} {...svgLabel}>{m}′</SvgText>
        </G>)}
        <Rect x={LEFT} y={TOP} width={plotWidth} height={mid - TOP} fill={colors.blue} opacity={0.05} />
        <Rect x={LEFT} y={mid} width={plotWidth} height={PLOT_BOTTOM - mid} fill={colors.orange} opacity={0.05} />
        {samples.map(sample => <G key={sample.key}>
          <Rect x={x(sample.minute) - bar / 2} y={mid - scale(sample.home)} width={bar} height={Math.max(1, scale(sample.home))} rx={bar / 2} fill={colors.blue} />
          <Rect x={x(sample.minute) - bar / 2} y={mid} width={bar} height={Math.max(1, scale(sample.away))} rx={bar / 2} fill={colors.orange} />
        </G>)}
        <Line x1={LEFT} x2={LEFT + plotWidth} y1={mid} y2={mid} stroke={colors.textMuted} strokeWidth={1.5} />
        {goals.map(goal => {
          const cy = goal.side === "HOME" ? HOME_GOAL_Y : AWAY_GOAL_Y;
          const ink = goal.side === "HOME" ? colors.blue : colors.orange;
          const label = edgeSafeLabel(x(goal.minute), LEFT, LEFT + plotWidth, GOAL_LABEL_WIDTH);
          return <G key={goal.key}>
            <Line x1={x(goal.minute)} x2={x(goal.minute)} y1={goal.side === "HOME" ? HOME_GOAL_Y + 5 : mid} y2={goal.side === "HOME" ? mid : AWAY_GOAL_Y - 5} stroke={ink} strokeOpacity={0.35} />
            <Circle cx={x(goal.minute)} cy={cy} r={5} fill={colors.text} stroke={ink} strokeWidth={2} />
            <SvgText x={label.x} y={cy + 4} textAnchor={label.anchor} fill={colors.text} {...svgLabel}>gol</SvgText>
          </G>;
        })}
        {latest ? <Circle cx={x(latest.minute)} cy={mid} r={4} fill={colors.text} /> : null}
      </Svg>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.sm, overflow: "hidden" },
  summary: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" },
  headline: { ...typeScale.moduleTitle, color: colors.text, flexShrink: 1 },
  meta: { ...typeScale.label, color: colors.textMuted },
  split: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2 },
  splitHome: { backgroundColor: colors.blue },
  splitAway: { backgroundColor: colors.orange },
  teams: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  team: { ...typeScale.label, fontWeight: "700", flexShrink: 1 },
  teamAway: { textAlign: "right" },
  empty: { ...typeScale.bodyCompact, color: colors.textMuted }
});
