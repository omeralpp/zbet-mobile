import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";
import type { RebuildPressureHistory, RebuildStatistics } from "@/src/api/rebuild-statistics-schemas";
import { colors, fontFamilies, numericFont, radii, spacing, textFont, typeScale } from "@/src/theme/theme";
import { activityIntervals, currentPressureView, latestIntervalReading, pressureIntervals, pressureRuns } from "@/src/utils/rebuild-pressure";
import { possessionContext, type PossessionMatch } from "@/src/utils/rebuild-possession";
import { journeySvgAccessibility } from "./JourneyEventIcon";
import { edgeSafeLabel, pressureHeadline, pressureLeader } from "./pressure-chart";
import { PressureGoalMarkers } from "./PressureGoalMarkers";
import { SurfaceMaterial } from "./SurfaceMaterial";

/**
 * Two distinct backend series: confirmed pressure intervals over their actual
 * span, or one column per observed minute of five-minute activity estimates.
 * Neither is interpolated. Possession is supporting context, never a bar
 * weight. Native current pressure and its 74A parts stay in separate details.
 */
const HEIGHT = 202, LEFT = 12, RIGHT = 12;
const HOME_GOAL_Y = 12, TOP = 26, PLOT_BOTTOM = 150, AWAY_GOAL_Y = 164, AXIS_Y = 196;
const svgLabel = { fontSize: 11, fontWeight: "700", fontFamily: fontFamilies.text } as const;

export interface PressureGoalMark { key: string; minute: number; side: "HOME" | "AWAY"; kind?: "GOAL" | "SCORE_UPDATE" }

function unavailableText(history: RebuildPressureHistory | undefined, isLoading: boolean, isError: boolean) {
  if (isLoading) return "Baskı geçmişi yükleniyor…";
  if (isError || !history) return "Baskı geçmişi alınamadı.";
  if (history.availability === "NOT_STARTED") return "Maç başlamadı; baskı ilk doğrulanmış aralıkla gelir.";
  if (history.reason === "DUMMY_NOT_PUBLISHED") return "Örnek veride doğrulanmış baskı aralığı yok.";
  if (history.availability === "PARTIAL") return "Saha gözlemleri kaydedildi; doğrulanmış baskı aralığı henüz yok. Tek bir şut toplamı veya topa sahip olma ölçümü, zamana yayılan baskıyı tek başına göstermez.";
  return "Doğrulanmış baskı geçmişi şu an okunamadı; eksik seri gösterilmez.";
}

