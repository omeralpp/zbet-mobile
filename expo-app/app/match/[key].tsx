import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import {
  matchInsightQuery,
  matchLeagueContextQuery,
  matchPeriodScoreQuery,
  matchQuery,
  matchSuperLogsQuery
} from "@/src/api/queries";
import { RatingStars } from "@/src/components/RatingStars";
import { LeagueStandingsTable } from "@/src/components/LeagueStandingsTable";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { RatioResultsChart } from "@/src/components/RatioResultsChart";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { buildBilyonerMatchUrl } from "@/src/external/bilyoner";
import { colors, radii, spacing } from "@/src/theme/theme";
import {
  formatCurrentMarketRate,
  formatDecisionReason,
  formatFixtureDateTime,
  formatElapsed,
  formatPercentage,
  formatRate
} from "@/src/utils/format";
import { relatedSuperDecisions } from "@/src/utils/related-super-decisions";

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
  position,
  redCards
}: {
  name: string;
  position?: number | null | undefined;
  redCards: number;
}) {
  return (
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
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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
  const insight = insightQuery.data;
  const currentMarket = formatCurrentMarketRate(
    match.currentRate,
    match.selectedOdd,
    "güncel oran"
  );

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
      scrollProps={{
        alwaysBounceVertical: true,
        onScroll: handleScroll,
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
                  superLogs.refetch()
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
        <View style={styles.leagueRow}>
          <View style={styles.leagueCopy}>
            <Text style={styles.league}>{match.league}</Text>
            <Text style={styles.fixtureTime}>
              {formatFixtureDateTime(match.matchDate, match.matchTime)}
            </Text>
          </View>
          <View style={styles.elapsedPill}>
            <Text style={styles.elapsed}>
              {formatElapsed(match.status, match.elapsed)}
            </Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <TeamHeroName
              name={match.homeTeam}
              position={insight?.homeStandingPosition}
              redCards={insight?.homeRedCards ?? match.homeRedCards}
            />
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreContext}>Maç skoru</Text>
            <Text style={styles.score}>
              {match.homeScore} – {match.awayScore}
            </Text>
            {periodScoreQuery.data?.halfTimeScore ? (
              <Text style={styles.halfTimeScore}>
                İlk yarı {periodScoreQuery.data.halfTimeScore.homeScore}-
                {periodScoreQuery.data.halfTimeScore.awayScore}
              </Text>
            ) : null}
          </View>
          <View style={[styles.teamBlock, styles.awayTeam]}>
            <TeamHeroName
              name={match.awayTeam}
              position={insight?.awayStandingPosition}
              redCards={insight?.awayRedCards ?? match.awayRedCards}
            />
          </View>
        </View>
        <View style={styles.selectionRow}>
          <View>
            <RatingStars rating={match.rating} size={16} />
            <Text style={styles.selection}>
              {match.selectedOdd || "Super adayı bekleniyor"}
            </Text>
          </View>
          <View style={styles.ratePair}>
            <View>
              <Text style={styles.rateValue}>{formatRate(match.liveRate)}</Text>
              <Text style={styles.rateLabel}>seçim oranı</Text>
            </View>
            <View style={styles.alignEnd}>
              <Text style={styles.rateValue}>{currentMarket.value}</Text>
              <Text style={styles.rateLabel}>{currentMarket.label}</Text>
            </View>
          </View>
        </View>
        </View>
      </TutorialTarget>

      {match.selectedOdd && match.rating > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowDecision((visible) => !visible)}
          style={styles.decisionCard}
        >
          <View style={styles.decisionHeader}>
            <View>
              <Text style={styles.decisionEyebrow}>KARAR ÖZETİ</Text>
              <Text style={styles.decisionTitle}>BTB neden seçti?</Text>
            </View>
            <Text style={styles.decisionToggle}>
              {showDecision ? "Gizle" : "Göster"}
            </Text>
          </View>
          {showDecision ? (
            <View style={styles.decisionBody}>
              <Text style={styles.decisionReason}>
                {formatDecisionReason(match.decisionReason)}
              </Text>
              <Text style={styles.decisionMeta}>
                {match.selectedOdd}
                {match.decisionMinute !== null
                  ? ` · ${match.decisionMinute}'`
                  : ""}
                {match.decisionConfidence !== null
                  ? ` · Güven ${formatPercentage(match.decisionConfidence)}`
                  : ""}
              </Text>
              {match.decisionScore !== null ? (
                <Text style={styles.decisionScore}>
                  Model skoru {match.decisionScore.toFixed(2)}
                </Text>
              ) : null}
            </View>
          ) : null}
        </Pressable>
      ) : null}

      {relatedDecisions.length ? (
        <>
          <Text style={styles.sectionTitle}>Maçın Super tercihleri</Text>
          <View style={styles.relatedDecisionCard}>
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
                  <Text style={styles.relatedDecisionMinute}>{log.elapsed}&apos;</Text>
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
      ) : null}

      {leagueContextQuery.data &&
      (leagueContextQuery.data.homeStandingPosition !== null ||
        leagueContextQuery.data.awayStandingPosition !== null ||
        leagueContextQuery.data.homeStandingPoints !== null ||
        leagueContextQuery.data.awayStandingPoints !== null) ? (
        <>
          <Text style={styles.sectionTitle}>Lig sıralaması</Text>
          <TutorialTarget id="match-standings">
            <LeagueStandingsTable
              contextLabel={
                leagueContextQuery.data.source === "LATEST_SUPER_DECISION"
                  ? "Son Super kararı kaydı"
                  : "Kaynak bekleniyor"
              }
              rows={[
                {
                  team: leagueContextQuery.data.homeTeam,
                  position: leagueContextQuery.data.homeStandingPosition,
                  points: leagueContextQuery.data.homeStandingPoints,
                  side: "HOME"
                },
                {
                  team: leagueContextQuery.data.awayTeam,
                  position: leagueContextQuery.data.awayStandingPosition,
                  points: leagueContextQuery.data.awayStandingPoints,
                  side: "AWAY"
                }
              ]}
            />
          </TutorialTarget>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Oran sonuçları</Text>
      <RatioResultsChart
        marketRates={insight?.marketRates ?? []}
        phase={match.ratioPhase}
        rows={match.ratioResults}
      />

      <Text style={styles.sectionTitle}>Canlı saha dengesi</Text>
      <View style={styles.statsCard}>
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

      <Text style={styles.sectionTitle}>Skor dağılımı</Text>
      <View style={styles.distributionCard}>
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
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl
  },
  leagueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  league: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
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
  elapsedPill: {
    backgroundColor: colors.redSoft,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  elapsed: {
    color: colors.red,
    fontSize: 10,
    fontWeight: "900"
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl
  },
  teamBlock: {
    flex: 1
  },
  awayTeam: {
    alignItems: "flex-end"
  },
  team: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
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
  scoreContext: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  score: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    paddingHorizontal: spacing.lg
  },
  scoreBlock: {
    alignItems: "center"
  },
  halfTimeScore: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3
  },
  selectionRow: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg
  },
  selection: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3
  },
  ratePair: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl
  },
  alignEnd: {
    alignItems: "flex-end"
  },
  rateValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  rateLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: 2
  },
  decisionCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginTop: spacing.lg
  },
  decisionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  decisionEyebrow: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  decisionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2
  },
  decisionToggle: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "900"
  },
  decisionBody: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md
  },
  decisionReason: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
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
    backgroundColor: colors.backgroundElevated,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    marginTop: spacing.xxl,
    marginBottom: spacing.md
  },
  statsCard: {
    backgroundColor: colors.backgroundElevated,
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
    backgroundColor: colors.backgroundElevated,
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
