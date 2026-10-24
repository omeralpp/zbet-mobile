import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Platform,
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
import { MetricStrip, MetricTile } from "@/src/components/MetricCard";
import { toneColor } from "@/src/components/DecisionTicket";
import { Screen } from "@/src/components/Screen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { EmptyState, ErrorState, LoadingState } from "@/src/components/StateView";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { TotoProgramCard } from "@/src/components/TotoProgramCard";
import { dashboardQuery, matchInsightsQuery, matchesQuery } from "@/src/api/queries";
import { usePublishedSelections } from "@/src/api/use-published-selections";
import { RecentRecommendations, useRebuildWeek, useRebuildClock } from "@/src/components/RebuildEvidencePanel";
import { activeMatch, activeStarCounts, publishedStarCounts } from "@/src/utils/rebuild-cards";
import { overviewLiveSelections } from "@/src/utils/overview-live-selections";
import { formatRatio, formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { isAtLeast } from "@/src/layout/breakpoints";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import type { OverviewModuleId } from "@/src/layout/module-registry";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { JinxDailyComment } from "@/src/mascot/JinxDailyComment";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { colors, iconSizes, radii, semantic, spacing, typeScale, textFont } from "@/src/theme/theme";
import {
  liveStarMetricCount,
  starMetricLabel
} from "@/src/utils/decision-filters";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { formatTodayEyebrow } from "@/src/utils/format";

export default function DashboardScreen() {
  const clock = useRebuildClock();
  const router = useRouter();
  const { filter: liveStarFilter } = useLiveStarFilter();
  const query = useQuery(dashboardQuery);
  const hasRebuild = query.data?.liveStarSelections !== undefined || !!query.data?.featuredMatches.some(match=>match.rebuild);
  // Share the Live screen's complete snapshot cache; featured matches alone
  // are capped and cannot supply a truthful star count.
  const snapshots = useQuery({...matchesQuery,enabled:hasRebuild});
  const now = Math.max(clock,snapshots.dataUpdatedAt);
  const publications = usePublishedSelections(hasRebuild ? snapshots.data ?? query.data?.featuredMatches : undefined);
  const insights = useQuery(matchInsightsQuery);
  const breakpoint = useBreakpoint();
  // Desktop (v40 W-Özet): four separate figure tiles with Jinx as the fourth,
  // and each featured match as one horizontal row.
  const wideWeb = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible, reset } = useModuleLayout("overview");
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollOffset.current = event.nativeEvent.contentOffset.y;
    },
    []
  );
  const insightMap = useMemo(
    () => new Map((insights.data ?? []).map((insight) => [insight.key, insight])),
    [insights.data]
  );

  const dashboard = query.data;
  const selectionUnavailable = publications.unavailable || snapshots.isError;
  const starCounts = hasRebuild ? snapshots.isPending || publications.pending || selectionUnavailable ? null
    : publishedStarCounts(snapshots.data ?? [],publications.records,now)
    : dashboard ? activeStarCounts(dashboard,now) : null;
  const activeSelection = (match: NonNullable<typeof dashboard>["featuredMatches"][number]) => activeMatch(match,now,publications.records,selectionUnavailable);
  const hasLiveMatches = hasRebuild && (snapshots.data ?? []).some(match=>["LIVE","HALF_TIME"].includes(match.status));
  const selectedMatches = overviewLiveSelections(snapshots.data ?? [],publications.records,liveStarFilter,now,selectionUnavailable).slice(0,3);
  const featuredMatches = hasLiveMatches ? selectedMatches : [...(dashboard?.featuredMatches ?? [])].sort((a,b)=>activeSelection(b).rating-activeSelection(a).rating);
  const featuredMode = selectedMatches.length ? "SELECTED_LIVE" : dashboard?.featuredMatchMode === "SELECTED_LIVE" && !featuredMatches.some(match=>activeSelection(match).selectedOdd)
    ? "PRESSURE_LIVE" : dashboard?.featuredMatchMode ?? "EMPTY";
  const week = useRebuildWeek();
  const featuredTitle = hasLiveMatches ? "Takipteki canlı maçlar" : {
    SELECTED_LIVE: "Öne çıkan canlı maçlar",
    PRESSURE_LIVE: "Takipteki canlı maçlar",
    UPCOMING: "Sıradaki maçlar",
    EMPTY: "Maç görünümü"
  }[featuredMode];
  const featuredCaption = hasLiveMatches ? `${starMetricLabel(liveStarFilter)} · seçim ve güncel oran` :
    dashboard?.featuredMatchMode === "UPCOMING"
      ? "Başlama zamanı en yakın aktif fikstürler"
      : "Skor, seçim ve güncel oran";

  const weekTone = week.period ? unitsTone(week.period.net) : "neutral";
  const tiles = dashboard ? [
    <MetricTile
      // The live-match counter used loss red. It counts matches in
      // progress and says nothing about how they are going.
      accent={semantic.live}
      detail="aktif takip"
      icon="access-point"
      key="live"
      label="Canlı maç"
      onPress={() =>
        router.push({
          pathname: "/live",
          params: { scope: "LIVE" }
        } as never)
      }
      value={String(dashboard.liveMatchCount)}
    />,
    <MetricTile
      accent={colors.gold}
      detail={hasRebuild && !starCounts ? selectionUnavailable ? "kayıtlar doğrulanamıyor" : "kayıtlar yükleniyor" : "canlı maç filtresi"}
      icon="star"
      key="stars"
      label={starMetricLabel(liveStarFilter)}
      onPress={() =>
        router.push({
          pathname: "/live",
          params: { scope: "STAR", decision: liveStarFilter }
        } as never)
      }
      value={starCounts ? String(liveStarMetricCount(starCounts,liveStarFilter)) : "—"}
    />,
    // The rebuild's own seven-day result at the original quote, one
    // hypothetical unit per recommendation; the full report and its caveats
    // live on the Super tab.
    <TutorialTarget id="home-super-metric" key="week" style={wideWeb ? styles.metricTarget : styles.stripTarget}>
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
    </TutorialTarget>
  ] : [];

  const moduleNodes: Partial<Record<OverviewModuleId, ReactNode>> = {
    metrics: dashboard ? (
      wideWeb ? (
        <View style={styles.metricRow}>
          {tiles.map((tile, index) => (
            <View key={index} style={styles.metricCard}>
              <SurfaceMaterial radius={18} />
              {tile}
            </View>
          ))}
          <JinxDailyComment variant="tile" />
        </View>
      ) : (
        <View style={styles.metrics}>
          <TutorialTarget id="home-hero" radius={18}>
            <MetricStrip>{tiles}</MetricStrip>
          </TutorialTarget>
          <JinxDailyComment />
        </View>
      )
    ) : null,
    // Always present (v40 board), with its own state while nothing is published.
    recentSuper: (
      <>
        <SectionHeader
          actionLabel="Tüm kararlar"
          caption="En yeni kararlar"
          onAction={() => router.push("/super" as never)}
          title="Son Super hareketleri"
        />
        <RecentRecommendations />
      </>
    )
  };

  if (featuredMatches.length || hasLiveMatches) {
    moduleNodes.featured = (
      <>
        <SectionHeader
          actionLabel="Tümünü gör"
          caption={featuredCaption}
          onAction={() => router.push(hasLiveMatches ? {pathname:"/live",params:{scope:"STAR",decision:liveStarFilter}} as never : "/live" as never)}
          title={featuredTitle}
        />
        {hasLiveMatches && !featuredMatches.length ? <EmptyState kind="NO_DECISION"
          title={publications.pending ? "Seçimler yükleniyor" : selectionUnavailable ? "Seçimler doğrulanamıyor" : "Filtreye uygun aktif seçim yok"}
          message="Seçilen yıldız eşiğinde, piyasası açık ve güncel oranı bulunan son seçimler burada gösterilir." /> : null}
        {featuredMatches.map((match, index) =>
          index === 0 ? (
            <TutorialTarget id="home-featured" key={match.key}>
              <MatchCard clock={now} compact horizontal={wideWeb} insight={insightMap.get(match.key)} match={match} />
            </TutorialTarget>
          ) : (
            <MatchCard clock={now} compact horizontal={wideWeb} insight={insightMap.get(match.key)} key={match.key} match={match} />
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
    .map((id) => ({
      id,
      node: moduleNodes[id],
      fullWidth: id === "metrics",
      // The featured matches keep the left column while the decisions and
      // the Toto program stack on the right (v40 W-Özet).
      ...(id === "featured" ? { rowSpan: 2 } : {})
    }));

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
            onRefresh={() => Promise.all([query.refetch(),insights.refetch(),...(hasRebuild ? [snapshots.refetch(),publications.query.refetch()] : [])])}
            refreshing={query.isRefetching || (hasRebuild && (snapshots.isRefetching || publications.query.isRefetching))}
            tintColor={colors.green}
          />
        )
      }}
    >
      {!dashboard ? query.isLoading ? <LoadingState label="Maç ve program özeti hazırlanıyor" /> : <ErrorState error={query.error} onRetry={() => { void query.refetch(); }} /> : query.isError ? <Text accessibilityRole="alert" style={styles.scopeNote}>Özet yenilenemedi; son alınan maç ve program verileri gösteriliyor.</Text> : null}
      {dashboard && featuredMode !== "SELECTED_LIVE" ? <Text style={styles.selectionNotice}>
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
      {/* The phone's reorder hint (v40 board); desktop shows handles on hover. */}
      {Platform.OS !== "web" && dashboard ? (
        <View style={styles.reorderHint}>
          <MaterialCommunityIcons color={colors.textMuted} name="drag" size={iconSizes.small} />
          <Text style={styles.reorderText}>Bölümleri basılı tutup sürükleyerek sırala.</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => { void reset(); }} style={styles.reorderAction}>
            <Text style={styles.reorderActionText}>Düzeni sıfırla</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  selectionNotice: { ...textFont("400"), color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
  content: {
    paddingTop: spacing.md
  },
  metrics: {
    width: "100%",
    gap: spacing.md
  },
  stripTarget: {
    flex: 1
  },
  metricTarget: {
    flex: 1
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%"
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  scopeNote: { ...typeScale.bodyCompact, color: colors.textMuted, lineHeight: 19 },
  reorderHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border
  },
  reorderText: { flex: 1, color: colors.textMuted, ...typeScale.bodyCompact },
  reorderAction: { minHeight: 44, justifyContent: "center" },
  reorderActionText: { color: semantic.intelligence, ...typeScale.bodyCompact, fontWeight: "700" }
});
