import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
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
  matchInsightQuery,
  matchLeagueContextQuery,
  matchLiveContextQuery,
  matchPeriodScoreQuery,
  matchQuery,
  matchSuperLogsQuery
} from "@/src/api/queries";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { RatingStars } from "@/src/components/RatingStars";
import { LiveDot } from "@/src/components/LiveDot";
import { SignalMeter } from "@/src/components/SignalMeter";
import {
  SurfaceDivider,
  SurfaceMaterial
} from "@/src/components/SurfaceMaterial";
import { TeamLogo } from "@/src/components/TeamLogo";
import { GamePulseCard } from "@/src/components/GamePulseCard";
import { MatchTimelineCard } from "@/src/components/MatchTimelineCard";
import { LiveContextFreshness } from "@/src/components/LiveContextNotice";
import { StandingsModule } from "@/src/components/StandingsModule";
import { PressureBalance } from "@/src/components/PressureBalance";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { RatioResultsChart } from "@/src/components/RatioResultsChart";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { buildBilyonerMatchUrl } from "@/src/external/bilyoner";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { LiveDetailModuleId } from "@/src/layout/module-registry";
import {
  colors,
  fontWeights,
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
  formatRate
} from "@/src/utils/format";
import { relatedSuperDecisions } from "@/src/utils/related-super-decisions";
import { deriveLiveRateTrend } from "@/src/utils/live-card-indicators";

function firstParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
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
          <MaterialCommunityIcons color={colors.red} name="card" size={14} />
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
  formatter
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
  formatter?: (value: number) => string;
}) {
  const total = Math.max(1, home + away);
  const homeWidth: `${number}%` = `${Math.max(4, (home / total) * 100)}%`;
  const awayWidth: `${number}%` = `${Math.max(4, (away / total) * 100)}%`;
  const formatValue = formatter ?? String;

  return (
    <View style={styles.comparison}>
      <View style={styles.comparisonLabels}>
        <Text style={styles.statValue}>
          {formatValue(home)}
          {suffix}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {formatValue(away)}
          {suffix}
        </Text>
      </View>
      <View style={styles.dualBar}>
        <View style={styles.homeTrack}>
          <View style={[styles.homeBar, { width: homeWidth }]} />
        </View>
        <View style={styles.awayTrack}>
          <View style={[styles.awayBar, { width: awayWidth }]} />
        </View>
      </View>
    </View>
  );
}

