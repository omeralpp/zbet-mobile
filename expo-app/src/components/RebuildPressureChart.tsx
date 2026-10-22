import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Rect, Text as SvgText } from "react-native-svg";
import type { RebuildPressureHistory, RebuildStatistics } from "@/src/api/rebuild-statistics-schemas";
import { colors, fontFamilies, numericFont, radii, spacing, textFont, typeScale } from "@/src/theme/theme";
import { currentPressureView, latestIntervalReading, pressureIntervals, pressureRuns } from "@/src/utils/rebuild-pressure";
import { journeySvgAccessibility } from "./JourneyEventIcon";
import { edgeSafeLabel, pressureGoalGroups } from "./pressure-chart";
import { SurfaceMaterial } from "./SurfaceMaterial";

/**
 * Baskı grafiği on RB1 (btb-pressure-history.v1). Every verified interval is
 * drawn over its own minutes, home above the axis and away below; intervals
 * touch only where the backend joined them, so a gap stays a gap. Values are
 * the backend's; the client neither recomputes nor smooths them. The current
 * same-state interval (statistics endpoint) is shown apart, with its 74A parts.
 */
const HEIGHT = 196, LEFT = 8, RIGHT = 8;
const HOME_GOAL_Y = 12, TOP = 26, PLOT_BOTTOM = 152, AWAY_GOAL_Y = 166, AXIS_Y = 190;
const svgLabel = { fontSize: 11, fontWeight: "700", fontFamily: fontFamilies.text } as const;

export interface PressureGoalMark { key: string; minute: number; side: "HOME" | "AWAY" }

function unavailableText(history: RebuildPressureHistory | undefined, isLoading: boolean, isError: boolean) {
  if (isLoading) return "Baskı geçmişi yükleniyor…";
  if (isError || !history) return "Baskı geçmişi alınamadı.";
  if (history.availability === "NOT_STARTED") return "Maç başlamadı; baskı ilk doğrulanmış aralıkla gelir.";
  if (history.reason === "DUMMY_NOT_PUBLISHED") return "Örnek veride doğrulanmış baskı aralığı yok.";
  if (history.availability === "PARTIAL") return "Gözlem var ama doğrulanmış baskı aralığı yok.";
  return "Doğrulanmış baskı geçmişi şu an okunamadı; eksik seri gösterilmez.";
}

