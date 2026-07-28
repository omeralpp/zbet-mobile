import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { MatchCard } from "@/src/components/MatchCard";
import { MetricCard } from "@/src/components/MetricCard";
import { Screen } from "@/src/components/Screen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { SuperLogCard } from "@/src/components/SuperLogCard";
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { dashboardQuery } from "@/src/api/queries";
import { colors, radii, spacing } from "@/src/theme/theme";
import { formatSigned } from "@/src/utils/format";

export default function DashboardScreen() {
  const router = useRouter();
  const query = useQuery(dashboardQuery);

  if (query.isLoading) {
    return (
      <Screen eyebrow="BTB Mobile" title="Bugünün merkezi">
        <LoadingState />
      </Screen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Screen eyebrow="BTB Mobile" title="Bugünün merkezi">
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Özet verisi alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const dashboard = query.data;
  const profitColor =
    dashboard.todaySuperProfit >= 0 ? colors.green : colors.red;

  return (
    <Screen
      contentStyle={styles.content}
      scrollProps={{
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
      <View style={styles.hero}>
        <Image
          resizeMode="contain"
          source={require("../../assets/icon.png")}
          style={styles.logo}
        />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>CANLI KARAR MERKEZİ</Text>
          <Text style={styles.heroTitle}>Saha şimdi ne söylüyor?</Text>
          <Text style={styles.heroText}>
            BTB, Super ve Toto sinyalleri tek mobil akışta.
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <MetricCard
          accent={colors.red}
          detail="aktif takip"
          icon="access-point"
          label="Canlı maç"
          value={String(dashboard.liveMatchCount)}
        />
        <MetricCard
          accent={colors.gold}
          detail="rating 3 ve üzeri"
          icon="star-four-points-outline"
          label="Yüksek yıldız"
          value={String(dashboard.highStarLiveCount)}
        />
        <MetricCard
          accent={profitColor}
          detail={`${dashboard.todaySuperWon} kazandı · ${dashboard.todaySuperLost} kaybetti`}
          icon="chart-line"
          label="Günlük Super"
          value={formatSigned(dashboard.todaySuperProfit)}
        />
      </View>

      <SectionHeader
        actionLabel="Tümünü gör"
        caption="Skor, oran ve baskı birlikte"
        onAction={() => router.push("/live" as never)}
        title="Öne çıkan canlı maçlar"
      />
      {dashboard.featuredMatches.map((match) => (
        <MatchCard key={match.key} match={match} />
      ))}

      <SectionHeader
        actionLabel="Super Log"
        caption="En yeni kararlar"
        onAction={() => router.push("/super" as never)}
        title="Son Super hareketleri"
      />
      {dashboard.recentSuper.map((log) => (
        <SuperLogCard key={log.key} log={log} />
      ))}

      {dashboard.latestTotoProgram ? (
        <>
          <SectionHeader
            actionLabel="Programlar"
            caption="Toto-native program görünümü"
            onAction={() => router.push("/toto" as never)}
            title="Spor Toto"
          />
          <TotoProgramCard program={dashboard.latestTotoProgram} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg
  },
  hero: {
    minHeight: 170,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden"
  },
  logo: {
    width: 92,
    height: 92,
    marginRight: spacing.lg
  },
  heroCopy: {
    flex: 1
  },
  eyebrow: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: spacing.sm
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg
  }
});
