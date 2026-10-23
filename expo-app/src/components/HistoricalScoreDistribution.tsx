import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RebuildPoolPath } from "@/src/api/rebuild-statistics-schemas";
import { colors, interaction, numericFont, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { historicalScoreView } from "@/src/utils/historical-score-view";
import { formatHistoricalFraction, historicalFractionWidth } from "@/src/utils/statistical-geometry";
import { SurfaceMaterial } from "./SurfaceMaterial";

export function HistoricalScoreDistribution({ match, pool, now, allowLegacy = false }: {
  match: { status: string; elapsed: number; homeScore: number; awayScore: number; phase?: string | undefined; scoreDistribution: { score: string; probability: number }[] };
  pool?: RebuildPoolPath | undefined;
  now: number;
  allowLegacy?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const view = historicalScoreView(match, pool, now);
  const source = view.source;
  // Legacy rows carry full-time outcomes only. Never relabel them as first half.
  const rows = source ? source.rows.map(row => ({ score: row.score, probability: row.share, count: row.count })) :
    view.period === "2H" && allowLegacy ? match.scoreDistribution.map(row => ({ ...row, count: null })) : [];
  const visible = expanded ? rows : rows.slice(0, 6);
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.head}>
      <Text style={styles.period}>{view.label}</Text>
      {source ? <Text style={styles.meta}>{source.minute}′ · {source.total} referans</Text> : null}
    </View>
    <Text style={styles.meta}>Tarihsel örnek payı · kazanma olasılığı değildir.</Text>
    {visible.length ? visible.map(row => <View key={row.score} accessible accessibilityLabel={`${row.score}, ${formatHistoricalFraction(row.probability)}${row.count === null ? "" : `, ${row.count} referans`}`} style={styles.row}>
      <Text style={styles.score}>{row.score}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: historicalFractionWidth(row.probability) ?? "0%" }]} /></View>
      <Text style={styles.value}>{formatHistoricalFraction(row.probability)}</Text>
    </View>) : <Text style={styles.empty}>{view.message}</Text>}
    {rows.length > 6 ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.action}>
      <Text style={styles.link}>{expanded ? "Daha az göster" : `Tüm ${rows.length} skoru göster`}</Text>
    </Pressable> : null}
    {source ? <Text style={styles.meta}>Bu skor durumundaki {source.period === "1H" ? "ilk yarı" : "maç sonu"} referansları. Farklı SAP kayıtları aynı fiziksel maçı içerebilir.</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft },
  head: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  period: { ...typeScale.bodyCompact, fontWeight: "700", color: colors.text },
  meta: { ...typeScale.label, color: colors.textMuted, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 30 },
  score: { ...numericFont("700"), fontSize: 18, color: colors.text, width: 46 },
  track: { flex: 1, height: 6, borderRadius: radii.round, backgroundColor: colors.surfaceStrong, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.round, backgroundColor: semantic.intelligence },
  value: { ...numericFont("700"), fontSize: 16, color: colors.text, minWidth: 52, textAlign: "right" },
  empty: { ...typeScale.bodyCompact, color: colors.textMuted },
  action: { minHeight: interaction.minTouchTarget, justifyContent: "center" },
  link: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700" }
});
