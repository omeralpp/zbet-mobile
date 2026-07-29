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
import type { SuperLog } from "@/src/api/schemas";
import { superLogsQuery } from "@/src/api/queries";
import { FilterChip } from "@/src/components/FilterChip";
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

type SuperFilter = "ALL" | "OPEN" | "SETTLED" | "HIGH_STAR";

function superFilter(log: SuperLog, filter: SuperFilter): boolean {
  if (filter === "OPEN") {
    return log.result === "OPEN";
  }
  if (filter === "SETTLED") {
    return log.result === "WON" || log.result === "LOST";
  }
  if (filter === "HIGH_STAR") {
    return log.rating >= 3;
  }
  return true;
}

export default function SuperScreen() {
  const params = useLocalSearchParams<{
    scope?: string | string[];
  }>();
  const router = useRouter();
  const rawScope = Array.isArray(params.scope)
    ? params.scope[0]
    : params.scope;
  const latestDayOnly = rawScope === "LATEST_DAY";
  const [filter, setFilter] = useState<SuperFilter>("ALL");
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
    () => scopedLogs.filter((log) => superFilter(log, filter)),
    [filter, scopedLogs]
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
          label="Tümü"
          onPress={() => setFilter("ALL")}
          selected={filter === "ALL"}
        />
        <FilterChip
          label="Açık"
          onPress={() => setFilter("OPEN")}
          selected={filter === "OPEN"}
        />
        <FilterChip
          label="Sonuçlanan"
          onPress={() => setFilter("SETTLED")}
          selected={filter === "SETTLED"}
        />
        <FilterChip
          label="3+"
          onPress={() => setFilter("HIGH_STAR")}
          selected={filter === "HIGH_STAR"}
        />
      </View>
      <View style={styles.scopeRow}>
        {dateScope ? <Text style={styles.scope}>{dateScope}</Text> : null}
        {latestDayOnly ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/super" as never)}
          >
            <Text style={styles.allDays}>Tüm günler</Text>
          </Pressable>
        ) : null}
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
  allDays: {
    color: colors.blue,
    fontSize: 10,
    fontWeight: "900"
  },
  list: {
    paddingBottom: 112
  }
});
