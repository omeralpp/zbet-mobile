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
import { TotoProgressBar, totoStatusColor, useMinuteNow } from "@/src/components/TotoProgramCard";
import { TotoCouponList } from "@/src/components/TotoCouponList";
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
  formatProgramStatus,
  formatCurrencyAmount,
  formatTimestamp
} from "@/src/utils/format";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { filterTotoResults, type TotoResultFilter } from "@/src/utils/toto-results";
import { dayRange, formatCost, kickoffLabel, kickoffText, outOf, payoutRows, totoProgress } from "@/src/utils/toto-lifecycle";
import { TotoCouponGrid } from "@/src/web/TotoCouponGrid";
import { TotoRefreshNotice } from "@/src/components/TotoRefreshNotice";
import { totoQueryView } from "@/src/utils/toto-query-view";

const resultFilters: { value: TotoResultFilter; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "OPEN", label: "Bekliyor" },
  { value: "COVERAGE", label: "Kapsamada" },
  { value: "MISS", label: "Kapsam dışı" }
];

function predictionResultPresentation(result: TotoPrediction["result"]): {
  color: string;
  label: string;
} {
  if (result === "MAIN_HIT") {
    return { color: semantic.positive, label: "ANA İSABET" };
  }
  if (result === "COVERED") {
    // Deliberately still the raw gold. A covered prediction is the middle tier
    // of a three-tier outcome scale, and it is neither a warning nor a partial
    // positive - the semantic vocabulary has no honest name for it yet.
    return { color: colors.gold, label: "KAPSAMADA" };
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
  const now = useMinuteNow();
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
  const progress = totoProgress(program, now);
  const visiblePredictions = filterTotoResults(program.predictions, resultFilter);
  const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
  const of = (count: number | null) => outOf(count, progress.total);
  const span = progress.firstKickoff !== null && progress.lastKickoff !== null ? dayRange(progress.firstKickoff, progress.lastKickoff) : null;
  // SAP's coupon close when known, otherwise the first kickoff.
  const when = progress.deadline ? { label: progress.deadline.label, text: kickoffText(progress.deadline.at, now) } : { label: "İlk maç", text: "tarih bekleniyor" };
  const cost = formatCost(program.cost, program.costCurrency);
  const unitNote = program.costCurrency ? "" : " Maliyet birimi belirtilmiyor.";
  const plan = [{ value: number.format(program.columns), label: "kolon" }, { value: cost, label: "maliyet" }];
  const tiers = program.status === "RESULTED" && program.payouts?.length && program.costCurrency ? payoutRows(program.payouts, program.costCurrency) : [];
  // The overview answers this lifecycle's question: when play starts, how the
  // open program is going, or how it ended. Each count appears once.
  const metrics = program.status === "ACTIVE" ? progress.planned ? plan : []
    : program.status === "WAITING_RESULT" ? [{ value: `${progress.settled}/${progress.total}`, label: "sonuçlandı" },
      { value: program.coverageHits === null ? "—" : String(program.coverageHits), label: "kapsama" },
      { value: program.mainHits === null ? "—" : String(program.mainHits), label: "ana isabet" }, { value: of(progress.maxCoverage), label: "en fazla kapsama" }]
    : program.status === "RESULTED" ? [{ value: of(program.coverageHits), label: "kapsama" }, { value: of(program.mainHits), label: "ana isabet" }, ...plan]
    : [...plan, { value: program.mainHits === null ? "—" : String(program.mainHits), label: "ana isabet" }, { value: program.coverageHits === null ? "—" : String(program.coverageHits), label: "kapsama" }];
  const legend = ([["ana isabet", colors.green, progress.mainHits], ["kapsamada", colors.gold, progress.coveredOnly],
    ["kapsam dışı", colors.red, progress.misses], ["bekliyor", colors.textSubtle, progress.open]] as const).filter(([, , count]) => count > 0);
  const note = program.status === "ACTIVE" ? unitNote.trim()
    : `Kapsama, ana isabet dahil sonucu kuponda kalan maçlardır; kupon kazancı değildir.${program.status === "WAITING_RESULT" ? " En fazla kapsama bir üst sınırdır, tahmin değildir." : ""}${unitNote}`;
  const meta = [program.status === "WAITING_RESULT" ? `${number.format(program.columns)} kolon · ${cost} maliyet` : null, progress.structure].filter(Boolean).join(" · ");
  const bilyonerAction = (primary: boolean) => (
    <Pressable
      accessibilityHint="Bilyoner uygulaması kuruluysa Spor Toto sayfasını uygulamada, değilse güvenli web sayfasında açar"
      accessibilityRole="link"
      onPress={() => Linking.openURL(buildBilyonerTotoUrl()).catch(() => Alert.alert("Bilyoner açılamadı", "Bilyoner Spor Toto sayfası şu anda açılamıyor."))}
      style={({ pressed }) => [styles.bilyonerAction, primary ? styles.bilyonerPrimary : styles.bilyonerSecondary, pressed && styles.actionPressed]}
    >
      <Text style={[styles.bilyonerActionText, !primary && styles.bilyonerSecondaryText]}>Bilyoner Spor Toto&apos;da aç</Text>
    </Pressable>
  );

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
        <Text style={styles.eyebrow}>{program.weekText}{span ? ` · ${span}` : ""}</Text>
        <Text style={styles.title}>Program {program.gcNo}</Text>
        <View
          style={[styles.statusPill, { backgroundColor: `${statusColor}1F` }]}
        >
          <Text style={[styles.status, { color: statusColor }]}>
            {formatProgramStatus(program.status)}
          </Text>
        </View>
        {metrics.length ? <View style={styles.metrics}>
          {metrics.map((metric) => (
            <View key={metric.label} style={[styles.metric, inlineMetrics && styles.overviewMetric]}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View> : null}
        {program.status === "ACTIVE" ? (
          <Text style={styles.kickoff}>{progress.planned ? when.label : `${program.predictions.length ? "Henüz kolon planı yok" : "Tahmin hazırlanıyor"} · ${when.label.toLocaleLowerCase("tr-TR")}`} {when.text}</Text>
        ) : null}
        {progress.settled > 0 ? (
          <View style={styles.resultBlock}>
            <TotoProgressBar progress={progress} />
            <View style={styles.resultLegend}>
              {legend.map(([label, color]) => (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {program.status === "WAITING_RESULT" && progress.next ? (
          <Text style={styles.kickoff}>{progress.next.started ? "Sonuç bekleniyor" : "Sıradaki"}: {progress.next.matchName}{progress.next.at !== null ? ` · ${kickoffLabel(progress.next.at)}` : ""}</Text>
        ) : null}
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
        {program.status === "RESULTED" && program.bestColumnHits !== null ? (
          <Text style={styles.kickoff}>Kupon tam sistem: en iyi kolon {outOf(program.bestColumnHits, progress.total)} doğru.</Text>
        ) : null}
        {tiers.length ? (
          <View style={styles.tiers}>
            <Text style={styles.prizeLabel}>İkramiye kademeleri</Text>
            {tiers.map((tier) => (
              <View accessible accessibilityLabel={`${tier.label}, ${tier.detail}, ${tier.oursLabel}`} key={tier.key} style={styles.tierRow}>
                <Text style={[styles.tierLabel, tier.ours > 0 && styles.tierWon]}>{tier.label}</Text>
                <View style={styles.tierCopy}>
                  <Text style={styles.tierDetail}>{tier.detail}</Text>
                  <Text style={[styles.tierOurs, tier.ours > 0 && styles.tierWon]}>{tier.oursLabel}</Text>
                </View>
              </View>
            ))}
            <Text style={styles.prizeDescription}>Teorik tutarlar SAP ikramiye dağılımından; kuponun oynandığı varsayılır.</Text>
          </View>
        ) : null}
        {resultFilter !== "ALL" ? <Text style={styles.contextNote}>Programın tamamı · aşağıdaki filtreler yalnızca maç listesini daraltır.</Text> : null}
        {note ? <Text style={styles.contextNote}>{note}</Text> : null}
        {meta ? <Text style={styles.distribution}>{meta}</Text> : null}
        <Text style={styles.updatedAt}>
          Son güncelleme: {formatTimestamp(program.updatedAt)}
        </Text>
      </View>
      {program.status === "ACTIVE" ? bilyonerAction(true) : null}
      </View>

      <View style={desktop ? styles.couponColumn : undefined}>
      <ModuleHeading
        eyebrow="KUPON"
        title={program.predictions.length ? "Tahminler" : "Aktif fikstür"}
      />
      {program.predictions.length > 0 && progress.settled > 0 ? <View style={styles.listControls}>
        <View style={styles.filters}>
          {resultFilters.map(option => ({ option, count: filterTotoResults(program.predictions, option.value).length }))
            .filter(({ option, count }) => option.value === "ALL" || count > 0 || resultFilter === option.value)
            .map(({ option, count }) => <FilterChip key={option.value} label={option.label} count={count} selected={resultFilter === option.value} onPress={() => setResultFilter(option.value)} />)}
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
      ) : program.predictions.length ? (
        <TotoCouponList
          onOpen={openBilyoner}
          predictions={visiblePredictions}
          presentResult={predictionResultPresentation}
        />
      ) : program.fixtures.length ? (
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

      {/* Playing matters only before kickoff; a resulted program has no play action. */}
      {program.status === "WAITING_RESULT" || program.status === "ERROR" ? <View style={styles.actions}>{bilyonerAction(false)}</View> : null}
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
    borderRadius: radii.round,
    justifyContent: "center",
    minHeight: 50
  },
  bilyonerPrimary: { backgroundColor: colors.green, marginTop: spacing.lg },
  bilyonerSecondary: { borderWidth: 1, borderColor: colors.border },
  bilyonerSecondaryText: { color: colors.text },
  kickoff: { color: colors.textMuted, ...typeScale.bodyCompact, marginTop: spacing.md },
  // Prize tiers: a tier that pays any coupon column takes the prize's gold.
  tiers: { gap: spacing.sm, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  tierRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  tierLabel: { ...typeScale.metricCompact, fontSize: 14, lineHeight: 18, color: colors.textMuted, width: 64 },
  tierCopy: { flex: 1, minWidth: 0, gap: 2 },
  tierDetail: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  tierOurs: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, fontWeight: "700" },
  tierWon: { color: colors.gold },
  resultBlock: { gap: spacing.sm, marginTop: spacing.lg },
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
