import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { colors, spacing, typeScale } from "@/src/theme/theme";
import { Action } from "@/src/components/RebuildEvidencePanel";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { TotoRefreshNotice } from "@/src/components/TotoRefreshNotice";
import { totoQueryView } from "@/src/utils/toto-query-view";
import { coverageTrend } from "@/src/utils/toto-lifecycle";

type StatusFilter = "ALL" | TotoProgram["status"];
// Current programs render as cards and resulted ones as compact history rows,
// each chunked into the grid's columns so one single-column list stays virtualized.
type ListRow = { kind: "cards" | "past"; key: string; programs: TotoProgram[] } | { kind: "history"; key: string; count: number };
const chunk = <T,>(items: T[], size: number) => Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, index * size + size));

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
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  };
  const programs = useMemo(() => query.data ?? [], [query.data]);
  const counts = useMemo(() => {
    const result: Record<TotoProgram["status"], number> = { ACTIVE: 0, WAITING_RESULT: 0, RESULTED: 0, ERROR: 0 };
    for (const program of programs) {
      result[program.status] += 1;
    }
    return result;
  }, [programs]);
  const visible = filter === "ALL" ? programs : programs.filter((program) => program.status === filter);
  const view = totoQueryView(query);
  const current = visible.filter((program) => program.status !== "RESULTED");
  const past = visible.filter((program) => program.status === "RESULTED").sort((a, b) => b.gcNo - a.gcNo);
  const trend = coverageTrend(programs);
  const rows: ListRow[] = [
    ...chunk(current, grid.columns).map((items, index): ListRow => ({ kind: "cards", key: `c${index}`, programs: items })),
    ...(past.length ? [{ kind: "history", key: "history", count: past.length } as ListRow] : []),
    ...chunk(past, grid.columns).map((items, index): ListRow => ({ kind: "past", key: `p${index}`, programs: items }))
  ];
  const firstKey = (current[0] ?? past[0])?.key;
  const card = (program: TotoProgram, compact: boolean) => {
    const element = <TotoProgramCard compact={compact} program={program} showContextNote={false} />;
    return program.key === firstKey ? <TutorialTarget id="toto-first-card">{element}</TutorialTarget> : element;
  };

  return (
    <Screen
      brand
      contentStyle={styles.screen}
      eyebrow="SPOR TOTO"
      scroll={false}
      title="Programlar"
      fixedHeader={view.kind === "retained" ? <TotoRefreshNotice receivedAt={view.receivedAt} refreshing={query.isFetching} onRetry={() => { void refresh(); }} /> : undefined}
      wide
    >
      {view.kind === "current" || view.kind === "retained" ? (
        <ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
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
        </ScrollView>
      ) : null}
      {view.kind === "loading" ? (
        <LoadingState label="Toto programları hazırlanıyor" />
      ) : view.kind === "unavailable" ? (
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
          contentContainerStyle={styles.list}
          data={rows}
          keyExtractor={(row) => row.key}
          ListEmptyComponent={
            <View style={styles.empty}>
              <EmptyState
                message={filter === "ALL" ? view.kind === "retained" ? "Güncel programları almak için tekrar deneyebilirsin." : "Programlar hazır olduğunda burada görünür." : "Diğer durumdaki programları görmek için filtreyi temizleyebilirsin."}
                title={filter === "ALL" ? view.kind === "retained" ? "Son alınan listede program yok" : "Henüz program yok" : filter === "WAITING_RESULT" ? "Sonuç bekleyen program yok" : filter === "RESULTED" ? "Sonuçlanmış program yok" : filter === "ERROR" ? "Hatalı program yok" : "Aktif program yok"}
              />
              {filter !== "ALL" && programs.length > 0 ? <Action icon="chevron-right" onPress={() => setFilter("ALL")} title="Tüm programları göster" /> : null}
            </View>
          }
          ListHeaderComponent={<View style={styles.intro}><Text style={styles.subtitle}>Programı aç, kuponu ve sonuçları incele.</Text>{programs.length > 0 ? <Text style={styles.contextNote}>Kapsama kupon kazancı değildir.{programs.every((program) => program.costCurrency) ? "" : " Maliyet birimi kaynakta belirtilmiyor."}</Text> : null}</View>}
          refreshControl={
            <RefreshControl
              colors={[colors.green]}
              onRefresh={() => { void refresh(); }}
              refreshing={refreshing}
              tintColor={colors.green}
            />
          }
          renderItem={({ item }) => item.kind === "history" ? (
            <View style={styles.historyHead}>
              <Text accessibilityRole="header" aria-level={2} style={styles.historyTitle}>Geçmiş</Text>
              <Text style={styles.contextNote}>{item.count} sonuçlanan program{trend.length > 1 ? ` · son ${trend.length} programın kapsaması, yeniden eskiye: ${trend.join(" · ")}` : ""}</Text>
            </View>
          ) : (
            <View style={grid.wrapStyle}>
              {item.programs.map((program) => <View key={program.key} style={grid.cellStyle}>{card(program, item.kind === "past")}</View>)}
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
  // One horizontal row of chips keeps the fixed header short on a phone.
  filterBar: { flexGrow: 0, flexShrink: 0, marginBottom: 14 },
  filters: {
    flexDirection: "row",
    gap: spacing.sm
  },
  intro: { gap: spacing.xs, marginBottom: spacing.md },
  subtitle: { ...typeScale.body, color: colors.textMuted },
  historyHead: { gap: 2, marginTop: spacing.md, marginBottom: spacing.sm },
  historyTitle: { ...typeScale.moduleTitle, color: colors.text },
  list: {
    paddingBottom: 112
  },
  contextNote: { ...typeScale.bodyCompact, color: colors.textMuted },
  empty: { gap: spacing.sm }
});
