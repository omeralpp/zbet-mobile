import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { rebuildCohortsReportQuery } from "@/src/api/queries";
import type { RebuildCohortsReport, RebuildRecommendation } from "@/src/api/rebuild-schemas";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { useSuperStarFilter } from "@/src/preferences/SuperStarFilterProvider";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { starFilterMinRating, starMetricLabel } from "@/src/utils/decision-filters";
import { formatSelection } from "@/src/utils/format";
import { rebuildReason } from "@/src/utils/rebuild-current";
import { formatQuote, formatReportRange, formatUnits, resultPresentation, unitsTone } from "@/src/utils/rebuild-display";
import {
  combinedReport,
  defaultLogSort,
  evidenceLine,
  filterLog,
  logSummary,
  nextLogSort,
  periodRecords,
  publishedParts,
  sortLog,
  type LogColumn,
  type LogSort,
  type LogSummary
} from "@/src/utils/rebuild-log";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { refreshPerformanceWidgetFromApi } from "@/src/widgets/performance-widget";
import { DecisionFilterChip } from "./DecisionFilterChip";
import { ListPerforation, ResultPill, TonePill, toneColor } from "./DecisionTicket";
import { FilterChip } from "./FilterChip";
import { LocalTabPager } from "./LocalTabPager";
import { RatingStars } from "./RatingStars";
import { Action, Card, RebuildReportDetails } from "./RebuildEvidencePanel";
import { EmptyState, LoadingState } from "./StateView";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { TeamLogo } from "./TeamLogo";

type Days = "today" | "yesterday";
const periodLabel = (day: Days) => day === "today" ? "Bugün" : "Dün";

const localTabs = ["ALL", "STAR"] as const;

/** Opens a record's Super kararı page; the match key lets it load the match. */
function useOpenDecision() {
  const router = useRouter();
  return (record: RebuildRecommendation) =>
    router.push({ pathname: "/super/[key]", params: { key: record.decisionId, match: record.matchKey } } as never);
}

