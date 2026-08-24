import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  RefreshControl,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { matchInsightsQuery, matchesQuery } from "@/src/api/queries";
import { DecisionFilterChip } from "@/src/components/DecisionFilterChip";
import { MatchCard } from "@/src/components/MatchCard";
import { LocalTabPager } from "@/src/components/LocalTabPager";
import { Screen } from "@/src/components/Screen";
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
  count,
  onChange
}: {
  active: boolean;
  count: number;
  onChange: (active: boolean) => void;
}) {
  return (
    <View style={[styles.liveSwitch, active && styles.liveSwitchActive]}>
      <View>
        <Text style={[styles.liveSwitchLabel, active && styles.liveSwitchLabelActive]}>
          Canlı
        </Text>
        <Text style={styles.liveSwitchCount}>{count} maç</Text>
      </View>
      <Switch
        accessibilityLabel={`Yalnız canlı maçlar, ${count} maç`}
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
        const pageMatches = source.filter((match) =>
          matchLiveTab(match, pageTab, starFilter)
        );
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
  }, [pinnedKeys, query.data, starFilter]);
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
          <LiveSwitch
            active={tab === "LIVE"}
            count={tabCounts.LIVE}
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
                          onTogglePinned={
                            pinnedHydrated
                              ? () => togglePinned(match.key)
                              : undefined
                          }
                          pinned={pinnedKeys.has(match.key)}
                        />
                      </TutorialTarget>
                    ) : (
                      <MatchCard
                        insight={insightMap.get(match.key)}
                        key={match.key}
                        match={match}
                        onTogglePinned={
                          pinnedHydrated
                            ? () => togglePinned(match.key)
                            : undefined
                        }
                        pinned={pinnedKeys.has(match.key)}
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
