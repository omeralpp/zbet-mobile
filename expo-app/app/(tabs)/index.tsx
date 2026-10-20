import { useCallback, useRef, useState, type ReactNode } from "react";
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
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { dashboardQuery } from "@/src/api/queries";
import { RebuildReportPanel } from "@/src/components/RebuildEvidencePanel";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { OverviewModuleId } from "@/src/layout/module-registry";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";
import {
  liveStarMetricCount,
  starMetricLabel
} from "@/src/utils/decision-filters";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";

export default function DashboardScreen() {
  const router = useRouter();
  const { filter: liveStarFilter } = useLiveStarFilter();
  const query = useQuery(dashboardQuery);
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

  const dashboard = query.data;
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
        <RebuildReportPanel />
      </View>
    ),
    recentSuper: null
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
            onRefresh={() => query.refetch()}
            refreshing={query.isRefetching}
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
