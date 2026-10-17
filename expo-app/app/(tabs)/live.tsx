import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  RefreshControl,
  FlatList,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { matchInsightsQuery, matchesQuery } from "@/src/api/queries";
import { DecisionFilterChip } from "@/src/components/DecisionFilterChip";
import { MatchCard } from "@/src/components/MatchCard";
import { LocalTabPager } from "@/src/components/LocalTabPager";
import { Screen } from "@/src/components/Screen";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { useCardGrid, type CardGrid } from "@/src/layout/use-card-grid";
import { MatchDetailView } from "@/src/screens/MatchDetailView";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import { usePinnedMatches } from "@/src/preferences/use-pinned-matches";
import { splitPinnedMatches } from "@/src/preferences/pinned-matches";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import {
  colors,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  isStarDecisionFilter
} from "@/src/utils/decision-filters";
import {
  matchLiveTab,
  resolveLiveMatchTab,
  type LiveMatchTab
} from "@/src/utils/live-match-tabs";
import { groupMatchesByKickoff } from "@/src/utils/match-groups";
import { normalizeSearchText, searchTextScore } from "@/src/utils/search";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";

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

function LiveSwitch({
  active,
  fixtureCount,
  liveCount,
  onChange
}: {
  active: boolean;
  fixtureCount: number;
  liveCount: number;
  onChange: (active: boolean) => void;
}) {
  // The chip names the scope the list is actually showing, not the control's
  // on-state: switched off the page is the fixture list, so it says so.
  const label = active ? "Canlı" : "Fikstür";
  const count = active ? liveCount : fixtureCount;
  return (
    <View style={[styles.liveSwitch, active && styles.liveSwitchActive]}>
      <View>
        <Text style={[styles.liveSwitchLabel, active && styles.liveSwitchLabelActive]}>
          {label}
        </Text>
        <Text style={styles.liveSwitchCount}>{count} maç</Text>
      </View>
      <Switch
        accessibilityLabel={`${label}, ${count} maç`}
        accessibilityRole="switch"
        accessibilityState={{ checked: active }}
        onValueChange={onChange}
        thumbColor={active ? colors.white : colors.textSubtle}
        trackColor={{ false: colors.borderSoft, true: semantic.live }}
        value={active}
      />
    </View>
  );
}

export default function LiveScreen() {
  const params = useLocalSearchParams<{
    filter?: string | string[];
    scope?: string | string[];
    decision?: string | string[];
  }>();
  const router = useRouter();
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
  const [search, setSearch] = useState("");
  const query = useQuery(matchesQuery);
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
      LIVE: source.filter((match) => matchLiveTab(match, "LIVE", starFilter)).length,
      FIXTURE: source.filter((match) =>
        matchLiveTab(match, "FIXTURE", starFilter)
      ).length,
      STAR: source.filter((match) => matchLiveTab(match, "STAR", starFilter)).length
    };
  }, [query.data, starFilter]);
  const sectionsByTab = useMemo(() => {
    const source = query.data ?? [];
    return localTabs.reduce(
      (result, pageTab) => {
        const needle = normalizeSearchText(search);
        const pageMatches = source.filter(match => matchLiveTab(match, pageTab, starFilter));
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
  }, [pinnedKeys, query.data, starFilter, search]);
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

  return (
    <Screen
      // The shell reports live-ness only while something is actually live, so
      // the trace is evidence rather than theming.
      {...(tabCounts.LIVE > 0 ? { accent: semantic.live } : {})}
      contentStyle={styles.screen}
      eyebrow="BTB"
      scroll={false}
      title="Canlı maçlar"
      wide
    >
      <TutorialTarget
        id="live-filters"
        radius={radii.round}
        style={styles.filterTarget}
      >
        <View style={styles.filters}>
          <LiveSwitch
            active={tab === "LIVE"}
            fixtureCount={tabCounts.FIXTURE}
            liveCount={tabCounts.LIVE}
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
            count={tabCounts.STAR}
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

      <TextInput accessibilityLabel="Takım veya lig ara" placeholder="Takım veya ligin bir bölümünü ara"
        placeholderTextColor={colors.textMuted} value={search} onChangeText={setSearch}
        autoCorrect={false} autoCapitalize="none" style={styles.search} />

      {query.isLoading ? (
        <LoadingState label="Canlı maçlar hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Maçlar alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      ) : (
        <View style={splitLayout ? styles.split : styles.single}>
        <View style={splitLayout ? styles.splitList : styles.single}>
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
                <EmptyState
                  kind="NO_LIVE_MATCH"
                  message={
                    pageTab === "FIXTURE"
                      ? "Yakında başlayacak planlı bir maç bulunmuyor."
                      : pageTab === "STAR" && !search ? "Seçilen yıldız filtresinde BTB seçimi yok. Canlı maçları izlemeye devam edebilirsin." : "Bu arama veya filtreye uyan bir maç bulunmuyor."
                  }
                  title={
                    pageTab === "FIXTURE"
                      ? "Yaklaşan maç yok"
                      : "Maç yok"
                  }
                />
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
                  onRefresh={() =>
                    Promise.all([query.refetch(), insightsQuery.refetch()])
                  }
                  refreshing={query.isRefetching || insightsQuery.isRefetching}
                  tintColor={semantic.live}
                />
              }
              renderItem={({ item: section, index: sectionIndex }) => (
                <View style={[styles.group, grid.cellStyle]}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.map((match, matchIndex) =>
                    pageTab === tab &&
                    sectionIndex === 0 &&
                    matchIndex === 0 ? (
                      <TutorialTarget id="live-first-card" key={match.key}>
                        <MatchCard
                          compact
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
                        compact
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
        {splitLayout ? (
          <View style={styles.splitDetail}>
            {paneKey ? (
              <MatchDetailView embedded key={paneKey} matchKey={paneKey} />
            ) : (
              <EmptyState
                kind="NO_LIVE_MATCH"
                message="Soldaki listeden bir maç seçildiğinde detayı burada açılır."
                title="Maç seçilmedi"
              />
            )}
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
  search: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    backgroundColor: colors.backgroundElevated, color: colors.text, fontSize: 14,
    paddingHorizontal: spacing.md, marginBottom: spacing.md },
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
    borderColor: colors.borderSoft,
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: interaction.minTouchTarget,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm
  },
  liveSwitchActive: {
    backgroundColor: semantic.liveSoft,
    borderColor: semantic.live
  },
  liveSwitchLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  liveSwitchLabelActive: {
    color: semantic.live
  },
  liveSwitchCount: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "900"
  },
  filterTarget: {
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: 112
  },
  group: {
    borderColor: colors.borderSoft,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  sectionTitle: {
    color: colors.textMuted,
    ...typeScale.meta,
    marginBottom: spacing.sm,
    marginTop: spacing.xs
  }
});
