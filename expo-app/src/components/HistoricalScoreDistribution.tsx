import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RebuildPoolPath } from "@/src/api/rebuild-statistics-schemas";
import { colors, interaction, numericFont, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { historicalScoreReachability, historicalScoreView, retainHistoricalReference, type HistoricalReference } from "@/src/utils/historical-score-view";
import { formatHistoricalFraction, historicalFractionWidth } from "@/src/utils/statistical-geometry";
import { SurfaceMaterial } from "./SurfaceMaterial";

export function HistoricalScoreDistribution({ match, pool, now, allowLegacy = false }: {
  match: { status: string; elapsed: number; homeScore: number; awayScore: number; phase?: string | undefined; lastUpdatedAt?: string | undefined; clock?: { period: string } | undefined; scoreDistribution: { score: string; probability: number }[] };
  pool?: RebuildPoolPath | undefined;
  now: number;
  allowLegacy?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const view = historicalScoreView(match, pool, now);
  const [reference, setReference] = useState<HistoricalReference>({ period: view.period, source: view.source });
  const nextReference = retainHistoricalReference(reference, view.period, view.source);
  if (nextReference !== reference) setReference(nextReference);
  const source = nextReference.source;
  // Legacy rows carry full-time outcomes only. Never relabel them as first half.
  const rows = source ? source.rows.map(row => ({ score: row.score, probability: row.share, count: row.count })) :
    view.period === "2H" && allowLegacy ? match.scoreDistribution.map(row => ({ ...row, count: null })) : [];
  const classified = rows.map(row => ({ ...row, reachability: historicalScoreReachability(row.score, match, view.period, now) }));
  const visible = expanded ? classified : classified.slice(0, 6);
  const unreachable = classified.some(row => row.reachability === "UNREACHABLE");
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.head}>
      <Text style={styles.period}>{view.label}</Text>
      {source ? <Text style={styles.meta}>Referans {source.minute}′ · {source.homeScore}–{source.awayScore} · {source.total} kayıt</Text> : null}
    </View>
    <Text style={styles.meta}>Tarihsel örnek payı · kazanma olasılığı değildir.</Text>
    {visible.length ? visible.map(row => {
      const inactive = row.reachability === "UNREACHABLE";
      return <View key={row.score} accessible accessibilityLabel={`${row.score}, ${formatHistoricalFraction(row.probability)}${row.count === null ? "" : `, ${row.count} referans`}${inactive ? ", güncel skorla artık ulaşılamaz" : row.reachability === "UNKNOWN" ? ", ulaşılabilirlik doğrulanmadı" : ""}`} style={styles.row}>
        <View style={styles.scoreCell}><Text style={[styles.score, inactive && styles.inactive]}>{row.score}</Text>
          {inactive ? <Text style={styles.status}>Ulaşılamaz</Text> : null}</View>
        <View style={styles.track}><View style={[styles.fill, inactive && styles.inactiveFill, { width: historicalFractionWidth(row.probability) ?? "0%" }]} /></View>
        <Text style={[styles.value, inactive && styles.inactive]}>{formatHistoricalFraction(row.probability)}</Text>
      </View>;
    }) : <Text style={styles.empty}>{view.message}</Text>}
    {unreachable ? <Text style={styles.meta}>Soluk skorlar: güncel skorla artık ulaşılamaz. Tarihsel sayılar korunur.</Text> : null}
    {source && !view.source ? <Text style={styles.meta}>Kaydedilmiş referans havuz gösteriliyor · {view.message}</Text> : null}
    {rows.length > 6 ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={styles.action}>
      <Text style={styles.link}>{expanded ? "Daha az göster" : `Tüm ${rows.length} skoru göster`}</Text>
    </Pressable> : null}
    {source ? <Text style={styles.meta}>Kaydedilmiş {source.period === "1H" ? "ilk yarı" : "maç sonu"} referansları; paylar yeniden hesaplanmaz. Farklı SAP kayıtları aynı fiziksel maçı içerebilir.</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft },
  head: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  period: { ...typeScale.bodyCompact, fontWeight: "700", color: colors.text },
  meta: { ...typeScale.label, color: colors.textMuted, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 30 },
  scoreCell: { width: 72 },
  score: { ...numericFont("700"), fontSize: 18, color: colors.text },
  status: { ...typeScale.label, color: colors.textMuted, fontSize: 12 },
  inactive: { color: colors.textMuted },
  inactiveFill: { backgroundColor: colors.textMuted, opacity: 0.4 },
  track: { flex: 1, height: 6, borderRadius: radii.round, backgroundColor: colors.surfaceStrong, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.round, backgroundColor: semantic.intelligence },
  value: { ...numericFont("700"), fontSize: 16, color: colors.text, minWidth: 52, textAlign: "right" },
  empty: { ...typeScale.bodyCompact, color: colors.textMuted },
  action: { minHeight: interaction.minTouchTarget, justifyContent: "center" },
  link: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700" }
});
