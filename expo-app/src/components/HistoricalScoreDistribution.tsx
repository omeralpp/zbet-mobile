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
  const [showMethod, setShowMethod] = useState(false);
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
  const unknownReachability = classified.some(row => row.reachability === "UNKNOWN");
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.head}>
      <Text style={styles.period}>{view.label}</Text>
      {source ? <View style={styles.countPill}><Text style={styles.count}>{source.total} referans kaydı</Text></View> : null}
    </View>
    {source ? <Text style={styles.meta}>Referans anı {source.minute}′ · skor {source.homeScore}–{source.awayScore}</Text> : null}
    <Text style={styles.meta}>Tarihsel örnek payı · kazanma olasılığı değildir.</Text>
    {visible.length ? <View style={styles.columns}><Text style={styles.meta}>Skor</Text><Text style={styles.meta}>{source ? "Kayıt / toplam · pay" : "Tarihsel pay"}</Text></View> : null}
    {visible.length ? visible.map(row => {
      const inactive = row.reachability === "UNREACHABLE";
      return <View key={row.score} accessible accessibilityLabel={`${row.score}, ${formatHistoricalFraction(row.probability)}${row.count === null ? "" : `, ${row.count} referans`}${inactive ? ", güncel skorla artık ulaşılamaz" : row.reachability === "UNKNOWN" ? ", ulaşılabilirlik doğrulanmadı" : ""}`} style={styles.row}>
        <View style={styles.scoreCell}><Text style={[styles.score, inactive && styles.inactive]}>{row.score}</Text>
          {inactive ? <Text style={styles.status}>Ulaşılamaz</Text> : null}</View>
        <View style={styles.track}><View style={[styles.fill, inactive && styles.inactiveFill, { width: historicalFractionWidth(row.probability) ?? "0%" }]} /></View>
        <View style={styles.valueCell}>
          {source && row.count !== null ? <Text style={[styles.recordCount, inactive && styles.inactive]}>{row.count} / {source.total}</Text> : null}
          <Text style={[styles.value, inactive && styles.inactive]}>{formatHistoricalFraction(row.probability)}</Text>
        </View>
      </View>;
    }) : <Text style={styles.empty}>{view.message}</Text>}
    {unreachable ? <Text style={styles.meta}>Soluk skorlar: güncel skorla artık ulaşılamaz. Tarihsel sayılar korunur.</Text> : null}
    {unknownReachability ? <Text style={styles.meta}>Güncel skorla ulaşılabilirlik doğrulanmadı.</Text> : null}
    {source && !view.source ? <Text style={styles.meta}>Kaydedilmiş referans havuz gösteriliyor · {view.message}</Text> : null}
    {rows.length > 6 ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} aria-expanded={expanded} onPress={() => setExpanded(!expanded)} style={styles.action}>
      <Text style={styles.link}>{expanded ? "İlk 6 skoru göster" : `Tüm ${rows.length} skoru göster`}</Text>
    </Pressable> : null}
    {source ? <>
      <Text style={styles.meta}>Kayıt sayısı, bağımsız maç sayısı değildir.</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMethod }}
        aria-expanded={showMethod}
        onPress={() => setShowMethod(!showMethod)} style={styles.methodAction}>
        <Text style={styles.link}>{showMethod ? "Referans bilgisini gizle" : "Referans bilgisi"}</Text>
      </Pressable>
      {showMethod ? <Text style={styles.meta}>Kaydedilmiş {source.period === "1H" ? "ilk yarı" : "maç sonu"} referansları gösterilir. Skor değişse veya liste kısaltılsa da paylar yeniden hesaplanmaz. Aynı maç birden çok referans kaydında yer alabilir.</Text> : null}
    </> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft },
  head: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  period: { ...typeScale.bodyCompact, fontWeight: "700", color: colors.text },
  countPill: { borderRadius: radii.round, backgroundColor: colors.surfaceStrong, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  count: { ...typeScale.label, color: colors.text, fontWeight: "700" },
  meta: { ...typeScale.label, color: colors.textMuted, lineHeight: 18 },
  columns: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 40 },
  scoreCell: { width: 76, flexShrink: 0 },
  score: { ...numericFont("700"), fontSize: 18, color: colors.text },
  status: { ...typeScale.label, color: colors.textMuted, fontSize: 12 },
  inactive: { color: colors.textMuted },
  inactiveFill: { backgroundColor: colors.textMuted, opacity: 0.4 },
  track: { flex: 1, height: 6, borderRadius: radii.round, backgroundColor: colors.surfaceStrong, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.round, backgroundColor: semantic.intelligence },
  valueCell: { minWidth: 76, alignItems: "flex-end", gap: 2 },
  recordCount: { ...typeScale.label, color: colors.textMuted, fontVariant: ["tabular-nums"] },
  value: { ...numericFont("700"), fontSize: 16, color: colors.text, textAlign: "right" },
  empty: { ...typeScale.bodyCompact, color: colors.textMuted },
  action: { minHeight: interaction.minTouchTarget, justifyContent: "center" },
  methodAction: { minHeight: interaction.minTouchTarget, justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.borderSoft },
  link: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700" }
});
