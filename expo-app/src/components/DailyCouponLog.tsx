import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { dailyCouponWindowQuery } from "@/src/api/queries";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatRatio, formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { istanbulDay } from "@/src/utils/rebuild-log";
import { CouponTicket } from "./CouponTicket";
import { TonePill, toneColor } from "./DecisionTicket";
import {
  countByResult, couponEntries, filterCoupons, summarizeCoupons, tierNames, tierOrder,
  type CouponEntry, type CouponResultFilter, type CouponTierFilter
} from "./daily-coupon-view";
import { ChipRow } from "./ChipRow";
import { FilterChip } from "./FilterChip";
import { Action, Card } from "./RebuildEvidencePanel";
import { EmptyState, LoadingState } from "./StateView";
import { SurfaceMaterial } from "./SurfaceMaterial";

export const logWindows = [
  { days: 1, label: "Bugün" },
  { days: 7, label: "7 gün" },
  { days: 30, label: "30 gün" }
] as const;
export type LogWindowDays = (typeof logWindows)[number]["days"];

/** Shared result filter of the Karar günlüğü rule views. */
export const resultFilters: readonly { id: CouponResultFilter; label: string }[] = [
  { id: "ALL", label: "Tümü" },
  { id: "WON", label: "Kazandı" },
  { id: "LOST", label: "Kaybetti" },
  { id: "PENDING", label: "Bekliyor" }
];

const dayLabel = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "long" });

function CouponSummaryCard({ entries }: { entries: readonly CouponEntry[] }) {
  const summary = summarizeCoupons(entries);
  const tone = unitsTone(summary.net.toFixed(2));
  return (
    <View style={styles.summary}>
      <SurfaceMaterial radius={16} />
      <View style={styles.flexCopy}>
        <Text style={styles.summaryLine}>
          <Text style={[styles.strong, { color: semantic.positive }]}>{summary.wins} kazandı</Text>
          {" · "}
          <Text style={[styles.strong, { color: semantic.negative }]}>{summary.losses} kaybetti</Text>
          {summary.pending ? ` · ${summary.pending} bekliyor` : ""}{summary.voids ? ` · ${summary.voids} iptal` : ""}
        </Text>
        <Text style={styles.summaryRatios}>
          {`${summary.coupons} kupon · isabet ${formatRatio(summary.hitRate)} · ROI ${formatRatio(summary.roi)}`}
        </Text>
      </View>
      <View style={styles.figure}>
        <Text style={[styles.summaryNet, { color: tone === "neutral" ? colors.text : toneColor[tone] }]}>{formatUnits(summary.net.toFixed(2))}</Text>
        <Text style={styles.footLabel}>birim</Text>
      </View>
    </View>
  );
}

/**
 * Karar günlüğü · Günlük kupon (owner direction 2026-11-17): every published
 * Banko, Dengeli and Riskli coupon of 1, 7 or 30 days with its result, the
 * match that lost it and each final score. Filters narrow the list and the
 * summary together, so the figures always describe what is on screen.
 */
