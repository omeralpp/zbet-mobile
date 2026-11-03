import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { rebuildCohortsReportQuery, rebuildReportWindowQuery } from "@/src/api/queries";
import type { RebuildCohortsReport, RebuildLogRecord } from "@/src/api/rebuild-schemas";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { useSuperStarFilter } from "@/src/preferences/SuperStarFilterProvider";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { starFilterMinRating, starMetricLabel } from "@/src/utils/decision-filters";
import { formatSelection } from "@/src/utils/format";
import { rebuildReason } from "@/src/utils/rebuild-current";
import { formatQuote, formatRatio, formatReportRange, formatUnits, resultPresentation, unitsTone } from "@/src/utils/rebuild-display";
import {
  canStepDay,
  choiceForDay,
  combinedReport,
  defaultLogSort,
  evidenceCompact,
  evidenceLine,
  filterLog,
  finalScoreText,
  fixtureLine,
  istanbulDay,
  logSummary,
  namesUnverified,
  needsWindow,
  nextLogSort,
  periodRecords,
  periodTitle,
  publishedParts,
  resolvePeriod,
  sharedCohort,
  shiftDay,
  sortLog,
  type LogColumn,
  type LogPeriod,
  type LogPeriodChoice,
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

const localTabs = ["ALL", "STAR"] as const;

const periodOptions: readonly { choice: LogPeriodChoice; label: string }[] = [
  { choice: { kind: "today" }, label: "Bugün" },
  { choice: { kind: "yesterday" }, label: "Dün" },
  { choice: { kind: "last", days: 7 }, label: "Son 7 gün" },
  { choice: { kind: "last", days: 30 }, label: "Son 30 gün" }
];
const sameChoice = (a: LogPeriodChoice, b: LogPeriodChoice) => JSON.stringify(a) === JSON.stringify(b);

/** Opens a record's Super kararı page; the match key lets it load the match. */
function useOpenDecision() {
  const router = useRouter();
  return (record: RebuildLogRecord) =>
    router.push({ pathname: "/super/[key]", params: { key: record.decisionId, match: record.matchKey } } as never);
}

function StepButton({ icon, label, disabled, onPress }: { icon: "chevron-left" | "chevron-right"; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.stepButton, hovered && !disabled && styles.hover, pressed && styles.pressed, disabled && styles.stepDisabled]}
    >
      <MaterialCommunityIcons color={semantic.intelligence} name={icon} size={iconSizes.control} />
    </Pressable>
  );
}

/**
 * Istanbul calendar views from the backend's own day bounds: today, yesterday,
 * the last 7 or 30 days, and single days stepped back up to a year.
 */