export function RebuildPressureChart({ match, history, statistics, goals, isLoading, isError, now }: {
  match: PossessionMatch & { homeTeam: string; awayTeam: string };
  now: number;
  history: RebuildPressureHistory | undefined;
  statistics: RebuildStatistics | undefined;
  goals: readonly PressureGoalMark[];
  isLoading: boolean;
  isError: boolean;
}) {
  const [width, setWidth] = useState(320);
  const [showDetails, setShowDetails] = useState(false);
  const [mode, setMode] = useState<"activity" | "confirmed">("activity");
  const nativeIntervals = useMemo(() => pressureIntervals(history), [history]);
  const rollingIntervals = useMemo(() => activityIntervals(history), [history]);
  const activityOffered = !!history?.activity;
  const rolling = mode === "activity" && activityOffered;
  const intervals = rolling ? rollingIntervals : nativeIntervals;
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
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const currentMinute = Math.max(0, Math.min(maxMinute, match.elapsed));
  const latest = intervals.at(-1);
  const balance = latest ? pressureLeader(latest.home, latest.away) : null;
  const homeShare = balance?.homeShare === null || balance?.homeShare === undefined ? null : Math.round(balance.homeShare * 100);
  const timeLabel = edgeSafeLabel(x(currentMinute), LEFT, LEFT + plotWidth, 34, 5);
  const possession = !isError ? possessionContext(statistics, match, now) : null;
  const confirmedGoals = goals.filter(goal=>goal.kind === "GOAL");
  const title = pressureHeadline(balance, match);
  const headline = rolling ? title?.replace("baskın", "daha hareketli").replace("Belirgin baskı yok", "Belirgin hareket yok") : title;
  const modeSwitch = activityOffered ? <View style={styles.modeSwitch}>
    {(["activity","confirmed"] as const).map(value=><Pressable key={value} accessibilityRole="button" accessibilityState={{selected:mode === value}}
      onPress={()=>setMode(value)} style={[styles.modeButton,mode === value && styles.modeSelected]}>
      <Text style={[styles.modeLabel,mode === value && styles.modeLabelSelected]}>{value === "activity" ? "5 dk hareketlilik" : "Doğrulanmış baskı"}</Text>
    </Pressable>)}
  </View> : null;

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

  if (!intervals.length && !confirmedGoals.length) {
    return <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      {modeSwitch}
      {!rolling ? currentBlock : null}
      <Text style={styles.empty}>{rolling ? "Beş dakikalık hareketlilik için yeterli ve kesintisiz kayıt yok. Eksik pencereler tahminle doldurulmaz." : unavailableText(history, isLoading, isError)}</Text>
      {possession ? <Text style={styles.meta}>{possession.label} · ek saha bilgisi</Text> : null}
    </View>;
  }

  const spoken = `Baskı grafiği. ${rolling ? `${intervals.length} beş dakikalık hareketlilik sütunu, tahmini; seçim hesabına katılmaz.` : `${intervals.length} doğrulanmış aralık.`} ${reading ? `Son kayıt ${reading.range}: ${headline}.` : ""}${confirmedGoals.length ? ` Takım rengindeki top işaretleri gol olaylarıdır: ${confirmedGoals.map(goal=>`${goal.minute}. dakika ${goal.side === "HOME" ? match.homeTeam : match.awayTeam}`).join(", ")}. Baskı değeri değildir.` : ""}${isError ? " Son okuma yenilenemedi; kayıtlı geçmiş." : ""}`;
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    {modeSwitch}
    {rolling ? <Text style={styles.eyebrow}>5 DAKİKALIK HAREKETLİLİK · TAHMİNİ</Text> : null}
    {isError ? <Text style={styles.meta}>Son okuma yenilenemedi · kayıtlı baskı geçmişi gösteriliyor.</Text> : null}
    <View style={styles.summary}>
      <Text style={styles.headline}>{reading ? `${reading.range} · ` : ""}{headline ?? "Baskı ölçümü yok"}</Text>
      {reading ? <Text style={styles.meta}>{live ? `Maç ${match.elapsed}′ · ` : ""}Son kayıtlı {rolling ? "pencere" : "aralık"}</Text> : null}
    </View>
    {homeShare !== null ? <View accessible accessibilityLabel={`Son ${rolling ? "penceredeki hareketlilik" : "aralıktaki baskı"} payı: ${match.homeTeam} yüzde ${homeShare}, ${match.awayTeam} yüzde ${100 - homeShare}.`} style={styles.balance}>
      <View style={styles.balanceTrack}>
        {homeShare > 0 ? <View style={[styles.balancePart, { flex: homeShare, backgroundColor: colors.blue }]} /> : null}
        {homeShare < 100 ? <View style={[styles.balancePart, { flex: 100 - homeShare, backgroundColor: colors.orange }]} /> : null}
      </View>
      <Text style={styles.balanceLabel}><Text style={{color:colors.blue}}>▲ %{homeShare}</Text> · <Text style={{color:colors.orange}}>%{100 - homeShare} ▼</Text></Text>
    </View> : null}
    <View style={styles.teams}>
      <Text numberOfLines={1} style={[styles.team, { color: colors.blue }]}>▲ {match.homeTeam}{reading ? ` ${reading.homeText}` : ""}</Text>
      <Text numberOfLines={1} style={[styles.team, styles.alignRight, { color: colors.orange }]}>{reading ? `${reading.awayText} ` : ""}{match.awayTeam} ▼</Text>
    </View>
    {possession ? <Text style={styles.meta}>{possession.label} · ek saha bilgisi</Text> : null}
    <View accessible accessibilityLabel={spoken} onLayout={(event) => setWidth(Math.max(160, event.nativeEvent.layout.width))}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} {...journeySvgAccessibility}>
        {axisMinutes.map((minute) => <Line key={minute} x1={x(minute)} x2={x(minute)} y1={TOP} y2={PLOT_BOTTOM} stroke={colors.borderSoft} strokeDasharray="2 5" />)}
        {live && currentMinute < maxMinute ? <Rect x={x(currentMinute)} y={TOP} width={x(maxMinute) - x(currentMinute)} height={PLOT_BOTTOM - TOP} fill={colors.textMuted} opacity={0.035} /> : null}
        {runs.map((run) => <G key={run[0]!.key}>
          {run.map((interval) => {
            const left = x(interval.startMinute);
            const span = Math.max(2, x(interval.endMinute) - left - 1.5);
            const opacity = interval.estimated ? 0.85 : 1;
            return <G key={interval.key}>
              {interval.home > 0 ? <Rect x={left} y={mid - 2 - scale(interval.home)} rx={Math.min(3, span / 2)} width={span} height={scale(interval.home)} fill={colors.blue} opacity={opacity} />
                : <Line x1={left} x2={left + span} y1={mid - 2} y2={mid - 2} stroke={colors.blue} strokeWidth={1} />}
              {interval.away > 0 ? <Rect x={left} y={mid + 2} rx={Math.min(3, span / 2)} width={span} height={scale(interval.away)} fill={colors.orange} opacity={opacity} />
                : <Line x1={left} x2={left + span} y1={mid + 2} y2={mid + 2} stroke={colors.orange} strokeWidth={1} />}
            </G>;
          })}
        </G>)}
        <Line x1={LEFT} x2={LEFT + plotWidth} y1={mid} y2={mid} stroke={colors.textMuted} strokeWidth={1.5} />
        {live ? <G>
          <Line x1={x(currentMinute)} x2={x(currentMinute)} y1={TOP - 5} y2={PLOT_BOTTOM + 7} stroke={colors.teal} strokeWidth={1.25} strokeDasharray="2 3" />
          <SvgText x={timeLabel.x} y={PLOT_BOTTOM + 30} textAnchor={timeLabel.anchor} fill={colors.teal} {...svgLabel}>{match.status === "HALF_TIME" ? "devre" : "şimdi"}</SvgText>
        </G> : null}
        <PressureGoalMarkers goals={goals} x={x} left={LEFT} right={LEFT+plotWidth} mid={mid} homeY={HOME_GOAL_Y} awayY={AWAY_GOAL_Y} />
      </Svg>
      {/* Native Text: Android SVG mis-measures the fallback prime when centred. */}
      {axisMinutes.map((minute) => {
        const anchor = minute === 0 ? 0 : minute >= maxMinute ? 1 : 0.5;
        return <Text key={minute} numberOfLines={1} pointerEvents="none"
          style={[styles.axis, { left: x(minute) - 40 * anchor, top: AXIS_Y - 12, textAlign: anchor === 0 ? "left" : anchor === 1 ? "right" : "center" }]}>{minute}′</Text>;
      })}
    </View>
    <Text style={styles.coverage}>
      {!intervals.length ? "Baskı ölçümü yok · kaydedilmiş gol olayları gösteriliyor." : rolling ? "Her sütun son 5 dakikayı gösterir · boşluklarda pencere doğrulanamadı. Seçim hesabına katılmaz." : `${intervals.length} doğrulanmış aralık${allEstimated ? " · tahmini ölçüm" : ""} · boşluklarda ölçüm yok.`}
    </Text>
    {confirmedGoals.length ? <Text style={styles.meta}>Top işareti: gol · ev mavi, deplasman turuncu</Text> : null}
    {currentBlock ? <>
      <Pressable accessibilityRole="button" accessibilityState={{expanded:showDetails}} onPress={()=>setShowDetails(!showDetails)} style={styles.detailsToggle}>
        <Text style={styles.detailsLabel}>{showDetails ? "BTB baskı ölçümünü gizle −" : "BTB baskı ölçümü +"}</Text>
      </Pressable>
      {showDetails ? currentBlock : null}
    </> : null}
    {goals.length ? <Text style={styles.meta}>{goals.every(goal=>goal.kind === "SCORE_UPDATE") ? "Skor kayıtları" : "Gol / skor kayıtları"}: {goals.map(goal => `${goal.minute}′ ${goal.side === "HOME" ? match.homeTeam : match.awayTeam}`).join(" · ")}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.sm, overflow: "hidden" },
  modeSwitch: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  modeButton: { flexGrow: 1, minHeight: 44, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radii.round, borderWidth: 1, borderColor: colors.borderSoft, alignItems: "center", justifyContent: "center" },
  modeSelected: { backgroundColor: colors.blueSoft, borderColor: colors.blue },
  modeLabel: { ...textFont("700"), fontSize: 12, color: colors.textMuted },
  modeLabelSelected: { color: colors.blue },
  summary: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" },
  headline: { ...typeScale.moduleTitle, color: colors.text, flexShrink: 1 },
  balance: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  balanceTrack: { flex: 1, flexDirection: "row", gap: 3, height: 7 },
  balancePart: { borderRadius: radii.round },
  balanceLabel: { ...textFont("700"), fontSize: 12 },
  detailsToggle: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  detailsLabel: { ...typeScale.label, color: colors.blue, fontWeight: "700" },
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
