import { StyleSheet, Text, View } from "react-native";
import { G, Line, Rect } from "react-native-svg";
import type { PressureInterval } from "@/src/utils/rebuild-pressure";
import { colors, numericFont, radii, spacing, textFont, typeScale } from "@/src/theme/theme";
import { activityHeadline } from "./match-path-activity";

/** Uses the journey's x function, cursor and axis; not a second chart. */
export function MatchActivityBars({ intervals, x, left, right, mid, height }: {
  intervals: readonly PressureInterval[]; x: (minute: number) => number;
  left: number; right: number; mid: number; height: number;
}) {
  const peak = Math.max(0, ...intervals.flatMap(point => [point.home, point.away]));
  const scale = (value: number) => peak ? value / peak * (height / 2 - 4) : 0;
  return <G>
    <Rect x={left} y={mid - height / 2} width={right - left} height={height} rx={8} fill={colors.background} opacity={0.5} />
    <Line x1={left} x2={right} y1={mid} y2={mid} stroke={colors.textMuted} strokeOpacity={0.6} />
    {intervals.map(point => {
      const at = x(point.startMinute), span = Math.max(1, x(point.endMinute) - at - 1);
      return <G key={point.key}>
        {point.home > 0 ? <Rect x={at} y={mid - 2 - scale(point.home)} width={span} height={scale(point.home)} rx={Math.min(2, span / 2)} fill={colors.blue} />
          : <Line x1={at} x2={at + span} y1={mid - 2} y2={mid - 2} stroke={colors.blue} />}
        {point.away > 0 ? <Rect x={at} y={mid + 2} width={span} height={scale(point.away)} rx={Math.min(2, span / 2)} fill={colors.orange} />
          : <Line x1={at} x2={at + span} y1={mid + 2} y2={mid + 2} stroke={colors.orange} />}
      </G>;
    })}
  </G>;
}

export function MatchActivitySummary({ intervals, match, failed, loading }: {
  intervals: readonly PressureInterval[]; match: { homeTeam: string; awayTeam: string; status: string; elapsed: number };
  failed: boolean; loading: boolean;
}) {
  const last = intervals.at(-1);
  return <View style={styles.summary} testID="match-activity-summary">
    <View style={styles.copy}>
      <Text style={styles.eyebrow}>MAÇIN RİTMİ · SON 5 DAKİKA</Text>
      <Text style={styles.headline}>{last ? activityHeadline(last, match) : loading ? "Hareketlilik yükleniyor…" : "Henüz doğrulanmış hareketlilik penceresi yok."}</Text>
      <Text style={styles.note}>{failed ? "Yenileme başarısız · kayıtlı geçmiş. " : ""}Tahmini hareketlilik · seçim hesabına katılmaz.</Text>
    </View>
    <View style={styles.teams}>
      <View style={[styles.team, { borderLeftColor: colors.blue }]}><Text style={styles.teamLabel}>{match.homeTeam}</Text><Text style={[styles.teamValue, { color: colors.blue }]}>{last?.homeText ?? "—"}</Text></View>
      <View style={[styles.team, { borderLeftColor: colors.orange }]}><Text style={styles.teamLabel}>{match.awayTeam}</Text><Text style={[styles.teamValue, { color: colors.orange }]}>{last?.awayText ?? "—"}</Text></View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  summary: { flex: 1, borderRadius: radii.md, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md, flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  copy: { flex: 1, minWidth: 180, gap: 4 },
  eyebrow: { ...typeScale.eyebrow, color: colors.textMuted },
  headline: { ...textFont("700"), fontSize: 16, lineHeight: 21, color: colors.text },
  note: { ...typeScale.label, color: colors.textMuted },
  teams: { flexDirection: "row", gap: spacing.lg, flexShrink: 1, flexWrap: "wrap" },
  team: { paddingLeft: spacing.sm, borderLeftWidth: 2, gap: 6, maxWidth: 160, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  teamLabel: { ...typeScale.label, color: colors.textMuted },
  teamValue: { ...numericFont("700"), fontSize: 24, lineHeight: 28 }
});
