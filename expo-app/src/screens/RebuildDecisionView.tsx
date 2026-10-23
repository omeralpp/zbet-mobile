import { useCallback, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent
} from "react-native";
import { matchPeriodScoreQuery, matchQuery, rebuildCohortsReportQuery, rebuildMatchQuery } from "@/src/api/queries";
import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";
import { ListPerforation, ResultPill, TicketSeam, toneColor } from "@/src/components/DecisionTicket";
import { PitchMarkings } from "@/src/components/PitchMarkings";
import { RatingStars } from "@/src/components/RatingStars";
import { Screen } from "@/src/components/Screen";
import { SignalMeter } from "@/src/components/SignalMeter";
import { EmptyState, LoadingState } from "@/src/components/StateView";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { TeamLogo } from "@/src/components/TeamLogo";
import { CollapsibleModule } from "@/src/layout/CollapsibleModule";
import { isAtLeast } from "@/src/layout/breakpoints";
import type { SuperDetailModuleId } from "@/src/layout/module-registry";
import { useModuleLayout } from "@/src/layout/module-layout-store";
import { ReorderableModuleList } from "@/src/layout/ReorderableModuleList";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { TutorialTarget } from "@/src/tutorial/TutorialTarget";
import { colors, iconSizes, interaction, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatFixtureDateTime, formatSelection } from "@/src/utils/format";
import { formatDecimal, formatQuote, formatScore, formatSupport, formatUnits, resultPresentation, unitsTone } from "@/src/utils/rebuild-display";
import { publishedParts } from "@/src/utils/rebuild-log";
import { publishedExplanation } from "@/src/utils/rebuild-presentation";

const capLabel: Record<string, string> = { sample: "Havuz", direction: "Yön", timing: "Ölçüm zamanı", xg: "xG kapsamı", time_goals: "Dakika / gereken gol" };

function Section({ id, eyebrow, title, children }: { id: SuperDetailModuleId; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <CollapsibleModule eyebrow={eyebrow} moduleId={id} surface="superDetail" title={title}>
      <View style={styles.sectionCard}>
        <SurfaceMaterial radius={20} />
        {children}
      </View>
    </CollapsibleModule>
  );
}

