import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
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
  const [filter, setFilter] = useState<SuperFilter>("ALL");
  const query = useQuery(superLogsQuery);
  const logs = useMemo(
    () => (query.data ?? []).filter((log) => superFilter(log, filter)),
    [filter, query.data]
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
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: 112
  }
});
