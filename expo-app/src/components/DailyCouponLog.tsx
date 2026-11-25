import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Platform, RefreshControl, ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { dailyCouponMatchStatesQuery, dailyCouponWindowQuery } from "@/src/api/queries";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, spacing, typeScale } from "@/src/theme/theme";
import { formatRatio } from "@/src/utils/rebuild-display";
import { istanbulDay, resolvePeriod, shiftDay, type LogPeriodChoice } from "@/src/utils/rebuild-log";
import { CouponTicket } from "./CouponTicket";
import { TonePill } from "./DecisionTicket";
import {
  countByResult, couponEntries, currentCouponMatchKeys, filterCoupons, liveLegStates, summarizeCoupons, tierNames, tierOrder,
  type CouponEntry, type CouponResultFilter, type CouponTierFilter
} from "./daily-coupon-view";
import { SegmentedControl, SelectMenu } from "./FilterControls";
import { Action, Card } from "./RebuildEvidencePanel";
import { EmptyState, LoadingState } from "./StateView";
import { LogOutcomeSummary } from "./LogOutcomeSummary";
import { LogPeriodControl } from "./LogPeriodControl";
import { LogToolbar } from "./LogToolbar";

const tierOptions: readonly { id: CouponTierFilter; label: string }[] = [
  { id: "ALL", label: "Tüm kuponlar" },
  ...tierOrder.map((name) => ({ id: name as CouponTierFilter, label: tierNames[name] }))
];

/** Result segments with their counts, shared by the Karar günlüğü rule views. */
export function resultOptions(counts: Readonly<Record<CouponResultFilter, number>>) {
  return resultFilters.map((item) => ({ ...item, count: counts[item.id] }));
}

/** Shared result filter of the Karar günlüğü rule views. */
export const resultFilters: readonly { id: CouponResultFilter; label: string }[] = [
  { id: "ALL", label: "Tümü" },
  { id: "WON", label: "Kazandı" },
  { id: "LOST", label: "Kaybetti" },
  { id: "PENDING", label: "Bekliyor" }
];

const dayLabel = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" });

/**
 * Karar günlüğü · Günlük kupon (owner direction 2026-11-17): every published
 * Banko, Dengeli and Riskli coupon of 1, 7 or 30 days with its result, the
 * match that lost it and each final score. Filters narrow the list and the
 * summary together, so the figures always describe what is on screen.
 */
