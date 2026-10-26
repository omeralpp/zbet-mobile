import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  RefreshControl,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { matchInsightsQuery, matchesQuery } from "@/src/api/queries";
import { usePublishedSelections } from "@/src/api/use-published-selections";
import { DecisionFilterChip } from "@/src/components/DecisionFilterChip";
import { MatchCard } from "@/src/components/MatchCard";
import { useRebuildClock } from "@/src/components/RebuildEvidencePanel";
import { LocalTabPager } from "@/src/components/LocalTabPager";
import { Screen } from "@/src/components/Screen";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { useCardGrid, type CardGrid } from "@/src/layout/use-card-grid";
import { MatchDetailView } from "@/src/screens/MatchDetailView";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { usePinnedMatches } from "@/src/preferences/use-pinned-matches";
import { splitPinnedMatches } from "@/src/preferences/pinned-matches";
import {
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import {
  colors,
  iconSizes,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  isStarDecisionFilter,
  starMetricLabel
} from "@/src/utils/decision-filters";
import {
  matchLiveTab,
  resolveLiveMatchTab,
  type LiveMatchTab
} from "@/src/utils/live-match-tabs";
import { groupMatchesByKickoff } from "@/src/utils/match-groups";
import { normalizeSearchText, searchTextScore } from "@/src/utils/search";
import { liveEmptyKind, type LiveEmptyKind } from "@/src/utils/live-list-state";
import { canRefreshScreenQuery } from "@/src/web/refresh-data";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { formatTodayEyebrow } from "@/src/utils/format";

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function routeTab(
  scopeValue: string | string[] | undefined,
  legacyFilter: string | string[] | undefined,
  decisionValue: string | string[] | undefined
): LiveMatchTab {
  const scope = firstParam(scopeValue);
  const legacy = firstParam(legacyFilter);
  return resolveLiveMatchTab(
    scope,
    legacy,
    isStarDecisionFilter(firstParam(decisionValue))
  );
}

const localTabs = ["LIVE", "FIXTURE", "STAR"] as const;

/**
 * The single compact Canlı / Tümü segment. The second half lists the upcoming
 * fixtures under the v40 board's "Tümü" label (owner decision 2026-10-21,
 * replacing NXT-OBS-123's "Fikstür"); the count line under the search field
 * still says how many it holds.
 */
function LiveSwitch({
  tab,
  fixtureCount,
  liveCount,
  onChange
}: {
  /** The star view selects neither half; the star chip shows it instead. */
  tab: LiveMatchTab;
  fixtureCount: number | null;
  liveCount: number | null;
  onChange: (active: boolean) => void;
}) {
  const segments = [
    { live: true, label: "Canlı", count: liveCount as number | null },
    { live: false, label: "Tümü", count: null }
  ];
  return (
    <View accessibilityRole="tablist" style={styles.liveSwitch}>
      {segments.map((segment) => {
        const selected = segment.live ? tab === "LIVE" : tab === "FIXTURE";
        return (
          <Pressable
            accessibilityLabel={`${segment.label}, ${(segment.live ? liveCount : fixtureCount) === null ? "maç sayısı henüz doğrulanmadı" : `${segment.live ? liveCount : fixtureCount} maç`}`}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={segment.label}
            onPress={() => {
              if (!selected) {
                onChange(segment.live);
              }
            }}
            style={({ pressed }) => [
              styles.liveSegment,
              selected && (segment.live ? styles.liveSegmentLive : styles.liveSegmentSelected),
              pressed && styles.segmentPressed
            ]}
          >
            {segment.live ? <View style={[styles.segmentDot, !selected && styles.segmentDotIdle]} /> : null}
            <Text style={[styles.liveSwitchLabel, selected && (segment.live ? styles.liveSwitchLabelActive : styles.liveSwitchLabelSelected)]}>
              {segment.live ? `${segment.label} · ${segment.count ?? "—"}` : segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LiveListEmpty({ kind, filterLabel, hasLiveMatches, hasFixtures, onClear, onLive, onFixture, onRetry }: {
  kind: LiveEmptyKind;
  filterLabel: string;
  hasLiveMatches: boolean;
  hasFixtures: boolean;
  onClear: () => void;
  onLive: () => void;
  onFixture: () => void;
  onRetry: () => void;
}) {
  if (kind === "LOADING") return <LoadingState label="Seçim kayıtları yükleniyor" />;
  const content = {
    SEARCH: { title: "Bu kapsamda eşleşme yok", message: "Takım veya lig adını kontrol edebilir, aramayı temizleyebilir ya da üstten başka bir kapsam seçebilirsin.", action: "Aramayı temizle", onPress: onClear },
    UNAVAILABLE: { title: "Seçimler doğrulanamıyor", message: "Seçim kayıtları alınamadığı için aktif seçim sayısı bilinmiyor. Canlı maçları ayrı olarak inceleyebilirsin.", action: "Tekrar dene", onPress: onRetry },
    NO_SELECTION: { title: `${filterLabel} için aktif seçim yok`, message: hasLiveMatches
      ? "Bu yıldız eşiğinde, güncel oranı bulunan bir BTB seçimi yok. Tüm canlı maçları izlemeye devam edebilirsin."
      : "Bu yıldız eşiğinde aktif seçim yok. Şu anda devam eden canlı maç da bulunmuyor.",
      action: hasLiveMatches ? "Tüm canlı maçları gör" : hasFixtures ? "Fikstürü gör" : "Yenile", onPress: hasLiveMatches ? onLive : hasFixtures ? onFixture : onRetry },
    NO_FIXTURE: { title: "Fikstürde maç yok", message: hasLiveMatches
      ? "Bu kapsam, yaklaşan ve oynanmayacağı bildirilen maçları gösterir. Devam eden maçlar Canlı bölümündedir."
      : "Yaklaşan veya oynanmayacağı bildirilen bir maç bulunmuyor. Liste otomatik yenilenir; şimdi yeniden kontrol edebilirsin.",
      action: hasLiveMatches ? "Canlı maçlara geç" : "Yenile", onPress: hasLiveMatches ? onLive : onRetry },
    NO_LIVE: { title: "Şu anda canlı maç yok", message: hasFixtures
      ? "Yeni maçlar başladığında burada görünecek. Sıradaki maçları fikstürden inceleyebilirsin."
      : "Yeni maçlar başladığında burada görünecek. Liste otomatik yenilenir; şimdi yeniden kontrol edebilirsin.",
      action: hasFixtures ? "Fikstürü gör" : "Yenile", onPress: hasFixtures ? onFixture : onRetry }
  }[kind];
  return <View accessibilityLiveRegion="polite" style={styles.emptyCard}>
    <SurfaceMaterial radius={18} />
    <MaterialCommunityIcons accessible={false} color={kind === "UNAVAILABLE" ? semantic.warning : colors.blue}
      name={kind === "SEARCH" ? "magnify" : kind === "UNAVAILABLE" ? "cloud-alert-outline" : "soccer-field"} size={iconSizes.control} />
    <Text accessibilityRole="header" aria-level={2} style={styles.emptyTitle}>{content.title}</Text>
    <Text style={styles.emptyMessage}>{content.message}</Text>
    <View style={styles.emptyActions}>
      <Pressable accessibilityRole="button" accessibilityLabel={content.action} onPress={content.onPress}
        style={({ pressed }) => [styles.emptyAction, pressed && styles.segmentPressed]}>
        <Text style={styles.emptyActionText}>{content.action}</Text>
        <MaterialCommunityIcons accessible={false} color={colors.blue} name={kind === "UNAVAILABLE" ? "refresh" : "arrow-right"} size={iconSizes.inline} />
      </Pressable>
      {kind === "UNAVAILABLE" && (hasLiveMatches || hasFixtures) ? <Pressable accessibilityRole="button" onPress={hasLiveMatches ? onLive : onFixture} style={styles.emptySecondaryAction}>
        <Text style={styles.emptyActionText}>{hasLiveMatches ? "Tüm canlı maçları gör" : "Fikstürü gör"}</Text>
      </Pressable> : null}
    </View>
  </View>;
}

export default function LiveScreen() {
  const clock = useRebuildClock();
  const params = useLocalSearchParams<{
    filter?: string | string[];
    scope?: string | string[];
    decision?: string | string[];
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const refreshRunning = useRef(false);
  const refresh = useCallback(async () => {
    if (refreshRunning.current) return;
    refreshRunning.current = true;
    setRefreshing(true);
    setRefreshFailed(false);
    try {
      await queryClient.refetchQueries({type:"active",predicate:item=>canRefreshScreenQuery(item.queryKey)}, {throwOnError:true});
    } catch {
      setRefreshFailed(true);
    } finally {
      refreshRunning.current = false;
      setRefreshing(false);
    }
  }, [queryClient]);
  const { filter: persistedStarFilter, setFilter: setPersistedStarFilter } =
    useLiveStarFilter();
  const routeStarFilter = firstParam(params.decision);
  const starFilter = isStarDecisionFilter(routeStarFilter)
    ? routeStarFilter
    : persistedStarFilter;
  const tab = routeTab(params.scope, params.filter, params.decision);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const cardGrid = useCardGrid();
  // Desktop (≥1200 px, platform exception): the list and the selected match's
  // full detail side by side; the list then keeps a single column.
  const breakpoint = useBreakpoint();
  const splitLayout = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const grid: CardGrid = splitLayout ? singleColumnGrid : cardGrid;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const hasSearch = normalizeSearchText(search).length > 0;
  const query = useQuery(matchesQuery);
  // A newly received quote can postdate the previous one-second clock tick.
  // Use its actual client receipt time, never treating a future quote as fresh.
  const now = Math.max(clock,query.dataUpdatedAt);
  const publications = usePublishedSelections(query.data);
  const countsKnown = query.data !== undefined && !query.isError;
  const insightsQuery = useQuery(matchInsightsQuery);
  const pinnedEligibleKeys = useMemo(
    () => (query.data ?? []).map((match) => match.key),
    [query.data]
  );
  const {
    hydrated: pinnedHydrated,
    keys: pinnedKeys,
    toggle: togglePinned
  } = usePinnedMatches(pinnedEligibleKeys, query.isSuccess);

  useEffect(() => {
    if (
      tab === "STAR" &&
      isStarDecisionFilter(routeStarFilter) &&
      routeStarFilter !== persistedStarFilter
    ) {
      setPersistedStarFilter(routeStarFilter);
    }
  }, [
    persistedStarFilter,
    routeStarFilter,
    setPersistedStarFilter,
    tab
  ]);

  const tabCounts = useMemo(() => {
    const source = query.data ?? [];
    return {
      LIVE: source.filter((match) => matchLiveTab(match, "LIVE", starFilter, now)).length,
      FIXTURE: source.filter((match) =>
        matchLiveTab(match, "FIXTURE", starFilter, now)
      ).length,
      STAR: source.filter((match) => matchLiveTab(match, "STAR", starFilter, now, publications.records, publications.unavailable)).length
    };
  }, [query.data, starFilter, now, publications.records, publications.unavailable]);
  const sectionsByTab = useMemo(() => {
    const source = query.data ?? [];
    return localTabs.reduce(
      (result, pageTab) => {
        const needle = normalizeSearchText(search);
        const pageMatches = source.filter(match => matchLiveTab(match, pageTab, starFilter, now, publications.records, publications.unavailable));
        if (needle) {
          const found = pageMatches.map((match, index) => ({ match, index,
            score: searchTextScore(`${match.homeTeam} ${match.awayTeam} ${match.league}`, needle) }))
            .filter(item => item.score !== null).sort((a, b) => a.score! - b.score! || a.index - b.index);
          result[pageTab] = found.length ? [{ key: `search-${pageTab}`, title: "Arama sonuçları", data: found.map(item => item.match) }] : [];
          return result;
        }
        const split = splitPinnedMatches(pageMatches, pinnedKeys);
        result[pageTab] = [
          ...(split.pinned.length
            ? [{ key: `pinned-${pageTab}`, title: "Sabitlenenler", data: split.pinned }]
            : []),
          ...groupMatchesByKickoff(split.regular)
        ];
        return result;
      },
      {} as Record<
        LiveMatchTab,
        ReturnType<typeof groupMatchesByKickoff>
      >
    );
  }, [pinnedKeys, query.data, starFilter, search, now, publications.records, publications.unavailable]);
  const insightMap = useMemo(
    () =>
      new Map(
        (insightsQuery.data ?? []).map((insight) => [insight.key, insight])
      ),
    [insightsQuery.data]
  );
  // The pane follows the user's pick while it is still in the active tab, and
  // otherwise shows the tab's first match, so it is never empty or stale.
  const paneKey = useMemo(() => {
    const keys = (sectionsByTab[tab] ?? []).flatMap((section) => section.data.map((match) => match.key));
    return selectedKey && keys.includes(selectedKey) ? selectedKey : keys[0] ?? null;
  }, [sectionsByTab, selectedKey, tab]);
  const detailExpanded = splitLayout && Boolean(paneKey) && expandedKey === paneKey;
  const showSplit = splitLayout && paneKey !== null;
  const visibleCount = (sectionsByTab[tab] ?? []).reduce((count, section) => count + section.data.length, 0);
  const changeTab = (nextTab: LiveMatchTab) => {
    setDecisionOpen(false);
    router.setParams({scope:nextTab,decision:nextTab === "STAR" ? starFilter : undefined,filter:undefined});
  };

  useEffect(() => {
    if (Platform.OS !== "web" || !detailExpanded) return;
    const restore = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedKey(null);
    };
    window.addEventListener("keydown", restore);
    return () => window.removeEventListener("keydown", restore);
  }, [detailExpanded]);

  return (
    <Screen
      // No trace under the title: the v40 board keeps live-ness on the cards'
      // own edge bars and the tab badge.
      brand
      contentStyle={styles.screen}
      eyebrow={formatTodayEyebrow()}
      scroll={false}
      title="Canlı maçlar"
      wide
    >
      {/* Phone: filters, search and count stack; desktop (v40 W-Canlı) keeps
          them on one toolbar row above the list and the detail pane. */}
      <View style={splitLayout ? styles.toolbarWide : undefined}>
      <TutorialTarget
        id="live-filters"
        radius={radii.round}
        style={splitLayout ? styles.filterTargetWide : styles.filterTarget}
      >
        <View style={styles.filters}>
          <LiveSwitch
            tab={tab}
            fixtureCount={countsKnown ? tabCounts.FIXTURE : null}
            liveCount={countsKnown ? tabCounts.LIVE : null}
            onChange={(enabled) => {
              setDecisionOpen(false);
              router.setParams({
                scope: enabled ? "LIVE" : "FIXTURE",
                decision: undefined,
                filter: undefined
              });
            }}
          />
          <DecisionFilterChip
            active={tab === "STAR"}
            {...(countsKnown && !publications.pending && !publications.unavailable ? {count:tabCounts.STAR} : {})}
            onActivate={() =>
              router.setParams({ scope: "STAR", decision: starFilter })
            }
            onChange={(value) => {
              setPersistedStarFilter(value);
              router.setParams({ scope: "STAR", decision: value });
            }}
            onOpenChange={setDecisionOpen}
            open={decisionOpen}
            value={starFilter}
          />
        </View>
      </TutorialTarget>

      <View style={[styles.searchRow, splitLayout && styles.searchRowWide]}>
        <View style={styles.searchField}>
          <MaterialCommunityIcons color={colors.textMuted} name="magnify" size={iconSizes.inline} />
          <TextInput accessibilityLabel="Takım veya lig ara" accessibilityHint={Platform.OS === "web" ? "Yalnız seçili kapsamın maçlarında arar. Escape aramayı temizler." : "Yalnız seçili kapsamın maçlarında arar."} placeholder="Takım veya lig ara"
            placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch}
            onKeyPress={event => { if (event.nativeEvent.key === "Escape" && search) { event.stopPropagation(); setSearch(""); } }}
            autoCorrect={false} autoCapitalize="none" style={styles.search} />
          {search ? <Pressable accessibilityRole="button" accessibilityLabel="Maç aramasını temizle" onPress={() => setSearch("")} style={styles.clearSearch}>
            <MaterialCommunityIcons accessible={false} color={colors.blue} name="close" size={iconSizes.inline} />
          </Pressable> : null}
        </View>
      </View>
      {query.data ? <Text accessibilityLiveRegion="polite" style={[styles.resultCount, splitLayout && styles.resultCountWide]}>
        {!countsKnown ? "Maç listesi doğrulanamıyor" : tab === "STAR" && publications.pending ? "Seçim kayıtları yükleniyor…" : tab === "STAR" && publications.unavailable ? "Seçim kayıtları doğrulanamıyor" :
          `${tab === "STAR" ? starMetricLabel(starFilter) : tab === "FIXTURE" ? "Fikstür" : "Canlı"} · ${hasSearch ? `${visibleCount} / ${tabCounts[tab]} eşleşme` : `${tabCounts[tab]} maç`}`}
      </Text> : null}
      </View>

      {refreshFailed && !query.isError ? <Text accessibilityRole="alert" style={styles.refreshNote}>Bazı veriler yenilenemedi. Son alınan bilgiler gösteriliyor.</Text> : null}

      {query.isLoading ? (
        <LoadingState label="Canlı maçlar hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          message={
            query.error instanceof Error
              ? query.error.message
              : "Maçlar alınamadı."
          }
          onRetry={() => void refresh()}
        />
      ) : (
        <View style={showSplit ? styles.split : styles.single}>
        <View style={[showSplit ? styles.splitList : styles.single, detailExpanded && styles.hiddenList]}>
        <LocalTabPager
          activeKey={tab}
          onSelect={(nextTab) => {
            setDecisionOpen(false);
            router.setParams({
              scope: nextTab,
              decision: nextTab === "STAR" ? starFilter : undefined,
              filter: undefined
            });
          }}
          renderPage={(pageTab) => (
            <FlatList
              // Desktop lays the kickoff sections side by side; numColumns
              // cannot change on a mounted list, so a new grid remounts it.
              key={`${pageTab}-${grid.columns}`}
              contentContainerStyle={styles.list}
              data={sectionsByTab[pageTab]}
              initialNumToRender={4}
              keyExtractor={(section) => section.key}
              numColumns={grid.columns}
              {...(grid.rowStyle ? { columnWrapperStyle: grid.rowStyle } : {})}
              ListEmptyComponent={
                <LiveListEmpty kind={liveEmptyKind(pageTab,hasSearch,publications.pending,publications.unavailable)}
                  filterLabel={starMetricLabel(starFilter)}
                  hasLiveMatches={tabCounts.LIVE > 0}
                  hasFixtures={tabCounts.FIXTURE > 0}
                  onClear={() => setSearch("")}
                  onLive={() => changeTab("LIVE")}
                  onFixture={() => changeTab("FIXTURE")}
                  onRetry={() => { void refresh(); }}
                />
              }
              ListFooterComponent={
                (sectionsByTab[pageTab] ?? []).length ? (
                  // The v40 board closes the list and says how to refresh it.
                  <View accessibilityRole="text" style={styles.listEnd}>
                    <View style={styles.listEndLine} />
                    <Text style={styles.listEndText}>{Platform.OS === "web" ? "Liste sonu" : "Liste sonu · aşağı çek, yenile"}</Text>
                    <View style={styles.listEndLine} />
                  </View>
                ) : null
              }
              maxToRenderPerBatch={4}
              onScrollBeginDrag={() => setDecisionOpen(false)}
              onTouchStart={() => {
                if (decisionOpen) {
                  setDecisionOpen(false);
                }
              }}
              refreshControl={
                <RefreshControl
                  colors={[semantic.live]}
                  onRefresh={() => void refresh()}
                  refreshing={refreshing}
                  tintColor={semantic.live}
                />
              }
              renderItem={({ item: section, index: sectionIndex }) => (
                <View style={[styles.group, grid.cellStyle]}>
                  {/* Every card carries its own kickoff now, so only the
                      groupings a card cannot express keep a heading. */}
                  {section.key.startsWith("pinned-") || section.key.startsWith("search-") ? (
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  ) : null}
                  {section.data.map((match, matchIndex) =>
                    pageTab === tab &&
                    sectionIndex === 0 &&
                    matchIndex === 0 ? (
                      <TutorialTarget id="live-first-card" key={match.key}>
                        <MatchCard
                          clock={now}
                          compact={splitLayout}
                          dense={splitLayout}
                          insight={insightMap.get(match.key)}
                          match={match}
                          onSelect={splitLayout ? () => setSelectedKey(match.key) : undefined}
                          onTogglePinned={
                            pinnedHydrated
                              ? () => togglePinned(match.key)
                              : undefined
                          }
                          pinned={pinnedKeys.has(match.key)}
                          selected={splitLayout && match.key === paneKey}
                        />
                      </TutorialTarget>
                    ) : (
                      <MatchCard
                        clock={now}
                        compact={splitLayout}
                          dense={splitLayout}
                        insight={insightMap.get(match.key)}
                        key={match.key}
                        match={match}
                        onSelect={splitLayout ? () => setSelectedKey(match.key) : undefined}
                        onTogglePinned={
                          pinnedHydrated
                            ? () => togglePinned(match.key)
                            : undefined
                        }
                        pinned={pinnedKeys.has(match.key)}
                        selected={splitLayout && match.key === paneKey}
                      />
                    )
                  )}
                </View>
              )}
              showsVerticalScrollIndicator={false}
              windowSize={7}
            />
          )}
          tabs={localTabs}
        />
        </View>
        {showSplit ? (
          <View style={[styles.splitDetail, detailExpanded && styles.expandedDetail]}>
            {paneKey ? <View style={styles.detailActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={detailExpanded ? "Maç detayını küçült, maç listesine dön" : "Maç detayını büyüt"}
                accessibilityState={{ expanded: detailExpanded }} onPress={() => setExpandedKey(detailExpanded ? null : paneKey)}
                style={({ pressed }) => [styles.expandAction, pressed && styles.segmentPressed]}>
                <MaterialCommunityIcons name={detailExpanded ? "arrow-collapse" : "arrow-expand"} size={20} color={colors.blue} />
                <Text style={styles.expandText}>{detailExpanded ? "Küçült · listeye dön" : "Detayı büyüt"}</Text>
              </Pressable>
            </View> : null}
            <MatchDetailView embedded expanded={detailExpanded} key={paneKey} matchKey={paneKey!} />
          </View>
        ) : null}
        </View>
      )}
    </Screen>
  );
}

const singleColumnGrid: CardGrid = {
  columns: 1,
  rowStyle: undefined,
  cellStyle: undefined,
  wrapStyle: undefined
};

const styles = StyleSheet.create({
  emptyCard: { alignSelf: "center", width: "100%", maxWidth: 680, gap: spacing.md, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 18 },
  emptyTitle: { ...typeScale.decision, color: colors.text },
  emptyMessage: { ...typeScale.bodyCompact, color: colors.textMuted },
  emptyActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  emptyAction: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing.sm,
    paddingHorizontal: spacing.md, backgroundColor: colors.blueSoft, borderRadius: radii.round },
  emptyActionText: { ...typeScale.bodyCompact, color: colors.blue, fontWeight: "700" },
  emptySecondaryAction: { minHeight: interaction.minTouchTarget, paddingHorizontal: spacing.sm, justifyContent: "center" },
  refreshNote: { ...typeScale.bodyCompact, color: semantic.warning, marginBottom: spacing.md },
  hiddenList: { display: "none" },
  expandedDetail: { borderLeftWidth: 0 },
  detailActions: { alignItems: "flex-end", paddingBottom: spacing.sm },
  expandAction: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  expandText: { ...typeScale.label, color: colors.blue },
  searchRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center", marginBottom: spacing.sm },
  searchField: { flex: 1, minWidth: 0, minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.backgroundElevated,
    paddingLeft: 14 },
  search: { flex: 1, minWidth: 0, minHeight: 46, color: colors.text, ...typeScale.body, paddingRight: spacing.md },
  clearSearch: { width: interaction.minTouchTarget, minHeight: interaction.minTouchTarget, justifyContent: "center", alignItems: "center", borderRadius: radii.round },
  resultCount: { ...typeScale.meta, color: colors.textMuted, marginBottom: spacing.md },
  toolbarWide: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg, zIndex: 10 },
  filterTargetWide: { marginBottom: 0 },
  searchRowWide: { flex: 1, marginBottom: 0 },
  resultCountWide: { marginBottom: 0, width: 180, flexShrink: 0, textAlign: "right" },
  listEnd: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.lg },
  listEndLine: { flex: 1, height: 1, backgroundColor: colors.border },
  listEndText: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  screen: {
    paddingBottom: 0
  },
  single: {
    flex: 1
  },
  split: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.xl
  },
  splitList: {
    flexBasis: 420,
    flexGrow: 0,
    flexShrink: 0
  },
  splitDetail: {
    borderLeftColor: colors.borderSoft,
    borderLeftWidth: 1,
    flex: 1,
    minWidth: 0
  },
  filters: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  liveSwitch: {
    alignItems: "center",
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: "row",
    padding: 3
  },
  liveSegment: {
    alignItems: "center",
    borderRadius: radii.round,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: interaction.minTouchTarget - 2,
    minWidth: 96,
    paddingHorizontal: spacing.lg
  },
  liveSegmentLive: {
    backgroundColor: semantic.liveSoft
  },
  liveSegmentSelected: {
    backgroundColor: colors.surfaceStrong
  },
  segmentPressed: {
    opacity: 0.72
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: semantic.live
  },
  segmentDotIdle: {
    backgroundColor: colors.textSubtle
  },
  liveSwitchLabel: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    fontWeight: "700"
  },
  liveSwitchLabelActive: {
    color: semantic.live
  },
  liveSwitchLabelSelected: {
    color: colors.text
  },
  filterTarget: {
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: 112
  },
  group: {
    marginBottom: spacing.xs
  },
  sectionTitle: {
    color: colors.textMuted,
    ...typeScale.eyebrow,
    marginBottom: spacing.sm,
    marginTop: spacing.xs
  }
});
