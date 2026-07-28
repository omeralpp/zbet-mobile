import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";
import type { MatchSummary } from "@/src/api/schemas";
import { matchesQuery } from "@/src/api/queries";
import { FilterChip } from "@/src/components/FilterChip";
import { MatchCard } from "@/src/components/MatchCard";
import { Screen } from "@/src/components/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import { colors, spacing } from "@/src/theme/theme";

type MatchFilter = "ALL" | "LIVE" | "HIGH_STAR";

function matchesFilter(match: MatchSummary, filter: MatchFilter): boolean {
  if (filter === "LIVE") {
    return match.status === "LIVE" || match.status === "HALF_TIME";
  }
  if (filter === "HIGH_STAR") {
    return match.rating >= 3;
  }
  return true;
}

export default function LiveScreen() {
  const [filter, setFilter] = useState<MatchFilter>("LIVE");
  const query = useQuery(matchesQuery);
  const matches = useMemo(
    () => (query.data ?? []).filter((match) => matchesFilter(match, filter)),
    [filter, query.data]
  );

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
          onPress={() => setFilter("LIVE")}
          selected={filter === "LIVE"}
        />
        <FilterChip
          label="3+ yıldız"
          onPress={() => setFilter("HIGH_STAR")}
          selected={filter === "HIGH_STAR"}
        />
        <FilterChip
          label="Tümü"
          onPress={() => setFilter("ALL")}
          selected={filter === "ALL"}
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
          data={matches}
          initialNumToRender={8}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={
            <EmptyState
              message="Bu filtreye uyan bir maç bulunmuyor."
              title="Maç yok"
            />
          }
          maxToRenderPerBatch={8}
          refreshControl={
            <RefreshControl
              colors={[colors.green]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.green}
            />
          }
          renderItem={({ item }) => <MatchCard match={item} />}
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
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  list: {
    paddingBottom: 112
  }
});
