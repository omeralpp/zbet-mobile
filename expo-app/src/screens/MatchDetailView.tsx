import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import {
  matchAnalysisContextQuery,
  rebuildMatchQuery,
  rebuildPressureHistoryQuery,
  rebuildPoolPathQuery,
  rebuildStatisticsQuery
} from "@/src/api/queries";
import { mobileApi } from "@/src/api";
import type { AnalysisContext } from "@/src/api/schemas";
import { JinxAssessmentCard } from "@/src/components/JinxAssessmentCard";
import { pressureSide } from "@/src/components/MatchCard";
import { PitchMarkings } from "@/src/components/PitchMarkings";
import { RebuildDecisionModule, RebuildJinxCard, useRebuildClock } from "@/src/components/RebuildEvidencePanel";
import { ResultPill } from "@/src/components/DecisionTicket";
import { currentRebuild } from "@/src/utils/rebuild-current";
import { rebuildHero } from "@/src/utils/rebuild-hero";
import { possessionContext } from "@/src/utils/rebuild-possession";
import { matchPeriodLabel } from "@/src/utils/match-period";
import { formatQuote } from "@/src/utils/rebuild-display";
import { rebuildPresentation } from "@/src/utils/rebuild-presentation";
import { analysisNeedsRefresh } from "@/src/mascot/jinx-assessment";
import { useJinxAnalyticalSurface } from "@/src/mascot/JinxPreferencesProvider";
import { ChangeEmphasis } from "@/src/components/ChangeEmphasis";
import { LiveDot } from "@/src/components/LiveDot";
import { SignalMeter } from "@/src/components/SignalMeter";
import {
  SurfaceDivider,
  SurfaceMaterial
} from "@/src/components/SurfaceMaterial";
import { TeamLogo } from "@/src/components/TeamLogo";
import { ComparisonRow } from "@/src/components/ComparisonRow";
import { visibleEvents } from "@/src/components/live-context-view";
import { latestMatchPathSignal } from "@/src/components/match-analysis-events";
import { MatchPathCard } from "@/src/components/MatchPathCard";
import { buildMatchPath } from "@/src/components/match-path-model";
import { PressureChart } from "@/src/components/PressureChart";
import { matchActivity } from "@/src/components/match-path-activity";
import { RebuildStatisticsPanel } from "@/src/components/RebuildStatisticsPanel";
import { HistoricalScoreDistribution } from "@/src/components/HistoricalScoreDistribution";
import { TeamFormCard } from "@/src/components/TeamFormCard";
import { LiveContextFreshness } from "@/src/components/LiveContextNotice";
import { StandingsModule } from "@/src/components/StandingsModule";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { RatioResultsChart } from "@/src/components/RatioResultsChart";
import { Screen } from "@/src/components/Screen";
import { runtimeConfig } from "@/src/config/runtime";
import { mountsIntelligenceSurfaces } from "@/src/config/mobile-intelligence";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { buildBilyonerMatchUrl } from "@/src/external/bilyoner";
import { CollapsibleModule } from "@/src/layout/CollapsibleModule";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import { resetModuleCollapse, useModuleCollapse } from "@/src/layout/module-collapse-store";
import type { LiveDetailModuleId } from "@/src/layout/module-registry";
import {
  colors,
  fontWeights,
  iconSizes,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale,
  textFont,
  numericFont
} from "@/src/theme/theme";
import {
  formatCurrentMarketRate,
  formatFixtureDateTime,
  formatElapsed,
  formatRate,
  formatSelection
} from "@/src/utils/format";
import { deriveLiveRateTrend } from "@/src/utils/live-card-indicators";
import { matchPressureSide } from "@/src/utils/match-pressure";
import { latestIntervalReading, observedHalfTimeScore } from "@/src/utils/rebuild-pressure";

/**
 * The evidence chips under "Maçın kanıtları", in the v40 board's words. Maçın
 * yolu is its own card above them (v45 board), so it has no chip.
 */
const evidenceChips: { id: LiveDetailModuleId; label: string }[] = [
  { id: "pressure", label: "Baskı" },
  { id: "decision", label: "Karar" },
  { id: "teamForm", label: "Form" },
  { id: "odds", label: "Piyasa" },
  { id: "statistics", label: "Saha" },
  { id: "scoreDistribution", label: "Benzer maçlar" },
  { id: "standings", label: "Lig" }
];

/**
 * One Canlı detay module, as a collapsible panel.
 *
 * A thin binding of `CollapsibleModule` to this surface: each module then names
 * only its registry id and its heading, and `liveDetail` cannot be mistyped at
 * nine separate call sites.
 */
function LiveDetailPanel({
  children,
  eyebrow,
  id,
  leading,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  id: LiveDetailModuleId;
  leading?: ReactNode;
  title: string;
}) {
  return (
    <CollapsibleModule
      eyebrow={eyebrow}
      moduleId={id}
      surface="liveDetail"
      title={title}
      leading={leading}
    >
      {children}
    </CollapsibleModule>
  );
}

