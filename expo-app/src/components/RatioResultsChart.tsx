import { StyleSheet, Text, View } from "react-native";
import type {
  MatchDetail,
  MatchMarketRate,
  RatioResult
} from "@/src/api/schemas";
import { colors, radii, spacing } from "@/src/theme/theme";
import { formatRate } from "@/src/utils/format";

type RatioPhase = NonNullable<MatchDetail["ratioPhase"]>;

const phaseDefinitions: {
  key: RatioPhase;
  field: keyof Pick<RatioResult, "kickOff" | "halfTime" | "live">;
  label: string;
  color: string;
}[] = [
  { key: "KICK_OFF", field: "kickOff", label: "Kick-Off", color: colors.blue },
  { key: "HALF_TIME", field: "halfTime", label: "Devre", color: colors.gold },
  { key: "LIVE", field: "live", label: "Canlı", color: colors.green }
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
  const phases = phase ? visiblePhases(phase, rows) : [];
  const activeLabel = phaseDefinitions.find((item) => item.key === phase)?.label;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Geçmiş sonuç eşleşmesi</Text>
          <Text style={styles.caption}>
            Benzer oran ve skor koşullarındaki sonuç yüzdeleri
          </Text>
        </View>
        {activeLabel ? (
          <View style={styles.phasePill}>
            <Text style={styles.phasePillText}>{activeLabel}</Text>
          </View>
        ) : null}
      </View>

      {rows.length && phases.length ? (
        <>
          <View style={styles.legend}>
            {phases.map((item) => (
              <View key={item.key} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.rows}>
            {rows.map((row) => {
              const marketRate = marketRates.find(
                (rate) =>
                  rate.sort === row.sort && rate.betType === row.betType
              );
              const rateText = marketRate
                ? marketRate.liveRate === null
                  ? "kapalı"
                  : formatRate(marketRate.liveRate)
                : "—";
              return (
                <View
                  accessibilityLabel={`${row.betType} geçmiş sonuç yüzdeleri, canlı oran ${rateText}`}
                  key={`${row.sort}:${row.betType}`}
                  style={styles.row}
                >
                  <View style={styles.rowHeader}>
                    <Text numberOfLines={1} style={styles.betType}>
                      {row.betType}
                    </Text>
                    <View style={styles.marketRate}>
                      <Text style={styles.marketRateLabel}>Canlı oran</Text>
                      <Text
                        style={[
                          styles.marketRateValue,
                          marketRate?.liveRate === null &&
                            styles.marketRateClosed
                        ]}
                      >
                        {rateText}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bars}>
                    {phases.map((item) => {
                      const value = row[item.field];
                      if (value === null) {
                        return null;
                      }
                      const width: `${number}%` = `${Math.min(100, Math.max(0, value))}%`;
                      return (
                        <View key={item.key} style={styles.barLine}>
                          <View style={styles.track}>
                            <View
                              style={[
                                styles.fill,
                                { backgroundColor: item.color, width }
                              ]}
                            />
                          </View>
                          <Text style={styles.value}>%{Math.round(value)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
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
    backgroundColor: colors.backgroundElevated,
    padding: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  caption: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3
  },
  phasePill: {
    borderColor: colors.green,
    borderRadius: radii.round,
    borderWidth: 1,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  phasePillText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900"
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700"
  },
  rows: {
    gap: spacing.md,
    marginTop: spacing.lg
  },
  row: {
    gap: spacing.sm
  },
  rowHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  betType: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  marketRate: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  marketRateLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "700"
  },
  marketRateValue: {
    color: colors.green,
    fontSize: 11,
    fontWeight: "900"
  },
  marketRateClosed: {
    color: colors.textMuted
  },
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
    color: colors.textMuted,
    width: 30,
    textAlign: "right",
    fontSize: 9,
    fontWeight: "800"
  },
  empty: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.lg,
    textAlign: "center"
  }
});
