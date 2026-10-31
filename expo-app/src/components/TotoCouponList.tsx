import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoPrediction } from "@/src/api/schemas";
import { colors, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatFixtureDateTime, formatPercentage } from "@/src/utils/format";
import { couponCells } from "@/src/web/toto-coupon";

type ResultPresentation = (result: TotoPrediction["result"]) => { color: string; label: string };

/**
 * Phone Toto coupon: the desktop grid's 1/X/2 encoding in one compact row per
 * match (main pick filled, other coverage outlined, settled result ringed),
 * with a result stripe. A row opens its details and the Bilyoner link, so the
 * whole coupon fits about one screen instead of fifteen cards.
 */
export function TotoCouponList({ predictions, presentResult, onOpen }: {
  predictions: readonly TotoPrediction[]; presentResult: ResultPresentation; onOpen: (eventId: number | null) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendCell, styles.cellMain]} /><Text style={styles.meta}>Ana tahmin</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendCell, styles.cellCovered]} /><Text style={styles.meta}>Kapsama</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendCell, styles.legendActual]} /><Text style={styles.meta}>Gerçekleşen sonuç</Text></View>
      </View>
      <Text style={styles.hint}>Satıra dokun: ayrıntılar ve Bilyoner bağlantısı.</Text>
      <View style={styles.table}>
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={[styles.row, styles.headRow]}>
          <View style={styles.stripe} />
          <Text style={[styles.head, styles.no]}>#</Text>
          <Text style={[styles.head, styles.match]}>Maç</Text>
          {["1", "X", "2"].map(outcome => <Text key={outcome} style={[styles.head, styles.cellColumn]}>{outcome}</Text>)}
        </View>
        {predictions.map((prediction, index) => {
          const open = expanded === prediction.matchNo;
          const presentation = presentResult(prediction.result);
          const score = prediction.homeScore !== null && prediction.awayScore !== null ? `${prediction.homeScore}-${prediction.awayScore}` : null;
          const when = formatFixtureDateTime(prediction.matchDate, prediction.matchTime);
          return (
            <View key={prediction.matchNo} style={[index % 2 === 1 && styles.zebra, open && styles.openRow]}>
              <Pressable
                accessibilityHint="Maç ayrıntılarını açar"
                accessibilityLabel={`${prediction.matchNo}. ${prediction.matchName}, ana tahmin ${prediction.mainPick}, kapsama ${prediction.coverage}, ${presentation.label}${prediction.actualResult ? `, sonuç ${prediction.actualResult}` : ""}`}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                // React Native Web does not forward expanded state; name it for the web reader.
                aria-expanded={open}
                onPress={() => setExpanded(open ? null : prediction.matchNo)}
                style={({ pressed, hovered }) => [styles.row, hovered && styles.hover, pressed && styles.pressed]}
              >
                <View style={[styles.stripe, prediction.result !== "OPEN" && { backgroundColor: presentation.color }]} />
                <Text style={[styles.number, styles.no]}>{prediction.matchNo}</Text>
                <View style={styles.match}>
                  <Text numberOfLines={1} style={styles.matchName}>{prediction.matchName}</Text>
                  <Text numberOfLines={1} style={styles.meta}>{score ? `Skor ${score}` : when}</Text>
                </View>
                {couponCells(prediction).map(cell => (
                  <View key={cell.outcome} style={[styles.ring, cell.actual && styles.ringActual]}>
                    <View style={[styles.cell, cell.covered && styles.cellCovered, cell.main && styles.cellMain]}>
                      <Text style={[styles.cellText, cell.main && styles.cellTextMain, !cell.covered && styles.cellTextOff]}>{cell.outcome}</Text>
                    </View>
                  </View>
                ))}
              </Pressable>
              {open ? (
                <View style={styles.details}>
                  <Text style={[styles.status, { color: presentation.color }]}>{presentation.label}</Text>
                  <Text style={styles.detailName}>{prediction.matchName}</Text>
                  <Text style={styles.detail}>{when}{score ? ` · Skor ${score}` : ""}</Text>
                  <Text style={styles.detail}>Ana tahmin {prediction.mainPick} · Kapsama {prediction.coverage}{prediction.actualResult ? ` · Sonuç ${prediction.actualResult}` : ""}</Text>
                  <Text style={styles.detail}>Model güveni {formatPercentage(prediction.confidence)} · kazanma olasılığı değildir</Text>
                  {prediction.eventId ? (
                    <Pressable accessibilityHint="Karşılaşmayı Bilyoner uygulamasında veya web sitesinde açar" accessibilityRole="link"
                      onPress={() => onOpen(prediction.eventId)} style={({ pressed }) => [styles.external, pressed && styles.pressed]}>
                      <Text style={styles.externalText}>Bilyoner&apos;de aç ↗</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xs },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  legendCell: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: "transparent" },
  legendActual: { borderColor: colors.gold, borderWidth: 2 },
  hint: { ...typeScale.meta, color: colors.textSubtle, marginBottom: spacing.sm },
  table: { backgroundColor: colors.backgroundElevated, borderColor: colors.borderSoft, borderRadius: radii.lg, borderWidth: 1, marginBottom: spacing.xl, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 48, paddingRight: spacing.sm },
  headRow: { minHeight: 32, backgroundColor: colors.background },
  head: { ...typeScale.micro, color: colors.textSubtle, textTransform: "uppercase" },
  zebra: { backgroundColor: `${colors.surface}40` },
  openRow: { backgroundColor: colors.surface },
  hover: { backgroundColor: colors.surface },
  pressed: { opacity: 0.76 },
  // The result stripe repeats the row's outcome colour at the edge; open rows stay blank.
  stripe: { alignSelf: "stretch", width: 3, backgroundColor: "transparent" },
  no: { width: 22, textAlign: "center" },
  number: { ...typeScale.metricCompact, color: colors.textMuted },
  match: { flex: 1, minWidth: 0 },
  matchName: { ...typeScale.identityCompact, color: colors.text },
  meta: { ...typeScale.meta, color: colors.textSubtle },
  cellColumn: { width: 34, textAlign: "center" },
  ring: { width: 34, height: 32, alignItems: "center", justifyContent: "center", borderRadius: radii.sm + 2, borderWidth: 2, borderColor: "transparent" },
  ringActual: { borderColor: colors.gold },
  cell: { width: 26, height: 24, alignItems: "center", justifyContent: "center", borderRadius: radii.sm, borderWidth: 1.5, borderColor: "transparent" },
  cellCovered: { borderColor: semantic.positive },
  cellMain: { backgroundColor: semantic.positive },
  cellText: { ...typeScale.metricCompact, fontSize: 14, lineHeight: 16, color: colors.text },
  cellTextMain: { color: colors.background },
  cellTextOff: { color: colors.textSubtle, opacity: 0.5 },
  details: { gap: 4, paddingLeft: 34, paddingRight: spacing.md, paddingBottom: spacing.md },
  status: { ...typeScale.micro },
  detailName: { ...typeScale.identityCompact, color: colors.text },
  detail: { ...typeScale.label, letterSpacing: 0, color: colors.textMuted },
  external: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  externalText: { ...typeScale.bodyCompact, fontWeight: "700", color: semantic.intelligence }
});
