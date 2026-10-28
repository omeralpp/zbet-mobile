import { jinxInsight } from "@/src/utils/jinx-insight";
import { jinxMatchReading } from "@/src/utils/jinx-match-reading";
import type { AnalysisContext } from "@/src/api/schemas";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { rebuildMatchQuery, rebuildCohortsReportQuery } from "@/src/api/queries";
import type { RebuildRecommendation, RebuildReport } from "@/src/api/rebuild-schemas";
import { currentRebuild, rebuildReason } from "@/src/utils/rebuild-current";
import { rebuildHero, displayedDecision, requestedDecision } from "@/src/utils/rebuild-hero";
import { candidateFacts, rebuildPresentation, publishedExplanation } from "@/src/utils/rebuild-presentation";
import {
  formatDecimal,
  formatQuote,
  formatRatio,
  formatReportRange,
  formatScore,
  formatSupport,
  formatUnits,
  outcomeSegments,
  resultPresentation,
  unitsTone
} from "@/src/utils/rebuild-display";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatSelection } from "@/src/utils/format";
import { decisionEvidenceStatus } from "@/src/utils/decision-evidence-view";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { RatingStars } from "./RatingStars";
import { ListPerforation, ResultPill, TicketFigure, TicketSeam, TonePill, toneColor } from "./DecisionTicket";

export function useRebuildClock(enabled = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!enabled) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [enabled]);
  return now;
}
const capLabel: Record<string, string> = { sample: "Havuz", direction: "Yön", timing: "Ölçüm zamanı", xg: "xG kapsamı", time_goals: "Dakika / gereken gol" };
const jinxFace = require("../../assets/mascot/candidates/jinx-a-open.png");

/** Card frame shared by every rebuild surface: the Intelligence Noir material. */
export function Card({ children, padded = true, accent }: { children: ReactNode; padded?: boolean; accent?: string | undefined }) {
  return (
    <View style={styles.card}>
      <SurfaceMaterial accent={accent} radius={20} />
      <View style={padded ? styles.cardBody : null}>{children}</View>
    </View>
  );
}

/** Text action with a 44pt target, the rebuild screens' only button shape. */
export function Action({ title, onPress, icon, busy = false }: { title: string; onPress: () => void; icon?: "refresh" | "chevron-down" | "chevron-up" | "chevron-right"; busy?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy }}
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.action, hovered && styles.actionHover, pressed && styles.pressed]}
    >
      {icon === "refresh" ? <MaterialCommunityIcons color={semantic.intelligence} name="refresh" size={iconSizes.small} /> : null}
      <Text style={styles.link}>{title}</Text>
      {icon && icon !== "refresh" ? <MaterialCommunityIcons color={semantic.intelligence} name={icon} size={iconSizes.inline} /> : null}
    </Pressable>
  );
}