function TeamHeroName({
  name,
  participantId,
  position,
  redCards,
  pressure,
  pressureEstimated
}: {
  name: string;
  participantId?: string | null | undefined;
  position?: number | null | undefined;
  redCards: number;
  /** Set only on the side that currently has the pressure. */
  pressure?: "HOME" | "AWAY" | undefined;
  pressureEstimated: boolean;
}) {
  const side = pressure ? pressureSide[pressure] : null;
  // The v40 board: the name on its own line, then rank, pressure mark and
  // red cards beneath it.
  return (
    <View style={styles.teamIdentity}>
      <TeamLogo name={name} participantId={participantId} size="hero" />
      <Text numberOfLines={2} style={styles.team}>
        {name}
      </Text>
      <View style={styles.teamNameRow}>
      {position ? (
        <Text accessibilityLabel={`Lig sırası ${position}`} style={styles.rank}>
          #{position}
        </Text>
      ) : null}
      {side ? (
        <MaterialCommunityIcons
          accessibilityLabel={`${pressureEstimated ? "Tahmini baskı" : "Baskı"} ${side.label}`}
          color={side.color}
          name={side.icon}
          size={iconSizes.small}
          style={pressureEstimated ? styles.estimated : undefined}
        />
      ) : null}
      {redCards > 0 ? (
        <View
          accessibilityLabel={`${name}, ${redCards} kırmızı kart`}
          style={styles.redCardBadge}
        >
          <MaterialCommunityIcons
            color={colors.red}
            name="card"
            size={iconSizes.micro}
          />
          {redCards > 1 ? (
            <Text style={styles.redCardCount}>{redCards}</Text>
          ) : null}
        </View>
      ) : null}
      </View>
    </View>
  );
}

/**
 * Match detail. The `/match/[key]` route renders it full-screen; the desktop
 * Canlı split view embeds it beside the list (`embedded`), where it sets no
 * stack header, has no swipe-back and keeps a single module column.
 */
