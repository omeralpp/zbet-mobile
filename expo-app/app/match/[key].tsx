import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { matchQuery } from "@/src/api/queries";
import { RatingStars } from "@/src/components/RatingStars";
import { Screen } from "@/src/components/Screen";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { colors, radii, spacing } from "@/src/theme/theme";
import {
  formatElapsed,
  formatPercentage,
  formatRate
} from "@/src/utils/format";

function firstParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] ?? "" : value ?? "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function ComparisonRow({
  label,
  home,
  away,
  suffix = ""
}: {
  label: string;
  home: number;
  away: number;
  suffix?: string;
}) {
  const total = Math.max(1, home + away);
  const homeWidth: `${number}%` = `${Math.max(4, (home / total) * 100)}%`;
  const awayWidth: `${number}%` = `${Math.max(4, (away / total) * 100)}%`;

  return (
    <View style={styles.comparison}>
      <View style={styles.comparisonLabels}>
        <Text style={styles.statValue}>
          {home}
          {suffix}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {away}
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
  const router = useRouter();
  const key = firstParam(params.key);
  const query = useQuery(matchQuery(key));

  if (query.isLoading) {
    return (
      <Screen>
        <LoadingState label="Maç detayı hazırlanıyor" />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen>
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

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.scoreHero}>
        <View style={styles.leagueRow}>
          <Text style={styles.league}>{match.league}</Text>
          <View style={styles.elapsedPill}>
            <Text style={styles.elapsed}>
              {formatElapsed(match.status, match.elapsed)}
            </Text>
          </View>
        </View>
        <View style={styles.scoreRow}>
          <View style={styles.teamBlock}>
            <Text numberOfLines={2} style={styles.team}>
              {match.homeTeam}
            </Text>
          </View>
          <Text style={styles.score}>
            {match.homeScore} – {match.awayScore}
          </Text>
          <View style={[styles.teamBlock, styles.awayTeam]}>
            <Text numberOfLines={2} style={styles.team}>
              {match.awayTeam}
            </Text>
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
              <Text style={styles.rateValue}>
                {formatRate(match.currentRate)}
              </Text>
              <Text style={styles.rateLabel}>güncel oran</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Canlı saha dengesi</Text>
      <View style={styles.statsCard}>
        <ComparisonRow
          away={match.awayBallPossession}
          home={match.homeBallPossession}
          label="Topla oynama"
          suffix="%"
        />
        <ComparisonRow
          away={match.awayShotsOnTarget}
          home={match.homeShotsOnTarget}
          label="İsabetli şut"
        />
        <ComparisonRow
          away={match.awayDangerousAttacks}
          home={match.homeDangerousAttacks}
          label="Tehlikeli atak"
        />
        <ComparisonRow
          away={match.awayCorners}
          home={match.homeCorners}
          label="Korner"
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
            router.push({
              pathname: "/fiori",
              params: {
                target: "match",
                matchKey: match.key
              }
            })
          }
          style={styles.primaryAction}
        >
          <Text style={styles.primaryActionText}>Fiori ayrıntısını aç</Text>
        </Pressable>
      </View>
      <Text style={styles.safetyNote}>
        Canlı skor ve fixture güncelleme işlemleri bu preview sürümünde
        bilinçli olarak Fiori tarafında tutulur.
      </Text>
    </Screen>
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
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
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
  score: {
    color: colors.white,
    fontSize: 27,
    fontWeight: "900",
    paddingHorizontal: spacing.lg
  },
  selectionRow: {
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    flexDirection: "row",
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
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
    marginTop: spacing.xxl
  },
  primaryAction: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    backgroundColor: colors.blue
  },
  primaryActionText: {
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
