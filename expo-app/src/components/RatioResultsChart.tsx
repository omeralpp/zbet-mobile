import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type {
  MatchDetail,
  MatchMarketRate,
  RatioResult
} from "@/src/api/schemas";
import {
  colors,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { ratioMarketRateDisplay } from "./ratio-market-rate";
import { formatHistoricalFraction, historicalFractionWidth } from "@/src/utils/statistical-geometry";
import { formatSelection } from "@/src/utils/format";

type RatioPhase = NonNullable<MatchDetail["ratioPhase"]>;

const phaseDefinitions: {
  key: RatioPhase;
  field: keyof Pick<RatioResult, "kickOff" | "halfTime" | "live">;
  label: string;
  color: string;
  softColor: string;
}[] = [
  {
    key: "KICK_OFF",
    field: "kickOff",
    label: "Maç önü",
    color: semantic.intelligence,
    softColor: semantic.intelligenceSoft
  },
  {
    key: "HALF_TIME",
    field: "halfTime",
    label: "Devre",
    // Half-time is a structural boundary, not a warning or an outcome.
    color: colors.bronze,
    softColor: colors.surfaceStrong
  },
  {
    key: "LIVE",
    field: "live",
    label: "Canlı",
    color: semantic.live,
    softColor: semantic.liveSoft
  }
];

function visiblePhases(phase: RatioPhase, rows: RatioResult[]) {
  const activeIndex = phaseDefinitions.findIndex((item) => item.key === phase);
  return phaseDefinitions
    .slice(0, activeIndex + 1)
    .filter((item) => rows.some((row) => row[item.field] !== null));
}

export function RatioResultsChart({
  marketRates,
  phase,
  rows
}: {
  marketRates: MatchMarketRate[];
  phase: MatchDetail["ratioPhase"];
  rows: RatioResult[];
}) {
  const [expanded, setExpanded] = useState(false);
  const phases = phase ? visiblePhases(phase, rows) : [];
  const activePhase = phaseDefinitions.find((item) => item.key === phase);
  // Preserve source order and shares. A zero is evidence; a missing phase is not.
  const availableRows = rows.filter((row) => phases.some((item) => row[item.field] !== null));
  const visibleRows = expanded ? availableRows : availableRows.slice(0, 6);

  return (
    <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Tarihsel pazar payları</Text>
          <Text style={styles.caption}>
            Benzer oran ve skor koşullarındaki geçmiş kayıtlar.
          </Text>
        </View>
        {activePhase ? (
          <View
            style={[
              styles.phasePill,
              {
                backgroundColor: activePhase.softColor,
                borderColor: activePhase.color
              }
            ]}
          >
            <Text style={[styles.phasePillText, { color: activePhase.color }]}>
              {activePhase.label}
            </Text>
          </View>
        ) : null}
      </View>

      {availableRows.length && phases.length ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.meta}>{visibleRows.length} / {availableRows.length} pazar</Text>
            <Text style={styles.meta}>Tarihsel pay · kazanma olasılığı değildir.</Text>
          </View>
          <View style={styles.rows}>
            {visibleRows.map((row) => {
              const marketRate = marketRates.find(
                (rate) =>
                  rate.sort === row.sort && rate.betType === row.betType
              );
              const rateDisplay = ratioMarketRateDisplay(marketRate, phase);
              const label = formatSelection(row.betType);
              const shares = phases.flatMap((item) => row[item.field] === null ? [] :
                [`${item.label} ${formatHistoricalFraction(row[item.field]! / 100)}`]).join(", ");
              return (
                <View
                  accessible
                  accessibilityLabel={`${label}, ${shares}; ${rateDisplay.accessibilityText}`}
                  key={`${row.sort}:${row.betType}`}
                  style={styles.row}
                >
                  <View style={styles.rowHeader}>
                    <View style={styles.marketIdentity}>
                      <Text style={styles.betType}>{label}</Text>
                      {label !== row.betType ? <Text style={styles.marketCode}>{row.betType}</Text> : null}
                    </View>
                    <View style={styles.marketRate}>
                      <Text style={styles.marketRateLabel}>
                        {rateDisplay.label}
                      </Text>
                      <Text
                        style={[
                          styles.marketRateValue,
                          rateDisplay.label !== "Canlı oran" && styles.referenceRate,
                          rateDisplay.isClosed && styles.marketRateClosed
                        ]}
                      >
                        {rateDisplay.text}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bars}>
                    {phases.map((item) => {
                      const value = row[item.field];
                      if (value === null) {
                        return null;
                      }
                      const width = historicalFractionWidth(value / 100);
                      if (width === null) return null;
                      return (
                        <View key={item.key} style={styles.barLine}>
                          {phases.length > 1 ? <Text style={styles.phaseLabel}>{item.label}</Text> : null}
                          <View style={styles.track}>
                            <View
                              style={[
                                styles.fill,
                                { backgroundColor: item.color, width }
                              ]}
                            />
                          </View>
                          <Text style={styles.value}>{formatHistoricalFraction(value / 100)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
          {availableRows.length > 6 ? <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            aria-expanded={expanded}
            onPress={() => setExpanded(!expanded)}
            style={styles.action}
          >
            <Text style={styles.link}>{expanded ? "İlk 6 pazarı göster" : `Tüm ${availableRows.length} pazarı göster`}</Text>
          </Pressable> : null}
        </>
      ) : (
        <Text style={styles.empty}>
          Bu maç aşaması için geçmiş oran-sonuç verisi henüz oluşmadı.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    flexWrap: "wrap"
  },
  headerCopy: {
    flex: 1,
    minWidth: 140
  },
  title: {
    color: colors.text,
    ...typeScale.identity
  },
  caption: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    marginTop: spacing.xs
  },
  phasePill: {
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  phasePillText: {
    ...typeScale.micro
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  meta: {
    color: colors.textMuted,
    ...typeScale.label
  },
  rows: {
    gap: spacing.md,
    marginTop: spacing.lg
  },
  row: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: spacing.md
  },
  rowHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  marketIdentity: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 120,
    minWidth: 0,
    gap: 2
  },
  betType: {
    color: colors.text,
    ...typeScale.identityCompact
  },
  marketCode: { ...typeScale.micro, color: colors.textSubtle },
  marketRate: {
    alignItems: "flex-end",
    flexShrink: 1,
    maxWidth: "100%",
    gap: 2
  },
  marketRateLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    textAlign: "right"
  },
  marketRateValue: {
    color: semantic.live,
    ...typeScale.metricCompact
  },
  marketRateClosed: {
    color: colors.textMuted
  },
  referenceRate: { color: colors.text },
  bars: {
    flex: 1,
    gap: 4
  },
  barLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radii.round
  },
  value: {
    color: colors.text,
    minWidth: 60,
    flexShrink: 0,
    textAlign: "right",
    ...typeScale.label
  },
  phaseLabel: { ...typeScale.micro, color: colors.textMuted, width: 50 },
  action: { minHeight: interaction.minTouchTarget, justifyContent: "center", marginTop: spacing.md },
  link: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700" },
  empty: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    marginTop: spacing.lg,
    textAlign: "center"
  }
});
