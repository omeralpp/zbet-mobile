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
import { LocalTabPager } from "@/src/components/LocalTabPager";
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
        result[pageTab] = groupMatchesByKickoff(
          source.filter((match) => matchLiveTab(match, pageTab, starFilter))
        );
        return result;
      },
      {} as Record<
        LiveMatchTab,
        ReturnType<typeof groupMatchesByKickoff>
      >
    );
  }, [query.data, starFilter]);
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
      scroll={false}
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
              contentContainerStyle={styles.list}
              data={sectionsByTab[pageTab]}
              initialNumToRender={4}
              keyExtractor={(section) => section.key}
              ListEmptyComponent={
                <EmptyState
                  kind="NO_LIVE_MATCH"
                  message={
                    pageTab === "FIXTURE"
                      ? "Yakında başlayacak planlı bir maç bulunmuyor."
                      : "Bu filtreye uyan bir maç bulunmuyor."
                  }
                  title={
                    pageTab === "FIXTURE" ? "Yaklaşan maç yok" : "Maç yok"
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
                <View style={styles.group}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.map((match, matchIndex) =>
                    pageTab === tab &&
                    sectionIndex === 0 &&
                    matchIndex === 0 ? (
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
          tabs={localTabs}
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
