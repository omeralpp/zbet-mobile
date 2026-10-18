import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
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
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";
import {
  liveStarMetricCount,
  starMetricLabel
} from "@/src/utils/decision-filters";
import { formatSigned } from "@/src/utils/format";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { JinxDailyComment } from "@/src/mascot/JinxDailyComment";

/** " · 17.10" when the daily figure belongs to an earlier match date. */
function otherDayLabel(metricDate: string): string {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return metricDate === today || !/^\d{4}-\d{2}-\d{2}$/.test(metricDate)
    ? "" : ` · ${metricDate.slice(8, 10)}.${metricDate.slice(5, 7)}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { filter: liveStarFilter } = useLiveStarFilter();
  const { filter: superStarFilter } = useSuperStarFilter();
  const query = useQuery(dashboardQuery);
  const superKpis = useQuery(superKpisQuery);
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

  const dashboard = query.data;
  const dailySuper = superKpis.data?.buckets[superStarFilter];
  const profitColor =
    dailySuper && dailySuper.profit >= 0 ? semantic.positive : semantic.negative;
  const featuredTitle = {
    SELECTED_LIVE: "Öne çıkan canlı maçlar",
    PRESSURE_LIVE: "Takipteki canlı maçlar",
    UPCOMING: "Sıradaki maçlar",
    EMPTY: "Maç görünümü"
  }[dashboard?.featuredMatchMode ?? "EMPTY"];
  const featuredCaption =
    dashboard?.featuredMatchMode === "UPCOMING"
      ? "Başlama zamanı en yakın aktif fikstürler"
      : "Skor, seçim ve güncel oran";

  const moduleNodes: Partial<Record<OverviewModuleId, ReactNode>> = {
    metrics: (
      <View style={styles.metrics}>
        {dashboard ? <><MetricCard
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
        /></> : null}
        <TutorialTarget id="home-super-metric" style={styles.metricTarget}>
          {dailySuper && superKpis.data ? <><MetricCard
            accent={profitColor}
            detail={`${dailySuper.won} kazandı · ${dailySuper.lost} kaybetti${otherDayLabel(superKpis.data.metricDate)}`}
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
          </> : superKpis.isLoading ? <LoadingState label="Günlük Super verisi hazırlanıyor" /> : <ErrorState error={superKpis.error} onRetry={() => { void superKpis.refetch(); }} />}
        </TutorialTarget>
        {dailySuper && superKpis.data ? <View style={styles.metricScope}>
          <JinxDailyComment />
          {superKpis.isError ? <Text accessibilityRole="alert" style={styles.scopeNote}>Günlük Super yenilenemedi; son veri gösteriliyor.</Text> : null}
        </View> : null}
      </View>
    ),
    recentSuper: dashboard ? (
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
    ) : undefined
  };

  if (dashboard?.featuredMatches.length) {
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
              <MatchCard compact match={match} />
            </TutorialTarget>
          ) : (
            <MatchCard compact key={match.key} match={match} />
          )
        )}
      </>
    );
  }

  if (dashboard?.latestTotoProgram) {
    moduleNodes.toto = (
      <>
        <SectionHeader
          actionLabel="Programlar"
          caption="Güncel Spor Toto programı"
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
    .map((id) => ({ id, node: moduleNodes[id], fullWidth: id === "metrics" }));

  return (
    <Screen
      eyebrow="BTB"
      title="Bugünün görünümü"
      contentStyle={styles.content}
      scrollRef={scrollRef}
      wide
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
      {!dashboard ? query.isLoading ? <LoadingState label="Maç ve program özeti hazırlanıyor" /> : <ErrorState error={query.error} onRetry={() => { void query.refetch(); }} /> : query.isError ? <Text accessibilityRole="alert" style={styles.scopeNote}>Özet yenilenemedi; son alınan maç ve program verileri gösteriliyor.</Text> : null}
      {dashboard && dashboard.featuredMatchMode !== "SELECTED_LIVE" ? <Text style={styles.selectionNotice}>
        Şu an öne çıkan canlı BTB seçimi yok.
      </Text> : null}
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
  selectionNotice: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
  content: {
    paddingTop: spacing.md
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  metricTarget: {
    flex: 1,
    minWidth: 148,
    gap: spacing.sm
  },
  metricScope: { width: "100%", gap: spacing.xs },
  scopeNote: { ...typeScale.bodyCompact, color: colors.textMuted, lineHeight: 19 }
});
