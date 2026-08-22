import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  RefreshControl,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { matchInsightsQuery, matchesQuery } from "@/src/api/queries";
import { FilterChip } from "@/src/components/FilterChip";
import { DecisionFilterChip } from "@/src/components/DecisionFilterChip";
import { MatchCard } from "@/src/components/MatchCard";
import { Screen } from "@/src/components/Screen";
import { useLiveStarFilter } from "@/src/preferences/LiveStarFilterProvider";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import {
  colors,
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
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import {
  adjacentLocalTab,
  type TabSwipeDirection
} from "@/src/navigation/tab-swipe";

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

const localTabs = ["LIVE", "FIXTURE"] as const;

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
  const query = useQuery(matchesQuery);
  const insightsQuery = useQuery(matchInsightsQuery);

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

  const matches = useMemo(
    () =>
      (query.data ?? []).filter((match) =>
        matchLiveTab(match, tab, starFilter)
      ),
    [query.data, starFilter, tab]
  );
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
  const sections = useMemo(() => groupMatchesByKickoff(matches), [matches]);
  const localTabSwipe = useMemo(() => {
    const previous = adjacentLocalTab(tab, localTabs, "PREVIOUS");
    const next = adjacentLocalTab(tab, localTabs, "NEXT");
    return {
      hasNext: next !== null,
      hasPrevious: previous !== null,
      onNavigate: (direction: TabSwipeDirection) => {
        const target = adjacentLocalTab(tab, localTabs, direction);
        if (!target) {
          return;
        }
        setDecisionOpen(false);
        router.setParams({ scope: target, filter: undefined });
      }
    };
  }, [router, tab]);
  const insightMap = useMemo(
    () =>
      new Map(
        (insightsQuery.data ?? []).map((insight) => [insight.key, insight])
      ),
    [insightsQuery.data]
  );

  return (
    <Screen
      // The shell reports live-ness only while something is actually live, so
      // the trace is evidence rather than theming.
      {...(tabCounts.LIVE > 0 ? { accent: semantic.live } : {})}
      contentStyle={styles.screen}
      eyebrow="BTB"
      localTabSwipe={localTabSwipe}
      scroll={false}
      tabSwipe
      title="Canlı maçlar"
    >
      <TutorialTarget
        id="live-filters"
        radius={radii.round}
        style={styles.filterTarget}
      >
        <View style={styles.filters}>
        <FilterChip
          count={tabCounts.LIVE}
          label="Canlı"
          onPress={() => {
            setDecisionOpen(false);
            router.setParams({ scope: "LIVE", filter: undefined });
          }}
          selected={tab === "LIVE"}
        />
        <FilterChip
          count={tabCounts.FIXTURE}
          label="Fikstür"
          onPress={() => {
            setDecisionOpen(false);
            router.setParams({ scope: "FIXTURE", filter: undefined });
          }}
          selected={tab === "FIXTURE"}
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
        <FlatList
          contentContainerStyle={styles.list}
          data={sections}
          initialNumToRender={4}
          keyExtractor={(section) => section.key}
          ListEmptyComponent={
            <EmptyState
              kind="NO_LIVE_MATCH"
              message={
                tab === "FIXTURE"
                  ? "Yakında başlayacak planlı bir maç bulunmuyor."
                  : "Bu filtreye uyan bir maç bulunmuyor."
              }
              title={tab === "FIXTURE" ? "Yaklaşan maç yok" : "Maç yok"}
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
            <View style={styles.group}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((match, matchIndex) =>
                sectionIndex === 0 && matchIndex === 0 ? (
                  <TutorialTarget id="live-first-card" key={match.key}>
                    <MatchCard
                      insight={insightMap.get(match.key)}
                      match={match}
                    />
                  </TutorialTarget>
                ) : (
                  <MatchCard
                    insight={insightMap.get(match.key)}
                    key={match.key}
                    match={match}
                  />
                )
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          windowSize={7}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 0
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
