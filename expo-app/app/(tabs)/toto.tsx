import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { totoProgramsQuery } from "@/src/api/queries";
import type { TotoProgram } from "@/src/api/schemas";
import { FilterChip } from "@/src/components/FilterChip";
import { Screen } from "@/src/components/Screen";
import {
  EmptyState,
  ErrorState,
  LoadingState
} from "@/src/components/StateView";
import { TotoProgramCard, totoStatusColor } from "@/src/components/TotoProgramCard";
import { useCardGrid } from "@/src/layout/use-card-grid";
import { colors, spacing } from "@/src/theme/theme";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";

type StatusFilter = "ALL" | TotoProgram["status"];

/** The lifecycle filters, in lifecycle order; "Hata" only appears when needed. */
const statusFilters: { value: Exclude<StatusFilter, "ALL">; label: string }[] = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "WAITING_RESULT", label: "Sonuç bekliyor" },
  { value: "RESULTED", label: "Sonuçlandı" },
  { value: "ERROR", label: "Hata" }
];

export default function TotoScreen() {
  const query = useQuery(totoProgramsQuery);
  const grid = useCardGrid();
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const programs = useMemo(() => query.data ?? [], [query.data]);
  const counts = useMemo(() => {
    const result: Record<TotoProgram["status"], number> = { ACTIVE: 0, WAITING_RESULT: 0, RESULTED: 0, ERROR: 0 };
    for (const program of programs) {
      result[program.status] += 1;
    }
    return result;
  }, [programs]);
  const visible = filter === "ALL" ? programs : programs.filter((program) => program.status === filter);

  return (
    <Screen
      brand
      contentStyle={styles.screen}
      eyebrow="SPOR TOTO"
      scroll={false}
      subtitle="Program, kolon ve kapsama Toto'ya özeldir; Super sonuçlarıyla karışmaz."
      title="Programlar"
      wide
    >
      {query.data ? (
        <View style={styles.filters}>
          <FilterChip count={programs.length} label="Tümü" onPress={() => setFilter("ALL")} selected={filter === "ALL"} />
          {statusFilters
            .filter((option) => option.value !== "ERROR" || counts.ERROR > 0)
            .map((option) => (
              <FilterChip
                count={counts[option.value]}
                dot={totoStatusColor(option.value)}
                key={option.value}
                label={option.label}
                onPress={() => setFilter(option.value)}
                selected={filter === option.value}
              />
            ))}
        </View>
      ) : null}
      {query.isLoading ? (
        <LoadingState label="Toto programları hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          message={
            query.error instanceof Error
              ? query.error.message
              : "Toto programları alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          // numColumns cannot change on a mounted list; remount on a new grid.
          key={grid.columns}
          contentContainerStyle={styles.list}
          data={visible}
          keyExtractor={(item) => item.key}
          numColumns={grid.columns}
          {...(grid.rowStyle ? { columnWrapperStyle: grid.rowStyle } : {})}
          ListEmptyComponent={
            <EmptyState
              message={filter === "ALL" ? "Henüz mobil görünümde bir Toto programı yok." : "Bu durumda bir Toto programı yok."}
              title="Program yok"
            />
          }
          refreshControl={
            <RefreshControl
              colors={[colors.green]}
              onRefresh={() => query.refetch()}
              refreshing={query.isRefetching}
              tintColor={colors.green}
            />
          }
          renderItem={({ item, index }) => (
            <View style={grid.cellStyle}>
              {index === 0 ? (
                <TutorialTarget id="toto-first-card">
                  <TotoProgramCard program={item} />
                </TutorialTarget>
              ) : (
                <TotoProgramCard program={item} />
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
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
    marginBottom: 14
  },
  list: {
    paddingBottom: 112
  }
});