export default function MatchDetailScreen() {
  const params = useLocalSearchParams<{ key?: string | string[] }>();
  const key = firstParam(params.key);
  const router = useRouter();
  const handleEdgeSwipeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const [showDecision, setShowDecision] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible } = useModuleLayout("liveDetail");
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
      const next = event.nativeEvent.contentOffset.y > 150;
      setCompactHeader((current) => (current === next ? current : next));
    },
    []
  );
  const query = useQuery(matchQuery(key));
  const insightQuery = useQuery(matchInsightQuery(key));
  const leagueContextQuery = useQuery(matchLeagueContextQuery(key));
  const periodScoreQuery = useQuery(matchPeriodScoreQuery(key));
  const superLogs = useQuery(matchSuperLogsQuery(key));
  // Supplementary context. Its failure must never take Match Detail down, so it
  // is never consulted for the screen's loading or error state.
  const liveContext = useQuery(matchLiveContextQuery(key));
  const relatedDecisions = useMemo(
    () => relatedSuperDecisions(superLogs.data ?? [], key),
    [key, superLogs.data]
  );

  if (query.isLoading) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
        <LoadingState label="Maç detayı hazırlanıyor" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
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
      color: semantic.positive,
      label: "seçimden yükseldi"
    },
    DOWN: {
      icon: "trending-down" as const,
      color: semantic.negative,
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
  const moduleNodes: Partial<Record<LiveDetailModuleId, ReactNode>> = {
    gamePulse: <GamePulseCard betRadarId={match.betRadarId} />,
    timeline: (
      <>
        <MatchTimelineCard
          awayTeam={match.awayTeam}
          context={liveContext.data}
          homeTeam={match.homeTeam}
          isLoading={liveContext.isLoading}
        />
        <LiveContextFreshness
          ageSeconds={liveContext.data?.freshness?.ageSeconds}
          refreshFailed={liveContext.data?.freshness?.refreshFailed}
          stale={liveContext.data?.freshness?.stale}
        />
      </>
    ),
    odds: (
      <>
        <ModuleHeading eyebrow="PİYASA" title="Oran sonuçları" />
        <RatioResultsChart
          marketRates={insight?.marketRates ?? []}
          phase={match.ratioPhase}
          rows={match.ratioResults}
        />
      </>
    ),
    statistics: (
      <>
        <ModuleHeading eyebrow="SAHA" title="Canlı saha dengesi" />
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
            away={match.awayXg}
            formatter={formatRate}
            home={match.homeXg}
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
        </View>
      </>
    ),
    pressure: (
      <>
        <ModuleHeading eyebrow="BASKI" title="Güncel baskı dengesi" />
        <View style={styles.statsCard}>
          <SurfaceMaterial radius={radii.lg} />
          <PressureBalance
            label="Güncel maç snapshot'ı"
            pressureDiff={
              match.pressureSource === "CURRENT_MATCH"
                ? match.pressureDiff
                : null
            }
            totalPressure={
              match.pressureSource === "CURRENT_MATCH"
                ? match.totalPressure
                : null
            }
          />
        </View>
      </>
    ),
    scoreDistribution: (
      <>
        <ModuleHeading eyebrow="OLASILIK" title="Skor dağılımı" />
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
      </>
    )
  };

  if (match.selectedOdd && match.rating > 0) {
    moduleNodes.decision = (
      <Pressable
        accessibilityHint={
          showDecision ? "Model ayrıntılarını gizler" : "Model ayrıntılarını açar"
        }
        accessibilityRole="button"
        onPress={() => setShowDecision((visible) => !visible)}
        style={styles.decisionCard}
      >
        <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
        <Text style={styles.decisionEyebrow}>KARAR ÖZETİ</Text>
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
            <Text style={styles.decisionFact}>{match.selectedOdd}</Text>
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
    );
  }

  if (relatedDecisions.length) {
    moduleNodes.relatedSuper = (
      <>
        <ModuleHeading eyebrow="KARAR GEÇMİŞİ" title="Maçın Super tercihleri" />
        <View style={styles.relatedDecisionCard}>
          <SurfaceMaterial radius={radii.lg} />
          {relatedDecisions.map((log, index) => {
            const current =
              log.selectedOdd === match.selectedOdd &&
              log.rating === match.rating &&
              log.elapsed === match.decisionMinute;
            return (
              <Pressable
                accessibilityHint="Tarihsel Super karar detayını açar"
                accessibilityLabel={`${log.rating} yıldız, ${log.elapsed}. dakika, ${log.selectedOdd}`}
                accessibilityRole="button"
                key={log.key}
                onPress={() =>
                  router.push({
                    pathname: "/super/[key]",
                    params: { key: log.key }
                  } as never)
                }
                style={({ pressed }) => [
                  styles.relatedDecisionRow,
                  index > 0 && styles.relatedDecisionDivider,
                  pressed && styles.relatedDecisionPressed
                ]}
              >
                <RatingStars rating={log.rating} size={14} />
                <Text style={styles.relatedDecisionMinute}>
                  {log.elapsed}&apos;
                </Text>
                <Text style={styles.relatedDecisionOdd}>{log.selectedOdd}</Text>
                {current ? (
                  <Text style={styles.currentDecision}>Güncel</Text>
                ) : (
                  <MaterialCommunityIcons
                    color={colors.textMuted}
                    name="chevron-right"
                    size={18}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </>
    );
  }

  if (hasLeagueContext && leagueContext) {
    moduleNodes.standings = (
      <TutorialTarget id="match-standings" radius={radii.lg}>
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
              : "Kaynak bekleniyor; yalnız doğrulanan iki takım gösterilir."
          }
          home={{
            team: leagueContext.homeTeam,
            participantId: match.homeParticipantId,
            position: leagueContext.homeStandingPosition,
            points: leagueContext.homeStandingPoints,
            side: "HOME"
          }}
          title="Lig sıralaması"
        />
      </TutorialTarget>
    );
  }

  const moduleItems = order
    .filter((id): id is LiveDetailModuleId => Boolean(moduleNodes[id as LiveDetailModuleId]))
    .map((id) => ({ id, node: moduleNodes[id] }));

  return (
    <>
      <Stack.Screen
        options={{
          title: compactHeader
            ? `${match.homeTeam} – ${match.awayTeam}`
            : "Maç Detayı"
        }}
      />
      <Screen
      edgeSwipeBack
      onEdgeSwipeBack={handleEdgeSwipeBack}
      contentStyle={styles.screen}
      scrollRef={scrollRef}
      scrollProps={{
        alwaysBounceVertical: true,
        onScroll: handleScroll,
        scrollEnabled: !reordering,
        scrollEventThrottle: 16,
        refreshControl: (
          <RefreshControl
            colors={[colors.green]}
              onRefresh={() =>
                Promise.all([
                  query.refetch(),
                  insightQuery.refetch(),
                  leagueContextQuery.refetch(),
                  periodScoreQuery.refetch(),
                  superLogs.refetch(),
                  liveContext.refetch()
                ])
              }
              refreshing={
                query.isRefetching ||
                insightQuery.isRefetching ||
                leagueContextQuery.isRefetching ||
                periodScoreQuery.isRefetching ||
                superLogs.isRefetching
              }
            tintColor={colors.green}
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
            <Text style={styles.score}>
              {match.homeScore}
              <Text style={styles.scoreSeparator}> - </Text>
              {match.awayScore}
            </Text>
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
        <Text style={styles.verdictEyebrow}>BTB SEÇİMİ</Text>
        <View style={styles.verdictRow}>
          <View style={styles.verdictCopy}>
            <Text numberOfLines={1} style={styles.selection}>
              {match.selectedOdd || "Super adayı bekleniyor"}
            </Text>
            <SignalMeter rating={match.rating} />
          </View>
          <View style={styles.movementBlock}>
            <View style={styles.movementRow}>
              <Text style={styles.movementFrom}>
                {formatRate(match.liveRate)}
              </Text>
              <MaterialCommunityIcons
                color={movement.color}
                name={movement.icon}
                size={16}
              />
              <Text style={[styles.movementTo, { color: movement.color }]}>
                {currentMarket.value}
              </Text>
            </View>
            <Text style={styles.movementLabel}>{movement.label}</Text>
          </View>
        </View>
        </View>
      </TutorialTarget>

      <ReorderableModuleList
        items={moduleItems}
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
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/fiori",
              params: {
                target: "match",
                matchKey: match.key
              }
            })
          }
          style={styles.fioriAction}
        >
          <Text style={styles.fioriActionText}>Fiori&apos;de aç</Text>
        </Pressable>
      </View>
      <Text style={styles.safetyNote}>
        Maç sayfası Bilyoner uygulamasında; uygulama yoksa güvenli web
        sayfasında açılır. BTB görünümü salt okunurdur.
      </Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.lg
  },
  scoreHero: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.xl,
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
    marginVertical: spacing.xl
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
    marginTop: spacing.xl,
    marginBottom: spacing.lg
  },
  verdictEyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow,
    marginBottom: spacing.sm
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.lg
  },
  verdictCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm
  },
  movementBlock: {
    alignItems: "flex-end"
  },
  movementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  // The rate BTB selected at is context for where the market is now, so it sits
  // quieter than the current number it points to.
  movementFrom: {
    color: colors.textMuted,
    ...typeScale.metricCompact
  },
  movementTo: {
    ...typeScale.metric
  },
  movementLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  selection: {
    color: colors.text,
    ...typeScale.decision
  },
  decisionCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginTop: spacing.lg
  },
  decisionEyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow
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
  relatedDecisionCard: {
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg
  },
  relatedDecisionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 52
  },
  relatedDecisionDivider: {
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1
  },
  relatedDecisionPressed: {
    opacity: 0.7
  },
  relatedDecisionMinute: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    minWidth: 32
  },
  relatedDecisionOdd: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "900"
  },
  currentDecision: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
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
  fioriAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    backgroundColor: colors.blue
  },
  fioriActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
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