/** Winning share of the reference pool, drawn as sample support. */
function SupportBar({ wins, total }: { wins: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, wins / total) : 0;
  return (
    <View accessibilityElementsHidden style={styles.track}>
      <View style={[styles.trackFill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

function EvidenceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.evidenceRow}>
      <Text style={styles.evidenceLabel}>{label}</Text>
      <View style={styles.evidenceValue}>{children}</View>
    </View>
  );
}

/**
 * Everything the backend froze when it admitted the record: full tied leaders,
 * pool counts, the two or three pressure votes, the direction contradiction,
 * the score deductions and the star ceilings (A7 question 33). Read-only.
 */
function RecordEvidence({ record }: { record: RebuildRecommendation }) {
  const support = formatSupport(record.poolWins, record.poolTotal);
  return (
    <View style={styles.evidence}>
      <Text style={styles.eyebrowMuted}>KARAR KANITI</Text>
      <EvidenceRow label="Tutarlılık puanı">
        <Text style={styles.evidenceNumber}>{formatScore(record.consistencyScore)}</Text>
      </EvidenceRow>
      <EvidenceRow label="Havuz desteği">
        <Text style={styles.evidenceNumber}>{support.counts} <Text style={styles.evidenceMuted}>· {support.share}</Text></Text>
      </EvidenceRow>
      <SupportBar total={record.poolTotal} wins={record.poolWins} />
      <EvidenceRow label="Baskı teyidi">
        <Text style={styles.evidenceNumber}>{record.votesSupport}/{record.votesUsed}</Text>
      </EvidenceRow>
      {record.votes.length ? (
        <View style={styles.votes}>
          {record.votes.map((vote, i) => (
            <View key={vote.endsAt} style={styles.vote}>
              <MaterialCommunityIcons
                color={vote.supports ? semantic.positive : semantic.negative}
                name={vote.supports ? "check-circle-outline" : "close-circle-outline"}
                size={iconSizes.small}
              />
              <Text style={styles.voteText}>
                {i + 1}. aralık · {vote.supports ? "Destekliyor" : "Ters oy"}
                <Text style={styles.evidenceMuted}> · Ev {formatDecimal(vote.home)} / Deplasman {formatDecimal(vote.away)} / Toplam {formatDecimal(vote.total)}</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <EvidenceRow label="Yön çelişkisi">
        <Text style={[styles.evidenceText, record.directionConflict ? { color: semantic.warning } : null]}>{record.directionConflict ? "Var" : "Yok"}</Text>
      </EvidenceRow>
      <EvidenceRow label="Lider skorlar">
        <Text style={styles.evidenceNumber}>{record.leaders.map(s => `${s.home}–${s.away}`).join(" · ") || "—"}</Text>
      </EvidenceRow>
      <View style={styles.formula}>
        <Text style={styles.formulaLabel}>Puan kesintileri</Text>
        <Text style={styles.formulaText}>
          Havuz 20 × ({record.poolTotal}−{record.poolWins})/{record.poolTotal} · Yön {record.directionConflict ? 20 : 0} · Ters oy {record.dissent ? 5 : 0}
        </Text>
        <Text style={styles.formulaLabel}>Yıldız tavanları</Text>
        <View style={styles.caps}>
          {Object.entries(record.caps).map(([key, value]) => (
            <View key={key} style={styles.cap}>
              <Text style={styles.capLabel}>{capLabel[key]}</Text>
              <Text style={styles.capValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.note}>
        <MaterialCommunityIcons color={colors.textMuted} name="information-outline" size={iconSizes.small} />
        <Text style={styles.noteText}>Yıldız: tutarlılık ve kanıt kalitesi. Havuz desteği farklı SAP referans kayıtlarını sayar; fiziksel maç tekilliği doğrulanmamıştır.</Text>
      </View>
    </View>
  );
}

/**
 * The selected published record as a Karar fişi: frozen decision-time facts
 * above the seam, the revisioned outcome below it. Wide panes turn the ticket
 * on its side and the outcome becomes the stub.
 */
function RecommendationTicket({ record, wide }: { record: RebuildRecommendation; wide: boolean }) {
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  const decision = (
    <View style={[styles.ticketPart, wide && styles.ticketDecisionWide]}>
      <Text style={styles.eyebrowBronze}>KARAR ANI · {record.minute}′</Text>
      <View style={styles.ticketHeadline}>
        <Text accessibilityLabel={`Karar anındaki skor ${record.homeScore}–${record.awayScore}`} style={styles.ticketScore}>
          {record.homeScore}–{record.awayScore}
        </Text>
        <View style={styles.ticketMarket}>
          <Text style={styles.ticketMarketText}>{formatSelection(record.market)}</Text>
          <RatingStars rating={record.stars} size={13} />
        </View>
        <TicketFigure align="right" label="seçim oranı" value={formatQuote(record.quote)} />
      </View>
    </View>
  );
  const outcome = (
    <View style={[styles.ticketPart, wide && styles.ticketStubWide]}>
      <View style={styles.ticketOutcomeHead}>
        <Text style={styles.eyebrowMuted}>SONUÇ</Text>
        <ResultPill state={record.result.state} />
      </View>
      <View style={styles.ticketOutcome}>
        <TicketFigure label="birim · varsayımsal" size="large" tone={tone} value={formatUnits(record.result.net)} />
        <Text style={styles.revision}>Sonuç revizyonu {record.result.revision}</Text>
      </View>
    </View>
  );
  return (
    <View accessibilityLabel={`${formatSelection(record.market)}, ${record.minute}. dakika kararı, ${resultPresentation[record.result.state].label}`} style={[styles.ticket, wide && styles.ticketWide]}>
      <SurfaceMaterial radius={20} />
      {decision}
      <TicketSeam inset={16} orientation={wide ? "vertical" : "horizontal"} />
      {outcome}
    </View>
  );
}

/** One published record in a list: frozen facts, a short cut, then the outcome. */
function RecommendationRow({
  record,
  onPress,
  selected = false,
  showTeams = true
}: {
  record: RebuildRecommendation;
  onPress: () => void;
  selected?: boolean;
  showTeams?: boolean;
}) {
  const tone = record.result.net === null ? "neutral" : unitsTone(record.result.net);
  return (
    <Pressable
      accessibilityHint={showTeams ? "Maçın karar ve kanıt ekranını açar" : "Bu önerinin karar anı kanıtını gösterir"}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.row, selected && styles.rowSelected, hovered && styles.rowHover, pressed && styles.pressed]}
    >
      <View style={styles.rowCopy}>
        <View style={styles.rowMeta}>
          <RatingStars rating={record.stars} size={12} />
          <ResultPill state={record.result.state} />
        </View>
        {showTeams ? <Text numberOfLines={1} style={styles.rowTeams}>{record.homeTeam} – {record.awayTeam}</Text> : null}
        {/* Market, frozen quote and minute as the board's one line; the minute
            and score wrap as one unit, never between the goals. */}
        <View style={styles.rowDetailLine}>
          <Text style={styles.rowDetail}>{formatSelection(record.market)} · </Text>
          <Text style={[styles.rowDetail, styles.rowMarket]}>{formatQuote(record.quote)}</Text>
          <Text numberOfLines={1} style={styles.rowDetail}> · {record.minute}′ · {record.homeScore}–{record.awayScore}</Text>
        </View>
      </View>
      <ListPerforation />
      <TicketFigure align="right" label="birim" size="compact" style={styles.rowUnits} tone={tone} value={formatUnits(record.result.net)} />
    </Pressable>
  );
}

function asOfTime(iso: string | undefined): string {
  const date = iso ? new Date(iso) : null;
  return date && Number.isFinite(date.getTime())
    ? date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Istanbul" })
    : "—";
}

/**
 * One short interpretation with explicitly separate decision/current sources.
 * Detailed provenance is on demand; refreshing never calls an LLM.
 */
export function RebuildJinxCard({ matchKey, matchStatus = "LIVE", possession, matchContext, refreshContext, contextRefreshing = false }: {
  matchKey: string; matchStatus?: string; possession?: {label:string} | null; matchContext?: AnalysisContext | undefined;
  refreshContext?: () => Promise<unknown>; contextRefreshing?: boolean;
}) {
  const router = useRouter();
  const query = useQuery(rebuildMatchQuery(matchKey)), now = useRebuildClock();
  const [showCandidates, setShowCandidates] = useState(false);
  const params = useLocalSearchParams<{decision?:string | string[]}>();
  const requested = requestedDecision(params.decision);
  const data = query.data;
  const hero = rebuildHero({data, matchKey, status: matchStatus, now, error: query.isError, decisionId: requested});
  const record = hero?.record;
  const state = rebuildPresentation({ status: matchStatus, summary: data, now, error: query.isError,
    redUnknown: data?.candidates.some(candidate => candidate.reason === "RED_CARD_UNKNOWN") });
  const reading = record && data ? jinxMatchReading({ record, data, matchKey, context: matchContext,
    now: Math.max(now, query.dataUpdatedAt), sourceFailed: query.isError }) : null;
  const text = reading?.text ?? (query.isError ? "Karar verisi yenilenemedi." : record ? jinxInsight(record)
    : requested ? "İncelenen karar kaydı doğrulanamadı." : state.text);
  const refreshing = query.isFetching || contextRefreshing;
  return (
    <View style={styles.jinxCard}>
      <SurfaceMaterial accent={hero?.playable || hero?.active ? semantic.intelligence : undefined} radius={20} />
      <View style={styles.jinxHead}>
        <Image accessible={false} resizeMode="contain" source={jinxFace} style={styles.jinxAvatar} />
        <View style={styles.jinxIdentity}>
          <Text accessibilityRole="header" aria-level={2} style={styles.jinxTitle}>Jinx</Text>
          <TonePill label={reading?.title ?? state.label} tone={reading?.tone ?? state.tone} />
        </View>
        <Pressable
          accessibilityLabel="Jinx kaydını yenile"
          accessibilityRole="button"
          accessibilityState={{ busy: refreshing }}
          disabled={refreshing}
          onPress={() => void Promise.all([query.refetch(), refreshContext?.()])}
          style={({ pressed, hovered }) => [styles.jinxRefresh, hovered && styles.actionHover, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={colors.text} name="refresh" size={iconSizes.small} />
          <Text style={styles.jinxRefreshText}>{refreshing ? "Yenileniyor…" : "Yenile"}</Text>
        </Pressable>
      </View>
      <View style={styles.jinxSpeech}>
        <Text accessibilityLiveRegion="polite" style={styles.jinxSpeechText}>{text}</Text>
        {reading?.comparison ? <View accessible
          accessibilityLabel={`${reading.comparison.label}: ilk karar ${reading.comparison.before}; son kontrol ${reading.comparison.after}`}
          style={styles.jinxComparison}>
          <Text style={styles.caption}>{reading.comparison.label}</Text>
          <View style={styles.jinxComparisonValues}>
            <Text style={styles.jinxComparisonBefore}>{reading.comparison.before}</Text>
            <Text style={styles.caption}>→</Text>
            <Text style={styles.jinxComparisonAfter}>{reading.comparison.after}</Text>
          </View>
        </View> : null}
        {reading?.decisionId ? <Pressable accessibilityRole="button" accessibilityLabel="Yeni BTB kararını aç"
          onPress={() => router.push({ pathname: "/super/[key]", params: { key: reading.decisionId!, match: matchKey } } as never)}
          style={({ pressed, hovered }) => [styles.jinxNewDecision, hovered && styles.actionHover, pressed && styles.pressed]}>
          <Text style={styles.link}>Yeni kararı aç</Text>
          <MaterialCommunityIcons name="chevron-right" size={iconSizes.small} color={semantic.intelligence} />
        </Pressable> : null}
      </View>
      <View style={styles.jinxFoot}>
        <Text style={styles.jinxTime}>{asOfTime(data?.asOf)} <Text style={styles.jinxTimeLabel}>· {query.isError ? "yenilenemedi" : "son okuma"}</Text></Text>
        {record || data?.candidates.length ? <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showCandidates }}
          onPress={() => setShowCandidates(!showCandidates)}
          style={({ pressed }) => [styles.jinxEvidenceAction, pressed && styles.pressed]}
        >
          <Text style={styles.link}>{showCandidates ? "Dayanakları gizle" : "Dayanakları gör"}</Text>
          <MaterialCommunityIcons color={semantic.intelligence} name={showCandidates ? "chevron-up" : "chevron-down"} size={iconSizes.inline} />
        </Pressable> : null}
      </View>
      {showCandidates ? (
        <View style={styles.jinxCandidates}>
          {reading ? <View style={styles.jinxSources}>
            <Text style={styles.evidenceLabel}>Yorumun dayanağı</Text>
            {reading.sources.map(source => <Text key={source.label} style={styles.caption}>{source.label} · {source.value}</Text>)}
          </View> : null}
          {record && !query.isError ? <>
            <Text style={styles.caption}>{publishedExplanation(record)}</Text>
            <RecordEvidence record={record} />
            <Text style={styles.caption}>Havuz payı ve yıldızlar kazanma olasılığı değildir.</Text>
          </> : null}
          {possession ? <Text style={styles.caption}>Ek saha bilgisi · {possession.label}. Seçim kanıtından ayrıdır.</Text> : null}
          <Text style={styles.caption}>Diğer adaylar ve elenme nedenleri · yayımlanmış birimlerden ayrı tutulur; bahis önerisi değildir.</Text>
          <Text style={styles.caption}>Erken elenen pazarda sonraki ölçütler hesaplanmamış olabilir. Hesaplanmayan değerler sıfır değildir; son kayıtlı değerlendirme gösterilir.</Text>
          {data?.candidates.length ? data.candidates.map(c => {
            const status = c.selected ? { label: !query.isError && currentRebuild(data, now) ? "EN İYİ ADAY" : "SON HESABIN LİDERİ", tone: "positive" as const } : c.admitted ? { label: "UYGUN, SEÇİLMEDİ", tone: "pending" as const } : { label: "ELENDİ", tone: "neutral" as const };
            return (
              <View key={c.market} style={styles.candidate}>
                <View style={styles.rowBetween}>
                  <Text style={styles.candidateMarket}>{formatSelection(c.market)}</Text>
                  <TonePill label={status.label} tone={status.tone} />
                </View>
                <Text style={styles.candidateReason}>{rebuildReason(c.reason)}</Text>
                <Text style={styles.candidateFacts}>
                  {candidateFacts(c)}
                </Text>
              </View>
            );
          }) : <Text style={styles.caption}>Aday kaydı yok.</Text>}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Karar özeti on an RB1 match: the selected published record as a Karar fişi
 * with its frozen evidence, then every record of the match as its own event
 * (one current best eligible choice; distinct later opportunities).
 */
export function RebuildDecisionModule({ matchKey }: { matchKey: string }) {
  const query = useQuery(rebuildMatchQuery(matchKey));
  const params = useLocalSearchParams<{ decision?: string | string[] }>();
  const [selectedId, setSelectedId] = useState<{matchKey:string;decisionId:string} | null>(null);
  const [width, setWidth] = useState(0);
  const data = query.data;
  const requested = requestedDecision(params.decision);
  const selected = data ? displayedDecision(data.history, matchKey, (selectedId?.matchKey === matchKey ? selectedId.decisionId : null) || requested) : null;
  const wide = width >= 560;
  const status = decisionEvidenceStatus(data, query.isLoading, query.isError);
  if (status.kind !== "READY") {
    return <Card>
      <View style={styles.decisionStateHead}>
        <MaterialCommunityIcons color={status.kind === "ERROR" ? colors.gold : semantic.intelligence} name={status.kind === "LOADING" ? "timer-sand" : status.kind === "ERROR" ? "cloud-alert-outline" : "clipboard-text-outline"} size={24} />
        <View style={styles.decisionStateCopy}>
          <Text style={styles.evidenceText}>{status.title}</Text>
          <Text style={styles.recordNote}>{status.detail}</Text>
        </View>
      </View>
      <Text style={styles.recordNote}>{status.count === 0 ? "Bu bölüm, yalnız yayımlanmış önerilerin karar anındaki kanıtlarını gösterir. Diğer maç verilerini aşağıdaki bölümlerde inceleyebilirsin." : "Kayıtlar alınmadan öneri sayısı gösterilmez."}</Text>
      {data ? <Text style={styles.caption}>Son kayıt kontrolü · {asOfTime(data.asOf)}</Text> : null}
      {status.kind !== "LOADING" ? <Action icon="refresh" title="Karar kayıtlarını yenile" busy={query.isFetching} onPress={() => { void query.refetch(); }} /> : null}
    </Card>;
  }
  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.stack}>
      {query.isError ? <Card><Text style={styles.recordNote}>Güncelleme alınamadı; son alınan kayıtlar gösteriliyor.</Text><Action title="Yeniden dene" icon="refresh" busy={query.isFetching} onPress={() => { void query.refetch(); }} /></Card> : null}
      {selected ? (
        <>
          <RecommendationTicket record={selected} wide={wide} />
          <Card><RecordEvidence record={selected} /></Card>
        </>
      ) : data?.history.length ? (
        <Text style={styles.hint}>Bir öneriyi seçtiğinde karar anındaki kanıt burada açılır.</Text>
      ) : null}
      <Card padded={false}>
        <View style={styles.listHead}>
          <Text style={styles.eyebrowMuted}>MAÇ BOYUNCA ÖNERİLER</Text>
          <Text style={styles.listCount}>{status.count}</Text>
        </View>
        <Text style={styles.decisionListNote}>Karar anındaki oran ve yıldızlar · son kontrol {asOfTime(data?.asOf)}</Text>
        {data?.history.length ? data.history.map(record => (
          <RecommendationRow
            key={record.decisionId}
            onPress={() => setSelectedId({matchKey,decisionId:record.decisionId})}
            record={record}
            selected={record.decisionId === selected?.decisionId}
            showTeams={false}
          />
        )) : <Text style={styles.empty}>{query.isError ? "Veri alınamadı." : "Yayımlanmış öneri yok."}</Text>}
      </Card>
    </View>
  );
}

/** The outcome counts as one proportional bar with a legend. */
function OutcomeBar({ period }: { period: RebuildReport["periods"][number] }) {
  const segments = outcomeSegments(period);
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  return (
    <View style={styles.outcome}>
      <View accessibilityElementsHidden style={styles.outcomeBar}>
        {total ? segments.map(segment => (
          <View key={segment.key} style={{ flex: segment.count, backgroundColor: toneColor[segment.tone] }} />
        )) : <View style={styles.outcomeEmpty} />}
      </View>
      <Text style={styles.outcomeLegend}>
        {period.wins} kazandı · {period.losses} kaybetti · {period.pending} bekliyor · {period.unresolved} çözülemedi · {period.voids} iptal
      </Text>
    </View>
  );
}

function BreakdownTable({ title, rows }: { title: string; rows: { key: string; label: ReactNode; settled: number; net: string; extra?: string }[] }) {
  if (!rows.length) return null;
  return (
    <View style={styles.table}>
      <Text style={styles.eyebrowMuted}>{title}</Text>
      {rows.map(row => (
        <View key={row.key} style={styles.tableRow}>
          <Text numberOfLines={1} style={styles.tableLabel}>{row.label}</Text>
          {row.extra ? <Text style={styles.tableExtra}>{row.extra}</Text> : null}
          <Text style={styles.tableExtra}>{row.settled} sonuç</Text>
          <Text style={[styles.tableNet, { color: toneColor[unitsTone(row.net)] }]}>{formatUnits(row.net)}</Text>
        </View>
      ))}
    </View>
  );
}

function Progress({ label, value, required }: { label: string; value: number; required: number }) {
  return (
    <View style={styles.progress}>
      <View style={styles.rowBetween}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{value}/{required}</Text>
      </View>
      <View style={styles.track}><View style={[styles.trackFill, styles.trackLearning, { width: `${Math.min(1, required > 0 ? value / required : 0) * 100}%` }]} /></View>
    </View>
  );
}

/**
 * The period's report behind the decision log's summary (A7 question 36):
 * hypothetical one-unit results at the original quote, five outcomes kept
 * apart, a dash for a ratio with no resolved risk, match-level risk retained.
 * Always the whole period as the backend reports it, never a filtered view.
 */
export function RebuildReportDetails({ report, period }: { report: RebuildReport; period: RebuildReport["periods"][number] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.reportBody}>
      <Text style={styles.eyebrowMuted}>RAPOR · {period.days} GÜN · {formatReportRange(period.from, period.through)}</Text>
      {period.recommendations === 0 ? (
        <Text style={styles.waitingReason}>BTB bir öneri yayımladığında seçim oranıyla burada sayılır.</Text>
      ) : (
        <>
          <View style={styles.hero}>
            <TicketFigure label="birim · varsayımsal" tone={unitsTone(period.net)} value={formatUnits(period.net)} />
            <View style={styles.heroSide}>
              <TicketFigure align="right" label="ROI" value={formatRatio(period.roi)} />
              <TicketFigure align="right" label="isabet" value={formatRatio(period.hitRate)} />
            </View>
          </View>
          <OutcomeBar period={period} />
          <Text style={styles.exposure}>
            {period.recommendations} öneri · {period.matches} maç · Toplam risk {period.totalRisk} · Sonuçlanan risk {period.risk}
          </Text>
        </>
      )}
      <View style={styles.note}>
        <MaterialCommunityIcons color={colors.textMuted} name="information-outline" size={iconSizes.small} />
        <Text style={styles.noteText}>Her öneri seçim oranıyla varsayımsal 1 birimdir. Aynı maçtaki öneriler bağımsız maç sayılmaz.</Text>
      </View>
      <Text style={styles.noteText}>{period.uncertainty ? `Maç bazlı keşif aralığı: ${formatRatio(period.uncertainty.lower)} — ${formatRatio(period.uncertainty.upper)}; küçük örneklemde kanıt sınırlıdır.` : "Belirsizlik hesabı için farklı maç kanıtı yetersiz."}</Text>
      <Action icon={expanded ? "chevron-up" : "chevron-down"} onPress={() => setExpanded(!expanded)} title={expanded ? "Kırılımları gizle" : "Yıldız / pazar kırılımları"} />
      {expanded ? (
        <View style={styles.stackTight}>
          <BreakdownTable rows={period.byStar.map(s => ({ key: String(s.stars), label: <RatingStars rating={s.stars} size={12} />, settled: s.settled, net: s.net }))} title="YILDIZA GÖRE" />
          <BreakdownTable rows={period.byMarket.map(m => ({ key: m.market, label: formatSelection(m.market), settled: m.settled, net: m.net }))} title="PAZARA GÖRE" />
          {report.learning ? (
            <View style={styles.learning}>
              <Text style={styles.eyebrowMuted}>ÖĞRENME İNCELEMESİ</Text>
              <Progress label="Sonuçlanan öneri" required={100} value={report.learning.overall.settled} />
              <Progress label="Farklı maç" required={30} value={report.learning.overall.matches} />
              <Progress label="Gün" required={2} value={report.learning.overall.days} />
              <Text style={styles.noteText}>Yalnız inceleme içindir; kurallar yalnız onayla değişir.</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The latest published records, for the Overview's "Son Super hareketleri"
 * (v40 board): always present, with a plain state when there is none yet.
 * A row opens the record's Super kararı page.
 */
export function RecentRecommendations({ limit = 3 }: { limit?: number }) {
  const query = useQuery(rebuildCohortsReportQuery), router = useRouter();
  const records = query.data?.availability === "AVAILABLE" ? [...query.data.recommendations]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, limit) : [];
  return (
    <Card padded={false}>
      {records.length ? records.map(r => (
        <RecommendationRow
          key={r.decisionId}
          onPress={() => router.push({ pathname: "/super/[key]", params: { key: r.decisionId, match: r.matchKey } } as never)}
          record={r}
        />
      )) : (
        <Text style={styles.recentEmpty}>
          {query.isLoading ? "Öneriler hazırlanıyor…" : query.isError || query.data?.availability !== "AVAILABLE" ? "Rapor şu anda alınamıyor." : "Henüz yayımlanmış öneri yok."}
        </Text>
      )}
    </Card>
  );
}

/** Today's figures for the Overview strip; undefined while unavailable. */
export function useRebuildToday() {
  const query = useQuery(rebuildCohortsReportQuery);
  const period = !query.isError && query.data?.availability === "AVAILABLE" ? query.data.periods.find(p => p.key === "today") : undefined;
  return { period, loading: query.isLoading, recommendations: query.data?.recommendations ?? [] };
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, width: "100%" },
  decisionStateHead: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  decisionStateCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  decisionListNote: { ...typeScale.label, color: colors.textMuted, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  stackTight: { gap: spacing.lg },
  card: { borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  eyebrowBronze: { color: colors.bronze, ...typeScale.eyebrow },
  eyebrowMuted: { color: colors.textMuted, ...typeScale.eyebrow },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  caption: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  link: { color: semantic.intelligence, ...typeScale.bodyCompact, fontWeight: "700" },
  action: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.md },
  actionHover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 },
  waitingReason: { color: colors.textMuted, ...typeScale.body },
  // Jinx card: the v40 board's match card (avatar, state pill, outlined
  // Yenile, a speech bubble, the pool-support figure, chips, time and evidence).
  jinxCard: { gap: 12, marginTop: 12, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, borderRadius: 22, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  jinxHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  jinxAvatar: { width: 50, height: 50 },
  jinxIdentity: { flex: 1, minWidth: 0, gap: 2, alignItems: "flex-start" },
  jinxTitle: { color: colors.text, ...typeScale.decision },
  jinxRefresh: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, borderRadius: radii.round, borderWidth: 1, borderColor: colors.border },
  jinxRefreshText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  jinxSpeech: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderTopLeftRadius: 6, backgroundColor: colors.surfaceStrong },
  jinxSpeechText: { color: colors.text, ...typeScale.body, fontSize: 16, lineHeight: 23, fontWeight: "500" },
  jinxComparison: { marginTop: 10, gap: 4 },
  jinxComparisonValues: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  jinxComparisonBefore: { color: colors.textMuted, ...typeScale.bodyCompact },
  jinxComparisonAfter: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  jinxSources: { gap: 4 },
  jinxNewDecision: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, alignSelf: "flex-start", marginTop: 6 },
  jinxFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  jinxTime: { color: colors.textMuted, ...typeScale.metricCompact, fontSize: 14, lineHeight: 18 },
  jinxTimeLabel: { ...typeScale.label, letterSpacing: 0 },
  jinxEvidenceAction: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 4 },
  jinxCandidates: { gap: 2 },
  recordNote: { color: colors.textMuted, ...typeScale.bodyCompact },
  recentEmpty: { color: colors.textMuted, ...typeScale.bodyCompact, padding: spacing.lg },
  hint: { color: colors.textMuted, ...typeScale.bodyCompact, textAlign: "center", paddingHorizontal: spacing.lg },
  ticket: { borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md, ...shadows.card },
  ticketWide: { flexDirection: "row", alignItems: "stretch", gap: spacing.lg },
  ticketPart: { gap: spacing.sm },
  ticketDecisionWide: { flex: 1, minWidth: 0 },
  ticketStubWide: { width: 200 },
  ticketHeadline: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ticketScore: { color: colors.text, ...typeScale.score, fontSize: 32, lineHeight: 34 },
  ticketMarket: { flex: 1, minWidth: 0, gap: 4 },
  ticketMarketText: { color: colors.text, ...typeScale.decision },
  ticketOutcomeHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  ticketOutcome: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" },
  revision: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  evidence: { gap: spacing.sm },
  evidenceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, minHeight: 28 },
  evidenceLabel: { color: colors.textMuted, ...typeScale.bodyCompact, flexShrink: 1 },
  evidenceValue: { flexShrink: 1, alignItems: "flex-end" },
  evidenceNumber: { color: colors.text, ...typeScale.metricCompact, textAlign: "right" },
  evidenceText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  evidenceMuted: { color: colors.textMuted, fontWeight: "500" },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceStrong, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 3, backgroundColor: semantic.intelligence },
  trackLearning: { backgroundColor: colors.bronze },
  votes: { gap: 6, paddingLeft: 2 },
  vote: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  voteText: { flex: 1, color: colors.text, ...typeScale.bodyCompact },
  formula: { gap: 6, backgroundColor: colors.surfaceStrong, borderRadius: 14, padding: spacing.md, marginTop: spacing.xs },
  formulaLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  formulaText: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "500" },
  caps: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  cap: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 4 },
  capLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  capValue: { color: colors.text, ...typeScale.metricCompact, fontSize: 15, lineHeight: 18 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  noteText: { flex: 1, color: colors.textMuted, ...typeScale.label, letterSpacing: 0, lineHeight: 18 },
  listHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  listCount: { color: colors.textMuted, ...typeScale.metricCompact },
  empty: { color: colors.textMuted, ...typeScale.bodyCompact, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, minHeight: 64 },
  rowSelected: { backgroundColor: semantic.intelligenceSoft },
  rowHover: { backgroundColor: colors.surfaceStrong },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowTeams: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  rowDetailLine: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" },
  rowDetail: { color: colors.textMuted, ...typeScale.bodyCompact },
  rowMarket: { color: colors.text, fontWeight: "700" },
  rowUnits: { minWidth: 52 },
  candidate: { gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.md },
  candidateMarket: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700", flexShrink: 1 },
  candidateReason: { color: colors.textMuted, ...typeScale.bodyCompact },
  candidateFacts: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  reportBody: { gap: spacing.md },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  hero: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.lg },
  heroSide: { flexDirection: "row", gap: spacing.xl },
  outcome: { gap: spacing.sm },
  outcomeBar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2, backgroundColor: colors.surfaceStrong },
  outcomeEmpty: { flex: 1 },
  outcomeLegend: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  exposure: { color: colors.text, ...typeScale.bodyCompact },
  table: { gap: 2 },
  tableRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 36, borderBottomWidth: 1, borderBottomColor: colors.border },
  tableLabel: { flex: 1, minWidth: 0, color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  tableExtra: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  tableNet: { ...typeScale.metricCompact, minWidth: 56, textAlign: "right" },
  learning: { gap: spacing.sm },
  progress: { gap: 6 },
  progressLabel: { color: colors.textMuted, ...typeScale.bodyCompact },
  progressValue: { color: colors.text, ...typeScale.metricCompact }
});
