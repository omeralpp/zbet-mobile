import { useCallback, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
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
  matchQuery,
  superLogPeriodScoreQuery,
  superLogQuery
} from "@/src/api/queries";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { SignalMeter } from "@/src/components/SignalMeter";
import {
  SurfaceDivider,
  SurfaceMaterial
} from "@/src/components/SurfaceMaterial";
import { StandingsModule } from "@/src/components/StandingsModule";
import { TeamLogo } from "@/src/components/TeamLogo";
import { PressureBalance } from "@/src/components/PressureBalance";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { CollapsibleModule } from "@/src/layout/CollapsibleModule";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { SuperDetailModuleId } from "@/src/layout/module-registry";
import {
  colors,
  fontWeights,
  interaction,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { teamLogoSizes } from "@/src/utils/team-logo";
import {
  formatFixtureDateTime,
  formatDecisionReason,
  formatPercentage,
  formatRate,
  formatSigned,
  formatSuperResult
} from "@/src/utils/format";
import { deriveSuperOutcomeBand } from "@/src/utils/super-outcome-band";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

/**
 * One Super detay module, as a collapsible panel.
 *
 * The surface binding lives here for the same reason as its Canlı detay twin:
 * a module declares its registry id and heading and nothing else.
 */
function SuperDetailPanel({
  children,
  eyebrow,
  id,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  id: SuperDetailModuleId;
  title: string;
}) {
  return (
    <CollapsibleModule
      eyebrow={eyebrow}
      moduleId={id}
      surface="superDetail"
      title={title}
    >
      {children}
    </CollapsibleModule>
  );
}

function Metric({
  value,
  label,
  color
}: {
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function SuperLogDetailScreen() {
  const params = useLocalSearchParams<{ key?: string | string[] }>();
  const router = useRouter();
  const handleEdgeSwipeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const key = firstParam(params.key);
  const [compactHeader, setCompactHeader] = useState(false);
  const [showModelDetail, setShowModelDetail] = useState(false);
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible } = useModuleLayout("superDetail");
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
      const next = event.nativeEvent.contentOffset.y > 150;
      setCompactHeader((current) => (current === next ? current : next));
    },
    []
  );
  const query = useQuery(superLogQuery(key));
  const periodScoreQuery = useQuery(superLogPeriodScoreQuery(key));
  const currentMatchQuery = useQuery({
    ...matchQuery(query.data?.matchKey ?? ""),
    // The outcome band is current match state, not a frozen Super snapshot.
    // Poll only while the decision is open; settled history stays inert.
    refetchInterval: query.data?.result === "OPEN" ? 30_000 : false
  });
  const currentMatchKey = query.data?.matchKey ?? "";
  const openCurrentMatch = useCallback(() => {
    if (!currentMatchKey) {
      return;
    }
    router.push({
      pathname: "/match/[key]",
      params: { key: currentMatchKey }
    } as never);
  }, [currentMatchKey, router]);

  if (query.isLoading) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={handleEdgeSwipeBack}>
        <LoadingState label="Super kararı hazırlanıyor" />
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
              : "Super kararı alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const log = query.data;
  const outcomeBand = deriveSuperOutcomeBand(log, currentMatchQuery.data);
  const hasStandingContext =
    log.homeStandingPosition > 0 ||
    log.awayStandingPosition > 0 ||
    log.homeStandingPoints > 0 ||
    log.awayStandingPoints > 0;
  const resultColor =
    log.result === "WON"
      ? colors.green
      : log.result === "LOST"
        ? colors.red
        : log.result === "VOID"
          ? colors.textSubtle
          : colors.blue;

  // Karar özeti stays purely model evidence; league and pool context moved into
  // their own modules so the decision metrics are not diluted by description.
  const moduleNodes: Partial<Record<SuperDetailModuleId, ReactNode>> = {
    decisionSummary: (
      <SuperDetailPanel eyebrow="MODEL" id="decisionSummary" title="Karar özeti">
        <View style={styles.card}>
          <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
          <Text style={styles.reason}>{formatDecisionReason(log.reason)}</Text>

          {/* The score is the model's answer, so it leads. Base probability sits
              beside it as its own quantity rather than as the first step of a
              pipeline: it is not a term in the score formula, and drawing it as
              one would describe arithmetic the backend does not perform.
              See `model-summary.ts` for what the formula actually is. */}
          <View style={styles.modelHeadline}>
            <Text style={styles.modelScoreValue}>
              {log.modelScore === null ? "—" : formatSigned(log.modelScore)}
            </Text>
            <Text style={styles.modelScoreLabel}>model skoru</Text>
          </View>
          <View style={styles.primaryMetrics}>
            <Metric
              label="temel olasılık"
              value={
                log.baseProbability === null
                  ? "—"
                  : formatPercentage(log.baseProbability)
              }
            />
            <Metric label="edge" value={formatSigned(log.edgeScore)} />
          </View>

          <Pressable
            accessibilityHint={
              showModelDetail
                ? "Model ayrıntılarını gizler"
                : "Model ayrıntılarını açar"
            }
            accessibilityRole="button"
            onPress={() => setShowModelDetail((visible) => !visible)}
            style={styles.disclosure}
          >
            <Text style={styles.disclosureText}>
              {showModelDetail ? "Ayrıntıyı gizle" : "Model ayrıntısı"}
            </Text>
          </Pressable>

          {showModelDetail ? (
            <>
              {/* `GİRDİLER`, not terms. Each of these reaches the score through
                  a market-dependent weight, alongside an intercept and a
                  red-market penalty this surface does not show, so no column of
                  numbers here adds up to the score above. */}
              <Text style={styles.contributorHeading}>MODEL GİRDİLERİ</Text>
              <View style={styles.metricGrid}>
                <Metric
                  label="baskı etkisi"
                  value={formatSigned(log.pressureAdjustment)}
                />
                <Metric
                  label="durum etkisi"
                  value={formatSigned(log.stateAdjustment)}
                />
                <Metric
                  label="uyumluluk"
                  value={formatSigned(log.compatibilityScore)}
                />
                <Metric
                  label="hizalama"
                  value={formatSigned(log.alignmentScore)}
                />
              </View>
              <Text style={styles.contributorNote}>
                Bu değerler modele ağırlıklı olarak girer; toplamları model
                skorunu vermez.
              </Text>
            </>
          ) : null}

          {log.aiComment ? (
            <Text style={styles.comment}>{log.aiComment}</Text>
          ) : null}
        </View>
      </SuperDetailPanel>
    ),
    decisionField: (
      <SuperDetailPanel
        eyebrow="SAHA"
        id="decisionField"
        title="Karar anındaki saha"
      >
        <View style={styles.card}>
          <View style={styles.metricGrid}>
            <Metric label="toplam baskı" value={formatSigned(log.totalPressure)} />
            <Metric label="baskı farkı" value={formatSigned(log.pressureDiff)} />
            <Metric label="ev baskısı" value={formatSigned(log.homePressure)} />
            <Metric
              label="deplasman baskısı"
              value={formatSigned(log.awayPressure)}
            />
            <Metric
              label="baskı düzeltmesi"
              value={formatSigned(log.pressureAdjustment)}
            />
            <Metric
              label="durum düzeltmesi"
              value={formatSigned(log.stateAdjustment)}
            />
          </View>
          <View style={styles.cardDivider} />
          <PressureBalance
            pressureDiff={log.pressureDiff}
            totalPressure={log.totalPressure}
          />
        </View>
      </SuperDetailPanel>
    ),
    similarity: (
      <SuperDetailPanel
        eyebrow="BAĞLAM"
        id="similarity"
        title="Benzerlik ve lig bağlamı"
      >
        <View style={styles.card}>
          <Text style={styles.groupLabel}>Havuz derinliği</Text>
          <View style={styles.metricGrid}>
            <Metric label="ilk havuz" value={String(log.initialPool)} />
            <Metric
              label="ikinci yarı havuzu"
              value={String(log.halfTimePool)}
            />
            <Metric
              label="skor sonrası havuz"
              value={String(log.postScorePool)}
            />
            <Metric label="seçim havuzu" value={String(log.selectedOddPool)} />
          </View>
          <View style={styles.cardDivider} />
          <Text style={styles.groupLabel}>Benzerlik ve lig gücü</Text>
          <View style={styles.metricGrid}>
            <Metric label="sapma" value={log.deviation.toFixed(2)} />
            <Metric
              label="lig PPG farkı"
              value={
                hasStandingContext ? formatSigned(log.standingPpgDiff) : "—"
              }
            />
            <Metric
              label="saha PPG farkı"
              value={formatSigned(log.venuePpgDiff)}
            />
          </View>
        </View>
      </SuperDetailPanel>
    )
  };

  if (hasStandingContext) {
    moduleNodes.standings = (
      <SuperDetailPanel
        eyebrow="PUAN DURUMU"
        id="standings"
        title="Karar anındaki lig"
      >
        <StandingsModule
          away={{
            team: log.awayTeam,
            participantId: log.awayParticipantId,
            position: log.awayStandingPosition || null,
            points: log.awayStandingPoints,
            side: "AWAY"
          }}
          caption="Karar anındaki kayıt; yalnız doğrulanan iki takım gösterilir."
          home={{
            team: log.homeTeam,
            participantId: log.homeParticipantId,
            position: log.homeStandingPosition || null,
            points: log.homeStandingPoints,
            side: "HOME"
          }}
        />
      </SuperDetailPanel>
    );
  }

  const moduleItems = order
    .filter((id): id is SuperDetailModuleId =>
      Boolean(moduleNodes[id as SuperDetailModuleId])
    )
    .map((id) => ({ id, node: moduleNodes[id] }));

  return (
    <>
      <Stack.Screen
        options={{
          title: compactHeader
            ? `${log.homeTeam} – ${log.awayTeam}`
            : "Super Kararı Detayı"
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
              colors={[colors.gold]}
              onRefresh={() =>
                Promise.all([
                  query.refetch(),
                  periodScoreQuery.refetch(),
                  currentMatchQuery.refetch()
                ])
              }
              refreshing={
                query.isRefetching ||
                periodScoreQuery.isRefetching ||
                currentMatchQuery.isRefetching
              }
              tintColor={colors.gold}
            />
          )
        }}
      >
        <TutorialTarget id="super-summary" radius={radii.xl}>
          <View style={styles.hero}>
            <SurfaceMaterial radius={radii.xl} />
            <View style={styles.heroHeader}>
              <View style={styles.heroMeta}>
                <Text numberOfLines={1} style={styles.league}>
                  {log.league}
                </Text>
                <Text style={styles.fixtureTime}>
                  {formatFixtureDateTime(log.matchDate, log.matchTime)} ·{" "}
                  {log.elapsed}&apos; karar
                </Text>
              </View>
              <View
                style={[
                  styles.resultPill,
                  {
                    backgroundColor: `${resultColor}1F`,
                    borderColor: resultColor
                  }
                ]}
              >
                <Text style={[styles.result, { color: resultColor }]}>
                  {formatSuperResult(log.result)}
                </Text>
              </View>
            </View>
            <View style={styles.matchIdentity}>
              <View style={styles.matchTeam}>
                <TeamLogo participantId={log.homeParticipantId} size="hero" />
                <Text numberOfLines={2} style={styles.matchTeamName}>
                  {log.homeTeam}
                </Text>
              </View>
              <Text style={styles.matchVersus}>–</Text>
              <View style={styles.matchTeam}>
                <TeamLogo participantId={log.awayParticipantId} size="hero" />
                <Text numberOfLines={2} style={styles.matchTeamName}>
                  {log.awayTeam}
                </Text>
              </View>
            </View>
            {/* Two temporal bands, not one stack of metrics.
                Everything above the seam was knowable when BTB decided;
                everything below it only became true afterwards. The previous
                layout put the settled profit in the same row and at the same
                weight as the selection rate, which reads as though the outcome
                were part of the decision. Separating them is the point of the
                screen, so it is drawn as structure rather than implied by
                labels. */}
            <SurfaceDivider style={styles.bandDivider} />
            <Text style={styles.bandEyebrow}>
              KARAR ANI · {log.elapsed}&apos;
            </Text>
            <View style={styles.bandRow}>
              <View style={styles.bandCell}>
                <Text style={styles.score}>
                  {log.decisionHomeScore}
                  <Text style={styles.scoreSeparator}> - </Text>
                  {log.decisionAwayScore}
                </Text>
                <Text style={styles.bandLabel}>
                  {periodScoreQuery.data?.halfTimeScore
                    ? `İY ${periodScoreQuery.data.halfTimeScore.homeScore}-${periodScoreQuery.data.halfTimeScore.awayScore}`
                    : "ilk yarı skoru yok"}
                </Text>
              </View>
              <View style={[styles.bandCell, styles.bandCellWide]}>
                <Text numberOfLines={1} style={styles.selection}>
                  {log.selectedOdd}
                </Text>
                <SignalMeter rating={log.rating} />
              </View>
              <View style={[styles.bandCell, styles.bandCellEnd]}>
                <Text style={styles.bandValue}>{formatRate(log.liveRate)}</Text>
                <Text style={styles.bandLabel}>seçim oranı</Text>
              </View>
            </View>

            {/* The seam. Bronze because it is structure, not a verdict: it must
                not take the colour of the result it introduces. */}
            <SurfaceDivider accent={colors.bronze} style={styles.bandSeam} />
            <Text style={[styles.bandEyebrow, styles.outcomeEyebrow]}>
              SONUÇ
            </Text>
            <View style={styles.bandRow}>
              <Pressable
                accessibilityHint="Bu karşılaşmanın güncel maç detayını açar"
                accessibilityLabel={`${outcomeBand.accessibilityLabel}. Güncel maç görünümünü aç`}
                accessibilityRole="button"
                onPress={openCurrentMatch}
                style={({ pressed }) => [
                  styles.bandCell,
                  styles.bandCellWide,
                  styles.outcomeAction,
                  pressed && styles.outcomeActionPressed
                ]}
              >
                <Text
                  style={[
                    outcomeBand.kind === "PENDING"
                      ? styles.pendingScore
                      : styles.score,
                    outcomeBand.kind === "SETTLED"
                      ? { color: resultColor }
                      : outcomeBand.kind === "LIVE"
                        ? { color: semantic.live }
                        : null
                  ]}
                >
                  {outcomeBand.score}
                </Text>
                <Text style={styles.bandLabel}>{outcomeBand.label}</Text>
              </Pressable>
              <View style={[styles.bandCell, styles.bandCellEnd]}>
                <Text style={[styles.bandValue, { color: resultColor }]}>
                  {log.profit === null ? "—" : formatSigned(log.profit)}
                </Text>
                <Text style={styles.bandLabel}>kâr</Text>
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
            accessibilityHint="Kararın gelişmiş BTB Web görünümünü açar"
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/fiori",
                params: {
                  target: "super",
                  matchDate: log.matchDate,
                  matchId: String(log.matchId),
                  elapsed: String(log.elapsed),
                  selectedOdd: log.selectedOdd,
                  rating: String(log.rating),
                  reason: log.reason
                }
              })
            }
            style={styles.primaryAction}
          >
            <Text style={styles.primaryActionText}>BTB Web’de aç</Text>
          </Pressable>
        </View>
        <Text style={styles.safetyNote}>
          Bu ekran seçilen Super kararının tarihsel kaydını gösterir; güncel maç
          verisiyle değiştirilmez.
        </Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.lg },
  hero: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  heroMeta: {
    flex: 1
  },
  league: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  resultPill: {
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    borderWidth: 1,
    paddingHorizontal: spacing.md
  },
  result: { fontSize: 10, fontWeight: "900" },
  fixtureTime: { color: colors.textSubtle, fontSize: 10, marginTop: 4 },
  matchIdentity: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  matchTeam: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm
  },
  matchTeamName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
    textAlign: "center"
  },
  matchVersus: {
    // Pin the separator to the crest row instead of the block centre, so it
    // reads as a connector rather than floating between crest and name.
    alignSelf: "flex-start",
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: teamLogoSizes.hero
  },
  modelHeadline: {
    marginTop: spacing.lg,
    gap: spacing.xs
  },
  modelScoreValue: {
    color: colors.text,
    ...typeScale.display
  },
  modelScoreLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  contributorHeading: {
    color: colors.bronze,
    ...typeScale.eyebrow,
    marginTop: spacing.lg
  },
  contributorNote: {
    color: colors.textSubtle,
    ...typeScale.bodyCompact,
    marginTop: spacing.md
  },
  primaryMetrics: {
    flexDirection: "row",
    gap: spacing.xxxl,
    marginTop: spacing.lg
  },
  disclosure: {
    minHeight: interaction.minTouchTarget,
    justifyContent: "center"
  },
  disclosureText: {
    color: semantic.intelligence,
    ...typeScale.label
  },
  bandDivider: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg
  },
  // The seam gets more air than the divider above it, so the eye registers a
  // boundary rather than another row.
  bandSeam: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg
  },
  bandEyebrow: {
    color: colors.bronze,
    ...typeScale.eyebrow,
    marginBottom: spacing.md
  },
  outcomeEyebrow: {
    color: colors.textSubtle
  },
  bandRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.lg
  },
  bandCell: {
    gap: spacing.xs
  },
  bandCellWide: {
    flex: 1,
    minWidth: 0
  },
  outcomeAction: {
    borderRadius: radii.md,
    justifyContent: "center",
    marginHorizontal: -spacing.sm,
    marginVertical: -spacing.sm,
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm
  },
  outcomeActionPressed: {
    backgroundColor: colors.surfaceStrong,
    opacity: 0.8
  },
  bandCellEnd: {
    alignItems: "flex-end"
  },
  bandValue: {
    color: colors.text,
    ...typeScale.metric
  },
  bandLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  score: {
    color: colors.text,
    ...typeScale.score
  },
  scoreSeparator: {
    color: colors.textSubtle,
    fontWeight: fontWeights.medium
  },
  pendingScore: {
    color: colors.textMuted,
    ...typeScale.score
  },
  selection: {
    color: colors.text,
    ...typeScale.decision
  },
  card: {
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundElevated
  },
  cardDivider: {
    backgroundColor: colors.borderSoft,
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.xl
  },
  groupLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    textTransform: "uppercase"
  },
  // A decision reason is not a positive outcome, so it does not take BTB green.
  reason: {
    color: colors.text,
    ...typeScale.decision
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.md,
    rowGap: spacing.lg,
    marginTop: spacing.lg
  },
  metric: { flexBasis: "45%", flexGrow: 1, minWidth: 128 },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2
  },
  comment: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  primaryAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    backgroundColor: colors.blue
  },
  primaryActionText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  safetyNote: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg
  }
});
