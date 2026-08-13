import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  superLogPeriodScoreQuery,
  superLogQuery
} from "@/src/api/queries";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { RatingStars } from "@/src/components/RatingStars";
import { LeagueStandingsTable } from "@/src/components/LeagueStandingsTable";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { colors, radii, spacing } from "@/src/theme/theme";
import {
  formatFixtureDateTime,
  formatPercentage,
  formatRate,
  formatSigned,
  formatSuperResult
} from "@/src/utils/format";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function metric(value: string, label: string, color?: string) {
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
  const query = useQuery(superLogQuery(key));
  const periodScoreQuery = useQuery(superLogPeriodScoreQuery(key));

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

  return (
    <Screen
      edgeSwipeBack
      onEdgeSwipeBack={handleEdgeSwipeBack}
      contentStyle={styles.screen}
      scrollProps={{
        alwaysBounceVertical: true,
        refreshControl: (
          <RefreshControl
            colors={[colors.gold]}
            onRefresh={() =>
              Promise.all([query.refetch(), periodScoreQuery.refetch()])
            }
            refreshing={query.isRefetching || periodScoreQuery.isRefetching}
            tintColor={colors.gold}
          />
        )
      }}
    >
      <TutorialTarget id="super-summary" radius={radii.xl}>
        <View style={styles.hero}>
        <View style={styles.rowBetween}>
          <Text numberOfLines={1} style={styles.league}>{log.league}</Text>
          <Text style={[styles.result, { color: resultColor }]}>
            {formatSuperResult(log.result)}
          </Text>
        </View>
        <Text style={styles.fixtureTime}>
          {formatFixtureDateTime(log.matchDate, log.matchTime)} · {log.elapsed}&apos; karar
        </Text>
        <Text style={styles.match}>{log.homeTeam} - {log.awayTeam}</Text>
        <Text style={styles.scoreLabel}>Karar anı skoru</Text>
        <Text style={styles.score}>
          {log.decisionHomeScore} - {log.decisionAwayScore}
        </Text>
        {periodScoreQuery.data?.halfTimeScore ? (
          <Text style={styles.halfTimeScore}>
            İY: {periodScoreQuery.data.halfTimeScore.homeScore}-
            {periodScoreQuery.data.halfTimeScore.awayScore}
          </Text>
        ) : null}
        {(log.result === "WON" || log.result === "LOST") && log.finalScore ? (
          <View
            accessibilityLabel={`Biten skor ${log.finalScore}`}
            style={[styles.finalScorePill, { borderColor: resultColor }]}
          >
            <Text style={styles.finalScoreLabel}>Biten skor</Text>
            <Text style={[styles.finalScoreValue, { color: resultColor }]}>
              {log.finalScore.replace("-", " - ")}
            </Text>
          </View>
        ) : null}
        <View style={styles.selectionRow}>
          <View>
            <RatingStars rating={log.rating} />
            <Text style={styles.selection}>{log.selectedOdd}</Text>
          </View>
          {metric(formatRate(log.liveRate), "seçim oranı")}
          {metric(
            log.profit === null ? "—" : formatSigned(log.profit),
            "kâr",
            resultColor
          )}
        </View>
        </View>
      </TutorialTarget>

      <Text style={styles.sectionTitle}>Karar özeti</Text>
      <View style={styles.card}>
        <Text style={styles.reason}>{log.reason}</Text>
        <View style={styles.metricGrid}>
          {metric(
            log.baseProbability === null
              ? "—"
              : formatPercentage(log.baseProbability),
            "base probability"
          )}
          {metric(
            hasStandingContext ? formatSigned(log.standingPpgDiff) : "—",
            "Lig PPG farkı"
          )}
          {metric(
            log.modelScore === null ? "—" : formatSigned(log.modelScore),
            "model skoru"
          )}
          {metric(formatSigned(log.edgeScore), "edge")}
          {metric(formatSigned(log.compatibilityScore), "uyumluluk")}
          {metric(formatSigned(log.alignmentScore), "hizalama")}
        </View>
        {log.aiComment ? <Text style={styles.comment}>{log.aiComment}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Karar anındaki saha</Text>
      <View style={styles.card}>
        <View style={styles.metricGrid}>
          {metric(formatSigned(log.totalPressure), "toplam baskı")}
          {metric(formatSigned(log.pressureDiff), "baskı farkı")}
          {metric(formatSigned(log.homePressure), "ev baskısı")}
          {metric(formatSigned(log.awayPressure), "deplasman baskısı")}
          {metric(formatSigned(log.pressureAdjustment), "pressure adjustment")}
          {metric(formatSigned(log.stateAdjustment), "state adjustment")}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Benzerlik ve lig bağlamı</Text>
      <View style={styles.card}>
        <View style={styles.metricGrid}>
          {metric(String(log.initialPool), "ilk havuz")}
          {metric(String(log.halfTimePool), "ikinci yarı havuzu")}
          {metric(String(log.postScorePool), "skor sonrası havuz")}
          {metric(String(log.selectedOddPool), "seçim havuzu")}
          {metric(log.deviation.toFixed(2), "deviation")}
          {metric(formatSigned(log.venuePpgDiff), "saha PPG farkı")}
        </View>
        {hasStandingContext ? (
          <LeagueStandingsTable
            contextLabel="Karar anındaki kayıt"
            rows={[
              {
                team: log.homeTeam,
                position: log.homeStandingPosition || null,
                points: log.homeStandingPoints,
                side: "HOME"
              },
              {
                team: log.awayTeam,
                position: log.awayStandingPosition || null,
                points: log.awayStandingPoints,
                side: "AWAY"
              }
            ]}
          />
        ) : null}
      </View>

      <Pressable
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
        <Text style={styles.primaryActionText}>Fiori Super Log’da aç</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.push({ pathname: "/match/[key]", params: { key: log.matchKey } } as never)
        }
        style={styles.secondaryAction}
      >
        <Text style={styles.secondaryActionText}>Güncel maç görünümünü aç</Text>
      </Pressable>
      <Text style={styles.safetyNote}>
        Bu ekran dokunulan Super Log satırının tarihsel snapshot&apos;ını gösterir;
        güncel maç verisiyle değiştirilmez.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.lg },
  hero: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  league: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  result: { fontSize: 10, fontWeight: "900" },
  fixtureTime: { color: colors.textSubtle, fontSize: 10, marginTop: 4 },
  match: { color: colors.text, fontSize: 22, fontWeight: "900", marginTop: spacing.lg },
  scoreLabel: { color: colors.textSubtle, fontSize: 9, fontWeight: "800", marginTop: spacing.md },
  score: { color: colors.text, fontSize: 28, fontWeight: "900", marginTop: spacing.sm },
  halfTimeScore: { color: colors.textMuted, fontSize: 10, fontWeight: "800", marginTop: 3 },
  finalScorePill: { alignItems: "center", alignSelf: "flex-start", borderRadius: radii.round, borderWidth: 1, flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  finalScoreLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "800" },
  finalScoreValue: { fontSize: 15, fontWeight: "900" },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft
  },
  selection: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 4 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "900", marginTop: spacing.xxl, marginBottom: spacing.md },
  card: { padding: spacing.xl, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.backgroundElevated },
  reason: { color: colors.green, fontSize: 14, fontWeight: "900" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: spacing.lg, marginTop: spacing.lg },
  metric: { flexBasis: "45%", flexGrow: 1, minWidth: 128 },
  metricValue: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: "900" },
  metricLabel: { color: colors.textSubtle, fontSize: 10, lineHeight: 14, marginTop: 2 },
  comment: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  primaryAction: { minHeight: 50, alignItems: "center", justifyContent: "center", borderRadius: radii.round, backgroundColor: colors.blue, marginTop: spacing.xxl },
  primaryActionText: { color: colors.white, fontSize: 14, fontWeight: "900" },
  secondaryAction: { minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: radii.round, borderWidth: 1, borderColor: colors.green, marginTop: spacing.md },
  secondaryActionText: { color: colors.green, fontSize: 13, fontWeight: "900" },
  safetyNote: { color: colors.textSubtle, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: spacing.md, paddingHorizontal: spacing.lg }
});
