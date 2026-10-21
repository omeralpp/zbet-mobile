import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { TotoPrediction } from "@/src/api/schemas";
import { totoProgramQuery } from "@/src/api/queries";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { Screen } from "@/src/components/Screen";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import {
  buildBilyonerMatchUrl,
  buildBilyonerTotoUrl
} from "@/src/external/bilyoner";
import {
  colors,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale,
  textFont,
  numericFont
} from "@/src/theme/theme";
import {
  formatFixtureDateTime,
  formatPercentage,
  formatProgramStatus,
  formatCurrencyAmount,
  formatTimestamp
} from "@/src/utils/format";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { summarizeTotoResults } from "@/src/utils/toto-results";
import { TotoCouponGrid } from "@/src/web/TotoCouponGrid";
import { totoProgramTone } from "@/src/utils/toto-status";

function predictionResultPresentation(result: TotoPrediction["result"]): {
  color: string;
  label: string;
} {
  if (result === "MAIN_HIT") {
    return { color: semantic.positive, label: "ANA TAHMİN" };
  }
  if (result === "COVERED") {
    // Deliberately still the raw gold. A covered prediction is the middle tier
    // of a three-tier outcome scale, and it is neither a warning nor a partial
    // positive - the semantic vocabulary has no honest name for it yet.
    return { color: colors.gold, label: "KUPONDA" };
  }
  if (result === "MISS") {
    return { color: semantic.negative, label: "KAPSAM DIŞI" };
  }
  return { color: semantic.intelligence, label: "BEKLİYOR" };
}

function openBilyoner(eventId: number | null): void {
  if (!eventId) {
    return;
  }
  Linking.openURL(buildBilyonerMatchUrl(eventId)).catch(() =>
    Alert.alert(
      "Bilyoner açılamadı",
      "Bu karşılaşmanın Bilyoner sayfası şu anda açılamıyor."
    )
  );
}

function numberParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

