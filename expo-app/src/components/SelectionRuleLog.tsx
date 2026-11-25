import { type ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { rebuildCohortsReportQuery, selectionDecisionsQuery } from "@/src/api/queries";
import type { SelectionDecisionRecord, SelectionRule } from "@/src/api/selection-decisions-schema";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatSelection } from "@/src/utils/format";
import { formatQuote, formatRatio, formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { istanbulDay, resolvePeriod, type LogPeriodChoice } from "@/src/utils/rebuild-log";
import { ResultPill, TonePill, toneColor } from "./DecisionTicket";
import { resultFilters, resultOptions } from "./DailyCouponLog";
import type { CouponResultFilter } from "./daily-coupon-view";
import { SegmentedControl } from "./FilterControls";
import { RatingStars } from "./RatingStars";
import { Action, Card } from "./RebuildEvidencePanel";
import { EmptyState, LoadingState } from "./StateView";
import { LogOutcomeSummary } from "./LogOutcomeSummary";
import { LogPeriodControl } from "./LogPeriodControl";
import { LogToolbar } from "./LogToolbar";
import { SurfaceMaterial } from "./SurfaceMaterial";

const istanbulTime = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function ratio(value: string | null): number | null {
  return value === null ? null : Number(value);
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
          {/* The header reads as on Şampiyon cards (stars, score, result). How the
              decision was recorded moves to the meta line: a green CANLI pill
              beside a settled result read as a match still in play. */}
          <RatingStars rating={record.stars} size={14} />
        </View>
        <View style={styles.rowStart}>
          {final ? <Text style={styles.finalScore}>{final}</Text> : null}
          <ResultPill state={record.result.state} />
        </View>
      </View>
      <Text numberOfLines={2} style={styles.team}>{teams}</Text>
      <Text numberOfLines={2} style={styles.meta}>
        {[record.league || null, `${istanbulTime.format(new Date(record.evaluatedAt))} karar`, record.live ? "canlı kayıt" : "sonradan kayıt"].filter(Boolean).join(" · ")}
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
export function SelectionRuleLog({ rule, ruleControl }: { rule: SelectionRule; ruleControl?: ReactNode }) {
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [choice, setChoice] = useState<LogPeriodChoice>({ kind: "today" });
  const [periodOpen, setPeriodOpen] = useState(false);
  const [result, setResult] = useState<CouponResultFilter>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const { data: report } = useQuery(rebuildCohortsReportQuery);
  const today = istanbulDay(report ? Date.parse(report.asOf) : openedAt);
  const period = resolvePeriod(choice, today);
  const query = useQuery(selectionDecisionsQuery(rule, period.through, period.days, period.through === today));
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
  const toolbar = (
    <LogToolbar
      wide={wide}
      period={<LogPeriodControl align={wide ? "right" : "left"} choice={choice} onChange={setChoice}
        onOpenChange={setPeriodOpen} open={periodOpen} period={period} today={today} />}
      results={query.isLoading || value?.availability === "AVAILABLE" ? (
        <SegmentedControl fill={!wide} label="Sonuç" onChange={(next) => { setPeriodOpen(false); setResult(next); }}
          options={value ? resultOptions(counts) : resultFilters} value={result} />
      ) : null}
    >
      {ruleControl}
    </LogToolbar>
  );
  const coverage = value?.coverage;
  const note = "Varsayımsal: her maçta kuralın ilk kararı, ilk orana 1 birim. Kapsam dışı maçlar, ilk döngüsü temiz başlamayan maçlardır. Şampiyonun yerine geçmez; karşılaştırma içindir.";

  if (query.isLoading) return <View style={styles.stack}>{toolbar}<LoadingState label="Kural kararları hazırlanıyor" /></View>;
  if (query.isError || !value) {
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
  if (value.availability !== "AVAILABLE" || !value.summary) {
    return (
      <View style={styles.stack}>
        {toolbar}
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
      <LogOutcomeSummary counts={summary} hitRate={formatRatio(ratio(summary.hitRate))} net={summary.net}
        netLabel="Net birim" roi={formatRatio(ratio(summary.roi))} wide={wide} />
      {coverage ? (
        <View style={styles.coverage}>
          <Text style={styles.ruleName}>{value.ruleLabel}</Text>
          <Text style={styles.scopeText}>
            {`${coverage.fixtures} maç · ${coverage.decided} karar · ${coverage.tracking} izleniyor · ${coverage.notEnrolled} kapsam dışı${coverage.stopped ? ` · ${coverage.stopped} durdu` : ""}`}
          </Text>
        </View>
      ) : null}
      <Text style={styles.scopeText}>
        {`${visible.length} / ${summary.decisions} karar · ort. oran ${formatQuote(summary.averageQuote)}${summary.live ? ` · ${summary.live} canlı kayıt` : ""}`}
      </Text>
      <Text style={styles.note}>{`${note}${result === "ALL" ? "" : " · Özet seçili dönemin tüm kararlarını gösterir"}`}</Text>
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
          {visible.length ? (
            <View style={styles.grid}>
              {visible.map((record) => (
                <View key={record.decisionId} style={styles.gridItem}><DecisionCard record={record} /></View>
              ))}
            </View>
          ) : empty}
        </ScrollView>
      ) : (
        <FlatList
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListEmptyComponent={empty}
          ListHeaderComponent={header}
          contentContainerStyle={styles.pageList}
          data={visible}
          keyExtractor={(record) => record.decisionId}
          onScrollBeginDrag={closePeriod}
          refreshControl={refreshControl}
          renderItem={({ item }) => <DecisionCard record={item} />}
          showsVerticalScrollIndicator={false}
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
  coverage: { gap: 2 },
  ruleName: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  scopeText: { color: colors.textMuted, ...typeScale.meta },
  note: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  pageList: { paddingBottom: 112 },
  wideContent: { gap: spacing.md, paddingBottom: spacing.xxl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { flexBasis: "31.5%", minWidth: 0 },
  cardGap: { height: 12 },
  flexCopy: { flex: 1, minWidth: 0 },
  card: { gap: spacing.sm, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  rowBetween: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
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
