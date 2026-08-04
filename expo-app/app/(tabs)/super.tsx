import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { superLogsQuery } from "@/src/api/queries";
import { FilterChip } from "@/src/components/FilterChip";
import { DecisionFilterChip } from "@/src/components/DecisionFilterChip";
import { Screen } from "@/src/components/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import { SuperLogCard } from "@/src/components/SuperLogCard";
import { colors, spacing } from "@/src/theme/theme";
import {
  formatFixtureDateTime,
  formatSuperDateScope,
  matchDateFromKey
} from "@/src/utils/format";
import { getSuperDayScopeAction } from "@/src/utils/super-day-scope";
import {
  useSuperStarFilter
} from "@/src/preferences/SuperStarFilterProvider";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import {
  matchSuperLogTab,
  type SuperLogTab
} from "@/src/utils/super-log-tabs";

export default function SuperScreen() {
  const params = useLocalSearchParams<{
    scope?: string | string[];
  }>();
  const router = useRouter();
  const rawScope = Array.isArray(params.scope)
    ? params.scope[0]
    : params.scope;
  const latestDayOnly = rawScope === "LATEST_DAY";
  const dayScopeAction = getSuperDayScopeAction(latestDayOnly);
  const [tab, setTab] = useState<SuperLogTab>("ALL");
  const { filter: starFilter, setFilter: setStarFilter } =
    useSuperStarFilter();
  const [decisionOpen, setDecisionOpen] = useState(false);
  const query = useQuery(superLogsQuery);
  const latestMatchDate = useMemo(
    () =>
      (query.data ?? [])
        .map((log) => matchDateFromKey(log.matchKey))
        .filter(Boolean)
        .sort()
        .at(-1) ?? "",
    [query.data]
  );
  const scopedLogs = useMemo(
    () =>
      latestDayOnly && latestMatchDate
        ? (query.data ?? []).filter(
            (log) => matchDateFromKey(log.matchKey) === latestMatchDate
          )
        : query.data ?? [],
    [latestDayOnly, latestMatchDate, query.data]
  );
  const logs = useMemo(
    () =>
      scopedLogs.filter(
        (log) => matchSuperLogTab(log, tab, starFilter)
      ),
    [scopedLogs, starFilter, tab]
  );
  const tabCounts = useMemo(
    () => ({
      ALL: scopedLogs.filter((log) => matchSuperLogTab(log, "ALL", starFilter)).length,
      OPEN: scopedLogs.filter((log) => matchSuperLogTab(log, "OPEN", starFilter)).length,
      STAR: scopedLogs.filter((log) => matchSuperLogTab(log, "STAR", starFilter)).length
    }),
    [scopedLogs, starFilter]
  );
  const dateScope = useMemo(
    () =>
      latestDayOnly && latestMatchDate
        ? `${formatFixtureDateTime(latestMatchDate, "12:00").split(" · ")[0]} · son gün · ${scopedLogs.length} karar`
        : formatSuperDateScope(scopedLogs.map((log) => log.createdAt)),
    [latestDayOnly, latestMatchDate, scopedLogs]
  );

  return (
    <Screen
      contentStyle={styles.screen}
      eyebrow="BTB SUPER"
      scroll={false}
      title="Karar günlüğü"
    >
      <View style={styles.filters}>
        <FilterChip
          count={tabCounts.ALL}
          label="Tümü"
          onPress={() => {
            setDecisionOpen(false);
            setTab("ALL");
          }}
          selected={tab === "ALL"}
        />
        <FilterChip
          count={tabCounts.OPEN}
          label="Açık"
          onPress={() => {
            setDecisionOpen(false);
            setTab("OPEN");
          }}
          selected={tab === "OPEN"}
        />
        <DecisionFilterChip
          active={tab === "STAR"}
          count={tabCounts.STAR}
          onActivate={() => setTab("STAR")}
          onChange={(value) => {
            setStarFilter(value);
            setTab("STAR");
            refreshPerformanceWidgetFromApi(value).catch(
              (error: unknown) => {
                console.warn(
                  "Super tercihi widgeta uygulanamadı.",
                  error
                );
              }
            );
          }}
          onOpenChange={setDecisionOpen}
          open={decisionOpen}
          value={starFilter}
        />
      </View>
      <View style={styles.scopeRow}>
        {dateScope ? <Text style={styles.scope}>{dateScope}</Text> : null}
        <Pressable
          accessibilityLabel={`${dayScopeAction.label} kapsamına geç`}
          accessibilityRole="button"
          accessibilityState={{ disabled: query.isRefetching }}
          disabled={query.isRefetching}
          hitSlop={6}
          onPress={() => {
            setDecisionOpen(false);
            router.replace(
              dayScopeAction.nextScope
                ? ({
                    pathname: "/super",
                    params: { scope: dayScopeAction.nextScope }
                  } as never)
                : ("/super" as never)
            );
          }}
          style={({ pressed }) => [
            styles.dayScopeButton,
            pressed && styles.dayScopeButtonPressed,
            query.isRefetching && styles.dayScopeButtonDisabled
          ]}
        >
          <Text style={styles.dayScopeAction}>
            {dayScopeAction.label}
          </Text>
        </Pressable>
      </View>

      {query.isLoading ? (
        <LoadingState label="Super kararları hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Super Log alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={logs}
          initialNumToRender={10}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={
            <EmptyState
              message="Bu görünüm için bir Super kararı bulunmuyor."
              title="Karar yok"
            />
          }
          refreshControl={
            <RefreshControl
              colors={[colors.gold]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.gold}
            />
          }
          onScrollBeginDrag={() => setDecisionOpen(false)}
          onTouchStart={() => {
            if (decisionOpen) {
              setDecisionOpen(false);
            }
          }}
          renderItem={({ item }) => <SuperLogCard log={item} />}
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
    marginBottom: spacing.sm
  },
  scope: {
    flex: 1,
    color: colors.textSubtle,
    fontSize: 10
  },
  scopeRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  dayScopeAction: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "900"
  },
  dayScopeButton: {
    minHeight: 44,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md
  },
  dayScopeButtonPressed: {
    opacity: 0.68
  },
  dayScopeButtonDisabled: {
    opacity: 0.5
  },
  list: {
    paddingBottom: 112
  }
});