function PeriodControl({ choice, period, today, open, onOpenChange, onChange }: {
  choice: LogPeriodChoice; period: LogPeriod; today: string; open: boolean; onOpenChange: (open: boolean) => void; onChange: (choice: LogPeriodChoice) => void;
}) {
  const title = periodTitle(period, today);
  const step = (delta: -1 | 1) => {
    onOpenChange(false);
    onChange(choiceForDay(shiftDay(period.through, delta), today));
  };
  return (
    <View style={[styles.periodWrapper, open && styles.periodWrapperOpen]}>
      <View style={styles.periodRow}>
        {period.days === 1 ? <StepButton disabled={!canStepDay(period, today, -1)} icon="chevron-left" label="Önceki gün" onPress={() => step(-1)} /> : null}
        <Pressable
          accessibilityLabel={`Dönem: ${title}, İstanbul saati`}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => onOpenChange(!open)}
          style={({ pressed, hovered }) => [styles.periodButton, hovered && styles.hover, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={semantic.intelligence} name="calendar-blank-outline" size={iconSizes.small} />
          <Text numberOfLines={1} style={styles.periodText}>{title}</Text>
          <MaterialCommunityIcons color={semantic.intelligence} name={open ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
        </Pressable>
        {period.days === 1 ? <StepButton disabled={!canStepDay(period, today, 1)} icon="chevron-right" label="Sonraki gün" onPress={() => step(1)} /> : null}
      </View>
      {open ? (
        <View accessibilityRole="menu" style={styles.periodMenu}>
          {periodOptions.map((option) => {
            const selected = sameChoice(option.choice, choice);
            return (
              <Pressable
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                key={option.label}
                onPress={() => {
                  onOpenChange(false);
                  onChange(option.choice);
                }}
                style={({ pressed }) => [styles.periodOption, selected && styles.periodOptionSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>{option.label}</Text>
                {selected ? <MaterialCommunityIcons color={colors.onAction} name="check" size={iconSizes.inline} /> : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/** "1 kazandı · 1 kaybetti · 1 bekliyor" with the outcomes in their own colours; empty extras left out. */
function OutcomeLine({ summary }: { summary: LogSummary }) {
  const extra = [summary.pending ? `${summary.pending} bekliyor` : null, summary.unresolved ? `${summary.unresolved} çözülemedi` : null,
    summary.voids ? `${summary.voids} iptal` : null].filter(Boolean);
  return (
    <Text style={styles.summaryLine}>
      <Text style={[styles.summaryStrong, { color: semantic.positive }]}>{summary.wins} kazandı</Text>
      {" · "}
      <Text style={[styles.summaryStrong, { color: semantic.negative }]}>{summary.losses} kaybetti</Text>
      {extra.length ? ` · ${extra.join(" · ")}` : ""}
    </Text>
  );
}

/** Team names, or an honest line when the backend could not prove them. */
function teamsText(record: RebuildLogRecord): string {
  return namesUnverified(record.match) ? "Takım adları doğrulanamadı" : `${record.homeTeam} – ${record.awayTeam}`;
}

/**
 * The board's decision card: stars, the settled score and outcome, the match
 * with its league and kickoff, why, then the frozen price against the result.
 * `day` adds the publication day in multi-day views; `cohortLabel` tags the
 * record only when the listed records mix policy cohorts.
 */
export function RebuildDecisionCard({ record, onPress, cohortLabel, day = false }: { record: RebuildLogRecord; onPress: () => void; cohortLabel?: string | undefined; day?: boolean }) {
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  const published = publishedParts(record.publishedAt);
  const pending = record.result.state === "PENDING";
  const unverified = namesUnverified(record.match);
  const fixture = fixtureLine(record.match), score = finalScoreText(record.match);
  return (
    <Pressable
      accessibilityHint="Super kararı sayfasını açar"
      accessibilityLabel={`${teamsText(record)}, ${formatSelection(record.market)}, ${record.stars} yıldız, ${resultPresentation[record.result.state].label}${score ? `, ${score}` : ""}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.card, hovered && styles.cardHover, pressed && styles.pressed]}
    >
      <SurfaceMaterial accent={pending ? semantic.intelligence : undefined} radius={20} />
      <View style={styles.rowBetween}>
        <RatingStars rating={record.stars} size={14} />
        <View style={styles.resultGroup}>
          {score ? <Text style={styles.finalScore}>{score}</Text> : null}
          <ResultPill state={record.result.state} />
        </View>
      </View>
      {unverified ? (
        <Text style={[styles.team, styles.unverified]}>Takım adları doğrulanamadı</Text>
      ) : (
        <View style={styles.teams}>
          <TeamLogo name={record.homeTeam} size="compact" />
          <Text numberOfLines={1} style={styles.team}>{record.homeTeam}</Text>
          <Text style={styles.dash}>–</Text>
          <TeamLogo name={record.awayTeam} size="compact" />
          <Text numberOfLines={1} style={styles.team}>{record.awayTeam}</Text>
        </View>
      )}
      {fixture ? <Text numberOfLines={1} style={styles.meta}>{fixture}</Text> : null}
      <Text style={styles.evidenceMeta}>
        {day ? `${published.day} · ` : ""}{published.time} karar{cohortLabel ? ` · Sürüm ${cohortLabel}` : ""} · {evidenceLine(record)}
      </Text>
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
  { id: "publishedAt", label: "Karar", flex: 0.8 },
  { id: null, label: "Maç", flex: 2.5 },
  { id: "minute", label: "Dk", flex: 0.6, align: "right" },
  { id: null, label: "Market", flex: 1.6 },
  { id: "stars", label: "Yıldız", flex: 0.9 },
  { id: "quote", label: "Seçim oranı", flex: 0.9, align: "right" },
  { id: null, label: "Baskı · havuz", flex: 1, align: "right" },
  { id: null, label: "Sonuç", flex: 1.2, align: "center" },
  { id: "net", label: "Birim", flex: 0.7, align: "right" }
];

/**
 * Desktop Karar günlüğü (platform exception): the same records as a sortable
 * table. A row is a table row; its match name is the link (keyboard and
 * screen readers), and a click anywhere on the row opens the same page.
 */
function DecisionTable({ records, labels, mixed, multiDay, sort, onSort, onOpen }: {
  records: readonly RebuildLogRecord[]; labels: ReadonlyMap<string, string>; mixed: boolean; multiDay: boolean; sort: LogSort;
  onSort: (column: LogColumn) => void; onOpen: (record: RebuildLogRecord) => void;
}) {
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
        const unverified = namesUnverified(record.match);
        const score = finalScoreText(record.match);
        const context = [fixtureLine(record.match), mixed ? labels.get(record.decisionId) || null : null].filter(Boolean).join(" · ");
        return (
          <Pressable
            tabIndex={-1}
            key={record.decisionId}
            onPress={() => onOpen(record)}
            role="row"
            style={({ hovered }) => [styles.tableRow, index % 2 === 1 && styles.zebra, record.result.state === "PENDING" && styles.rowOpen, hovered && styles.hover]}
          >
            <View role="cell" style={[styles.tableCell, styles.stackCell, { flex: 0.8 }]}>
              <Text style={styles.cellStrong}>{published.time}</Text>
              {multiDay ? <Text style={styles.cellMeta}>{published.day}</Text> : null}
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 2.5 }]}>
              <Pressable
                accessibilityHint="Super kararı sayfasını açar"
                accessibilityLabel={`${teamsText(record)}, ${formatSelection(record.market)}, ${resultPresentation[record.result.state].label}${score ? `, ${score}` : ""}`}
                onPress={() => onOpen(record)}
                role="link"
                style={({ hovered }) => [styles.matchLink, hovered && styles.matchLinkHover]}
              >
                <Text numberOfLines={1} style={[styles.cellStrong, unverified && styles.unverified]}>{teamsText(record)}</Text>
                {context ? <Text numberOfLines={1} style={styles.cellMeta}>{context}</Text> : null}
              </Pressable>
            </View>
            <View role="cell" style={[styles.tableCell, styles.stackCell, styles.stackEnd, { flex: 0.6 }]}>
              <Text style={styles.cellNumber}>{record.minute}′</Text>
              <Text style={styles.cellMeta}>{record.homeScore}–{record.awayScore}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 1.6 }]}>
              <Text numberOfLines={2} style={styles.cellMarket}>{formatSelection(record.market)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, { flex: 0.9 }]}>
              <RatingStars rating={record.stars} size={12} />
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignRight, { flex: 0.9 }]}>
              <Text style={styles.cellNumber}>{formatQuote(record.quote)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignRight, { flex: 1 }]}>
              <Text numberOfLines={1} style={styles.cellEvidence}>{evidenceCompact(record)}</Text>
            </View>
            <View role="cell" style={[styles.tableCell, styles.alignCenter, { flex: 1.2 }]}>
              <ListPerforation height={28} />
              <View style={styles.resultCell}>
                <ResultPill state={record.result.state} />
                {score ? <Text style={styles.cellMeta}>{score}</Text> : null}
              </View>
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
      <Text numberOfLines={1} style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

/**
 * Karar günlüğü on RB1 data, in the v40 board's layout: every published
 * record of the chosen Istanbul period, filtered by star floor or pending
 * result. Today and yesterday share the app's daily report; other days and
 * the 7/30-day views read their own backend window. The list spans every
 * accepted policy cohort, named once when they all share one; the summary,
 * tiles and "Rapor ayrıntısı" are the backend's figures over all of them (a
 * star scope adds its per-star rows; owner decision 2026-10-22).
 */
export function RebuildDecisionLog() {
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const openDecision = useOpenDecision();
  const { filter: starFilter, setFilter: setStarFilter } = useSuperStarFilter();
  const [tab, setTab] = useState<"ALL" | "STAR">("ALL");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [choice, setChoice] = useState<LogPeriodChoice>({ kind: "today" });
  const [starMenuOpen, setStarMenuOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tableSort, setTableSort] = useState<LogSort>(defaultLogSort);
  const [refreshing, setRefreshing] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const daily = useQuery(rebuildCohortsReportQuery);
  // The backend's clock decides the Istanbul day (its periods use it); the
  // shared report refreshes every 30 s, so "Bugün" rolls over at midnight.
  const today = istanbulDay(daily.data ? Date.parse(daily.data.asOf) : openedAt);
  const period = resolvePeriod(choice, today);
  const ownWindow = needsWindow(period, today);
  const windowed = useQuery({ ...rebuildReportWindowQuery(period.days, period.through, period.through === today), enabled: ownWindow });
  const query = ownWindow ? windowed : daily;
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
  const found = full?.periods.find((item) => item.days === period.days && item.through === period.through);
  const available = !query.isError && full?.availability === "AVAILABLE" && found ? found : null;
  const labels = useMemo(() => cohortLabels(full), [full]);
  const minStars = starFilterMinRating(starFilter);
  const records = useMemo<RebuildLogRecord[]>(() => (full && available ? periodRecords(full, available) : []), [available, full]);
  const counts = {
    all: records.length,
    star: filterLog(records, { minStars, pendingOnly: false }).length,
    pending: filterLog(records, { minStars: tab === "STAR" ? minStars : null, pendingOnly: true }).length
  };
  const visible = sortLog(
    filterLog(records, { minStars: tab === "STAR" ? minStars : null, pendingOnly }),
    tableSort
  );
  // One cohort for every listed record is named once in the scope line.
  const cohort = sharedCohort(records, labels);
  const multiDay = period.days > 1;
  const updated = full ? publishedParts(full.asOf).time : null;
  const closeMenus = () => {
    setStarMenuOpen(false);
    setPeriodOpen(false);
  };
  const changePeriod = (next: LogPeriodChoice) => {
    setChoice(next);
    setDetailsOpen(false);
  };

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

  const scopeText = available
    ? [formatReportRange(available.from, available.through), `${visible.length} / ${records.length} karar`, tab === "STAR" ? starMetricLabel(starFilter) : null,
      pendingOnly ? "bekliyor" : null, cohort ? `Sürüm ${cohort}` : null].filter(Boolean).join(" · ")
    : query.isLoading ? "Rapor yükleniyor" : query.isError || full?.availability === "UNAVAILABLE" ? "Rapor doğrulanamadı · kayıt sayısı bilinmiyor" : "Rapor bekleniyor";
  const periodControl = (
    <PeriodControl
      choice={choice}
      onChange={changePeriod}
      onOpenChange={(open) => {
        setPeriodOpen(open);
        if (open) setStarMenuOpen(false);
      }}
      open={periodOpen}
      period={period}
      today={today}
    />
  );
  const scope = wide ? (
    <View style={styles.scopeWide}>
      <Text style={styles.scopeText}>{scopeText}</Text>
      {periodControl}
    </View>
  ) : (
    <View style={styles.scopeRow}>
      {periodControl}
      <Text style={styles.scopeText}>{scopeText}</Text>
    </View>
  );

  if (query.isLoading || !available || !report) {
    const failed = query.isError || full?.availability === "UNAVAILABLE";
    return (
      <View style={[styles.stack, styles.phoneHead]}>
        {wide ? <View style={styles.wideToolbar}>{filters}{scope}</View> : <>{filters}{scope}</>}
        {query.isLoading ? (
          <Card><LoadingState label="Karar günlüğü hazırlanıyor" /></Card>
        ) : (
          <Card>
            <View style={styles.waiting}>
              <TonePill dot label={failed ? "RAPOR DOĞRULANAMADI" : "RAPOR BEKLENİYOR"} tone={query.isError ? "neutral" : "warning"} />
              <Text style={styles.waitingText}>{query.isError ? "Veri alınamadı" : rebuildReason(full?.reason)}</Text>
              <Action icon="refresh" onPress={() => { void query.refetch(); }} title="Yenile" />
            </View>
          </Card>
        )}
      </View>
    );
  }

  const summary = logSummary(available, tab === "STAR" ? minStars : null);
  const netTone = unitsTone(summary.net);
  const stepBack = period.days === 1 && canStepDay(period, today, -1);
  const empty = (
    <View style={styles.empty}>
      <EmptyState
        kind="NO_DECISION"
        message={records.length === 0 ? "Başka bir dönem seçerek geçmiş kararları inceleyebilirsin." : "Filtreleri temizleyerek bu dönemin tüm kararlarını görebilirsin."}
        title={records.length === 0 ? "Bu dönemde karar yok" : pendingOnly ? "Bu filtrede bekleyen karar yok" : "Bu yıldız aralığında karar yok"}
      />
      {records.length > 0 ? (
        <Action icon="chevron-right" onPress={() => { closeMenus(); setTab("ALL"); setPendingOnly(false); }} title="Tüm kararları göster" />
      ) : stepBack ? (
        <Action icon="chevron-right" onPress={() => { closeMenus(); changePeriod(choiceForDay(shiftDay(period.through, -1), today)); }} title={period.through === today ? "Dünün kararlarını göster" : "Önceki günü göster"} />
      ) : null}
    </View>
  );
  const note = `Karar başına 1 varsayımsal birim${updated ? ` · güncellendi ${updated}` : ""}.${pendingOnly ? " Özet tüm sonuçları, liste yalnızca bekleyenleri içerir." : ""}`;
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
          <Text style={styles.detailsCaption}>Yıldıza ve pazara göre sonuçlar, ROI aralığı</Text>
        </View>
        <MaterialCommunityIcons color={semantic.intelligence} name={detailsOpen ? "chevron-up" : "chevron-down"} size={iconSizes.control} />
      </Pressable>
      {detailsOpen ? <RebuildReportDetails columns={wide} period={available} report={report} /> : null}
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
        <View style={styles.tiles}>
          <Tile color={netTone === "neutral" ? undefined : toneColor[netTone]} label={`birim · ${tab === "STAR" ? starMetricLabel(starFilter) : "tüm yıldızlar"}`} value={formatUnits(summary.net)} />
          <Tile label="ROI · birim başına" value={formatRatio(summary.roi)} />
          <Tile label={`isabet · ${summary.settled} sonuç`} value={formatRatio(summary.hitRate)} />
          <Tile label={["kazandı · kaybetti", summary.pending ? `${summary.pending} bekliyor` : null, summary.unresolved ? `${summary.unresolved} çözülemedi` : null,
            summary.voids ? `${summary.voids} iptal` : null].filter(Boolean).join(" · ")}>
            <Text numberOfLines={1} style={styles.tileValue}>
              <Text style={{ color: semantic.positive }}>{summary.wins}</Text>
              <Text style={styles.tileDot}> · </Text>
              <Text style={{ color: semantic.negative }}>{summary.losses}</Text>
            </Text>
          </Tile>
        </View>
        <Text style={styles.tableNote}>{note}</Text>
        {visible.length ? (
          <TutorialTarget id="super-first-card">
            <DecisionTable
              labels={labels}
              mixed={!cohort}
              multiDay={multiDay}
              onOpen={openDecision}
              onSort={(column) => setTableSort((current) => nextLogSort(current, column))}
              records={visible}
              sort={tableSort}
            />
          </TutorialTarget>
        ) : empty}
        <Text style={styles.tableNote}>Sütun başlığı sıralar (varsayılan en yeni karar) · satır karar sayfasını açar · seçim oranı karar anında donmuştur · MS: normal sürede kesinleşen skor</Text>
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
          const card = (item: RebuildLogRecord) => (
            <RebuildDecisionCard cohortLabel={cohort ? undefined : labels.get(item.decisionId)} day={multiDay} onPress={() => openDecision(item)} record={item} />
          );
          return (
            <FlatList
              ItemSeparatorComponent={CardGap}
              ListEmptyComponent={empty}
              ListFooterComponent={<View style={styles.footer}>{details}</View>}
              ListHeaderComponent={
                <View style={styles.summaryHeader}>
                  <SummaryCard scope={page === "STAR" ? starMetricLabel(starFilter) : null} summary={pageSummary} />
                  <Text style={styles.tableNote}>{note}</Text>
                </View>
              }
              contentContainerStyle={styles.pageList}
              data={pageRecords}
              keyExtractor={(record) => record.decisionId}
              onScrollBeginDrag={closeMenus}
              refreshControl={<RefreshControl colors={[colors.gold]} onRefresh={() => { void refresh(); }} refreshing={refreshing} tintColor={colors.gold} />}
              renderItem={({ item, index }) =>
                page === tab && index === 0 ? <TutorialTarget id="super-first-card">{card(item)}</TutorialTarget> : card(item)
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

/** The scope summary: outcomes and the report's ratios on the left, the net units on the right. */
function SummaryCard({ scope, summary }: { scope: string | null; summary: LogSummary }) {
  const tone = unitsTone(summary.net);
  return (
    <View style={styles.summary}>
      <SurfaceMaterial radius={16} />
      <View style={styles.flexCopy}>
        <OutcomeLine summary={summary} />
        <Text style={styles.summaryRatios}>{scope ? `${scope} · ` : ""}ROI {formatRatio(summary.roi)} · isabet {formatRatio(summary.hitRate)}</Text>
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
  resultGroup: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  finalScore: { color: colors.text, ...typeScale.metricCompact },
  filters: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  scopeRow: { gap: spacing.sm, zIndex: 20 },
  scopeWide: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.md, flexShrink: 1, zIndex: 20 },
  scopeText: { flexShrink: 1, color: colors.textMuted, ...typeScale.meta },
  wideToolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.lg, zIndex: 20 },
  periodWrapper: { position: "relative", zIndex: 10, alignSelf: "flex-start" },
  periodWrapperOpen: { zIndex: 40, elevation: 40 },
  periodRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
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
  stepButton: {
    width: interaction.minTouchTarget,
    height: interaction.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  stepDisabled: { opacity: 0.38 },
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
  summaryLine: { color: colors.text, ...typeScale.bodyCompact },
  summaryRatios: { color: colors.textMuted, ...typeScale.meta, marginTop: 2 },
  summaryStrong: { fontWeight: "800" },
  summaryFigure: { alignItems: "flex-end" },
  summaryNet: { ...typeScale.metric, fontSize: 26, lineHeight: 28, fontWeight: "800" },
  card: { gap: spacing.sm, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  cardHover: { borderColor: colors.border },
  teams: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 },
  team: { flexShrink: 1, color: colors.text, ...typeScale.identity, fontWeight: "700" },
  unverified: { color: colors.textMuted, fontStyle: "italic", fontWeight: "600" },
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
  stackEnd: { alignItems: "flex-end" },
  alignRight: { justifyContent: "flex-end" },
  alignCenter: { justifyContent: "center" },
  matchLink: { flex: 1, minWidth: 0, minHeight: interaction.minTouchTarget, justifyContent: "center", borderRadius: radii.sm },
  matchLinkHover: { opacity: 0.85 },
  resultCell: { alignItems: "center", gap: 2 },
  headAction: { flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radii.sm },
  headText: { color: colors.textSubtle, ...typeScale.micro, textTransform: "uppercase" },
  headActive: { color: colors.text },
  cellStrong: { color: colors.text, ...typeScale.identityCompact },
  cellMeta: { color: colors.textMuted, ...typeScale.meta },
  cellMarket: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  cellNumber: { color: colors.text, ...typeScale.metricCompact },
  cellEvidence: { color: colors.textMuted, ...typeScale.metricCompact },
  cellNet: { fontWeight: "800" },
  tableNote: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 }
});
