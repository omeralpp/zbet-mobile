import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
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
  matchAnalysisContextQuery
} from "@/src/api/queries";
import { mobileApi } from "@/src/api";
import type { AnalysisContext } from "@/src/api/schemas";
import { JinxAssessmentCard } from "@/src/components/JinxAssessmentCard";
import { analysisNeedsRefresh } from "@/src/mascot/jinx-assessment";
import { ChangeEmphasis } from "@/src/components/ChangeEmphasis";
import { LiveDot } from "@/src/components/LiveDot";
import { SignalMeter } from "@/src/components/SignalMeter";
import {
  SurfaceDivider,
  SurfaceMaterial
} from "@/src/components/SurfaceMaterial";
import { TeamLogo } from "@/src/components/TeamLogo";
import { MatchJourneyChart } from "@/src/components/MatchJourneyChart";
import { MatchTimelineCard } from "@/src/components/MatchTimelineCard";
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
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import { resetModuleCollapse } from "@/src/layout/module-collapse-store";
import type { LiveDetailModuleId } from "@/src/layout/module-registry";
import {
  colors,
  fontWeights,
  iconSizes,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  formatCurrentMarketRate,
  formatDecisionReason,
  formatFixtureDateTime,
  formatElapsed,
  formatPercentage,
  formatRate,
  formatSelection
} from "@/src/utils/format";
import { relatedSuperDecisions } from "@/src/utils/related-super-decisions";
import { deriveLiveRateTrend } from "@/src/utils/live-card-indicators";
import { recordedSelection } from "@/src/utils/decision-model";

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
  redCards
}: {
  name: string;
  participantId?: string | null | undefined;
  position?: number | null | undefined;
  redCards: number;
}) {
  return (
    <View style={styles.teamIdentity}>
      <TeamLogo participantId={participantId} size="hero" />
      <View style={styles.teamNameRow}>
      <Text numberOfLines={2} style={styles.team}>
        {name}
      </Text>
      {position ? (
        <Text accessibilityLabel={`Lig sırası ${position}`} style={styles.rank}>
          #{position}
        </Text>
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

function ComparisonRow({
  label,
  home,
  away,
  suffix = "",
  formatter,
  note
}: {
  label: string;
  home: number | null;
  away: number | null;
  suffix?: string;
  formatter?: (value: number) => string;
  note?: string;
}) {
  const total = Math.max(1, (home ?? 0) + (away ?? 0));
  const homeWidth: `${number}%` = `${Math.max(4, ((home ?? 0) / total) * 100)}%`;
  const awayWidth: `${number}%` = `${Math.max(4, ((away ?? 0) / total) * 100)}%`;
  const formatValue = formatter ?? String;

  return (
    <View style={styles.comparison}>
      <View style={styles.comparisonLabels}>
        <Text style={styles.statValue}>
          {home === null ? "—" : formatValue(home)}
          {suffix}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {away === null ? "—" : formatValue(away)}
          {suffix}
        </Text>
      </View>
      {home !== null && away !== null ? <View style={styles.dualBar}>
        <View style={styles.homeTrack}>
          <View style={[styles.homeBar, { width: homeWidth }]} />
        </View>
        <View style={styles.awayTrack}>
          <View style={[styles.awayBar, { width: awayWidth }]} />
        </View>
      </View> : null}
      {note ? <Text style={styles.statNote}>{note}</Text> : null}
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
  embedded = false
}: {
  matchKey: string;
  embedded?: boolean;
}) {
  const key = matchKey;
  const router = useRouter();
  const handleEdgeSwipeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const [showDecision, setShowDecision] = useState(false);
  // Jinx is asked, never volunteered. Until this flips, its query stays
  // disabled and the surface costs nothing but its own entry point.
  const [compactHeader, setCompactHeader] = useState(false);
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
  const [expandedFlowKey, setExpandedFlowKey] = useState<string | null>(null);
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
  const superLogs = sourceView(context.data?.sources.superLogs);
  const liveContext = sourceView(context.data?.sources.liveContext);
  const intelligence = mountsIntelligenceSurfaces(runtimeConfig.mobileIntelligence);
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
  const relatedDecisions = useMemo(
    () => relatedSuperDecisions(superLogs.data ?? [], key),
    [key, superLogs.data]
  );

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

  const match = query.data;
  const currentDecisionKey =
    relatedDecisions.find(
      (log) =>
        log.selectedOdd === match.selectedOdd &&
        log.rating === match.rating &&
        log.elapsed === match.decisionMinute
    )?.key ?? null;
  const live = match.status === "LIVE" || match.status === "HALF_TIME";
  const insight = insightQuery.data;
  const leagueContext = leagueContextQuery.data;
  const currentMarket = formatCurrentMarketRate(
    match.currentRate,
    match.selectedOdd,
    "güncel oran"
  );
  // Reuses the list card's trend derivation, so Match Detail and the Live list
  // can never disagree about which way an odd moved.
  const trend = deriveLiveRateTrend(match.liveRate, match.currentRate);
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

  // Only modules that currently have data are rendered; the persisted order
  // still holds a slot for the rest so they return where the user left them.
  const openDecision = (decisionKey: string) =>
    router.push({
      pathname: "/super/[key]",
      params: { key: decisionKey }
    } as never);

  const moduleNodes: Partial<Record<LiveDetailModuleId, ReactNode>> = {
    // Maçın Yolu carries the score and star flow (owner decision 2026-10-16):
    // goals, cards and recorded Super decisions are marked on the chart's
    // event lane; the duplicate chronological list opens only on demand. The
    // panel mounts even when the chart engine is off, so the flow itself is
    // never lost with the build flag.
    matchPath: (
      <LiveDetailPanel eyebrow="MAÇ ANALİZİ" id="matchPath" title="Maçın yolu">
        {matchPathEnabled ? (
          <MatchJourneyChart
            context={liveContext.data}
            decisions={relatedDecisions}
            key={key}
            match={match}
            journey={journey.data}
            path={matchPath.data}
            isError={journey.isError}
            isLoading={journey.isLoading}
            onDecisionPress={openDecision}
            pathIsLoading={matchPath.isLoading}
          />
        ) : null}
        <View style={styles.flowSection}>
          {matchPathEnabled ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: expandedFlowKey === key }}
            onPress={() => setExpandedFlowKey(expandedFlowKey === key ? null : key)} style={{ minHeight: 48, justifyContent: "center" }}>
            <Text style={styles.flowEyebrow}>{expandedFlowKey === key ? "TÜM OLAYLARI GİZLE −" : "TÜM OLAYLARI GÖR +"}</Text>
          </Pressable> : <Text style={styles.flowEyebrow}>SKOR VE YILDIZ AKIŞI</Text>}
          {!matchPathEnabled || expandedFlowKey === key ? <>
          <MatchTimelineCard
            awayScore={match.awayScore}
            awayTeam={match.awayTeam}
            context={liveContext.data}
            homeScore={match.homeScore}
            currentDecisionKey={currentDecisionKey}
            decisions={relatedDecisions}
            homeTeam={match.homeTeam}
            isLoading={liveContext.isLoading}
            includeRedCards
            onDecisionPress={(decision) => openDecision(decision.key)}
          />
          <LiveContextFreshness
            ageSeconds={liveContext.data?.freshness?.ageSeconds}
            refreshFailed={liveContext.data?.freshness?.refreshFailed}
            stale={liveContext.data?.freshness?.stale}
          />
          </> : null}
        </View>
      </LiveDetailPanel>
    ),
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
        <View style={styles.statsCard}>
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
            note={match.homeXg === 0 && match.awayXg === 0
              ? "xG kapsamı doğrulanmadı · ölçülmüş sıfır kabul edilmez"
              : "Bildirilen xG · kaynak kapsamı ve ölçüm zamanı doğrulanmadı"}
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
        </View>
      </LiveDetailPanel>
    ),
    scoreDistribution: (
      <LiveDetailPanel
        eyebrow="BENZER MAÇLAR"
        id="scoreDistribution"
        title="Tarihsel skor dağılımı"
      >
        <View style={styles.distributionCard}>
          <SurfaceMaterial radius={radii.lg} />
          {match.scoreDistribution.length ? (
            match.scoreDistribution.map((row) => (
              <View key={row.score} style={styles.distributionRow}>
                <Text style={styles.distributionScore}>{row.score}</Text>
                <View style={styles.probabilityTrack}>
                  <View
                    style={[
                      styles.probabilityFill,
                      { width: `${Math.max(3, row.probability * 100)}%` }
                    ]}
                  />
                </View>
                <Text style={styles.probability}>
                  {formatPercentage(row.probability)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Skor dağılımı henüz oluşmadı.</Text>
          )}
        </View>
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

  if (match.selectedOdd && match.rating > 0) {
    moduleNodes.decision = (
      <LiveDetailPanel eyebrow="KARAR" id="decision" title="Karar özeti">
        <Pressable
          accessibilityHint={
            showDecision ? "Model ayrıntılarını gizler" : "Model ayrıntılarını açar"
          }
          accessibilityRole="button"
          onPress={() => setShowDecision((visible) => !visible)}
          style={styles.decisionCard}
        >
          <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
          {/* The reason is the answer to the question the card asks, so it is the
              headline rather than something revealed after a tap. Only the model
              internals sit behind the disclosure - a reader who wants to know why
              gets an answer immediately, and a reader who wants the numbers asks
              for them. */}
          <Text style={styles.decisionReason}>
            {formatDecisionReason(match.decisionReason)}
          </Text>
          <View style={styles.decisionFacts}>
            {match.decisionMinute !== null ? (
              <Text style={styles.decisionFact}>{match.decisionMinute}&apos; karar</Text>
            ) : null}
            {match.selectedOdd ? (
              <Text style={styles.decisionFact}>{formatSelection(match.selectedOdd)} · {match.selectedOdd}</Text>
            ) : null}
            <Text style={styles.decisionToggle}>
              {showDecision ? "Modeli gizle" : "Modeli göster"}
            </Text>
          </View>
          {showDecision ? (
            <View style={styles.decisionBody}>
              {match.decisionConfidence !== null ? (
                <View style={styles.decisionMetric}>
                  <Text style={styles.decisionMetricValue}>
                    {formatPercentage(match.decisionConfidence)}
                  </Text>
                  <Text style={styles.decisionMetricLabel}>güven</Text>
                </View>
              ) : null}
              {match.decisionScore !== null ? (
                <View style={styles.decisionMetric}>
                  <Text style={styles.decisionMetricValue}>
                    {match.decisionScore.toFixed(2)}
                  </Text>
                  <Text style={styles.decisionMetricLabel}>model skoru</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </Pressable>
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
                ? "Son Super kararı kaydından; yalnız doğrulanan iki takım gösterilir."
                : "Lig bilgisi bekleniyor; yalnız doğrulanan iki takım gösterilir."
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

  const moduleItems = order
    .filter((id): id is LiveDetailModuleId => Boolean(moduleNodes[id as LiveDetailModuleId]))
    .map((id) => ({ id, node: moduleNodes[id] }));

  return (
    <>
      {embedded ? null : (
        <Stack.Screen
          options={{
            title: compactHeader
              ? `${match.homeTeam} – ${match.awayTeam}`
              : "Maç Detayı"
          }}
        />
      )}
      <Screen
      edgeSwipeBack={!embedded}
      onEdgeSwipeBack={handleEdgeSwipeBack}
      wide={!embedded}
      contentStyle={styles.screen}
      scrollRef={scrollRef}
      fixedHeader={compactHeader ? <View style={styles.fixedHeader}>
        <Text numberOfLines={1} style={styles.fixedTitle}>{match.homeTeam} – {match.awayTeam}</Text>
        <Text style={styles.fixedValue}>{match.homeScore}–{match.awayScore} · {formatElapsed(match.status, match.elapsed)} · {formatSelection(match.selectedOdd) || "Seçim yok"} · {currentMarket.value}</Text>
      </View> : null}
      scrollProps={{
        alwaysBounceVertical: true,
        onScroll: handleScroll,
        scrollEnabled: !reordering,
        scrollEventThrottle: 16,
        refreshControl: (
          <RefreshControl
            colors={[semantic.live]}
              onRefresh={() => void context.refetch()}
              refreshing={context.isRefetching}
            tintColor={semantic.live}
          />
        )
      }}
    >
      <TutorialTarget id="match-summary" radius={radii.xl}>
        <View style={styles.scoreHero}>
        <SurfaceMaterial
          {...(live ? { accent: semantic.live } : {})}
          radius={radii.xl}
        />
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
              {formatElapsed(match.status, match.elapsed)}
            </Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <TeamHeroName
              name={match.homeTeam}
              participantId={match.homeParticipantId}
              position={insight?.homeStandingPosition}
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
                <Text style={styles.scoreSeparator}> - </Text>
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
        <Text style={styles.verdictEyebrow}>
          {recordedSelection(match.selectedOdd, match.currentRate, match.decisionContext) ? "KAYITLI BTB SEÇİMİ" : "BTB SEÇİMİ"}
        </Text>
        <View style={styles.verdictRow}>
          <View style={[styles.verdictCell, styles.verdictCellWide]}>
            <Text numberOfLines={2} style={styles.selection}>
              {formatSelection(match.selectedOdd) || "Şu anda seçim yok"}
            </Text>
            <SignalMeter rating={match.rating} />
          </View>
          <View style={[styles.verdictCell, styles.verdictCellEnd]}>
            <Text style={styles.verdictValue}>
              {formatRate(match.liveRate)}
            </Text>
            <Text style={styles.verdictLabel}>seçim oranı</Text>
          </View>
          <View style={[styles.verdictCell, styles.verdictCellEnd]}>
            <View style={styles.movementRow}>
              <MaterialCommunityIcons
                color={movement.color}
                name={movement.icon}
                size={iconSizes.small}
              />
              <ChangeEmphasis token={currentMarket.value}>
                <Text
                  accessibilityLabel={`${currentMarket.value} - ${movement.label}`}
                  style={[styles.verdictValue, { color: movement.color }]}
                >
                  {currentMarket.value}
                </Text>
              </ChangeEmphasis>
            </View>
            <Text style={styles.verdictLabel}>{currentMarket.label}</Text>
          </View>
        </View>
        </View>
      </TutorialTarget>

      {intelligence ? <JinxAssessmentCard context={context.data} assessment={jinx.data}
        pending={jinx.isPending && jinx.variables?.matchKey === key}
        error={jinx.isError && jinx.variables?.matchKey === key} onAsk={() => void askJinx()} /> : null}

      <View style={styles.rowTools}>
        <Text style={styles.verdictLabel}>Maçın kanıtları</Text>
        <Pressable accessibilityRole="button" onPress={() => { void reset(); void resetModuleCollapse("liveDetail"); }} style={styles.resetAction}>
          <Text style={styles.decisionToggle}>Düzeni sıfırla</Text>
        </Pressable>
      </View>
      <ReorderableModuleList
        items={moduleItems}
        {...(embedded ? { maxColumns: 1 } : {})}
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
          style={styles.bilyonerAction}
        >
          <Text style={styles.bilyonerActionText}>Bilyoner&apos;da aç</Text>
        </Pressable>
      </View>
      <Text style={styles.safetyNote}>
        {Platform.OS === "web"
          ? "Maç sayfası Bilyoner'de yeni sekmede açılır."
          : "Maç sayfası Bilyoner uygulamasında; uygulama yoksa güvenli web sayfasında açılır."}
      </Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  fixedHeader: { backgroundColor: colors.background, borderBottomWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 2 },
  fixedTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  fixedValue: { color: colors.textMuted, fontSize: 13 },
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
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  league: {
    color: colors.textMuted,
    ...typeScale.micro,
    textTransform: "uppercase"
  },
  leagueCopy: {
    flex: 1
  },
  fixtureTime: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3
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
    backgroundColor: semantic.liveSoft,
    borderWidth: 1,
    borderColor: semantic.live
  },
  elapsed: {
    color: colors.textMuted,
    ...typeScale.micro
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
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
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
    color: colors.green,
    fontSize: 10,
    fontWeight: "900"
  },
  redCardBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  redCardCount: {
    color: colors.red,
    fontSize: 9,
    fontWeight: "900"
  },
  score: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    paddingHorizontal: spacing.md,
    textAlign: "center"
  },
  // The separator recedes so the two numbers read as one value rather than as
  // three glyphs of equal weight.
  scoreSeparator: {
    color: colors.textSubtle,
    fontWeight: fontWeights.medium
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
  rowTools: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resetAction: { minHeight: 48, justifyContent: "center" },
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
    alignItems: "flex-end"
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
    ...typeScale.label
  },
  statNote: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  selection: {
    color: colors.text,
    ...typeScale.decision
  },
  decisionCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg
  },
  decisionToggle: {
    color: semantic.intelligence,
    ...typeScale.label,
    marginLeft: "auto"
  },
  decisionFacts: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md
  },
  decisionFact: {
    color: colors.textMuted,
    ...typeScale.label
  },
  decisionBody: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    flexDirection: "row",
    gap: spacing.xxl,
    marginTop: spacing.md,
    paddingTop: spacing.md
  },
  decisionMetric: {
    gap: spacing.xs
  },
  decisionMetricValue: {
    color: colors.text,
    ...typeScale.metric
  },
  decisionMetricLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  decisionReason: {
    color: colors.text,
    ...typeScale.decision,
    marginTop: spacing.sm
  },
  decisionMeta: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16
  },
  decisionScore: {
    color: colors.textSubtle,
    fontSize: 10
  },
  statsCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: spacing.lg
  },
  comparison: {
    gap: spacing.sm
  },
  comparisonLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statValue: {
    color: colors.text,
    width: 54,
    fontSize: 14,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.textMuted,
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700"
  },
  dualBar: {
    flexDirection: "row",
    gap: spacing.xs
  },
  homeTrack: {
    flex: 1,
    height: 5,
    alignItems: "flex-end",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    overflow: "hidden"
  },
  awayTrack: {
    flex: 1,
    height: 5,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    overflow: "hidden"
  },
  homeBar: {
    height: "100%",
    backgroundColor: colors.blue,
    borderRadius: radii.round
  },
  awayBar: {
    height: "100%",
    backgroundColor: colors.green,
    borderRadius: radii.round
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
    color: colors.text,
    width: 34,
    fontSize: 12,
    fontWeight: "900"
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
    width: 40,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 12
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  bilyonerAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    backgroundColor: colors.green
  },
  bilyonerActionText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "900"
  },
  flowSection: {
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  flowEyebrow: {
    ...typeScale.eyebrow,
    color: colors.bronze
  },
  safetyNote: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg
  }
});