export function DailyCouponLog({ active }: { active: boolean }) {
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [choice, setChoice] = useState<LogPeriodChoice>({ kind: "today" });
  const [periodOpen, setPeriodOpen] = useState(false);
  const [tier, setTier] = useState<CouponTierFilter>("ALL");
  const [result, setResult] = useState<CouponResultFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(Date.now());
    const immediate = setTimeout(tick, 0);
    const interval = setInterval(tick, 10_000);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, [active]);
  const today = istanbulDay(now);
  const period = resolvePeriod(choice, today);
  const recent = period.through >= shiftDay(today, -1);
  const query = useQuery({ ...dailyCouponWindowQuery(period.through, period.days, false),
    refetchInterval: active && recent ? (period.days === 1 ? 30_000 : 120_000) : false });
  const all = query.data ? couponEntries(query.data.entries) : [];
  const matchKeys = currentCouponMatchKeys(all, today);
  const matchQuery = useQuery(dailyCouponMatchStatesQuery(matchKeys, active));
  const live = liveLegStates(matchQuery.isError ? undefined : matchQuery.data);
  const refresh = async () => {
    setRefreshing(true);
    try { await Promise.all([query.refetch(), matchKeys.length ? matchQuery.refetch() : undefined]); }
    finally { setRefreshing(false); }
  };
  const byTier = filterCoupons(all, tier, "ALL");
  const counts = countByResult(byTier);
  const visible = filterCoupons(byTier, "ALL", result);
  const demo = query.data?.entries.some((entry) => entry.publication.mode === "DEMO");

  const toolbar = (
    <LogToolbar
      wide={wide}
      period={<LogPeriodControl align={wide ? "right" : "left"} choice={choice} onChange={setChoice}
        onOpenChange={setPeriodOpen} open={periodOpen} period={period} today={today} />}
      results={<SegmentedControl fill={!wide} label="Sonuç" onChange={(next) => { setPeriodOpen(false); setResult(next); }}
        options={query.data ? resultOptions(counts) : resultFilters} value={result} />}
    >
      <SelectMenu icon="ticket-outline" label="Kupon türü" onChange={(next) => { setPeriodOpen(false); setTier(next); }}
        options={tierOptions} value={tier} />
    </LogToolbar>
  );

  if (query.isLoading) return <View style={styles.stack}>{toolbar}<LoadingState label="Kupon sonuçları hazırlanıyor" /></View>;
  if (query.isError || !query.data) {
    return (
      <View style={styles.stack}>
        {toolbar}
        <Card>
          <View style={styles.waiting}>
            <TonePill dot label="VERİ ALINAMADI" tone="neutral" />
            <Action icon="refresh" onPress={() => { void query.refetch(); }} title="Yenile" />
          </View>
        </Card>
      </View>
    );
  }

  const missing = query.data.unavailableDays.length
    ? ` · ${query.data.unavailableDays.length} gün doğrulanamadı` : "";
  const note = `Her kupona yayın oranından 1 varsayımsal birim. Canlı skorlar maç akışından, kesin kupon sonuçları BTB sonuç kaydından gelir.${missing}${demo ? " · Örnek veri" : ""}`;
  const summary = summarizeCoupons(visible);
  const header = (
    <View style={styles.listHead}>
      <LogOutcomeSummary counts={summary} hitRate={formatRatio(summary.hitRate)} net={summary.net.toFixed(2)}
        netLabel="Net birim" roi={formatRatio(summary.roi)} wide={wide} />
      <Text style={styles.note}>{note}</Text>
    </View>
  );
  const empty = (
    <EmptyState kind="NO_DECISION"
      message={all.length ? "Filtreyi değiştirerek diğer kuponları görebilirsin." : query.data.todayStatus === "AWAITING_PUBLICATION"
        ? "Bugünün kuponları 11.00 bülteninden sonra yayımlanır." : "Başka bir dönem seçerek geçmiş kuponları görebilirsin."}
      title={all.length ? "Bu filtrede kupon yok" : "Bu dönemde kupon yok"} />
  );
  const byDay = new Map<string, CouponEntry[]>();
  for (const entry of visible) {
    const group = byDay.get(entry.day);
    if (group) group.push(entry);
    else byDay.set(entry.day, [entry]);
  }
  const sections = Array.from(byDay, ([day, data]) => ({ key: day, data }));
  const heading = (day: string, count: number) => (
    <View style={styles.dayHeading}>
      <Text accessibilityRole="header" aria-level={2} style={styles.day}>{day === today ? "Bugün" : dayLabel.format(new Date(day))}</Text>
      <Text style={styles.note}>{count} kupon</Text>
    </View>
  );
  const refreshControl = <RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />;
  const closePeriod = () => setPeriodOpen(false);

  return (
    <View style={styles.stack}>
      {toolbar}
      {wide ? (
        <ScrollView contentContainerStyle={styles.wideContent} onScroll={periodOpen ? closePeriod : undefined}
          refreshControl={refreshControl} style={styles.fill}>
          {header}
          {sections.length ? sections.map(({ key, data }) => (
            <View key={key} style={styles.dayGroup}>
              {heading(key, data.length)}
              <View style={styles.grid}>
                {data.map(({ tier }) => <View key={tier.tier} style={styles.gridItem}><CouponTicket live={live} now={now} tier={tier} /></View>)}
              </View>
            </View>
          )) : empty}
        </ScrollView>
      ) : (
        <SectionList
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListEmptyComponent={empty}
          ListHeaderComponent={header}
          contentContainerStyle={styles.pageList}
          keyExtractor={(entry) => `${entry.day}:${entry.tier.tier}`}
          onScrollBeginDrag={closePeriod}
          refreshControl={refreshControl}
          renderItem={({ item }) => <CouponTicket live={live} now={now} tier={item.tier} />}
          renderSectionHeader={({ section }) => heading(section.key, section.data.length)}
          sections={sections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          style={styles.fill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stack: { flex: 1, gap: spacing.md, width: "100%" },
  listHead: { gap: spacing.sm, marginBottom: spacing.md },
  note: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  pageList: { paddingBottom: 112 },
  wideContent: { gap: spacing.md, paddingBottom: spacing.xxl },
  dayGroup: { gap: spacing.sm },
  dayHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: spacing.md,
    paddingTop: spacing.sm, paddingBottom: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderSoft },
  day: { color: colors.text, ...typeScale.moduleTitle },
  grid: { flexDirection: "row", gap: spacing.md },
  gridItem: { flexBasis: "31.5%", minWidth: 0 },
  cardGap: { height: 12 }
});