function Tile({ value, label, color }: { value: string; label: string; color?: string | undefined }) {
  return (
    <View style={styles.tile}>
      <Text numberOfLines={1} style={[styles.tileValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

/** A count out of five as the board's horizontal bar (star ceilings). */
function CapBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.capRow}>
      <Text style={styles.capLabel}>{label}</Text>
      <View accessibilityElementsHidden style={styles.capTrack}>
        <View style={[styles.capFill, { flex: value }]} />
        {value < 5 ? <View style={{ flex: 5 - value }} /> : null}
      </View>
      <Text style={styles.capValue}>{value}</Text>
    </View>
  );
}

/** The current match state below the seam: live score, final score, or not started. */
function currentState(match: { status: string; homeScore: number; awayScore: number; elapsed: number } | undefined) {
  if (!match) return { score: "—", label: "maç durumu bekleniyor", live: false };
  if (match.status === "LIVE" || match.status === "HALF_TIME") {
    return { score: `${match.homeScore}–${match.awayScore}`, label: match.status === "HALF_TIME" ? "devre arası" : `${match.elapsed}′ canlı`, live: true };
  }
  if (match.status === "NOT_STARTED") return { score: "—", label: "başlamadı", live: false };
  return { score: `${match.homeScore}–${match.awayScore}`, label: "maç sonucu", live: false };
}

/**
 * Super kararı for one RB1 published record, in the v40 board's layout: the
 * frozen decision (minute, score, market, stars, selection quote) above the
 * Karar fişi seam, the result and current match below it, then the record's
 * backend evidence. Nothing here scores or re-ranks; the model makes no win
 * probability claim, so the board's A3 model score, probability and edge have
 * no RB1 counterpart and are not drawn.
 */
export function RebuildDecisionView({ decisionId, matchKey: matchParam, onEdgeSwipeBack }: { decisionId: string; matchKey: string; onEdgeSwipeBack: () => void }) {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const [compactHeader, setCompactHeader] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [reordering, setReordering] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffset = useRef(0);
  const { order, reorderVisible } = useModuleLayout("superDetail");
  // v2 lists every accepted cohort, so an older cohort's decision still opens.
  const report = useQuery(rebuildCohortsReportQuery);
  const fromReport = report.data?.recommendations.find((item) => item.decisionId === decisionId);
  const matchKey = matchParam || fromReport?.matchKey || "";
  const rebuild = useQuery(rebuildMatchQuery(matchKey));
  const record = rebuild.data?.history.find((item) => item.decisionId === decisionId) ?? fromReport;
  const pending = record?.result.state === "PENDING";
  const match = useQuery({ ...matchQuery(matchKey), refetchInterval: pending ? 30_000 : false });
  const periodScore = useQuery(matchPeriodScoreQuery(matchKey));
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
    const next = event.nativeEvent.contentOffset.y > 150;
    setCompactHeader((current) => (current === next ? current : next));
  }, []);
  // A manual refetch ignores `enabled`, so the match reads wait for a key.
  const refresh = () => Promise.all([report.refetch(), ...(matchKey ? [rebuild.refetch(), match.refetch(), periodScore.refetch()] : [])]);
  const openMatch = () => {
    if (matchKey) router.push({ pathname: "/match/[key]", params: { key: matchKey, decision: decisionId } } as never);
  };

  const header = (
    <Stack.Screen
      options={{
        title: compactHeader && record ? `${record.homeTeam} – ${record.awayTeam}` : "Super kararı",
        // Desktop already carries the shell's Yenile button.
        ...(wide ? {} : {
          headerRight: () => (
            <Pressable accessibilityLabel="Ekrandaki verileri yenile" accessibilityRole="button" hitSlop={8} onPress={() => { void refresh(); }} style={styles.headerAction}>
              <MaterialCommunityIcons color={semantic.intelligence} name="refresh" size={iconSizes.control} />
            </Pressable>
          )
        })
      }}
    />
  );

  if (!record && (report.isLoading || rebuild.isLoading)) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={onEdgeSwipeBack}>
        {header}
        <LoadingState label="Super kararı hazırlanıyor" />
      </Screen>
    );
  }
  if (!record) {
    return (
      <Screen edgeSwipeBack onEdgeSwipeBack={onEdgeSwipeBack}>
        {header}
        <EmptyState kind="NO_DECISION" message="Bu karar son 30 günlük raporda ya da maçın kayıtlarında bulunamadı." title="Karar bulunamadı" />
      </Screen>
    );
  }

  const detail = match.data;
  const now = currentState(detail);
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  const halfTime = record.minute > 45 && periodScore.data?.halfTimeScore ? `İY ${periodScore.data.halfTimeScore.homeScore}–${periodScore.data.halfTimeScore.awayScore}` : null;
  const support = formatSupport(record.poolWins, record.poolTotal);
  const lastVote = record.votes.at(-1);
  const voteHome = lastVote ? Number(lastVote.home) : 0;
  const voteAway = lastVote ? Number(lastVote.away) : 0;
  const history = rebuild.data?.history ?? [record];
  const statement = publishedExplanation(record);

  const sections: Record<SuperDetailModuleId, ReactNode> = {
    decisionSummary: (
      <Section eyebrow="KARAR" id="decisionSummary" title="Karar kanıtı">
        <Text style={styles.headline}>{formatSelection(record.market)} · {record.minute}′ kararı</Text>
        <View style={styles.bigFigure}>
          <Text style={styles.bigValue}>{formatScore(record.consistencyScore)}</Text>
          <Text style={styles.bigLabel}>tutarlılık puanı</Text>
        </View>
        <View style={styles.tiles}>
          <Tile label={`havuz desteği · ${support.counts}`} value={support.share} />
          <Tile label="baskı teyidi" value={`${record.votesSupport}/${record.votesUsed}`} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetail }}
          onPress={() => setShowDetail((open) => !open)}
          style={({ pressed }) => [styles.disclosure, pressed && styles.pressed]}
        >
          <Text style={styles.disclosureText}>{showDetail ? "Ayrıntıyı gizle" : "Kanıt ayrıntısı"}</Text>
          <MaterialCommunityIcons color={semantic.intelligence} name={showDetail ? "chevron-up" : "chevron-down"} size={iconSizes.small} />
        </Pressable>
        {showDetail ? (
          <View style={styles.rows}>
            <Row label="Yön çelişkisi"><Text style={[styles.rowValue, record.directionConflict ? { color: semantic.warning } : null]}>{record.directionConflict ? "Var" : "Yok"}</Text></Row>
            <Row label="Ters oy"><Text style={styles.rowValue}>{record.dissent ? "Var" : "Yok"}</Text></Row>
            <Row label="Lider skorlar"><Text style={styles.rowValue}>{record.leaders.map((s) => `${s.home}–${s.away}`).join(" · ") || "—"}</Text></Row>
            <Text style={styles.formula}>
              Puan kesintileri: Havuz 20 × ({record.poolTotal}−{record.poolWins})/{record.poolTotal} · Yön {record.directionConflict ? 20 : 0} · Ters oy {record.dissent ? 5 : 0}
            </Text>
          </View>
        ) : null}
        <View style={styles.statement}>
          <MaterialCommunityIcons color={semantic.intelligence} name="star-four-points-outline" size={iconSizes.small} />
          <Text style={styles.statementText}>{statement}</Text>
        </View>
      </Section>
    ),
    decisionField: (
      <Section eyebrow="SAHA" id="decisionField" title="Karar anındaki baskı">
        {lastVote ? (
          <>
            <View style={styles.tiles}>
              <Tile label="toplam baskı" value={formatDecimal(lastVote.total)} />
              <Tile label="teyit eden aralık" value={`${record.votesSupport}/${record.votesUsed}`} />
              <Tile color={semantic.intelligence} label="ev baskısı" value={formatDecimal(lastVote.home)} />
              <Tile color={colors.orange} label="deplasman baskısı" value={formatDecimal(lastVote.away)} />
            </View>
            <View style={styles.balance}>
              <Text style={styles.balanceTitle}>Son ölçüm aralığı baskı dengesi</Text>
              <View accessibilityElementsHidden style={styles.balanceBar}>
                <View style={[styles.balanceHome, { flex: Math.max(voteHome, 0.001) }]} />
                <View style={[styles.balanceAway, { flex: Math.max(voteAway, 0.001) }]} />
              </View>
              <View style={styles.rowBetween}>
                <Text style={[styles.balanceLabel, { color: semantic.intelligence }]}>{record.homeTeam} {formatDecimal(lastVote.home)}</Text>
                <Text style={[styles.balanceLabel, { color: colors.orange }]}>{formatDecimal(lastVote.away)} {record.awayTeam}</Text>
              </View>
            </View>
            <View style={styles.rows}>
              {record.votes.map((vote, index) => (
                <View key={vote.endsAt} style={styles.voteRow}>
                  <MaterialCommunityIcons color={vote.supports ? semantic.positive : semantic.negative} name={vote.supports ? "check-circle-outline" : "close-circle-outline"} size={iconSizes.small} />
                  <Text style={styles.voteText}>
                    {index + 1}. aralık · {vote.supports ? "Destekliyor" : "Ters oy"}
                    <Text style={styles.muted}> · Ev {formatDecimal(vote.home)} / Deplasman {formatDecimal(vote.away)} / Toplam {formatDecimal(vote.total)}{vote.estimated ? " · tahmini" : ""}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.muted}>Bu kararda baskı ölçümü kaydı yok.</Text>
        )}
        {record.directionConflict ? (
          <View style={styles.warning}>
            <MaterialCommunityIcons color={colors.gold} name="alert-circle-outline" size={iconSizes.small} />
            <Text style={styles.warningText}>Bu kararda yön çelişkisi kaydedildi.</Text>
          </View>
        ) : null}
      </Section>
    ),
    similarity: (
      <Section eyebrow="BAĞLAM" id="similarity" title="Havuz ve yıldız tavanları">
        <Text style={styles.groupTitle}>Havuz desteği</Text>
        <View style={styles.capRow}>
          <Text style={styles.capLabel}>Kazanan / toplam</Text>
          <View accessibilityElementsHidden style={styles.capTrack}>
            <View style={[styles.capFill, styles.poolFill, { flex: record.poolWins }]} />
            {record.poolTotal > record.poolWins ? <View style={{ flex: record.poolTotal - record.poolWins }} /> : null}
          </View>
          <Text style={styles.capValue}>{support.counts}</Text>
        </View>
        <Text style={styles.groupTitle}>Yıldız tavanları</Text>
        {Object.entries(record.caps).map(([key, value]) => (
          <CapBar key={key} label={capLabel[key] ?? key} value={value} />
        ))}
        <View style={styles.rows}>
          <Row label="Yıldız"><RatingStars rating={record.stars} size={13} /></Row>
        </View>
        <View style={styles.note}>
          <MaterialCommunityIcons color={colors.textMuted} name="information-outline" size={iconSizes.small} />
          <Text style={styles.noteText}>Yıldız: tutarlılık ve kanıt kalitesi. Havuz desteği farklı SAP referans kayıtlarını sayar; fiziksel maç tekilliği doğrulanmamıştır.</Text>
        </View>
      </Section>
    ),
    matchHistory: (
      <Section eyebrow="MAÇ" id="matchHistory" title="Maç boyunca öneriler">
        {history.map((item: RebuildRecommendation) => {
          const itemTone = item.result.net === null ? "neutral" : unitsTone(item.result.net);
          const selected = item.decisionId === record.decisionId;
          return (
            <Pressable
              accessibilityLabel={`${formatSelection(item.market)}, ${item.minute}. dakika, ${resultPresentation[item.result.state].label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={selected}
              key={item.decisionId}
              onPress={() => router.replace({ pathname: "/super/[key]", params: { key: item.decisionId, match: item.matchKey } } as never)}
              style={({ pressed, hovered }) => [styles.historyRow, selected && styles.historySelected, hovered && styles.hover, pressed && styles.pressed]}
            >
              <View style={styles.historyCopy}>
                <View style={styles.historyMeta}>
                  <RatingStars rating={item.stars} size={12} />
                  <ResultPill state={item.result.state} />
                </View>
                <Text style={styles.historyMarket}>{formatSelection(item.market)} · {formatQuote(item.quote)} · {item.minute}′</Text>
              </View>
              <ListPerforation />
              <View style={styles.historyUnits}>
                <Text style={[styles.historyNet, { color: itemTone === "neutral" ? colors.textMuted : toneColor[itemTone] }]}>{formatUnits(item.result.net)}</Text>
                <Text style={styles.footLabel}>birim</Text>
              </View>
            </Pressable>
          );
        })}
      </Section>
    )
  };
  const items = order
    .filter((id): id is SuperDetailModuleId => id in sections)
    .map((id) => ({ id, node: sections[id] }));

  const identity = (
    <View style={[styles.identity, wide && styles.identityWide]}>
      <PitchMarkings boxes={false} circle={116} />
      <View style={styles.identityMeta}>
        <Text numberOfLines={1} style={styles.league}>{detail?.league ?? "BTB"}</Text>
        <Text style={styles.kickoff}>{detail ? formatFixtureDateTime(detail.matchDate, detail.matchTime) : publishedParts(record.publishedAt).day}</Text>
      </View>
      <View style={styles.teamsRow}>
        <View style={styles.teamCell}>
          <TeamLogo name={record.homeTeam} participantId={detail?.homeParticipantId} size="hero" />
          <Text numberOfLines={2} style={styles.teamName}>{record.homeTeam}</Text>
        </View>
        <Text style={styles.versus}>–</Text>
        <View style={styles.teamCell}>
          <TeamLogo name={record.awayTeam} participantId={detail?.awayParticipantId} size="hero" />
          <Text numberOfLines={2} style={styles.teamName}>{record.awayTeam}</Text>
        </View>
      </View>
    </View>
  );
  const decision = (
    <View style={[styles.band, wide && styles.bandWide]}>
      <Text style={styles.eyebrowBronze}>KARAR ANI · {record.minute}′</Text>
      <View style={styles.bandRow}>
        <View>
          <Text style={styles.score}>{record.homeScore}–{record.awayScore}</Text>
          {halfTime ? <Text style={styles.bandLabel}>{halfTime}</Text> : null}
        </View>
        <View style={styles.bandMarket}>
          <Text style={styles.market}>{formatSelection(record.market)}</Text>
          <SignalMeter label={`Kanıt kalitesi · ${record.stars}/5`} rating={record.stars} />
        </View>
        <View style={styles.bandEnd}>
          <Text style={styles.price}>{formatQuote(record.quote)}</Text>
          <Text style={styles.bandLabel}>seçim oranı</Text>
        </View>
      </View>
    </View>
  );
  const outcome = (
    <View style={[styles.band, wide && styles.outcomeWide]}>
      <View style={styles.rowBetween}>
        <Text style={styles.eyebrowMuted}>GÜNCEL DURUM</Text>
        <ResultPill state={record.result.state} />
      </View>
      <View style={styles.bandRow}>
        <Pressable
          accessibilityHint="Bu karşılaşmanın güncel maç detayını açar"
          accessibilityLabel={`Güncel skor ${now.score}, ${now.label}. Maç detayını aç`}
          accessibilityRole="button"
          onPress={openMatch}
          style={({ pressed }) => [styles.outcomeAction, pressed && styles.pressed]}
        >
          <View style={styles.outcomeScore}>
            <Text style={[styles.score, now.live ? { color: semantic.live } : null]}>{now.score}</Text>
            {matchKey ? (
              <MaterialCommunityIcons color={colors.textMuted} name="chevron-right" size={iconSizes.control} />
            ) : null}
          </View>
          <Text style={styles.bandLabel}>{now.label}</Text>
        </Pressable>
        <View style={styles.bandEnd}>
          <Text style={[styles.price, { color: tone === "neutral" ? colors.textMuted : toneColor[tone] }]}>{formatUnits(record.result.net)}</Text>
          <Text style={styles.bandLabel}>birim · varsayımsal</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {header}
      <Screen
        contentStyle={styles.screen}
        edgeSwipeBack
        onEdgeSwipeBack={onEdgeSwipeBack}
        scrollProps={{
          alwaysBounceVertical: true,
          onScroll: handleScroll,
          scrollEnabled: !reordering,
          scrollEventThrottle: 16,
          refreshControl: (
            <RefreshControl
              colors={[colors.gold]}
              onRefresh={() => { void refresh(); }}
              refreshing={report.isRefetching || rebuild.isRefetching || match.isRefetching}
              tintColor={colors.gold}
            />
          )
        }}
        scrollRef={scrollRef}
        wide
      >
        <TutorialTarget id="super-summary" radius={22}>
          <View accessibilityLabel={`Super kararı: ${record.homeTeam} – ${record.awayTeam}, ${formatSelection(record.market)}, ${resultPresentation[record.result.state].label}`} style={[styles.hero, wide && styles.heroWide]}>
            <SurfaceMaterial radius={22} />
            {wide ? (
              <>
                {identity}
                <View style={styles.heroDividerVertical} />
                {decision}
                <TicketSeam inset={0} orientation="vertical" />
                {outcome}
              </>
            ) : (
              <>
                {identity}
                <View style={styles.heroDivider} />
                {decision}
                <View style={styles.seamGap} />
                <TicketSeam inset={16} />
                {outcome}
              </>
            )}
          </View>
        </TutorialTarget>
        {wide ? (
          <View style={styles.grid}>
            {items.map((item) => (
              <View key={item.id} style={styles.gridCell}>{item.node}</View>
            ))}
          </View>
        ) : (
          <ReorderableModuleList
            items={items}
            onDragStateChange={setReordering}
            onReorder={(from, to) => reorderVisible(items.map((item) => item.id), from, to)}
            scrollOffsetRef={scrollOffset}
            scrollRef={scrollRef}
          />
        )}
        <Pressable
          accessibilityRole="button"
          onPress={openMatch}
          style={({ pressed, hovered }) => [styles.matchButton, hovered && styles.hover, pressed && styles.pressed]}
        >
          <Text style={styles.matchButtonText}>Maç detayına git</Text>
          <MaterialCommunityIcons color={colors.text} name="chevron-right" size={iconSizes.control} />
        </Pressable>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.xs, gap: spacing.md },
  headerAction: { width: interaction.minTouchTarget, height: interaction.minTouchTarget, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  hero: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderSoft, paddingHorizontal: 16, paddingBottom: 16, ...shadows.card },
  heroWide: { flexDirection: "row", alignItems: "stretch", paddingBottom: 0, paddingHorizontal: 0, minHeight: 156 },
  identity: { gap: 14, paddingVertical: 16, marginHorizontal: -16, paddingHorizontal: 16, overflow: "hidden" },
  identityWide: { width: 272, marginHorizontal: 0, paddingHorizontal: 20 },
  identityMeta: { zIndex: 1 },
  league: { color: colors.textMuted, ...typeScale.eyebrow },
  kickoff: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  teamsRow: { zIndex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  teamCell: { flex: 1, minWidth: 0, alignItems: "center", gap: 6 },
  teamName: { color: colors.text, ...typeScale.identity, fontWeight: "700", textAlign: "center" },
  versus: { color: colors.textMuted, fontSize: 20, lineHeight: 24 },
  heroDivider: { height: 1, backgroundColor: colors.border, opacity: 0.7 },
  seamGap: { height: 16 },
  heroDividerVertical: { width: 1, backgroundColor: colors.border, opacity: 0.7 },
  band: { gap: 10, paddingTop: 14 },
  bandWide: { flex: 1, minWidth: 0, paddingHorizontal: 24, paddingVertical: 20 },
  outcomeWide: { width: 300, paddingHorizontal: 24, paddingVertical: 20 },
  bandRow: { flexDirection: "row", alignItems: "flex-end", gap: 14 },
  bandMarket: { flex: 1, minWidth: 0, gap: 6 },
  bandEnd: { alignItems: "flex-end" },
  eyebrowBronze: { color: colors.bronze, ...typeScale.eyebrow },
  eyebrowMuted: { color: colors.textMuted, ...typeScale.eyebrow },
  score: { color: colors.text, ...typeScale.score, fontSize: 32, lineHeight: 34, fontWeight: "800" },
  market: { color: colors.text, ...typeScale.decision },
  price: { color: colors.text, ...typeScale.metric, fontSize: 26, lineHeight: 28 },
  bandLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, fontWeight: "500" },
  outcomeAction: { flex: 1, minWidth: 0, minHeight: interaction.minTouchTarget, justifyContent: "center", borderRadius: 12, marginHorizontal: -8, marginVertical: -6, paddingHorizontal: 8, paddingVertical: 6 },
  outcomeScore: { flexDirection: "row", alignItems: "center", gap: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  gridCell: { flexBasis: "48%", flexGrow: 1, minWidth: 320 },
  sectionCard: { gap: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft },
  headline: { color: colors.text, ...typeScale.decision },
  bigFigure: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  bigValue: { color: colors.text, ...typeScale.display, fontSize: 46, lineHeight: 48 },
  bigLabel: { color: colors.textMuted, ...typeScale.bodyCompact, fontWeight: "700" },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { flexBasis: "45%", flexGrow: 1, minWidth: 120, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.surfaceStrong },
  tileValue: { color: colors.text, ...typeScale.metric, fontSize: 24, lineHeight: 26, fontWeight: "800" },
  tileLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  disclosure: { alignSelf: "flex-start", minHeight: interaction.minTouchTarget, marginVertical: -6, flexDirection: "row", alignItems: "center", gap: 4 },
  disclosureText: { color: semantic.intelligence, ...typeScale.label, letterSpacing: 0, fontWeight: "500" },
  rows: { borderTopWidth: 1, borderTopColor: colors.border },
  row: { minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textMuted, ...typeScale.bodyCompact },
  rowValue: { color: colors.text, ...typeScale.metricCompact },
  formula: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0, paddingTop: spacing.sm },
  statement: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, backgroundColor: semantic.intelligenceSoft },
  statementText: { flex: 1, color: colors.text, ...typeScale.bodyCompact },
  balance: { gap: 6 },
  balanceTitle: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  balanceBar: { flexDirection: "row", gap: 3, height: 8 },
  balanceHome: { borderRadius: 4, backgroundColor: semantic.intelligence },
  balanceAway: { borderRadius: 4, backgroundColor: colors.orange },
  balanceLabel: { ...typeScale.label, letterSpacing: 0, fontWeight: "700" },
  voteRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  voteText: { flex: 1, color: colors.text, ...typeScale.bodyCompact },
  muted: { color: colors.textMuted, ...typeScale.bodyCompact },
  warning: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  warningText: { flex: 1, color: colors.gold, ...typeScale.label, letterSpacing: 0 },
  groupTitle: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  capRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 28 },
  capLabel: { width: 132, color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  capTrack: { flex: 1, height: 8, flexDirection: "row", borderRadius: 4, overflow: "hidden", backgroundColor: colors.surfaceStrong },
  capFill: { borderRadius: 4, backgroundColor: semantic.intelligence },
  poolFill: { backgroundColor: colors.gold },
  capValue: { minWidth: 40, textAlign: "right", color: colors.text, ...typeScale.metricCompact },
  note: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  noteText: { flex: 1, color: colors.textMuted, ...typeScale.label, letterSpacing: 0, lineHeight: 18 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 60, paddingVertical: 8, borderRadius: 12, marginHorizontal: -8, paddingHorizontal: 8 },
  historySelected: { backgroundColor: semantic.intelligenceSoft },
  historyCopy: { flex: 1, minWidth: 0, gap: 4 },
  historyMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  historyMarket: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  historyUnits: { alignItems: "flex-end", minWidth: 52 },
  historyNet: { ...typeScale.metricCompact, fontWeight: "800" },
  footLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  matchButton: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 18, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.surface, marginBottom: spacing.xl },
  matchButtonText: { color: colors.text, ...typeScale.identity, fontWeight: "700" }
});
