import { memo, useState } from "react";
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

function availableRatioRows(phase: MatchDetail["ratioPhase"], rows: RatioResult[], marketRates: MatchMarketRate[]) {
  const phases = phase ? visiblePhases(phase, rows) : [];
  // Preserve source order and shares. A zero is evidence; a missing phase is not.
  const available = rows.filter((row) => phases.some((item) => row[item.field] !== null));
  const knownMarkets = new Set(available.map(row => row.betType));
  for (const rate of marketRates) {
    if (rate.quoteReadAt && !knownMarkets.has(rate.betType)) {
      available.push({ sort: rate.sort, betType: rate.betType, kickOff: null, halfTime: null, live: null });
    }
  }
  return { phases, rows: available };
}

/** Whether the module has any market to show; the section shortcuts skip it otherwise. */
export function ratioResultsAvailable(phase: MatchDetail["ratioPhase"], rows: RatioResult[], marketRates: MatchMarketRate[] = []) {
  return availableRatioRows(phase, rows, marketRates).rows.length > 0;
}

const sameMarket = (left: string, right: string) => left.trim().toLocaleLowerCase("tr-TR") === right.trim().toLocaleLowerCase("tr-TR");

export const RatioResultsChart = memo(function RatioResultsChart({
  marketRates,
  phase,
  rows,
  pinnedMarket
}: {
  marketRates: MatchMarketRate[];
  phase: MatchDetail["ratioPhase"];
  rows: RatioResult[];
  /** The published BTB selection's market leads the list (owner decision, NXT-OBS-241). */
  pinnedMarket?: string | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const { phases, rows: availableRows } = availableRatioRows(phase, rows, marketRates);
  const hasHistory = phases.length > 0;
  const activePhase = hasHistory ? phaseDefinitions.find((item) => item.key === phase) : undefined;
  // Only the selection's market moves; every other market keeps its source order.
  const pinnedIndex = pinnedMarket ? availableRows.findIndex((row) => sameMarket(row.betType, pinnedMarket)) : -1;
  const orderedRows = pinnedIndex > 0
    ? [availableRows[pinnedIndex]!, ...availableRows.filter((_, index) => index !== pinnedIndex)]
    : availableRows;
  const visibleRows = expanded ? orderedRows : orderedRows.slice(0, 6);

  if (!availableRows.length) {
    return (
      <View style={styles.card}>
        <SurfaceMaterial radius={radii.lg} />
        <Text style={styles.emptyCompact}>Bu maç aşaması için geçmiş oran-sonuç verisi henüz yok.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{hasHistory ? "Tarihsel pazar payları" : "Canlı gol oranları"}</Text>
          {hasHistory ? <Text style={styles.caption}>
            Benzer oran ve skor koşullarındaki geçmiş kayıtlar.
          </Text> : null}
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

      <View style={styles.summary}>
        <Text style={styles.meta}>{visibleRows.length} / {availableRows.length} pazar</Text>
        {hasHistory ? <Text style={styles.meta}>Tarihsel pay · kazanma olasılığı değildir.</Text> : null}
      </View>
      <View style={styles.rows}>
            {visibleRows.map((row) => {
              const marketRate = marketRates.find(
                (rate) =>
                  rate.betType === row.betType && (rate.quoteReadAt || rate.sort === row.sort)
              );
              const rateDisplay = ratioMarketRateDisplay(marketRate, phase);
              const label = formatSelection(row.betType);
              const pinned = pinnedIndex >= 0 && row === availableRows[pinnedIndex];
              const shares = phases.flatMap((item) => row[item.field] === null ? [] :
                [`${item.label} ${formatHistoricalFraction(row[item.field]! / 100)}`]).join(", ");
              return (
                <View
                  accessible
                  accessibilityLabel={`${pinned ? "BTB seçimi, " : ""}${label}, ${shares}; ${rateDisplay.accessibilityText}`}
                  key={`${row.sort}:${row.betType}`}
                  style={[styles.row, pinned && styles.pinnedRow]}
                >
                  {pinned ? <Text style={styles.pinnedTag}>BTB SEÇİMİ</Text> : null}
                  <View style={styles.rowHeader}>
                    <View style={styles.marketIdentity}>
                      <Text style={styles.betType}>
                        {label}
                        {label !== row.betType ? <Text style={styles.marketCode}>{`  ${row.betType}`}</Text> : null}
                      </Text>
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
    </View>
  );
});

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
  pinnedRow: {
    borderLeftWidth: 2,
    borderLeftColor: colors.bronze,
    paddingLeft: spacing.sm
  },
  pinnedTag: {
    color: colors.bronze,
    ...typeScale.eyebrow,
    marginBottom: -spacing.xs
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
  // Label and rate on one line: the market row is two lines, not four.
  marketRate: {
    alignItems: "baseline",
    flexDirection: "row",
    flexShrink: 1,
    flexWrap: "wrap",
    justifyContent: "flex-end",
    marginLeft: "auto",
    maxWidth: "100%",
    columnGap: spacing.sm
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
  emptyCompact: {
    color: colors.textMuted,
    ...typeScale.bodyCompact
  }
});