/** Daily report scopes, both using the server's Istanbul calendar boundaries. */
function PeriodMenu({ days, open, onOpenChange, onChange }: { days: Days; open: boolean; onOpenChange: (open: boolean) => void; onChange: (days: Days) => void }) {
  return (
    <View style={[styles.periodWrapper, open && styles.periodWrapperOpen]}>
      <Pressable
        accessibilityLabel={`Dönem: ${periodLabel(days)}, İstanbul saati`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => onOpenChange(!open)}
        style={({ pressed, hovered }) => [styles.periodButton, hovered && styles.hover, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons color={semantic.intelligence} name="calendar-blank-outline" size={iconSizes.small} />
        <Text style={styles.periodText}>{periodLabel(days)}</Text>
        <MaterialCommunityIcons color={semantic.intelligence} name={open ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
      </Pressable>
      {open ? (
        <View accessibilityRole="menu" style={styles.periodMenu}>
          {(["today", "yesterday"] as const).map((option) => {
            const selected = option === days;
            return (
              <Pressable
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                key={option}
                onPress={() => {
                  onOpenChange(false);
                  onChange(option);
                }}
                style={({ pressed }) => [styles.periodOption, selected && styles.periodOptionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>{periodLabel(option)}</Text>
                {selected ? <MaterialCommunityIcons color={colors.onAction} name="check" size={iconSizes.inline} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** "1 kazandı · 1 kaybetti · 1 bekliyor" with the outcomes in their own colours. */
function OutcomeLine({ summary }: { summary: LogSummary }) {
  const extra = [summary.unresolved ? `${summary.unresolved} çözülemedi` : null, summary.voids ? `${summary.voids} iptal` : null].filter(Boolean);
  return (
    <Text style={styles.summaryLine}>
      <Text style={[styles.summaryStrong, { color: semantic.positive }]}>{summary.wins} kazandı</Text>
      {" · "}
      <Text style={[styles.summaryStrong, { color: semantic.negative }]}>{summary.losses} kaybetti</Text>
      {` · ${summary.pending} bekliyor`}
      {extra.length ? ` · ${extra.join(" · ")}` : ""}
    </Text>
  );
}

/** The board's decision card: stars and outcome, the match, why, then the frozen price against the result. */
export function RebuildDecisionCard({ record, onPress, cohortLabel }: { record: RebuildRecommendation; onPress: () => void; cohortLabel?: string | undefined }) {
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  const published = publishedParts(record.publishedAt);
  const pending = record.result.state === "PENDING";
  return (
    <Pressable
      accessibilityHint="Super kararı sayfasını açar"
      accessibilityLabel={`${record.homeTeam} – ${record.awayTeam}, ${formatSelection(record.market)}, ${record.stars} yıldız, ${resultPresentation[record.result.state].label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.card, hovered && styles.cardHover, pressed && styles.pressed]}
    >
      <SurfaceMaterial accent={pending ? semantic.intelligence : undefined} radius={20} />
      <View style={styles.rowBetween}>
        <RatingStars rating={record.stars} size={14} />
        <ResultPill state={record.result.state} />
      </View>
      <View style={styles.teams}>
        <TeamLogo name={record.homeTeam} size="compact" />
        <Text numberOfLines={1} style={styles.team}>{record.homeTeam}</Text>
        <Text style={styles.dash}>–</Text>
        <TeamLogo name={record.awayTeam} size="compact" />
        <Text numberOfLines={1} style={styles.team}>{record.awayTeam}</Text>
      </View>
      <Text style={styles.meta}>{published.day} · {published.time}{cohortLabel ? ` · Sürüm ${cohortLabel}` : ""}</Text>
      <Text style={styles.evidenceMeta}>{evidenceLine(record)}</Text>
      <View style={styles.cardFoot}>
        <View style={styles.cardMarket}>
          <Text style={styles.market}>{formatSelection(record.market)}</Text>
          <Text style={styles.footLabel}>{record.minute}′ seçim · {record.homeScore}–{record.awayScore}</Text>
        </View>
        <View style={styles.figure}>
          <Text style={styles.quote}>{formatQuote(record.quote)}</Text>
          <Text style={styles.footLabel}>seçim oranı</Text>
        </View>
        <ListPerforation height={40} />
        <View style={[styles.figure, styles.units]}>
          <Text style={[styles.net, { color: tone === "neutral" ? colors.textMuted : toneColor[tone] }]}>{formatUnits(record.result.net)}</Text>
          <Text style={styles.footLabel}>birim</Text>
        </View>
      </View>
    </Pressable>
  );
}

const tableColumns: readonly { id: LogColumn | null; label: string; flex: number; align?: "right" | "center" }[] = [
  { id: "publishedAt", label: "Karar", flex: 1 },
  { id: null, label: "Maç", flex: 2.4 },
  { id: "minute", label: "Dk", flex: 0.5, align: "right" },
  { id: null, label: "Market", flex: 1.3 },
  { id: "stars", label: "Yıldız", flex: 0.9 },
  { id: "quote", label: "Seçim oranı", flex: 0.9, align: "right" },
  { id: null, label: "Kanıt", flex: 1.6 },
  { id: null, label: "Sonuç", flex: 1, align: "center" },
  { id: "net", label: "Birim", flex: 0.7, align: "right" }
];

/** Desktop Karar günlüğü (platform exception): the same records as a sortable table. */
function DecisionTable({ records, labels, sort, onSort, onOpen }: { records: readonly RebuildRecommendation[]; labels: ReadonlyMap<string, string>; sort: LogSort; onSort: (column: LogColumn) => void; onOpen: (record: RebuildRecommendation) => void }) {
  return (
    <View aria-label="Karar günlüğü" role="table" style={styles.table}>
      <View role="row" style={[styles.tableRow, styles.tableHead]}>
        {tableColumns.map((column) => {
          const active = column.id !== null && sort.column === column.id;
          const cellStyle = [styles.tableCell, { flex: column.flex }, column.align === "right" && styles.alignRight, column.align === "center" && styles.alignCenter];
          return (
            <View aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} key={column.label} role="columnheader" style={cellStyle}>
              {column.id === null ? (
                <Text style={styles.headText}>{column.label}</Text>
              ) : (
                <Pressable
                  accessibilityLabel={`${column.label} sütununa göre sırala`}
                  accessibilityRole="button"
                  onPress={() => onSort(column.id!)}
                  style={({ hovered }) => [styles.headAction, column.align === "right" && styles.alignRight, hovered && styles.hover]}
                >
                  <Text style={[styles.headText, active && styles.headActive]}>{column.label}</Text>
                  {active ? <MaterialCommunityIcons color={semantic.intelligence} name={sort.direction === "asc" ? "arrow-up" : "arrow-down"} size={iconSizes.micro} /> : null}
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
      {records.map((record, index) => {
        const published = publishedParts(record.publishedAt);
        const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
        return (
          <Pressable
            accessibilityHint="Super kararı sayfasını açar"
            accessibilityLabel={`${record.homeTeam} – ${record.awayTeam}, ${formatSelection(record.market)}, ${resultPresentation[record.result.state].label}`}
            accessibilityRole="link"
            key={record.decisionId}
            onPress={() => onOpen(record)}
            role="row"
            style={({ hovered }) => [styles.tableRow, index % 2 === 1 && styles.zebra, record.result.state === "PENDING" && styles.rowOpen, hovered && styles.hover]}
          >
            <View role="cell" style={[styles.tableCell, styles.stackCell, { flex: 1 }]}>
              <Text style={styles.cellStrong}>{published.time}</Text>
              <Text style={styles.cellMeta}>{published.day}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, styles.stackCell, { flex: 2.4 }]}>
              <Text style={styles.cellStrong}>{record.homeTeam} – {record.awayTeam}</Text>
              <Text style={styles.cellMeta}>karar anında {record.homeScore}–{record.awayScore}{labels.get(record.decisionId) ? ` · ${labels.get(record.decisionId)}` : ""}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignRight, { flex: 0.5 }]}>
              <Text style={styles.cellNumber}>{record.minute}′</Text>
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 1.3 }]}>
              <Text numberOfLines={2} style={styles.cellMarket}>{formatSelection(record.market)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 0.9 }]}>
              <RatingStars rating={record.stars} size={12} />
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignRight, { flex: 0.9 }]}>
              <Text style={styles.cellNumber}>{formatQuote(record.quote)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 1.6 }]}>
              <Text style={styles.cellMeta}>{evidenceLine(record)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignCenter, { flex: 1 }]}>
              <ListPerforation height={28} />
              <ResultPill state={record.result.state} />
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignRight, { flex: 0.7 }]}>
              <Text style={[styles.cellNumber, styles.cellNet, { color: tone === "neutral" ? colors.textMuted : toneColor[tone] }]}>{formatUnits(record.result.net)}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tile({ value, label, color, children }: { value?: string; label: string; color?: string | undefined; children?: ReactNode }) {
  return (
    <View style={styles.tile}>
      <SurfaceMaterial radius={16} />
      {children ?? <Text numberOfLines={1} style={[styles.tileValue, color ? { color } : null]}>{value}</Text>}
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

/**
 * Karar günlüğü on RB1 data, in the v40 board's layout: every published
 * record of today or yesterday in Istanbul, filtered by star floor or
 * pending result. The list spans every accepted policy cohort, each record
 * tagged with its cohort; the summary, tiles and "Rapor ayrıntısı" are the
 * backend's figures over all of them (a star scope adds its per-star rows;
 * owner decision 2026-10-22).
 */
export function RebuildDecisionLog() {
  const query = useQuery(rebuildCohortsReportQuery);
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const openDecision = useOpenDecision();
  const { filter: starFilter, setFilter: setStarFilter } = useSuperStarFilter();
  const [tab, setTab] = useState<"ALL" | "STAR">("ALL");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [days, setDays] = useState<Days>("today");
  const [starMenuOpen, setStarMenuOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tableSort, setTableSort] = useState<LogSort>(defaultLogSort);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try { await query.refetch(); } finally { setRefreshing(false); }
  };
  useEffect(() => {
    if (Platform.OS !== "web" || (!starMenuOpen && !periodOpen)) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPeriodOpen(false); setStarMenuOpen(false); }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [periodOpen, starMenuOpen]);
  const full = query.data;
  const report = useMemo(() => (full ? combinedReport(full) : null), [full]);
  const period = report?.periods.find((item) => item.key === days);
  const available = !query.isError && full?.availability === "AVAILABLE" && period ? period : null;
  const labels = useMemo(() => cohortLabels(full), [full]);
  const minStars = starFilterMinRating(starFilter);
  const records = useMemo(() => (full && available ? periodRecords(full, available) : []), [available, full]);
  const counts = {
    all: records.length,
    star: filterLog(records, { minStars, pendingOnly: false }).length,
    pending: filterLog(records, { minStars: tab === "STAR" ? minStars : null, pendingOnly: true }).length
  };
  const visible = sortLog(
    filterLog(records, { minStars: tab === "STAR" ? minStars : null, pendingOnly }),
    tableSort
  );
  const closeMenus = () => {
    setStarMenuOpen(false);
    setPeriodOpen(false);
  };

  if (query.isLoading) {
    return (
      <View style={styles.phoneHead}>
        <LoadingState label="Karar günlüğü hazırlanıyor" />
      </View>
    );
  }

  const filters = (
    <TutorialTarget id="super-filters">
      <View style={styles.filters}>
        <FilterChip
          {...(available ? {count:counts.all} : {})}
          label="Tümü"
          onPress={() => {
            closeMenus();
            setTab("ALL");
            setPendingOnly(false);
          }}
          selected={tab === "ALL" && !pendingOnly}
        />
        <DecisionFilterChip
          active={tab === "STAR"}
          {...(available ? {count:counts.star} : {})}
          onActivate={() => setTab("STAR")}
          onChange={(value) => {
            setStarFilter(value);
            setTab("STAR");
            refreshPerformanceWidgetFromApi(value).catch((error: unknown) => {
              console.warn("Super tercihi widgeta uygulanamadı.", error);
            });
          }}
          onOpenChange={(open) => {
            setStarMenuOpen(open);
            if (open) setPeriodOpen(false);
          }}
          onSortChange={(value) => setTableSort(value === "DEFAULT" ? defaultLogSort : { column: "stars", direction: value === "RATING_ASC" ? "asc" : "desc" })}
          open={starMenuOpen}
          sortValue={tableSort.column === "stars" ? tableSort.direction === "asc" ? "RATING_ASC" : "RATING_DESC" : tableSort.column === "publishedAt" && tableSort.direction === "desc" ? "DEFAULT" : null}
          value={starFilter}
        />
        <FilterChip
          {...(available ? {count:counts.pending} : {})}
          dot={semantic.intelligence}
          label="Bekliyor"
          onPress={() => {
            closeMenus();
            setPendingOnly((value) => !value);
          }}
          selected={pendingOnly}
        />
      </View>
    </TutorialTarget>
  );

  const scope = (
    <View style={styles.scopeRow}>
      <Text style={styles.scopeText}>
        {available ? `${formatReportRange(available.from, available.through)} · ${visible.length} / ${records.length} karar${tab === "STAR" ? ` · ${starMetricLabel(starFilter)}` : ""}${pendingOnly ? " · bekliyor" : ""} · İstanbul` : query.isError || full?.availability === "UNAVAILABLE" ? "Rapor doğrulanamadı · kayıt sayısı bilinmiyor" : "Rapor bekleniyor"}
      </Text>
      <PeriodMenu
        days={days}
        onChange={(value) => {
          setDays(value);
          setDetailsOpen(false);
        }}
        onOpenChange={(open) => {
          setPeriodOpen(open);
          if (open) setStarMenuOpen(false);
        }}
        open={periodOpen}
      />
    </View>
  );

  if (!available || !report) {
    return (
      <View style={[styles.stack, styles.phoneHead]}>
        {filters}
        {scope}
        <Card>
          <View style={styles.waiting}>
            <TonePill dot label={query.isError || full?.availability === "UNAVAILABLE" ? "RAPOR DOĞRULANAMADI" : "RAPOR BEKLENİYOR"} tone={query.isError ? "neutral" : "warning"} />
            <Text style={styles.waitingText}>{query.isError ? "Veri alınamadı" : rebuildReason(full?.reason)}</Text>
            <Action icon="refresh" onPress={() => { void query.refetch(); }} title="Yenile" />
          </View>
        </Card>
      </View>
    );
  }

  const summary = logSummary(available, tab === "STAR" ? minStars : null);
  const netTone = unitsTone(summary.net);
  const empty = (
    <View style={styles.empty}>
      <EmptyState
        kind="NO_DECISION"
        message={records.length === 0 ? "Başka bir dönem seçerek geçmiş kararları inceleyebilirsin." : "Filtreleri temizleyerek bu dönemin tüm kararlarını görebilirsin."}
        title={records.length === 0 ? "Bu dönemde öneri yok" : pendingOnly ? "Bu filtrede bekleyen karar yok" : "Bu yıldız aralığında karar yok"}
      />
      {records.length > 0 ? <Action icon="chevron-right" onPress={() => { closeMenus(); setTab("ALL"); setPendingOnly(false); }} title="Tüm kararları göster" /> : <Action icon="chevron-right" onPress={() => { closeMenus(); setDays(days === "today" ? "yesterday" : "today"); }} title={days === "today" ? "Dünün kararlarını göster" : "Bugünün kararlarını göster"} />}
    </View>
  );
  const summaryContext = (
    <Text style={styles.tableNote}>
      {`Dönem özeti · ${tab === "STAR" ? starMetricLabel(starFilter) : "tüm yıldızlar"}. Karar başına 1 varsayımsal birim.`}
      {pendingOnly ? " Bekliyor filtresi yalnızca listeyi daraltır; özet tüm sonuçları içerir." : ""}
    </Text>
  );
  const details = (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: detailsOpen }}
        onPress={() => setDetailsOpen((open) => !open)}
        style={({ pressed, hovered }) => [styles.detailsToggle, hovered && styles.hover, pressed && styles.pressed]}
      >
        <View style={styles.flexCopy}>
          <Text style={styles.detailsTitle}>Rapor ayrıntısı</Text>
          <Text style={styles.detailsCaption}>ROI, isabet, risk ve yıldız / pazar kırılımları</Text>
        </View>
        <MaterialCommunityIcons color={semantic.intelligence} name={detailsOpen ? "chevron-up" : "chevron-down"} size={iconSizes.control} />
      </Pressable>
      {detailsOpen ? <RebuildReportDetails period={available} report={report} /> : null}
    </Card>
  );

  if (wide) {
    return (
      <ScrollView
        contentContainerStyle={styles.wideContent}
        refreshControl={<RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />}
        style={styles.wideScroll}
      >
        <View style={styles.wideToolbar}>
          {filters}
          {scope}
        </View>
        {summaryContext}
        <View style={styles.tiles}>
          <Tile label={`karar · ${formatReportRange(available.from, available.through)}`} value={String(summary.recommendations)} />
          <Tile color={semantic.intelligence} label="bekleyen karar" value={String(summary.pending)} />
          <Tile label="kazandı · kaybetti">
            <Text numberOfLines={1} style={styles.tileValue}>
              <Text style={{ color: semantic.positive }}>{summary.wins}</Text>
              <Text style={styles.tileDot}> · </Text>
              <Text style={{ color: semantic.negative }}>{summary.losses}</Text>
            </Text>
          </Tile>
          <Tile color={netTone === "neutral" ? undefined : toneColor[netTone]} label={`birim · ${tab === "STAR" ? starMetricLabel(starFilter) : "tümü"}`} value={formatUnits(summary.net)} />
        </View>
        {visible.length ? (
          <TutorialTarget id="super-first-card">
            <DecisionTable labels={labels} onOpen={openDecision} onSort={(column) => setTableSort((current) => nextLogSort(current, column))} records={visible} sort={tableSort} />
          </TutorialTarget>
        ) : empty}
        <Text style={styles.tableNote}>Sütun başlığı: sırala (varsayılan en yeni karar) · satır: karar sayfası · seçim oranı karar anında donmuştur</Text>
        {details}
      </ScrollView>
    );
  }

  // Phone: Tümü and the star page stay real sibling pages under one native
  // pager (the earlier owner decision), each its own list with its summary.
  return (
    <View style={styles.phone}>
      <View style={styles.phoneHead}>
        {filters}
        {scope}
      </View>
      <LocalTabPager
        activeKey={tab}
        onSelect={(next) => {
          closeMenus();
          setTab(next);
        }}
        renderPage={(page) => {
          const pageSummary = logSummary(available, page === "STAR" ? minStars : null);
          const pageRecords = sortLog(filterLog(records, { minStars: page === "STAR" ? minStars : null, pendingOnly }), tableSort);
          return (
            <FlatList
              ItemSeparatorComponent={CardGap}
              ListEmptyComponent={empty}
              ListFooterComponent={<View style={styles.footer}>{details}</View>}
              ListHeaderComponent={
                <View style={styles.summaryHeader}>
                  <SummaryCard
                    label={`${periodLabel(days).toLocaleUpperCase("tr-TR")} · ${page === "STAR" ? starMetricLabel(starFilter).toLocaleUpperCase("tr-TR") : "TÜMÜ"}`}
                    summary={pageSummary}
                  />
                  <Text style={styles.tableNote}>Karar başına 1 varsayımsal birim.{pendingOnly ? " Özet tüm sonuçları, liste yalnızca bekleyenleri içerir." : ""}</Text>
                </View>
              }
              contentContainerStyle={styles.pageList}
              data={pageRecords}
              keyExtractor={(record) => record.decisionId}
              onScrollBeginDrag={closeMenus}
              refreshControl={<RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />}
              renderItem={({ item, index }) =>
                page === tab && index === 0 ? (
                  <TutorialTarget id="super-first-card">
                    <RebuildDecisionCard cohortLabel={labels.get(item.decisionId)} onPress={() => openDecision(item)} record={item} />
                  </TutorialTarget>
                ) : (
                  <RebuildDecisionCard cohortLabel={labels.get(item.decisionId)} onPress={() => openDecision(item)} record={item} />
                )
              }
              showsVerticalScrollIndicator={false}
            />
          );
        }}
        tabs={localTabs}
      />
    </View>
  );
}

/** Each record's cohort name, so the shared log can tag it. */
function cohortLabels(report: RebuildCohortsReport | undefined): ReadonlyMap<string, string> {
  const names = new Map((report?.cohorts ?? []).map((item) => [item.id, item.label]));
  return new Map((report?.recommendations ?? []).map((record) => [record.decisionId, names.get(record.cohortId) ?? ""]));
}

function CardGap() {
  return <View style={styles.cardGap} />;
}

/** The board's scope summary: outcomes on the left, the net units on the right. */
function SummaryCard({ label, summary }: { label: string; summary: LogSummary }) {
  const tone = unitsTone(summary.net);
  return (
    <View style={styles.summary}>
      <SurfaceMaterial radius={16} />
      <View style={styles.flexCopy}>
        <Text style={styles.summaryEyebrow}>{label}</Text>
        <OutcomeLine summary={summary} />
      </View>
      <View style={styles.summaryFigure}>
        <Text style={[styles.summaryNet, { color: tone === "neutral" ? colors.text : toneColor[tone] }]}>{formatUnits(summary.net)}</Text>
        <Text style={styles.footLabel}>birim</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, width: "100%" },
  empty: { gap: spacing.sm, alignItems: "stretch" },
  summaryHeader: { gap: spacing.xs, marginBottom: spacing.md },
  phone: { flex: 1 },
  phoneHead: { gap: spacing.md, paddingBottom: spacing.md, zIndex: 20 },
  pageList: { paddingBottom: 112 },
  cardGap: { height: 12 },
  footer: { marginTop: 12 },
  wideScroll: { flex: 1 },
  wideContent: { gap: spacing.md, paddingBottom: spacing.xxl },
  flexCopy: { flex: 1, minWidth: 0 },
  evidenceMeta: { ...typeScale.label, color: colors.textMuted, lineHeight: 19 },
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  filters: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  scopeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, zIndex: 20 },
  scopeText: { flex: 1, color: colors.textMuted, ...typeScale.meta },
  wideToolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.lg, zIndex: 20 },
  periodWrapper: { position: "relative", zIndex: 10 },
  periodWrapperOpen: { zIndex: 40, elevation: 40 },
  periodButton: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  periodText: { color: semantic.intelligence, ...typeScale.bodyCompact, fontWeight: "700" },
  periodMenu: {
    position: "absolute",
    top: interaction.minTouchTarget + 6,
    right: 0,
    minWidth: 168,
    padding: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceStrong,
    ...shadows.card
  },
  periodOption: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  periodOptionSelected: { backgroundColor: colors.actionFill },
  periodOptionText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  periodOptionTextSelected: { color: colors.onAction },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  summaryEyebrow: { color: colors.textMuted, ...typeScale.eyebrow },
  summaryLine: { color: colors.text, ...typeScale.bodyCompact, marginTop: 2 },
  summaryStrong: { fontWeight: "800" },
  summaryFigure: { alignItems: "flex-end" },
  summaryNet: { ...typeScale.metric, fontSize: 26, lineHeight: 28, fontWeight: "800" },
  cards: { gap: 12 },
  card: { gap: spacing.sm, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  cardHover: { borderColor: colors.border },
  teams: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 },
  team: { flexShrink: 1, color: colors.text, ...typeScale.identity, fontWeight: "700" },
  dash: { color: colors.textMuted, ...typeScale.identity, fontWeight: "500" },
  meta: { color: colors.textMuted, ...typeScale.meta },
  cardFoot: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  cardMarket: { flex: 1, minWidth: 0 },
  market: { color: colors.text, ...typeScale.bodyCompact, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  figure: { alignItems: "flex-end" },
  units: { minWidth: 48 },
  quote: { color: colors.text, ...typeScale.metric },
  net: { ...typeScale.metric, fontWeight: "800" },
  footLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  waitingText: { color: colors.textMuted, ...typeScale.body },
  detailsToggle: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: interaction.minTouchTarget, borderRadius: radii.md, marginHorizontal: -spacing.sm, paddingHorizontal: spacing.sm },
  detailsTitle: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  detailsCaption: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  tiles: { flexDirection: "row", gap: spacing.md },
  tile: { flex: 1, minWidth: 0, gap: 2, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderSoft },
  tileValue: { color: colors.text, ...typeScale.metric, fontSize: 32, lineHeight: 36, fontWeight: "800" },
  tileDot: { color: colors.textMuted },
  tileLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  table: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.backgroundElevated, overflow: "hidden" },
  tableRow: { flexDirection: "row", alignItems: "center", minHeight: 64, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  tableHead: { minHeight: 44, backgroundColor: colors.background },
  zebra: { backgroundColor: `${colors.surface}40` },
  rowOpen: { backgroundColor: semantic.intelligenceSoft },
  tableCell: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0, paddingHorizontal: spacing.xs },
  stackCell: { flexDirection: "column", alignItems: "flex-start", gap: 0 },
  alignRight: { justifyContent: "flex-end" },
  alignCenter: { justifyContent: "center" },
  headAction: { flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radii.sm },
  headText: { color: colors.textSubtle, ...typeScale.micro, textTransform: "uppercase" },
  headActive: { color: colors.text },
  cellStrong: { color: colors.text, ...typeScale.identityCompact },
  cellMeta: { color: colors.textMuted, ...typeScale.meta },
  cellMarket: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  cellNumber: { color: colors.text, ...typeScale.metricCompact },
  cellNet: { fontWeight: "800" },
  tableNote: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 }
});
