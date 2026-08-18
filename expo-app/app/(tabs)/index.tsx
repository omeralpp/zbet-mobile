import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { MatchCard } from "@/src/components/MatchCard";
import { MetricCard } from "@/src/components/MetricCard";
import { Screen } from "@/src/components/Screen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { SuperLogCard } from "@/src/components/SuperLogCard";
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { dashboardQuery, superKpisQuery } from "@/src/api/queries";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { OverviewModuleId } from "@/src/layout/module-registry";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { useSuperStarFilter } from "@/src/preferences/SuperStarFilterProvider";
import { colors, radii, semantic, spacing } from "@/src/theme/theme";
import {
  liveStarMetricCount,
  starMetricLabel
} from "@/src/utils/decision-filters";
import { formatSigned } from "@/src/utils/format";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";

export default function DashboardScreen() {
  const router = useRouter();
  const { filter: liveStarFilter } = useLiveStarFilter();
  const { filter: superStarFilter } = useSuperStarFilter();
  const query = useQuery(dashboardQuery);
  const superKpis = useQuery(superKpisQuery);
  const dashboardError = query.error ?? superKpis.error;
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible } = useModuleLayout("overview");
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  useEffect(() => {
    if (!query.data || !superKpis.data) {
      return;
    }
    refreshPerformanceWidgetFromApi(superStarFilter).catch((error: unknown) => {
      console.warn("Overview performans widgetını yenileyemedi.", error);
    });
  }, [query.data, superKpis.data, superStarFilter]);

  if (query.isLoading || superKpis.isLoading) {
    return (
      <Screen eyebrow="BTB Mobile" tabSwipe title="Bugünün merkezi">
        <LoadingState />
      </Screen>
    );
  }

  if (query.isError || superKpis.isError || !query.data || !superKpis.data) {
    return (
      <Screen eyebrow="BTB Mobile" tabSwipe title="Bugünün merkezi">
        <ErrorState
          message={
            dashboardError instanceof Error
              ? dashboardError.message
              : "Özet verisi alınamadı."
          }
          onRetry={() => {
            void Promise.all([query.refetch(), superKpis.refetch()]);
          }}
        />
      </Screen>
    );
  }

  const dashboard = query.data;
  const dailySuper = superKpis.data.buckets[superStarFilter];
  const profitColor = dailySuper.profit >= 0 ? colors.green : colors.red;
  const featuredTitle = {
    SELECTED_LIVE: "Öne çıkan canlı maçlar",
    PRESSURE_LIVE: "Takipteki canlı maçlar",
    UPCOMING: "Sıradaki maçlar",
    EMPTY: "Maç görünümü"
  }[dashboard.featuredMatchMode];
  const featuredCaption =
    dashboard.featuredMatchMode === "UPCOMING"
      ? "Başlama zamanı en yakın aktif fikstürler"
      : "Skor, oran ve baskı birlikte";

  const moduleNodes: Partial<Record<OverviewModuleId, ReactNode>> = {
    hero: (
      <TutorialTarget id="home-hero" radius={radii.xl}>
        <Pressable
          accessibilityHint="Uygulamanın kısa açıklamasını açar"
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              "BTB Mobile Next",
              "Canlı maç durumunu, BTB Super kararlarını ve Spor Toto program özetlerini tek yerde, salt okunur ve mobil odaklı sunar.",
              [{ text: "Anladım" }]
            )
          }
          style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
        >
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
        </Pressable>
      </TutorialTarget>
    ),
    metrics: (
      <View style={styles.metrics}>
        <MetricCard
          // The live-match counter used loss red. It counts matches in progress
          // and says nothing about how they are going.
          accent={semantic.live}
          detail="aktif takip"
          icon="access-point"
          label="Canlı maç"
          onPress={() =>
            router.push({
              pathname: "/live",
              params: { scope: "LIVE" }
            } as never)
          }
          value={String(dashboard.liveMatchCount)}
        />
        <MetricCard
          accent={colors.gold}
          detail="canlı maç filtresi"
          icon="star-four-points-outline"
          label={starMetricLabel(liveStarFilter)}
          onPress={() =>
            router.push({
              pathname: "/live",
              params: { scope: "STAR", decision: liveStarFilter }
            } as never)
          }
          value={String(
            liveStarMetricCount(dashboard.liveStarCounts, liveStarFilter)
          )}
        />
        <TutorialTarget id="home-super-metric" style={styles.metricTarget}>
          <MetricCard
            accent={profitColor}
            detail={`${dailySuper.won} kazandı · ${dailySuper.lost} kaybetti`}
            icon="chart-line"
            label={`Günlük Super · ${starMetricLabel(superStarFilter)}`}
            onPress={() =>
              router.push({
                pathname: "/super",
                params: { scope: "LATEST_DAY" }
              } as never)
            }
            value={formatSigned(dailySuper.profit)}
          />
        </TutorialTarget>
      </View>
    ),
    recentSuper: (
      <>
        <SectionHeader
          actionLabel="Tüm kararlar"
          caption="En yeni kararlar"
          onAction={() => router.push("/super" as never)}
          title="Son Super hareketleri"
        />
        {dashboard.recentSuper.map((log) => (
          <SuperLogCard key={log.key} log={log} />
        ))}
      </>
    )
  };

  if (dashboard.featuredMatches.length) {
    moduleNodes.featured = (
      <>
        <SectionHeader
          actionLabel="Tümünü gör"
          caption={featuredCaption}
          onAction={() => router.push("/live" as never)}
          title={featuredTitle}
        />
        {dashboard.featuredMatches.map((match, index) =>
          index === 0 ? (
            <TutorialTarget id="home-featured" key={match.key}>
              <MatchCard match={match} />
            </TutorialTarget>
          ) : (
            <MatchCard key={match.key} match={match} />
          )
        )}
      </>
    );
  }

  if (dashboard.latestTotoProgram) {
    moduleNodes.toto = (
      <>
        <SectionHeader
          actionLabel="Programlar"
          caption="Toto-native program görünümü"
          onAction={() => router.push("/toto" as never)}
          title="Spor Toto"
        />
        <TotoProgramCard program={dashboard.latestTotoProgram} />
      </>
    );
  }

  const moduleItems = order
    .filter((id): id is OverviewModuleId =>
      Boolean(moduleNodes[id as OverviewModuleId])
    )
    .map((id) => ({ id, node: moduleNodes[id] }));

  return (
    <Screen
      contentStyle={styles.content}
      scrollRef={scrollRef}
      // The horizontal tab gesture stands down while a section is lifted so a
      // reorder drag can never turn into a tab change.
      tabSwipe={!reordering}
      scrollProps={{
        onScroll: handleScroll,
        scrollEnabled: !reordering,
        scrollEventThrottle: 16,
        refreshControl: (
          <RefreshControl
            colors={[colors.green]}
            onRefresh={() => Promise.all([query.refetch(), superKpis.refetch()])}
            refreshing={query.isRefetching || superKpis.isRefetching}
            tintColor={colors.green}
          />
        )
      }}
    >
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 72
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
  pressed: {
    opacity: 0.82
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
  },
  metricTarget: {
    width: "100%",
    height: 144
  }
});
