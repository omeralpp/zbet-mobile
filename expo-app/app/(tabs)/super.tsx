import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import {
  colors,
  iconSizes,
  interaction,
  radii,
  shadows,
  spacing
} from "@/src/theme/theme";
import {
  formatFixtureDateTime,
  formatSuperDateScope,
  matchDateFromKey
} from "@/src/utils/format";
import {
  useSuperStarFilter
} from "@/src/preferences/SuperStarFilterProvider";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import {
  matchSuperLogTab,
  type SuperLogTab
} from "@/src/utils/super-log-tabs";
import {
  sortSuperLogs,
  type SuperStarSort
} from "@/src/utils/decision-filters";
import {
  resolveSuperDayScope,
  superDayScopeForLabel,
  superDayScopeLabel,
  superDayScopeLabels
} from "@/src/utils/super-day-scope";
import type { SuperLog } from "@/src/api/schemas";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import {
  adjacentLocalTab,
  type TabSwipeDirection
} from "@/src/navigation/tab-swipe";

const localTabs = ["ALL", "OPEN"] as const;

export default function SuperScreen() {
  const params = useLocalSearchParams<{
    scope?: string | string[];
  }>();
  const router = useRouter();
  const rawScope = Array.isArray(params.scope)
    ? params.scope[0]
    : params.scope;
  // Resolved rather than compared inline, so the screen and the default live in
  // one tested place instead of drifting apart at a string literal.
  const dayScope = resolveSuperDayScope(rawScope);
  const latestDayOnly = dayScope === "LATEST_DAY";
  const activeDayScope = superDayScopeLabel(dayScope);
  const [tab, setTab] = useState<SuperLogTab>("ALL");
  const { filter: starFilter, setFilter: setStarFilter } =
    useSuperStarFilter();
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [dayScopeOpen, setDayScopeOpen] = useState(false);
  const [sort, setSort] = useState<SuperStarSort>("DEFAULT");
  const listRef = useRef<FlatList<SuperLog>>(null);
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
      sortSuperLogs(
        scopedLogs.filter(
          (log) => matchSuperLogTab(log, tab, starFilter)
        ),
        sort
      ),
    [scopedLogs, sort, starFilter, tab]
  );
  useEffect(() => {
    listRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [sort]);
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
        setDayScopeOpen(false);
        setTab(target);
      }
    };
  }, [tab]);

  return (
    <Screen
      contentStyle={styles.screen}
      eyebrow="BTB SUPER"
      localTabSwipe={localTabSwipe}
      scroll={false}
      tabSwipe
      title="Karar günlüğü"
    >
      <TutorialTarget id="super-filters" style={styles.filterTarget}>
        <View style={styles.filters}>
        <FilterChip
          count={tabCounts.ALL}
          label="Tümü"
          onPress={() => {
            setDecisionOpen(false);
            setDayScopeOpen(false);
            setTab("ALL");
          }}
          selected={tab === "ALL"}
        />
        <FilterChip
          count={tabCounts.OPEN}
          label="Açık"
          onPress={() => {
            setDecisionOpen(false);
            setDayScopeOpen(false);
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
          onSortChange={setSort}
          onOpenChange={(open) => {
            setDecisionOpen(open);
            if (open) {
              setDayScopeOpen(false);
            }
          }}
          open={decisionOpen}
          value={starFilter}
          sortValue={sort}
        />
        </View>
      </TutorialTarget>
      <View style={styles.scopeRow}>
        {dateScope ? <Text style={styles.scope}>{dateScope}</Text> : null}
        <View style={[styles.dayScopeWrapper, dayScopeOpen && styles.dayScopeWrapperOpen]}>
          <Pressable
            accessibilityLabel={`Gün kapsamı: ${activeDayScope}`}
            accessibilityRole="button"
            accessibilityState={{
              disabled: query.isRefetching,
              expanded: dayScopeOpen
            }}
            disabled={query.isRefetching}
            onPress={() => {
              setDecisionOpen(false);
              setDayScopeOpen((open) => !open);
            }}
            style={({ pressed }) => [
              styles.dayScopeButton,
              pressed && styles.dayScopeButtonPressed,
              query.isRefetching && styles.dayScopeButtonDisabled
            ]}
          >
            <MaterialCommunityIcons
              color={colors.blue}
              name="calendar-range"
              size={iconSizes.small}
            />
            <Text style={styles.dayScopeAction}>{activeDayScope}</Text>
            <MaterialCommunityIcons
              color={colors.textMuted}
              name={dayScopeOpen ? "chevron-up" : "chevron-down"}
              size={iconSizes.small}
            />
          </Pressable>
          {dayScopeOpen ? (
            <View accessibilityRole="menu" style={styles.dayScopeMenu}>
              {(
                [
                  superDayScopeLabels.LATEST_DAY,
                  superDayScopeLabels.ALL
                ] as const
              ).map((label) => {
                const selected = label === activeDayScope;
                return (
                  <Pressable
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    key={label}
                    onPress={() => {
                      setDayScopeOpen(false);
                      // Both directions carry an explicit scope. Clearing the
                      // parameter would now resolve straight back to Bugün and
                      // make "Tüm günler" impossible to select.
                      router.replace({
                        pathname: "/super",
                        params: { scope: superDayScopeForLabel(label) }
                      } as never);
                    }}
                    style={({ pressed }) => [
                      styles.dayScopeOption,
                      selected && styles.dayScopeOptionSelected,
                      pressed && styles.dayScopeButtonPressed
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayScopeOptionText,
                        selected && styles.dayScopeOptionTextSelected
                      ]}
                    >
                      {label}
                    </Text>
                    {selected ? (
                      <MaterialCommunityIcons
                        color={colors.white}
                        name="check"
                        size={iconSizes.inline}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>

      {query.isLoading ? (
        <LoadingState label="Super kararları hazırlanıyor" />
      ) : query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Super kararları alınamadı."
          }
          onRetry={() => query.refetch()}
        />
      ) : (
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.list}
          data={logs}
          initialNumToRender={10}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={
            <EmptyState
              kind="NO_DECISION"
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
          onScrollBeginDrag={() => {
            setDecisionOpen(false);
            setDayScopeOpen(false);
          }}
          onTouchStart={() => {
            if (decisionOpen) {
              setDecisionOpen(false);
            }
            if (dayScopeOpen) {
              setDayScopeOpen(false);
            }
          }}
          renderItem={({ item, index }) =>
            index === 0 ? (
              <TutorialTarget id="super-first-card">
                <SuperLogCard log={item} />
              </TutorialTarget>
            ) : (
              <SuperLogCard log={item} />
            )
          }
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
    marginBottom: spacing.md,
    zIndex: 20
  },
  dayScopeAction: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "900"
  },
  dayScopeButton: {
    minHeight: interaction.minTouchTarget,
    minWidth: 126,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: spacing.md
  },
  dayScopeWrapper: {
    position: "relative",
    zIndex: 10
  },
  dayScopeWrapperOpen: {
    zIndex: 40,
    elevation: 40
  },
  dayScopeMenu: {
    position: "absolute",
    top: interaction.minTouchTarget + 6,
    right: 0,
    minWidth: 160,
    padding: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  dayScopeOption: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  dayScopeOptionSelected: {
    backgroundColor: colors.blueSoft
  },
  dayScopeOptionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  dayScopeOptionTextSelected: {
    color: colors.white
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