export function MatchDetailView({
  matchKey,
  embedded = false,
  expanded = false
}: {
  matchKey: string;
  embedded?: boolean;
  expanded?: boolean;
}) {
  useJinxAnalyticalSurface();
  const key = matchKey;
  const now = useRebuildClock();
  const router = useRouter();
  const handleEdgeSwipeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const [compactHeader, setCompactHeader] = useState(false);
  const breakpoint = useBreakpoint();
  const wideWeb = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const { collapsed, toggle: toggleModule } = useModuleCollapse("liveDetail");
  const moduleRefs = useRef(new Map<string, View | null>());
  const contentTopRef = useRef<View | null>(null);
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible, reset } = useModuleLayout("liveDetail");
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
      const next = event.nativeEvent.contentOffset.y > 150;
      setCompactHeader((current) => (current === next ? current : next));
    },
    []
  );
  const [isFocused, setIsFocused] = useState(false);
  const matchPathEnabled = mountsIntelligenceSurfaces(runtimeConfig.matchPathIntelligence);
  useFocusEffect(useCallback(() => {
    setIsFocused(true);
    return () => setIsFocused(false);
  }, []));
  const context = useQuery({ ...matchAnalysisContextQuery(key), refetchInterval: (state) =>
    isFocused && ["LIVE", "HALF_TIME"].includes(state.state.data?.sources.matchDetail.status ?? "") ? 30_000 : false });
  const sourceView = <T,>(data: T | null | undefined) => ({ data: data ?? undefined,
    isLoading: context.isLoading, isError: context.isError || (context.isSuccess && data === null),
    error: context.error, refetch: context.refetch, isRefetching: context.isRefetching });
  const query = sourceView(context.data?.sources.matchDetail);
  const insightQuery = sourceView(context.data?.sources.insight);
  const leagueContextQuery = sourceView(context.data?.sources.leagueContext);
  const periodScoreQuery = sourceView(context.data?.sources.periodScore);
  const liveContext = sourceView(context.data?.sources.liveContext);
  // RB1 records are the match's published decisions (the A3 Super log marks
  // are retired, owner decision 2026-10-21); a match outside RB1 has none.
  const isRebuild = Boolean(context.data?.sources.matchDetail?.rebuild);
  const rebuildMatch = useQuery(rebuildMatchQuery(isRebuild ? key : ""));
  // RB1 statistics and pressure history (TASK-0177). Current statistics expire
  // after 120 seconds at the backend, so a focused live screen asks every 30.
  const liveNow = ["LIVE", "HALF_TIME"].includes(context.data?.sources.matchDetail.status ?? "");
  const rebuildStatistics = useQuery({ ...rebuildStatisticsQuery(isRebuild ? key : ""), refetchInterval: isFocused && liveNow ? 30_000 : false });
  const pressureHistory = useQuery({ ...rebuildPressureHistoryQuery(isRebuild ? key : ""), refetchInterval: isFocused && liveNow ? 60_000 : false });
  const poolPath = useQuery({...rebuildPoolPathQuery(isRebuild ? key : ""),refetchInterval:isFocused && liveNow ? 60_000 : false});
  const refreshRebuild = () => {
    if (!isRebuild) return;
    void rebuildMatch.refetch();
    void rebuildStatistics.refetch();
    void pressureHistory.refetch();
    void poolPath.refetch();
  };
  const intelligence = mountsIntelligenceSurfaces(runtimeConfig.mobileIntelligence) && !query.data?.rebuild;
  const teamFormEnabled = mountsIntelligenceSurfaces(runtimeConfig.teamFormIntelligence);
  const teamForm = sourceView(context.data?.sources.teamForm);
  const journey = sourceView(context.data?.sources.matchJourney);
  const matchPath = sourceView(context.data?.sources.matchPath);
  const jinx = useMutation({ mutationFn: (packet: AnalysisContext) =>
    mobileApi.getMatchJinxAssessment(packet.matchKey, packet.snapshotId), retry: false });
  const askJinx = async () => {
    let packet = context.data;
    if (analysisNeedsRefresh(packet, jinx.error)) packet = (await context.refetch()).data;
    if (packet) jinx.mutate(packet);
  };
  // NXT-OBS-178: Jinx gives its confidence on arrival for a live selection,
  // once per opened match; later readings stay on the Yenile button.
  const autoAskedKey = useRef<string | null>(null);
  const askOnArrival = jinx.mutate;
  useEffect(() => {
    const packet = context.data;
    if (!intelligence || !packet || packet.matchKey !== key || autoAskedKey.current === key) return;
    if (!["LIVE", "HALF_TIME"].includes(packet.sources.matchDetail.status) || !packet.selectionKey) return;
    autoAskedKey.current = key;
    askOnArrival(packet);
  }, [askOnArrival, context.data, intelligence, key]);
  // A chip opens its module if it is closed, then brings it under the header.
  // Window positions keep this independent of how the list lays modules out.
  const jumpToModule = (id: LiveDetailModuleId) => {
    if (collapsed.includes(id)) toggleModule(id);
    setTimeout(() => {
      const target = moduleRefs.current.get(id);
      const top = contentTopRef.current;
      if (!target || !top) return;
      top.measureInWindow((_topX, topY) => {
        target.measureInWindow((_x, y) => {
          scrollRef.current?.scrollTo({ y: Math.max(0, y - topY + spacing.lg - spacing.sm), animated: true });
        });
      });
    }, 60);
  };

  if (query.isLoading) {
    return (
      <Screen edgeSwipeBack={!embedded} onEdgeSwipeBack={handleEdgeSwipeBack}>
        <LoadingState label="Maç detayı hazırlanıyor" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen edgeSwipeBack={!embedded} onEdgeSwipeBack={handleEdgeSwipeBack}>
        <ErrorState
          error={query.error}
          message={
            query.error instanceof Error
              ? query.error.message
              : "Maç detayı alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const match = query.data.rebuild && !currentRebuild(query.data.rebuild, now)
    ? { ...query.data, selectedOdd: "", rating: 0, liveRate: null, currentRate: null } : query.data;
  const hero = isRebuild ? rebuildHero({ data: rebuildMatch.data, matchKey: key, status: match.status, now, error: rebuildMatch.isError }) : null;
  const heroMarket = isRebuild ? hero?.record.market ?? "" : match.selectedOdd;
  const heroStars = isRebuild ? hero?.record.stars ?? 0 : match.rating;
  const heroFirstRate = isRebuild ? Number(hero?.record.quote ?? NaN) : match.liveRate;
  const heroCurrentRate = isRebuild ? hero?.currentQuote ? Number(hero.currentQuote) : null : match.currentRate;
  const pressure = matchPressureSide(match);
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const insight = insightQuery.data;
  const leagueContext = leagueContextQuery.data;
  const currentMarket = isRebuild ? { value: formatQuote(hero?.currentQuote), label: hero?.quoteLabel ?? "Güncel oran bekleniyor" } : formatCurrentMarketRate(
    heroCurrentRate,
    heroMarket,
    "güncel oran"
  );
  // Reuses the list card's trend derivation, so Match Detail and the Live list
  // can never disagree about which way an odd moved.
  const trend = deriveLiveRateTrend(Number.isFinite(heroFirstRate) ? heroFirstRate : null, heroCurrentRate);
  const movement = {
    UP: {
      icon: "trending-up" as const,
      color: semantic.intelligence,
      label: "seçimden yükseldi"
    },
    DOWN: {
      icon: "trending-down" as const,
      color: semantic.intelligence,
      label: "seçimden düştü"
    },
    STABLE: {
      icon: "minus" as const,
      color: colors.textMuted,
      label: "seçimden değişmedi"
    },
    UNAVAILABLE: {
      icon: "minus" as const,
      color: colors.textSubtle,
      label: "güncel oran bekleniyor"
    }
  }[trend];
  const hasLeagueContext = Boolean(
    leagueContext &&
      (leagueContext.homeStandingPosition !== null ||
        leagueContext.awayStandingPosition !== null ||
        leagueContext.homeStandingPoints !== null ||
        leagueContext.awayStandingPoints !== null)
  );

  // Maçın yolu: provider events, RB1 observations and published records on one
  // axis. RB1 exposes no pool path, so only a non-RB1 journey can draw a line.
  const history = pressureHistory.data?.matchKey === key ? pressureHistory.data : undefined;
  const statistics = !rebuildStatistics.isError && rebuildStatistics.data?.matchKey === key ? rebuildStatistics.data : undefined;
  const possession = possessionContext(statistics, match, now);
  const observedPhase = statistics?.phase ?? history?.observations.at(-1)?.phase;
  // Minute 46 can still be first-half added time. Prefer recorded phase;
  // without it, the ambiguous interval around half-time gets no inferred label.
  const phase = matchPeriodLabel(match,observedPhase);
  const intervals = matchActivity(history, match);
  const liveTimeline = liveContext.data?.matchKey && liveContext.data.matchKey !== key ? undefined : liveContext.data;
  const legacyPath = !isRebuild && matchPathEnabled;
  const halfTime = periodScoreQuery.data?.halfTimeScore;
  const pathModel = buildMatchPath({
    match,
    isRebuild,
    poolPath:poolPath.data?.matchKey === key && !poolPath.isError ? poolPath.data : undefined,
    events: visibleEvents(liveTimeline?.timeline),
    observations: history?.observations ?? [],
    records: isRebuild ? rebuildMatch.data?.history ?? [] : [],
    journeyPoints: legacyPath && journey.data?.matchKey === key ? journey.data.points : [],
    halfTimeScore: halfTime ? `${halfTime.homeScore}–${halfTime.awayScore}` : observedHalfTimeScore(history?.observations ?? []),
    latestReading: latestIntervalReading(intervals, match),
    latestReadingKind: "ACTIVITY"
  });
  const analysisSignal = legacyPath ? latestMatchPathSignal(matchPath.data?.matchKey === key ? matchPath.data : undefined) : undefined;
  const analysisText = analysisSignal?.stateNormality != null
    ? `Son ölçüm · normallik %${Math.round(analysisSignal.stateNormality * 100)} · ${analysisSignal.cohortSize} benzer maç` : null;

  // Only modules that currently have data are rendered; the persisted order
  // still holds a slot for the rest so they return where the user left them.
  const openDecision = (decisionKey: string) =>
    router.push({
      pathname: "/super/[key]",
      params: { key: decisionKey, match: key }
    } as never);

  const moduleNodes: Partial<Record<LiveDetailModuleId, ReactNode>> = {
    // NXT-OBS-175: the two sides' pressure over the match, as its own chart.
    pressure: !isRebuild ? (
      <LiveDetailPanel eyebrow="BASKI" id="pressure" title="Baskı grafiği">
        <PressureChart journey={journey.data} match={match} />
      </LiveDetailPanel>
    ) : null,
    odds: (
      <LiveDetailPanel eyebrow="PİYASA" id="odds" title="Oran sonuçları">
        <RatioResultsChart
          marketRates={insight?.marketRates ?? []}
          phase={match.ratioPhase}
          rows={match.ratioResults}
        />
      </LiveDetailPanel>
    ),
    statistics: (
      <LiveDetailPanel eyebrow="SAHA" id="statistics" title="Canlı saha dengesi">
        {isRebuild ? <RebuildStatisticsPanel key={key} homeTeam={match.homeTeam} awayTeam={match.awayTeam} isError={rebuildStatistics.isError} isLoading={rebuildStatistics.isLoading} statistics={statistics} /> : <View style={styles.statsCard}>
          <SurfaceMaterial radius={radii.lg} />
          <ComparisonRow
            away={match.awayBallPossession}
            home={match.homeBallPossession}
            label="Topla oynama"
            suffix="%"
          />
          <ComparisonRow
            away={match.awayTotalShots}
            home={match.homeTotalShots}
            label="Toplam şut"
          />
          <ComparisonRow
            away={match.awayShotsOnTarget}
            home={match.homeShotsOnTarget}
            label="İsabetli şut"
          />
          <ComparisonRow
            away={match.homeXg === 0 && match.awayXg === 0 ? null : match.awayXg}
            formatter={formatRate}
            home={match.homeXg === 0 && match.awayXg === 0 ? null : match.homeXg}
            label="xG"
          />
          <ComparisonRow
            away={match.awayCorners}
            home={match.homeCorners}
            label="Korner"
          />
          <ComparisonRow
            away={match.awayYellowCards}
            home={match.homeYellowCards}
            label="Sarı kart"
          />
          <ComparisonRow
            away={match.awayRedCards}
            home={match.homeRedCards}
            label="Kırmızı kart"
          />
        </View>}
      </LiveDetailPanel>
    ),
    scoreDistribution: (
      <LiveDetailPanel
        eyebrow="BENZER MAÇLAR"
        id="scoreDistribution"
        title="Tarihsel skor dağılımı"
      >
        <HistoricalScoreDistribution key={key} allowLegacy={!isRebuild} match={{ ...match, phase: observedPhase }} now={now} pool={isRebuild && !poolPath.isError && poolPath.data?.matchKey === key ? poolPath.data : undefined} />
      </LiveDetailPanel>
    )
  };

  // Each engine mounts only when its own build setting enables it.
  if (teamFormEnabled) {
    moduleNodes.teamForm = (
      <LiveDetailPanel eyebrow="FORM" id="teamForm" title="Takım formu">
        <TeamFormCard
          awayTeam={match.awayTeam}
          context={teamForm.data}
          homeTeam={match.homeTeam}
          isLoading={teamForm.isLoading}
        />
      </LiveDetailPanel>
    );
  }

  // Karar özeti is the RB1 record and its frozen evidence (owner decision
  // 2026-10-21); the A3 model summary it used to show is retired.
  if (match.rebuild) {
    moduleNodes.decision = (
      <LiveDetailPanel eyebrow="KARAR" id="decision" title="Karar özeti">
        <RebuildDecisionModule matchKey={key} />
      </LiveDetailPanel>
    );
  }

  if (hasLeagueContext && leagueContext) {
    moduleNodes.standings = (
      <TutorialTarget id="match-standings" radius={radii.lg}>
        <LiveDetailPanel
          eyebrow="PUAN DURUMU"
          id="standings"
          title="Lig sıralaması"
        >
          <StandingsModule
            away={{
              team: leagueContext.awayTeam,
              participantId: match.awayParticipantId,
              position: leagueContext.awayStandingPosition,
              points: leagueContext.awayStandingPoints,
              side: "AWAY"
            }}
            caption={
              leagueContext.source === "LATEST_SUPER_DECISION"
                ? "Son Super kararı kaydından"
                : "Lig bilgisi bekleniyor"
            }
            home={{
              team: leagueContext.homeTeam,
              participantId: match.homeParticipantId,
              position: leagueContext.homeStandingPosition,
              points: leagueContext.homeStandingPoints,
              side: "HOME"
            }}
          />
        </LiveDetailPanel>
      </TutorialTarget>
    );
  }

  // Every module with data shows on RB1 matches too (owner decision
  // 2026-10-21: Maçın yolu, Baskı grafiği and Karar özeti return). Each node
  // carries a ref so an evidence chip can bring it into view.
  const moduleItems = order
    .filter((id): id is LiveDetailModuleId => Boolean(moduleNodes[id as LiveDetailModuleId]))
    .map((id) => ({
      id,
      node: (
        <View collapsable={false} ref={(node) => { moduleRefs.current.set(id, node); }}>
          {moduleNodes[id]}
        </View>
      )
    }));
  const visibleChips = evidenceChips.filter((chip) => moduleItems.some((item) => item.id === chip.id));

  return (
    <>
      {embedded ? null : (
        <Stack.Screen
          options={{
            title: "Maç detayı",
            // Desktop already carries the shell's Yenile button.
            ...(wideWeb ? {} : {
              headerRight: () => (
                <Pressable
                  accessibilityLabel="Ekrandaki verileri yenile"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    void context.refetch();
                    refreshRebuild();
                  }}
                  style={styles.headerAction}
                >
                  <MaterialCommunityIcons color={semantic.intelligence} name="refresh" size={iconSizes.control} />
                </Pressable>
              )
            })
          }}
        />
      )}
      <Screen
      edgeSwipeBack={!embedded}
      onEdgeSwipeBack={handleEdgeSwipeBack}
      wide={!embedded || expanded}
      contentStyle={styles.screen}
      scrollRef={scrollRef}
      fixedHeader={compactHeader ? <View style={styles.fixedHeader}>
        <Text style={styles.fixedTitle}>{match.homeTeam} – {match.awayTeam}</Text>
        <Text style={styles.fixedValue}>{match.homeScore}–{match.awayScore} · {formatElapsed(match.status, match.elapsed, match.clock)} · {formatSelection(heroMarket) || "Seçim yok"}{hero ? ` · ${hero.stateLabel}` : ""} · {currentMarket.value}</Text>
      </View> : null}
      scrollProps={{
        alwaysBounceVertical: true,
        onScroll: handleScroll,
        scrollEnabled: !reordering,
        scrollEventThrottle: 16,
        refreshControl: (
          <RefreshControl
            colors={[semantic.live]}
              onRefresh={() => {
                void context.refetch();
                refreshRebuild();
              }}
              refreshing={context.isRefetching}
            tintColor={semantic.live}
          />
        )
      }}
    >
      <View collapsable={false} ref={contentTopRef}>
      <TutorialTarget id="match-summary" radius={radii.xl}>
        <View style={[styles.scoreHero, wideWeb && styles.scoreHeroWide]}>
        <SurfaceMaterial
          {...(live ? { accent: semantic.live } : {})}
          radius={radii.xl}
        />
        {/* Faint pitch markings behind the score. Decoration only, so they
            stay below every reading contrast and out of the accessibility tree. */}
        <PitchMarkings />
        <View style={styles.leagueRow}>
          <View style={styles.leagueCopy}>
            <Text numberOfLines={1} style={styles.league}>
              {match.league}
            </Text>
            <Text style={styles.fixtureTime}>
              {formatFixtureDateTime(match.matchDate, match.matchTime)}
            </Text>
          </View>
          <View style={[styles.elapsedPill, live && styles.elapsedPillLive]}>
            {live ? <LiveDot /> : null}
            <Text style={[styles.elapsed, live && styles.elapsedLive]}>
              {formatElapsed(match.status, match.elapsed, match.clock)}{phase ? ` · ${phase}` : ""}
            </Text>
          </View>
        </View>
        <View style={[styles.scoreRow, wideWeb && styles.scoreRowWide]}>
          <View style={styles.teamBlock}>
            <TeamHeroName
              name={match.homeTeam}
              participantId={match.homeParticipantId}
              position={insight?.homeStandingPosition}
              pressure={pressure.direction === "HOME" ? "HOME" : undefined}
              pressureEstimated={pressure.estimated}
              redCards={insight?.homeRedCards ?? match.homeRedCards}
            />
          </View>
          <View style={styles.scoreBlock}>
            <ChangeEmphasis
              kind="alert"
              token={`${match.homeScore}:${match.awayScore}`}
            >
              <Text style={styles.score}>
                {match.homeScore}
                <Text style={styles.scoreSeparator}>–</Text>
                {match.awayScore}
              </Text>
            </ChangeEmphasis>
            {periodScoreQuery.data?.halfTimeScore ? (
              <Text style={styles.halfTimeScore}>
                İY {periodScoreQuery.data.halfTimeScore.homeScore}-
                {periodScoreQuery.data.halfTimeScore.awayScore}
              </Text>
            ) : null}
          </View>
          <View style={styles.teamBlock}>
            <TeamHeroName
              name={match.awayTeam}
              participantId={match.awayParticipantId}
              position={insight?.awayStandingPosition}
              pressure={pressure.direction === "AWAY" ? "AWAY" : undefined}
              pressureEstimated={pressure.estimated}
              redCards={insight?.awayRedCards ?? match.awayRedCards}
            />
          </View>
        </View>
        {/* The verdict band. The score above is what happened; this is what
            BTB makes of it. Giving the verdict its own lit band instead of a
            third row of loose metrics is what stops the hero reading as a
            scoreboard with statistics attached. */}
        <SurfaceDivider
          {...(live ? { accent: semantic.live } : {})}
          style={styles.heroDivider}
        />
        <Text style={[styles.verdictEyebrow, wideWeb && styles.verdictRowWide]}>
          {hero ? `SON BTB SEÇİMİ · ${hero.record.minute}′ · ${hero.stateLabel}` : match.rebuild ? rebuildPresentation({status:match.status,summary:rebuildMatch.data ?? match.rebuild,now,
            redUnknown:rebuildMatch.data?.candidates.some(candidate => candidate.reason === "RED_CARD_UNKNOWN")}).label : `BTB SEÇİMİ${match.decisionMinute !== null && heroMarket ? ` · ${match.decisionMinute}′` : ""}`}
        </Text>
        <View style={[styles.verdictRow, wideWeb && styles.verdictRowWide]}>
          <View style={[styles.verdictCell, styles.verdictCellWide]}>
            <Text numberOfLines={2} style={styles.selection}>
              {formatSelection(heroMarket) || "Şu anda seçim yok"}
            </Text>
            {/* The rebuild's stars measure consistency and evidence quality,
                so the board's meter carries that name rather than "BTB rating". */}
            {heroMarket ? (
              <SignalMeter
                {...(match.rebuild ? { label: `İlk kanıt kalitesi · ${Math.min(5, heroStars)}/5` } : {})}
                rating={heroStars}
              />
            ) : null}
          </View>
          {heroMarket ? <View style={[styles.verdictCell, styles.verdictCellEnd]}>
            <Text style={styles.verdictValue}>
              {isRebuild ? formatQuote(hero?.record.quote) : formatRate(match.liveRate)}
            </Text>
            <Text style={styles.verdictLabel}>seçim oranı</Text>
          </View> : null}
          {heroMarket ? <View style={[styles.verdictCell, styles.verdictCellEnd]}>
            <View style={styles.movementRow}>
              <MaterialCommunityIcons
                color={movement.color}
                name={movement.icon}
                size={iconSizes.small}
              />
              <ChangeEmphasis token={currentMarket.value}>
                <Text
                  accessibilityLabel={`${currentMarket.value} · ${currentMarket.label}${heroCurrentRate !== null ? ` · ${movement.label}` : ""}`}
                  style={[styles.verdictValue, { color: movement.color }]}
                >
                  {currentMarket.value}
                </Text>
              </ChangeEmphasis>
            </View>
            <Text style={styles.verdictLabel}>{currentMarket.label}</Text>
          </View> : null}
        </View>
        {hero ? <View style={styles.heroRecordFooter}>
          <ResultPill state={hero.record.result.state} />
          <Pressable accessibilityRole="button" accessibilityLabel="Son BTB karar kaydını aç" onPress={() => openDecision(hero.record.decisionId)} style={styles.heroRecordAction}>
            <Text style={styles.resetText}>Karar kaydını aç</Text>
            <MaterialCommunityIcons color={semantic.intelligence} name="chevron-right" size={iconSizes.inline} />
          </Pressable>
        </View> : null}
        </View>
      </TutorialTarget>
      </View>

      {query.data?.rebuild ? <RebuildJinxCard matchKey={key} matchStatus={match.status} possession={possession} /> : intelligence ? <JinxAssessmentCard context={context.data} assessment={jinx.data}
        pending={jinx.isPending && jinx.variables?.matchKey === key}
        error={jinx.isError && jinx.variables?.matchKey === key} onAsk={() => void askJinx()} /> : null}

      <View collapsable={false} ref={(node) => { moduleRefs.current.set("matchPath", node); }}>
        <MatchPathCard
          {...(isRebuild ? { activity: { intervals, failed: pressureHistory.isError, loading: pressureHistory.isLoading } } : {})}
          analysisText={analysisText}
          collapsed={collapsed.includes("matchPath")}
          footer={<LiveContextFreshness
            ageSeconds={liveTimeline?.freshness?.ageSeconds}
            refreshFailed={liveTimeline?.freshness?.refreshFailed}
            stale={liveTimeline?.freshness?.stale}
          />}
          key={key}
          match={match}
          model={pathModel}
          onDecisionPress={openDecision}
          onToggleCollapse={() => toggleModule("matchPath")}
          synthetic={legacyPath && journey.data?.origin === "SYNTHETIC"}
          wide={wideWeb}
        />
      </View>

      <View style={styles.rowTools}>
        <Text accessibilityRole="header" aria-level={2} style={styles.evidenceTitle}>Maçın kanıtları</Text>
        <Pressable accessibilityRole="button" onPress={() => { void reset(); void resetModuleCollapse("liveDetail"); }} style={styles.resetAction}>
          <Text style={styles.resetText}>Düzeni sıfırla</Text>
        </Pressable>
      </View>
      {visibleChips.length ? (
        <ScrollView
          contentContainerStyle={styles.chipRow}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
        >
          {visibleChips.map((chip, index) => (
            <Pressable
              accessibilityHint={`${chip.label} bölümüne gider`}
              accessibilityRole="button"
              key={chip.id}
              onPress={() => jumpToModule(chip.id)}
              style={({ pressed, hovered }) => [styles.chip, index === 0 && styles.chipLead, hovered && styles.chipHover, pressed && styles.chipPressed]}
            >
              <Text style={[styles.chipText, index === 0 && styles.chipTextLead]}>{chip.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <ReorderableModuleList
        items={moduleItems}
        {...(embedded && !expanded ? { maxColumns: 1 } : {})}
        onDragStateChange={setReordering}
        onReorder={(from, to) =>
          reorderVisible(
            moduleItems.map((item) => item.id),
            from,
            to
          )
        }
        scrollOffsetRef={scrollOffset}
        scrollRef={scrollRef}
      />

      <View style={styles.actions}>
        <Pressable
          accessibilityHint="Maçın Bilyoner sayfasını açar"
          accessibilityRole="button"
          onPress={() =>
            Linking.openURL(buildBilyonerMatchUrl(match.id)).catch(() =>
              Alert.alert(
                "Bilyoner açılamadı",
                "Bu maçın Bilyoner sayfası şu anda açılamıyor."
              )
            )
          }
          style={({ pressed, hovered }) => [styles.bilyonerAction, hovered && styles.chipHover, pressed && styles.chipPressed]}
        >
          <Text style={styles.bilyonerActionText}>Bilyoner&apos;da aç</Text>
          <MaterialCommunityIcons color={colors.text} name="open-in-new" size={iconSizes.small} />
        </Pressable>
      </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fixedHeader: { backgroundColor: colors.background, borderBottomWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 2 },
  fixedTitle: { ...textFont("700"), color: colors.text, fontSize: 14 },
  fixedValue: { ...textFont("400"), color: colors.textMuted, fontSize: 13 },
  screen: {
    paddingTop: spacing.lg
  },
  scoreHero: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    ...shadows.card
  },
  scoreHeroWide: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  scoreRowWide: { width: "100%", maxWidth: 760, alignSelf: "center", marginVertical: spacing.xs },
  verdictRowWide: { width: "100%", maxWidth: 880, alignSelf: "center" },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  league: {
    color: colors.textMuted,
    ...typeScale.eyebrow
  },
  leagueCopy: {
    flex: 1
  },
  fixtureTime: {
    ...textFont("500"),
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2
  },
  // The minute pill was loss red for every status, so a finished match wore the
  // same signal as one in progress and neither of them meant anything. It now
  // carries the live signature only while the match is actually live.
  elapsedPill: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 5
  },
  elapsedPillLive: {
    backgroundColor: semantic.liveSoft
  },
  elapsed: {
    color: colors.textMuted,
    ...typeScale.eyebrow
  },
  elapsedLive: {
    color: semantic.live
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm
  },
  teamBlock: {
    flex: 1
  },
  teamIdentity: {
    alignItems: "center",
    gap: spacing.sm
  },
  team: {
    ...textFont("700"),
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center"
  },
  teamNameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "center"
  },
  rank: {
    ...textFont("700"),
    color: colors.textMuted,
    fontSize: 12
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  redCardCount: {
    ...textFont("800"),
    color: colors.red,
    fontSize: 11
  },
  score: {
    color: colors.text,
    ...typeScale.display,
    paddingHorizontal: spacing.md,
    textAlign: "center"
  },
  // The separator recedes so the two numbers read as one value rather than as
  // three glyphs of equal weight.
  scoreSeparator: {
    color: colors.textSubtle,
    fontWeight: fontWeights.medium
  },
  estimated: {
    opacity: 0.6
  },
  headerAction: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14
  },
  scoreBlock: {
    alignItems: "center"
  },
  halfTimeScore: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  heroDivider: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm
  },
  verdictEyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow,
    marginBottom: spacing.sm
  },
  heroRecordFooter: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, marginTop: spacing.sm },
  heroRecordAction: { flexDirection: "row", alignItems: "center", minHeight: 44, gap: spacing.xs },
  rowTools: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  resetAction: { minHeight: 48, justifyContent: "center" },
  evidenceTitle: { color: colors.text, ...typeScale.identity, fontWeight: "700", fontSize: 17, lineHeight: 22 },
  resetText: { color: semantic.intelligence, ...typeScale.bodyCompact, fontWeight: "700" },
  // The board's evidence chips: a row that scrolls sideways on a phone.
  chipScroll: { marginHorizontal: -spacing.lg, marginBottom: spacing.sm },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  chipLead: { borderColor: colors.actionFill, backgroundColor: colors.greenSoft },
  chipHover: { backgroundColor: colors.surfaceStrong },
  chipPressed: { opacity: 0.72 },
  chipText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  chipTextLead: { color: colors.actionFill },
  verdictRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.lg
  },
  verdictCell: {
    gap: spacing.xs
  },
  verdictCellWide: {
    flex: 1,
    minWidth: 0
  },
  verdictCellEnd: {
    alignItems: "flex-end",
    maxWidth: "30%"
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  verdictValue: {
    color: colors.text,
    ...typeScale.metric
  },
  verdictLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    textAlign: "right"
  },
  selection: {
    color: colors.text,
    ...typeScale.decision
  },
  statsCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.lg
  },
  distributionCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.md
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  distributionScore: {
    ...numericFont("800"),
    color: colors.text,
    width: 34,
    fontSize: 12
  },
  probabilityTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    overflow: "hidden"
  },
  probabilityFill: {
    height: "100%",
    backgroundColor: colors.gold,
    borderRadius: radii.round
  },
  probability: {
    color: colors.textMuted,
    minWidth: 48,
    flexShrink: 0,
    textAlign: "right",
    ...typeScale.label
  },
  emptyText: {
    ...textFont("400"),
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 12
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  // The board's outlined full-width link out, not a primary action.
  bilyonerAction: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface
  },
  bilyonerActionText: {
    ...textFont("700"),
    color: colors.text,
    fontSize: 15
  }
});