export function DailyCouponLog() {
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [days, setDays] = useState<LogWindowDays>(7);
  const [tier, setTier] = useState<CouponTierFilter>("ALL");
  const [result, setResult] = useState<CouponResultFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const today = istanbulDay(openedAt);
  const query = useQuery(dailyCouponWindowQuery(today, days, true));
  const refresh = async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  };
  const all = query.data ? couponEntries(query.data.entries) : [];
  const byTier = filterCoupons(all, tier, "ALL");
  const counts = countByResult(byTier);
  const visible = filterCoupons(byTier, "ALL", result);
  const demo = query.data?.entries.some((entry) => entry.publication.mode === "DEMO");

  const head = (
    <View style={styles.head}>
      <ChipRow label="Dönem">
        {logWindows.map((item) => <FilterChip key={item.days} label={item.label} onPress={() => setDays(item.days)} selected={days === item.days} />)}
      </ChipRow>
      <ChipRow label="Kupon türü">
        <FilterChip label="Tümü" onPress={() => setTier("ALL")} selected={tier === "ALL"} />
        {tierOrder.map((name) => <FilterChip key={name} label={tierNames[name]} onPress={() => setTier(name)} selected={tier === name} />)}
      </ChipRow>
      <ChipRow label="Sonuç">
        {resultFilters.map((item) => (
          <FilterChip count={counts[item.id]} key={item.id} label={item.label} onPress={() => setResult(item.id)} selected={result === item.id} />
        ))}
      </ChipRow>
    </View>
  );

  if (query.isLoading) return <View style={styles.stack}>{head}<Card><LoadingState label="Kupon sonuçları hazırlanıyor" /></Card></View>;
  if (query.isError || !query.data) {
    return (
      <View style={styles.stack}>
        {head}
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
  const note = `Her kupona yayın oranından 1 varsayımsal birim. Kazandı, kaybetti ve maç skorları SAP sonuç kaydından gelir.${missing}${demo ? " · Örnek veri" : ""}`;
  const header = (
    <View style={styles.listHead}>
      {head}
      <CouponSummaryCard entries={visible} />
      <Text style={styles.note}>{note}</Text>
    </View>
  );
  const empty = (
    <EmptyState kind="NO_DECISION"
      message={all.length ? "Filtreyi değiştirerek diğer kuponları görebilirsin." : query.data.todayStatus === "AWAITING_PUBLICATION"
        ? "Bugünün kuponları 11.00 bülteninden sonra yayımlanır." : "Başka bir dönem seçerek geçmiş kuponları görebilirsin."}
      title={all.length ? "Bu filtrede kupon yok" : "Bu dönemde kupon yok"} />
  );
  const eyebrow = (entry: CouponEntry) => entry.day === today ? "BUGÜN" : dayLabel.format(new Date(entry.day)).toLocaleUpperCase("tr-TR");
  const refreshControl = <RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />;

  if (wide) {
    return (
      <ScrollView contentContainerStyle={styles.wideContent} refreshControl={refreshControl} style={styles.fill}>
        {header}
        {visible.length ? (
          <View style={styles.grid}>
            {visible.map((entry) => (
              <View key={`${entry.day}:${entry.tier.tier}`} style={styles.gridItem}><CouponTicket eyebrow={eyebrow(entry)} tier={entry.tier} /></View>
            ))}
          </View>
        ) : empty}
      </ScrollView>
    );
  }
  return (
    <FlatList
      ItemSeparatorComponent={() => <View style={styles.cardGap} />}
      ListEmptyComponent={empty}
      ListHeaderComponent={header}
      contentContainerStyle={styles.pageList}
      data={visible}
      keyExtractor={(entry) => `${entry.day}:${entry.tier.tier}`}
      refreshControl={refreshControl}
      renderItem={({ item }) => <CouponTicket eyebrow={eyebrow(item)} tier={item.tier} />}
      showsVerticalScrollIndicator={false}
      style={styles.fill}
    />
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stack: { gap: spacing.md, width: "100%" },
  head: { gap: spacing.sm },
  listHead: { gap: spacing.sm, marginBottom: spacing.md },
  note: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  pageList: { paddingBottom: 112 },
  wideContent: { gap: spacing.md, paddingBottom: spacing.xxl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { flexBasis: 360, flexGrow: 1, maxWidth: 520 },
  cardGap: { height: 12 },
  flexCopy: { flex: 1, minWidth: 0 },
  summary: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.borderSoft },
  summaryLine: { color: colors.text, ...typeScale.bodyCompact },
  summaryRatios: { color: colors.textMuted, ...typeScale.meta, marginTop: 2 },
  strong: { fontWeight: "800" },
  summaryNet: { ...typeScale.metric, fontSize: 26, lineHeight: 28, fontWeight: "800" },
  figure: { alignItems: "flex-end" },
  footLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 }
});
