import { useState } from "react";
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
  View,
  useWindowDimensions
} from "react-native";
import type { TotoPrediction } from "@/src/api/schemas";
import { totoProgramQuery } from "@/src/api/queries";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { FilterChip } from "@/src/components/FilterChip";
import { Action } from "@/src/components/RebuildEvidencePanel";
import { totoStatusColor } from "@/src/components/TotoProgramCard";
import { Screen } from "@/src/components/Screen";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { EmptyState, ErrorState, LoadingState } from "@/src/components/StateView";
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
import { filterTotoResults, summarizeTotoResults, type TotoResultFilter } from "@/src/utils/toto-results";
import { TotoCouponGrid } from "@/src/web/TotoCouponGrid";
import { TotoRefreshNotice } from "@/src/components/TotoRefreshNotice";
import { totoQueryView } from "@/src/utils/toto-query-view";

const resultFilters: { value: TotoResultFilter; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "OPEN", label: "Bekliyor" },
  { value: "MISS", label: "Kapsam dışı" },
  { value: "COVERAGE", label: "Kapsamada" }
];

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
      router.replace("/toto");
    }
  };
  const query = useQuery(totoProgramQuery(gcNo, version));
  const [resultFilter, setResultFilter] = useState<TotoResultFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  };
  // Desktop has a coupon grid; split only when both columns have room.
  const breakpoint = useBreakpoint();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const split = desktop && width >= 1360;
  const inlineMetrics = desktop ? !split : width >= 375;
  const view = totoQueryView(query);

  if (view.kind === "loading") {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
        <LoadingState label="Toto programı hazırlanıyor" />
      </Screen>
    );
  }

  if (view.kind === "unavailable") {
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

  const program = view.data;
  const statusColor = totoStatusColor(program.status);
  const resultSummary = summarizeTotoResults(program.predictions);
  const resultTotal = resultSummary.total || program.fixtures.length;
  const visiblePredictions = filterTotoResults(program.predictions, resultFilter);
  const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

  return (
    <Screen
      edgeSwipeBack
      onEdgeSwipeBack={handleEdgeSwipeBack}
      wide
      contentStyle={styles.screen}
      fixedHeader={view.kind === "retained" ? <TotoRefreshNotice receivedAt={view.receivedAt} refreshing={query.isFetching} onRetry={() => { void refresh(); }} /> : undefined}
      scrollProps={{
        alwaysBounceVertical: true,
        refreshControl: (
          <RefreshControl
            colors={[colors.green]}
            onRefresh={() => { void refresh(); }}
            refreshing={refreshing}
            tintColor={colors.green}
          />
        )
      }}
    >
      <View style={split ? styles.desktopColumns : undefined}>
      <View style={split ? styles.summaryColumn : desktop ? styles.summaryOverview : undefined}>
      <View style={[styles.hero, desktop && !split && styles.overviewCard]}>
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
          <View style={[styles.metric, inlineMetrics && styles.overviewMetric]}>
            <Text style={styles.metricValue}>{number.format(program.columns)}</Text>
            <Text style={styles.metricLabel}>kolon</Text>
          </View>
          <View style={[styles.metric, inlineMetrics && styles.overviewMetric]}>
            <Text style={styles.metricValue}>{number.format(program.cost)}</Text>
            <Text style={styles.metricLabel}>maliyet</Text>
          </View>
          <View style={[styles.metric, inlineMetrics && styles.overviewMetric]}>
            <Text style={styles.metricValue}>{program.mainHits ?? "—"}</Text>
            <Text style={styles.metricLabel}>ana isabet</Text>
          </View>
          <View style={[styles.metric, inlineMetrics && styles.overviewMetric]}>
            <Text style={styles.metricValue}>
              {program.coverageHits ?? "—"}
            </Text>
            <Text style={styles.metricLabel}>kapsama</Text>
          </View>
        </View>
        <Text style={styles.contextNote}>Kapsama = ana isabet + kupondaki diğer isabetler. Kupon kazancı değildir. Maliyet birimi kaynakta belirtilmiyor.</Text>
        <Text style={styles.distribution}>
          {program.singleCount} tek · {program.doubleCount} çift ·{" "}
          {program.tripleCount} üçlü
        </Text>
        <Text style={styles.updatedAt}>
          Son güncelleme: {formatTimestamp(program.updatedAt)}
        </Text>
      </View>

      {resultTotal > 0 ? (
        <View style={[styles.resultProgressCard, desktop && !split && styles.overviewCard]}>
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
              <Text style={[styles.resultMetric, { color: semantic.intelligence }]}>{resultSummary.open} bekliyor</Text>
            </View>
          ) : null}
          {resultFilter !== "ALL" ? <Text style={styles.contextNote}>Programın tamamı · aşağıdaki filtreler yalnızca maç listesini daraltır.</Text> : null}
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
      {program.predictions.length > 0 ? <View style={styles.listControls}>
        <View style={styles.filters}>
          {resultFilters.map(option => <FilterChip key={option.value} label={option.label} count={filterTotoResults(program.predictions, option.value).length} selected={resultFilter === option.value} onPress={() => setResultFilter(option.value)} />)}
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.contextNote}>{visiblePredictions.length} / {program.predictions.length} maç · {resultFilters.find(option => option.value === resultFilter)?.label}</Text>
      </View> : null}
      {program.predictions.length > 0 && visiblePredictions.length === 0 ? (
        <View style={styles.listControls}>
          <EmptyState title="Bu filtrede maç yok" message="Programın tüm maçlarına dönerek diğer sonuçları inceleyebilirsin." />
          <Action icon="chevron-right" title="Tüm maçları göster" onPress={() => setResultFilter("ALL")} />
        </View>
      ) : program.predictions.length && desktop ? (
        <TotoCouponGrid
          onOpen={openBilyoner}
          predictions={visiblePredictions}
          presentResult={predictionResultPresentation}
        />
      ) : program.predictions.length ? visiblePredictions.map((prediction) => {
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
              styles.predictionStack,
              pressed && styles.pressed
            ]}
          >
            <View style={styles.predictionHeader}>
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
            </View>
            <View style={styles.predictionBottom}>
            <View style={styles.pickReadout}>
              <Text style={styles.metricLabel}>Ana tahmin <Text style={styles.pick}>{prediction.mainPick}</Text></Text>
              <Text style={styles.metricLabel}>Kapsama <Text style={styles.pick}>{prediction.coverage}</Text></Text>
            </View>
            <View style={styles.pickBlock}>
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
            </View>
            {prediction.eventId ? <Text style={styles.externalHint}>Bilyoner&apos;de aç ↗</Text> : null}
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
          Bu program için fikstür bilgisi henüz yok.
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
    flexBasis: 320,
    flexGrow: 0,
    flexShrink: 0
  },
  summaryOverview: { flexDirection: "row", alignItems: "flex-start", gap: spacing.lg, marginBottom: spacing.lg },
  overviewCard: { flex: 1, minWidth: 0, marginTop: 0 },
  metric: { flexBasis: "44%", flexGrow: 1, minWidth: 0 },
  overviewMetric: { flexBasis: "20%", minWidth: 60 },
  contextNote: { color: colors.textMuted, ...typeScale.label, lineHeight: 18, marginTop: spacing.sm },
  listControls: { gap: spacing.sm, marginBottom: spacing.md },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  predictionStack: { flexDirection: "column", alignItems: "stretch" },
  predictionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  predictionBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm },
  pickReadout: { flex: 1, minWidth: 0, gap: spacing.xs },
  externalHint: { ...typeScale.label, color: semantic.intelligence, alignSelf: "flex-end" },
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
    color: colors.text,
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