export function RebuildPressureChart({ match, history, statistics, goals, isLoading, isError }: {
  match: { homeTeam: string; awayTeam: string; elapsed: number; status: string };
  history: RebuildPressureHistory | undefined;
  statistics: RebuildStatistics | undefined;
  goals: readonly PressureGoalMark[];
  isLoading: boolean;
  isError: boolean;
}) {
  const [width, setWidth] = useState(320);
  const intervals = useMemo(() => pressureIntervals(history), [history]);
  const runs = useMemo(() => pressureRuns(intervals), [intervals]);
  const reading = latestIntervalReading(intervals, match);
  const current = currentPressureView(statistics?.pressure ?? null);
  const plotWidth = Math.max(120, width - LEFT - RIGHT);
  const maxMinute = Math.max(90, match.elapsed, ...intervals.map((interval) => interval.endMinute));
  const x = (minute: number) => LEFT + Math.min(minute, maxMinute) / maxMinute * plotWidth;
  const mid = (TOP + PLOT_BOTTOM) / 2;
  const half = (PLOT_BOTTOM - TOP) / 2 - 2;
  const peak = intervals.reduce((max, interval) => Math.max(max, interval.home, interval.away), 0);
  const scale = (value: number) => (peak > 0 ? value / peak * half : 0);
  const allEstimated = intervals.length > 0 && intervals.every((interval) => interval.estimated);
  const axisMinutes = [0, 45, 90].filter((minute) => minute <= maxMinute);

  const currentBlock = current ? <View style={styles.current}>
    <View style={styles.currentHead}>
      <Text style={styles.eyebrow}>GÜNCEL ARALIK · {current.range}{current.estimated ? " · TAHMİNİ" : ""}</Text>
    </View>
    <View style={styles.currentValues}>
      <Text style={[styles.currentValue, { color: colors.blue }]}>{match.homeTeam} {current.homeText}</Text>
      <Text style={[styles.currentValue, styles.alignRight, { color: colors.orange }]}>{current.awayText} {match.awayTeam}</Text>
    </View>
    {current.extended ? <>
      <Text style={styles.meta}>Taban {current.extended.baseHome} + ek {current.extended.extraHome} · taban {current.extended.baseAway} + ek {current.extended.extraAway}</Text>
      <View style={styles.optionalRow}>
        {current.extended.optional.map((item) => <View key={item.label} style={[styles.optional, !item.used && styles.optionalOff]}>
          <Text style={[styles.optionalText, !item.used && styles.optionalTextOff]}>{item.label}{item.used ? "" : " · yok"}</Text>
        </View>)}
      </View>
    </> : null}
  </View> : null;

  if (!intervals.length) {
    return <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      {currentBlock}
      <Text style={styles.empty}>{unavailableText(history, isLoading, isError)}</Text>
    </View>;
  }

  const spoken = `Baskı grafiği. ${intervals.length} doğrulanmış aralık. ${reading ? `Son kayıtlı aralık ${reading.range}: ${reading.headline}.` : ""}`;
  return <View style={styles.card} accessible accessibilityLabel={spoken}>
    <SurfaceMaterial radius={radii.lg} />
    {currentBlock}
    <View style={styles.summary}>
      <Text style={styles.headline}>{reading?.headline ?? "Baskı"}</Text>
      {reading ? <Text style={styles.meta}>son kayıtlı aralık {reading.range}</Text> : null}
    </View>
    <View style={styles.teams}>
      <Text numberOfLines={1} style={[styles.team, { color: colors.blue }]}>▲ {match.homeTeam}{reading ? ` ${reading.homeText}` : ""}</Text>
      <Text numberOfLines={1} style={[styles.team, styles.alignRight, { color: colors.orange }]}>{reading ? `${reading.awayText} ` : ""}{match.awayTeam} ▼</Text>
    </View>
    <View onLayout={(event) => setWidth(Math.max(160, event.nativeEvent.layout.width))}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} {...journeySvgAccessibility}>
        {axisMinutes.map((minute) => <Line key={minute} x1={x(minute)} x2={x(minute)} y1={TOP} y2={PLOT_BOTTOM} stroke={colors.borderSoft} strokeDasharray="2 5" />)}
        <Rect x={LEFT} y={TOP} width={plotWidth} height={mid - TOP} fill={colors.blue} opacity={0.05} />
        <Rect x={LEFT} y={mid} width={plotWidth} height={PLOT_BOTTOM - mid} fill={colors.orange} opacity={0.05} />
        {runs.map((run) => <G key={run[0]!.key}>
          {run.map((interval) => {
            const left = x(interval.startMinute);
            const span = Math.max(3, x(interval.endMinute) - left);
            const opacity = interval.estimated ? 0.72 : 0.95;
            return <G key={interval.key}>
              <Rect x={left} y={mid - scale(interval.home)} width={span} height={Math.max(1, scale(interval.home))} fill={colors.blue} opacity={opacity} />
              <Rect x={left} y={mid} width={span} height={Math.max(1, scale(interval.away))} fill={colors.orange} opacity={opacity} />
            </G>;
          })}
        </G>)}
        <Line x1={LEFT} x2={LEFT + plotWidth} y1={mid} y2={mid} stroke={colors.textMuted} strokeWidth={1.5} />
        {pressureGoalGroups(goals, x).map((goal) => {
          const cy = goal.side === "HOME" ? HOME_GOAL_Y : AWAY_GOAL_Y;
          const ink = goal.side === "HOME" ? colors.blue : colors.orange;
          const label = edgeSafeLabel(x(goal.minute), LEFT, LEFT + plotWidth, 36);
          return <G key={goal.key}>
            {goal.goals.map(mark => <G key={mark.key}>
              <Line x1={x(mark.minute)} x2={x(mark.minute)} y1={mark.side === "HOME" ? HOME_GOAL_Y + 5 : mid} y2={mark.side === "HOME" ? mid : AWAY_GOAL_Y - 5} stroke={ink} strokeOpacity={0.35} />
              <Circle cx={x(mark.minute)} cy={cy} r={5} fill={colors.text} stroke={ink} strokeWidth={2} />
            </G>)}
            <SvgText x={label.x} y={cy + 4} textAnchor={label.anchor} fill={colors.text} {...svgLabel}>{goal.goals.length > 1 ? `${goal.goals.length} gol` : "gol"}</SvgText>
          </G>;
        })}
      </Svg>
      {/* Native Text: Android SVG mis-measures the fallback prime when centred. */}
      {axisMinutes.map((minute) => {
        const anchor = minute === 0 ? 0 : minute >= maxMinute ? 1 : 0.5;
        return <Text key={minute} numberOfLines={1} pointerEvents="none"
          style={[styles.axis, { left: x(minute) - 40 * anchor, top: AXIS_Y - 12, textAlign: anchor === 0 ? "left" : anchor === 1 ? "right" : "center" }]}>{minute}′</Text>;
      })}
    </View>
    <Text style={styles.coverage}>
      {intervals.length} doğrulanmış aralık · tarihsel kayıt{allEstimated ? " · tahmini ölçüm" : ""}. Yalnız kaydedilen aralıklar çizilir; boşluklar ölçüm olmayan dakikalardır, maçın tamamı kanıtlanmadı.
    </Text>
    {goals.length ? <Text style={styles.meta}>Goller: {goals.map(goal => `${goal.minute}′ ${goal.side === "HOME" ? match.homeTeam : match.awayTeam}`).join(" · ")}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.sm, overflow: "hidden" },
  summary: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" },
  headline: { ...typeScale.moduleTitle, color: colors.text, flexShrink: 1 },
  meta: { ...typeScale.label, color: colors.textMuted },
  teams: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  team: { ...typeScale.label, fontWeight: "700", flexShrink: 1 },
  alignRight: { textAlign: "right" },
  coverage: { ...typeScale.label, color: colors.textMuted },
  axis: { position: "absolute", width: 40, ...textFont("700"), fontSize: 11, lineHeight: 14, color: colors.textMuted },
  empty: { ...typeScale.bodyCompact, color: colors.textMuted },
  current: { gap: 6, padding: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.background },
  currentHead: { flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { ...typeScale.eyebrow, color: colors.textMuted },
  currentValues: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  currentValue: { ...numericFont("700"), fontSize: 18, flexShrink: 1 },
  optionalRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  optional: { borderRadius: radii.round, backgroundColor: colors.blueSoft, paddingHorizontal: 8, paddingVertical: 3 },
  optionalOff: { backgroundColor: colors.surfaceStrong },
  optionalText: { ...textFont("700"), fontSize: 11, color: colors.blue },
  optionalTextOff: { color: colors.textMuted }
});