export default function TotoProgramDetailScreen() {
  const params = useLocalSearchParams<{
    gcNo?: string | string[];
    version?: string | string[];
  }>();
  const router = useRouter();
  const gcNo = numberParam(params.gcNo);
  const version = numberParam(params.version);
  const handleEdgeSwipeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const query = useQuery(totoProgramQuery(gcNo, version));
  // Desktop (≥1200 px, platform exception): summary beside a coupon grid.
  const breakpoint = useBreakpoint();
  const desktop = Platform.OS === "web" && isAtLeast(breakpoint, "wide");

  if (query.isLoading) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
        <LoadingState label="Toto programı hazırlanıyor" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
        <ErrorState
          error={query.error}
          message={
            query.error instanceof Error
              ? query.error.message
              : "Toto programı alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const program = query.data;
  const statusTone = totoProgramTone(program.status);
  const statusColor =
    statusTone === "LIVE"
      ? semantic.live
      : statusTone === "OPEN"
        ? semantic.intelligence
        : statusTone === "PROBLEM"
          ? semantic.negative
          : colors.textMuted;
  const resultSummary = summarizeTotoResults(program.predictions);
  const resultTotal = resultSummary.total || program.fixtures.length;

  return (
    <Screen
      edgeSwipeBack
      onEdgeSwipeBack={handleEdgeSwipeBack}
      wide
      contentStyle={styles.screen}
      scrollProps={{
        alwaysBounceVertical: true,
        refreshControl: (
          <RefreshControl
            colors={[colors.green]}
            onRefresh={() => query.refetch()}
            refreshing={query.isRefetching}
            tintColor={colors.green}
          />
        )
      }}
    >
      <View style={desktop ? styles.desktopColumns : undefined}>
      <View style={desktop ? styles.summaryColumn : undefined}>
      <View style={styles.hero}>
        <SurfaceMaterial radius={radii.xl} />
        <Text style={styles.eyebrow}>{program.weekText}</Text>
        <Text style={styles.title}>Program {program.gcNo}</Text>
        <View
          style={[styles.statusPill, { backgroundColor: `${statusColor}1F` }]}
        >
          <Text style={[styles.status, { color: statusColor }]}>
            {formatProgramStatus(program.status)}
          </Text>
        </View>
        <View style={styles.metrics}>
          <View>
            <Text style={styles.metricValue}>{program.columns}</Text>
            <Text style={styles.metricLabel}>kolon</Text>
          </View>
          <View>
            <Text style={styles.metricValue}>{new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(program.cost)}</Text>
            <Text style={styles.metricLabel}>maliyet</Text>
          </View>
          <View>
            <Text style={styles.metricValue}>{program.mainHits ?? "—"}</Text>
            <Text style={styles.metricLabel}>ana isabet</Text>
          </View>
          <View>
            <Text style={styles.metricValue}>
              {program.coverageHits ?? "—"}
            </Text>
            <Text style={styles.metricLabel}>kapsama</Text>
          </View>
        </View>
        <Text style={styles.distribution}>
          {program.singleCount} tek · {program.doubleCount} çift ·{" "}
          {program.tripleCount} üçlü
        </Text>
        <Text style={styles.updatedAt}>
          Son güncelleme: {formatTimestamp(program.updatedAt)}
        </Text>
      </View>

      {resultTotal > 0 ? (
        <View style={styles.resultProgressCard}>
          <View style={styles.resultProgressHeader}>
            <Text style={styles.resultProgressTitle}>Sonuçlar</Text>
            <Text style={styles.resultProgressValue}>
              {resultSummary.settled}/{resultTotal} sonuçlandı
            </Text>
          </View>
          <View style={styles.resultProgressTrack}>
            {resultSummary.total > 0 ? (
              <>
                <View
                  style={[
                    styles.resultProgressFill,
                    {
                      backgroundColor: colors.green,
                      flex: resultSummary.mainHits
                    }
                  ]}
                />
                <View
                  style={[
                    styles.resultProgressFill,
                    {
                      backgroundColor: colors.gold,
                      flex: resultSummary.coveredOnly
                    }
                  ]}
                />
                <View
                  style={[
                    styles.resultProgressFill,
                    {
                      backgroundColor: colors.red,
                      flex: resultSummary.misses
                    }
                  ]}
                />
                <View
                  style={[
                    styles.resultProgressFill,
                    {
                      backgroundColor: colors.textSubtle,
                      flex: resultSummary.open
                    }
                  ]}
                />
              </>
            ) : null}
          </View>
          {resultSummary.total > 0 ? (
            <View style={styles.resultMetrics}>
              <Text style={[styles.resultMetric, { color: colors.green }]}>
                {resultSummary.mainHits} ana isabet
              </Text>
              <Text style={[styles.resultMetric, { color: colors.gold }]}>
                {resultSummary.coveredOnly} Kuponda
              </Text>
              <Text style={[styles.resultMetric, { color: colors.red }]}>
                {resultSummary.misses} kapsam dışı
              </Text>
            </View>
          ) : null}
          <View style={styles.resultLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
              <Text style={styles.legendText}>Ana tahmin</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
              <Text style={styles.legendText}>Kuponda</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
              <Text style={styles.legendText}>Kapsam dışı</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.textSubtle }
                ]}
              />
              <Text style={styles.legendText}>Bekliyor</Text>
            </View>
          </View>
          {program.status === "RESULTED" && program.theoreticalPrize !== null ? (
            <View style={styles.prizeRow}>
              <View style={styles.prizeCopy}>
                <Text style={styles.prizeLabel}>Teorik ikramiye</Text>
                {program.payoutDescription ? (
                  <Text numberOfLines={2} style={styles.prizeDescription}>
                    {program.payoutDescription}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.prizeValue}>
                {formatCurrencyAmount(program.theoreticalPrize, program.theoreticalPrizeCurrency)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      </View>

      <View style={desktop ? styles.couponColumn : undefined}>
      <ModuleHeading
        eyebrow="KUPON"
        title={program.predictions.length ? "Tahminler" : "Aktif fikstür"}
      />
      {program.predictions.length && desktop ? (
        <TotoCouponGrid
          onOpen={openBilyoner}
          predictions={program.predictions}
          presentResult={predictionResultPresentation}
        />
      ) : program.predictions.length ? program.predictions.map((prediction) => {
        const presentation = predictionResultPresentation(prediction.result);
        return (
          <Pressable
            accessibilityRole="link"
            accessibilityHint="Karşılaşmayı Bilyoner uygulamasında veya web sitesinde açar"
            accessibilityLabel={`${prediction.matchNo}. ${prediction.matchName}, ana tahmin ${prediction.mainPick}, kupon ${prediction.coverage}, ${presentation.label}`}
            accessibilityState={{ disabled: !prediction.eventId }}
            disabled={!prediction.eventId}
            key={prediction.matchNo}
            onPress={() => openBilyoner(prediction.eventId)}
            style={({ pressed }) => [
              styles.predictionCard,
              pressed && styles.pressed
            ]}
          >
            <View style={styles.matchNo}>
              <Text style={styles.matchNoText}>{prediction.matchNo}</Text>
            </View>
            <View style={styles.predictionCopy}>
              <Text style={styles.matchName}>
                {prediction.matchName}
              </Text>
              <Text style={styles.predictionMeta}>
                {formatFixtureDateTime(
                  prediction.matchDate,
                  prediction.matchTime
                )}{" "}
                · Güven {formatPercentage(prediction.confidence)}
              </Text>
            </View>
            <View style={styles.pickBlock}>
              <Text style={styles.pick}>{prediction.coverage}</Text>
              <Text style={[styles.result, { color: presentation.color }]}>
                {presentation.label}
              </Text>
              {prediction.actualResult ? (
                <Text style={styles.actualResult}>
                  Sonuç {prediction.actualResult}
                </Text>
              ) : null}
              {prediction.homeScore !== null &&
              prediction.awayScore !== null ? (
                <Text style={styles.finalScore}>
                  Skor {prediction.homeScore}-{prediction.awayScore}
                </Text>
              ) : null}
            </View>
          </Pressable>
        );
      }) : program.fixtures.length ? (
        program.fixtures.map((fixture) => (
          <Pressable
            accessibilityRole="link"
            accessibilityHint="Karşılaşmayı Bilyoner uygulamasında veya web sitesinde açar"
            accessibilityLabel={`${fixture.matchNo}. ${fixture.matchName}; tahmin hazırlanıyor`}
            accessibilityState={{ disabled: !fixture.eventId }}
            disabled={!fixture.eventId}
            key={fixture.matchNo}
            onPress={() => openBilyoner(fixture.eventId)}
            style={({ pressed }) => [
              styles.predictionCard,
              pressed && styles.pressed
            ]}
          >
            <View style={styles.matchNo}>
              <Text style={styles.matchNoText}>{fixture.matchNo}</Text>
            </View>
            <View style={styles.predictionCopy}>
              <Text numberOfLines={1} style={styles.matchName}>
                {fixture.matchName}
              </Text>
              <Text style={styles.predictionMeta}>
                {formatFixtureDateTime(
                  fixture.matchDate,
                  fixture.matchTime
                )}
              </Text>
            </View>
            <Text style={styles.waitingPrediction}>Tahmin hazırlanıyor</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.emptyFixtures}>
          Aktif programın fikstür satırları henüz hazırlanmadı.
        </Text>
      )}
      </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityHint="Bilyoner uygulaması kuruluysa Spor Toto sayfasını uygulamada, değilse güvenli web sayfasında açar"
          accessibilityRole="link"
          onPress={() =>
            Linking.openURL(buildBilyonerTotoUrl()).catch(() =>
              Alert.alert(
                "Bilyoner açılamadı",
                "Bilyoner Spor Toto sayfası şu anda açılamıyor."
              )
            )
          }
          style={({ pressed }) => [
            styles.bilyonerAction,
            pressed && styles.actionPressed
          ]}
        >
          <Text style={styles.bilyonerActionText}>
            Bilyoner Spor Toto&apos;da aç
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.lg
  },
  desktopColumns: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.xxl
  },
  summaryColumn: {
    flexBasis: 400,
    flexGrow: 0,
    flexShrink: 0
  },
  couponColumn: {
    flex: 1,
    minWidth: 0
  },
  hero: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.xl,
    ...shadows.card
  },
  // Bronze, like every other module and hero label. The week was BTB green,
  // which spent the positive accent on a date.
  eyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow
  },
  title: {
    ...textFont("800"),
    color: colors.text,
    fontSize: 27,
    marginTop: spacing.sm
  },
  statusPill: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.round
  },
  status: {
    ...typeScale.micro,
    textTransform: "uppercase"
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft
  },
  metricValue: {
    color: colors.text,
    ...typeScale.metric
  },
  metricLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  distribution: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    marginTop: spacing.lg
  },
  updatedAt: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.sm
  },
  resultProgressCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginTop: spacing.lg,
    padding: spacing.lg
  },
  resultProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  resultProgressTitle: {
    ...textFont("800"),
    color: colors.text,
    fontSize: 14
  },
  resultProgressValue: {
    ...numericFont("800"),
    color: colors.green,
    fontSize: 14
  },
  resultProgressTrack: {
    height: 6,
    flexDirection: "row",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  resultProgressFill: {
    height: "100%",
    borderRadius: radii.round
  },
  resultMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md
  },
  resultMetric: {
    ...typeScale.micro
  },
  resultLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md
  },
  prizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft
  },
  prizeCopy: {
    flex: 1
  },
  prizeLabel: {
    ...textFont("800"),
    color: colors.text,
    fontSize: 12
  },
  prizeDescription: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  prizeValue: {
    ...numericFont("800"),
    color: colors.green,
    fontSize: 15,
    textAlign: "right"
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: radii.round
  },
  legendText: {
    color: colors.textMuted,
    ...typeScale.label
  },
  predictionCard: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  pressed: {
    opacity: 0.76
  },
  matchNo: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceStrong
  },
  matchNoText: {
    ...numericFont("800"),
    color: colors.blue,
    fontSize: 14
  },
  predictionCopy: {
    flex: 1
  },
  matchName: {
    ...textFont("800"),
    color: colors.text,
    fontSize: 13
  },
  predictionMeta: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  pickBlock: {
    alignItems: "flex-end"
  },
  pick: {
    ...numericFont("800"),
    color: colors.gold,
    fontSize: 16
  },
  result: {
    ...typeScale.micro,
    marginTop: spacing.xs
  },
  actualResult: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  finalScore: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  waitingPrediction: {
    color: colors.gold,
    maxWidth: 72,
    textAlign: "right",
    ...typeScale.label
  },
  emptyFixtures: {
    ...textFont("400"),
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 12,
    paddingVertical: spacing.xxl
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  bilyonerAction: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radii.round,
    justifyContent: "center",
    minHeight: 50
  },
  bilyonerActionText: {
    ...textFont("800"),
    color: colors.background,
    fontSize: 14
  },
  actionPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.995 }]
  }
});
