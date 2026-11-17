import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { selectionDecisionsQuery } from "@/src/api/queries";
import type { SelectionDecisionRecord, SelectionDecisions, SelectionRule } from "@/src/api/selection-decisions-schema";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatSelection } from "@/src/utils/format";
import { formatQuote, formatRatio, formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { istanbulDay } from "@/src/utils/rebuild-log";
import { ResultPill, TonePill, toneColor } from "./DecisionTicket";
import { resultFilters } from "./DailyCouponLog";
import type { CouponResultFilter } from "./daily-coupon-view";
import { ChipRow } from "./ChipRow";
import { FilterChip } from "./FilterChip";
import { RatingStars } from "./RatingStars";
import { Action, Card } from "./RebuildEvidencePanel";
import { EmptyState, LoadingState } from "./StateView";
import { SurfaceMaterial } from "./SurfaceMaterial";

const windows = [
  { days: 1, label: "Bugün" },
  { days: 7, label: "7 gün" },
  { days: 30, label: "30 gün" }
] as const;
type WindowDays = (typeof windows)[number]["days"];

const istanbulTime = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function ratio(value: string | null): number | null {
  return value === null ? null : Number(value);
}

/** Outcomes and ratios on the left, net units on the right, like the champion's summary. */
function RuleSummary({ value }: { value: NonNullable<SelectionDecisions["summary"]> }) {
  const tone = unitsTone(value.net);
  const extra = [value.pending ? `${value.pending} bekliyor` : null, value.unresolved ? `${value.unresolved} çözülemedi` : null].filter(Boolean);
  return (
    <View style={styles.summary}>
      <SurfaceMaterial radius={16} />
      <View style={styles.flexCopy}>
        <Text style={styles.summaryLine}>
          <Text style={[styles.strong, { color: semantic.positive }]}>{value.wins} kazandı</Text>
          {" · "}
          <Text style={[styles.strong, { color: semantic.negative }]}>{value.losses} kaybetti</Text>
          {extra.length ? ` · ${extra.join(" · ")}` : ""}
        </Text>
        <Text style={styles.summaryRatios}>
          {`${value.decisions} karar · isabet ${formatRatio(ratio(value.hitRate))} · ort. oran ${formatQuote(value.averageQuote)} · ROI ${formatRatio(ratio(value.roi))}`}
        </Text>
      </View>
      <View style={styles.figure}>
        <Text style={[styles.summaryNet, { color: tone === "neutral" ? colors.text : toneColor[tone] }]}>{formatUnits(value.net)}</Text>
        <Text style={styles.footLabel}>birim</Text>
      </View>
    </View>
  );
}

function DecisionCard({ record }: { record: SelectionDecisionRecord }) {
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  const final = record.result.finalHome === null ? null : `MS ${record.result.finalHome}–${record.result.finalAway}`;
  const teams = record.homeTeam && record.awayTeam ? `${record.homeTeam} – ${record.awayTeam}` : `Maç ${record.fixtureKey}`;
  return (
    <View
      accessibilityLabel={`${teams}, ${formatSelection(record.market)}, oran ${formatQuote(record.quote)}, ${record.minute}. dakika`}
      style={styles.card}
    >
      <SurfaceMaterial accent={record.result.state === "PENDING" ? semantic.intelligence : undefined} radius={20} />
      <View style={styles.rowBetween}>
        <View style={styles.rowStart}>
          <RatingStars rating={record.stars} size={14} />
          <TonePill label={record.live ? "CANLI" : "SONRADAN"} tone={record.live ? "positive" : "neutral"} />
        </View>
        <View style={styles.rowStart}>
          {final ? <Text style={styles.finalScore}>{final}</Text> : null}
          <ResultPill state={record.result.state} />
        </View>
      </View>
      <Text numberOfLines={1} style={styles.team}>{teams}</Text>
      <Text numberOfLines={1} style={styles.meta}>
        {[record.league || null, `${istanbulTime.format(new Date(record.evaluatedAt))} karar`].filter(Boolean).join(" · ")}
      </Text>
      <View style={styles.cardFoot}>
        <View style={styles.flexCopy}>
          <Text style={styles.market}>{formatSelection(record.market)}</Text>
          <Text style={styles.footLabel}>{record.minute}′ seçim · {record.homeScore}–{record.awayScore}</Text>
        </View>
        <View style={styles.figure}>
          <Text style={styles.quote}>{formatQuote(record.quote)}</Text>
          <Text style={styles.footLabel}>seçim oranı</Text>
        </View>
        <View style={[styles.figure, styles.units]}>
          <Text style={[styles.net, { color: tone === "neutral" ? colors.textMuted : toneColor[tone] }]}>{formatUnits(record.result.net)}</Text>
          <Text style={styles.footLabel}>birim</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Selection Lab rule log (owner direction 2026-11-14): one rule's hypothetical
 * decisions from SAP, its hits and odds for 1, 7 or 30 Istanbul days, and how
 * many fixtures the rule could follow. It sits beside the champion's log and
 * never changes it.
 */
export function SelectionRuleLog({ rule }: { rule: SelectionRule }) {
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [days, setDays] = useState<WindowDays>(7);
  const [result, setResult] = useState<CouponResultFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const today = istanbulDay(openedAt);
  const query = useQuery(selectionDecisionsQuery(rule, today, days, true));
  const refresh = async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  };
  const value = query.data;
  const states = { WON: "WIN", LOST: "LOSS", PENDING: "PENDING" } as const;
  const records = value?.records ?? [];
  const counts = { ALL: records.length, WON: records.filter((record) => record.result.state === "WIN").length,
    LOST: records.filter((record) => record.result.state === "LOSS").length,
    PENDING: records.filter((record) => record.result.state === "PENDING").length };
  const visible = result === "ALL" ? records : records.filter((record) => record.result.state === states[result]);
  const periodChips = (
    <ChipRow label="Dönem">
      {windows.map((item) => (
        <FilterChip key={item.days} label={item.label} onPress={() => setDays(item.days)} selected={days === item.days} />
      ))}
    </ChipRow>
  );
  const head = (
    <View style={styles.head}>
      {periodChips}
      {value?.availability === "AVAILABLE" ? (
        <ChipRow label="Sonuç">
          {resultFilters.map((item) => (
            <FilterChip count={counts[item.id]} key={item.id} label={item.label} onPress={() => setResult(item.id)} selected={result === item.id} />
          ))}
        </ChipRow>
      ) : null}
      <Text style={styles.scopeText}>
        {value?.coverage
          ? `${value.ruleLabel} · ${value.coverage.fixtures} maç · ${value.coverage.decided} karar verdi · ${value.coverage.tracking} izleniyor · ${value.coverage.notEnrolled} başlangıç kuralı dışında${value.coverage.stopped ? ` · ${value.coverage.stopped} durdu` : ""}`
          : value?.ruleLabel ?? rule}
      </Text>
    </View>
  );
  const note = "Varsayımsal: her maçta kuralın ilk kararı, ilk orana 1 birim. Kapsam dışı maçlar, ilk döngüsü temiz başlamayan maçlardır. Şampiyonun yerine geçmez; karşılaştırma içindir.";

  if (query.isLoading) return <View style={styles.stack}>{head}<Card><LoadingState label="Kural kararları hazırlanıyor" /></Card></View>;
  if (query.isError || !value) {
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
  if (value.availability !== "AVAILABLE" || !value.summary) {
    return (
      <View style={styles.stack}>
        {head}
        <EmptyState
          kind="NO_DECISION"
          message={value.reason === "RULE_NOT_PUBLISHED" ? "Bu kural için tüm ligleri kapsayan form girdisi geliştiriliyor." : "Kural verisi şu an doğrulanamadı."}
          title={value.reason === "RULE_NOT_PUBLISHED" ? `${value.ruleLabel} hazırlanıyor` : "Kural verisi bekleniyor"}
        />
      </View>
    );
  }
  const summary = value.summary;
  const empty = records.length
    ? <EmptyState kind="NO_DECISION" message="Filtreyi değiştirerek bu dönemin diğer kararlarını görebilirsin." title="Bu filtrede karar yok" />
    : <EmptyState kind="NO_DECISION" message="Başka bir dönem seçerek bu kuralın geçmiş kararlarını görebilirsin." title="Bu dönemde kural kararı yok" />;
  const header = (
    <View style={styles.listHead}>
      {head}
      <RuleSummary value={summary} />
      <Text style={styles.note}>{`${note}${summary.live ? ` · ${summary.live} karar canlı kaydedildi` : ""}${result === "ALL" ? "" : " · Özet seçili dönemin tüm kararlarını gösterir"}`}</Text>
    </View>
  );
  const refreshControl = <RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />;

  if (wide) {
    return (
      <ScrollView contentContainerStyle={styles.wideContent} refreshControl={refreshControl} style={styles.fill}>
        {header}
        {visible.length ? (
          <View style={styles.grid}>
            {visible.map((record) => (
              <View key={record.decisionId} style={styles.gridItem}><DecisionCard record={record} /></View>
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
      keyExtractor={(record) => record.decisionId}
      refreshControl={refreshControl}
      renderItem={({ item }) => <DecisionCard record={item} />}
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
  filters: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  scopeText: { color: colors.textMuted, ...typeScale.meta },
  note: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  pageList: { paddingBottom: 112 },
  wideContent: { gap: spacing.md, paddingBottom: spacing.xxl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { flexBasis: 360, flexGrow: 1, maxWidth: 560 },
  cardGap: { height: 12 },
  flexCopy: { flex: 1, minWidth: 0 },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  summaryLine: { color: colors.text, ...typeScale.bodyCompact },
  summaryRatios: { color: colors.textMuted, ...typeScale.meta, marginTop: 2 },
  strong: { fontWeight: "800" },
  summaryNet: { ...typeScale.metric, fontSize: 26, lineHeight: 28, fontWeight: "800" },
  card: { gap: spacing.sm, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rowStart: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  finalScore: { color: colors.text, ...typeScale.metricCompact },
  team: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  meta: { color: colors.textMuted, ...typeScale.meta },
  cardFoot: { flexDirection: "row", alignItems: "flex-end", gap: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  market: { color: colors.text, ...typeScale.bodyCompact, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  figure: { alignItems: "flex-end" },
  units: { minWidth: 48 },
  quote: { color: colors.text, ...typeScale.metric },
  net: { ...typeScale.metric, fontWeight: "800" },
  footLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 }
});
