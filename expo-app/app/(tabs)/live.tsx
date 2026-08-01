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
import { matchesQuery } from "@/src/api/queries";
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
import { colors, radii, spacing } from "@/src/theme/theme";
import {
  isStarDecisionFilter
} from "@/src/utils/decision-filters";
import {
  matchLiveTab,
  type LiveMatchTab
} from "@/src/utils/live-match-tabs";
import { groupMatchesByKickoff } from "@/src/utils/match-groups";

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
  if (["LIVE", "SELECTED", "ALL", "STAR"].includes(scope)) {
    return scope as LiveMatchTab;
  }
  if (legacy === "SELECTED") {
    return "SELECTED";
  }
  if (legacy === "ALL") {
    return "ALL";
  }
  if (
    legacy === "HIGH_STAR" ||
    isStarDecisionFilter(firstParam(decisionValue))
  ) {
    return "STAR";
  }
  return "LIVE";
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
  const sections = useMemo(() => groupMatchesByKickoff(matches), [matches]);

  return (
    <Screen
      contentStyle={styles.screen}
      eyebrow="BTB"
      scroll={false}
      title="Canlı maçlar"
    >
      <View style={styles.filters}>
        <FilterChip
          label="Canlı"
          onPress={() => {
            setDecisionOpen(false);
            router.setParams({ scope: "LIVE", filter: undefined });
          }}
          selected={tab === "LIVE"}
        />
        <FilterChip
          label="Seçili"
          onPress={() => {
            setDecisionOpen(false);
            router.setParams({ scope: "SELECTED", filter: undefined });
          }}
          selected={tab === "SELECTED"}
        />
        <FilterChip
          label="Tümü"
          onPress={() => {
            setDecisionOpen(false);
            router.setParams({ scope: "ALL", filter: undefined });
          }}
          selected={tab === "ALL"}
        />
        <DecisionFilterChip
          active={tab === "STAR"}
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

      {query.isLoading ? (
        <LoadingState label="Maç havuzu hazırlanıyor" />
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
              message="Bu filtreye uyan bir maç bulunmuyor."
              title="Maç yok"
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
              colors={[colors.green]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.green}
            />
          }
          renderItem={({ item: section }) => (
            <View style={styles.group}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.data.map((match) => (
                <MatchCard key={match.key} match={match} />
              ))}
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
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: 112
  },
  group: {
    borderColor: `${colors.green}40`,
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
    marginTop: spacing.xs
  }
});
