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
import { MetricStrip, MetricTile } from "@/src/components/MetricCard";
import { toneColor } from "@/src/components/DecisionTicket";
import { Screen } from "@/src/components/Screen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { ErrorState, LoadingState } from "@/src/components/StateView";
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { dashboardQuery } from "@/src/api/queries";
import { RecentRecommendations, useRebuildWeek } from "@/src/components/RebuildEvidencePanel";
import { formatRatio, formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { OverviewModuleId } from "@/src/layout/module-registry";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { colors, semantic, spacing, typeScale, textFont } from "@/src/theme/theme";
import {
  liveStarMetricCount,
  starMetricLabel
} from "@/src/utils/decision-filters";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { formatTodayEyebrow } from "@/src/utils/format";

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
  const week = useRebuildWeek();
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

  const weekTone = week.period ? unitsTone(week.period.net) : "neutral";
  const moduleNodes: Partial<Record<OverviewModuleId, ReactNode>> = {
    metrics: dashboard ? (
      <View style={styles.metrics}>
        <MetricStrip>
          <MetricTile
            // The live-match counter used loss red. It counts matches in
            // progress and says nothing about how they are going.
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
          <MetricTile
            accent={colors.gold}
            detail="canlı maç filtresi"
            icon="star"
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
          {/* The rebuild's own seven-day result at the original quote, one
              hypothetical unit per recommendation; the full report and its
              caveats live on the Super tab. */}
          <MetricTile
            accent={week.period ? toneColor[weekTone] : semantic.neutral}
            accessibilityLabel={week.period
              ? `BTB son 7 gün, varsayımsal birim ${formatUnits(week.period.net)}; ${week.period.wins} kazandı, ${week.period.losses} kaybetti; ROI ${formatRatio(week.period.roi)}`
              : "BTB son 7 gün: rapor bekleniyor"}
            detail={!week.period
              ? week.loading ? "hazırlanıyor" : "rapor bekleniyor"
              : week.period.recommendations === 0
                ? "henüz öneri yok"
                : `${week.period.wins} kazandı · ${week.period.losses} kaybetti`}
            icon="chart-line"
            label="BTB · 7 gün"
            onPress={() => router.push("/super" as never)}
            value={week.period ? formatUnits(week.period.net) : "—"}
            valueColor={week.period && weekTone !== "neutral" ? toneColor[weekTone] : undefined}
          />
        </MetricStrip>
      </View>
    ) : null,
    recentSuper: week.recommendations.length ? (
      <>
        <SectionHeader
          actionLabel="Tümü"
          caption="İlk oran ve sonuç, karar anındaki haliyle"
          onAction={() => router.push("/super" as never)}
          title="Son BTB önerileri"
        />
        <RecentRecommendations />
      </>
    ) : null
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
      brand
      eyebrow={formatTodayEyebrow()}
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
  selectionNotice: { ...textFont("400"), color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
  content: {
    paddingTop: spacing.md
  },
  metrics: {
    width: "100%"
  },
  metricTarget: {
    flex: 1,
    minWidth: 148,
    gap: spacing.sm
  },
  metricScope: { width: "100%", gap: spacing.xs },
  scopeNote: { ...typeScale.bodyCompact, color: colors.textMuted, lineHeight: 19 }
});
