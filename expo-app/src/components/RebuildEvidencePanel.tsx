import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { rebuildMatchQuery, rebuildReportQuery } from "@/src/api/queries";
import type { RebuildRecommendation, RebuildReport } from "@/src/api/rebuild-schemas";
import { currentRebuild, rebuildCalendarDay, rebuildReason } from "@/src/utils/rebuild-current";
import {
  formatDecimal,
  formatQuote,
  formatRatio,
  formatReportRange,
  formatScore,
  formatSupport,
  formatUnits,
  matchLabel,
  outcomeSegments,
  resultPresentation,
  unitsTone
} from "@/src/utils/rebuild-display";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatSelection } from "@/src/utils/format";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { RatingStars } from "./RatingStars";
import { ListPerforation, ResultPill, TicketFigure, TicketSeam, TonePill, toneColor } from "./DecisionTicket";

export function useRebuildClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  return now;
}
const capLabel: Record<string, string> = { sample: "Havuz", direction: "Yön", timing: "Ölçüm zamanı", xg: "xG kapsamı", time_goals: "Dakika / gereken gol" };
const jinxFace = require("../../assets/mascot/candidates/jinx-a-open.png");

/** Card frame shared by every rebuild surface: the Intelligence Noir material. */
function Card({ children, padded = true, accent }: { children: ReactNode; padded?: boolean; accent?: string | undefined }) {
  return (
    <View style={styles.card}>
      <SurfaceMaterial accent={accent} radius={20} />
      <View style={padded ? styles.cardBody : null}>{children}</View>
    </View>
  );
}

/** Text action with a 44pt target, the rebuild screens' only button shape. */
function Action({ title, onPress, icon, busy = false }: { title: string; onPress: () => void; icon?: "refresh" | "chevron-down" | "chevron-up" | "chevron-right"; busy?: boolean }) {
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

/** Eyebrow + title, with an optional control on the title line. */
function Heading({ eyebrow, title, trailing }: { eyebrow: string; title: string; trailing?: ReactNode }) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingCopy}>
        <Text style={styles.eyebrowBronze}>{eyebrow}</Text>
        <Text accessibilityRole="header" aria-level={2} style={styles.headingTitle}>{title}</Text>
      </View>
      {trailing}
    </View>
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
        <TicketFigure align="right" label="ilk oran" value={formatQuote(record.quote)} />
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
        {/* The minute and score wrap as one unit, never between the goals. */}
        <View style={styles.rowDetailLine}>
          <Text style={[styles.rowDetail, styles.rowMarket]}>{formatSelection(record.market)}</Text>
          <Text numberOfLines={1} style={styles.rowDetail}> · {record.minute}′ · {record.homeScore}–{record.awayScore}</Text>
        </View>
      </View>
      <TicketFigure align="right" label="ilk oran" size="compact" value={formatQuote(record.quote)} />
      <ListPerforation />
      <TicketFigure align="right" label="birim" size="compact" style={styles.rowUnits} tone={tone} value={formatUnits(record.result.net)} />
    </Pressable>
  );
}

/**
 * The match's canonical decision and its evidence (A7 questions 33–35): one
 * current best eligible choice, Jinx explaining that same decision, every
 * published record as its own event, and rejected candidates kept apart from
 * published units.
 */
export function RebuildEvidencePanel({ matchKey }: { matchKey: string }) {
  const query = useQuery(rebuildMatchQuery(matchKey)), now = useRebuildClock();
  const params = useLocalSearchParams<{ decision?: string | string[] }>();
  const [selectedId, setSelectedId] = useState<string | null>(null), [showCandidates, setShowCandidates] = useState(false);
  const [width, setWidth] = useState(0);
  const data = query.data, current = !query.isError ? currentRebuild(data, now) : null;
  const requested = typeof params.decision === "string" ? params.decision : null;
  const selected = data?.history.find(h => h.decisionId === (selectedId || requested || current?.decisionId));
  const reason = query.isError ? "Veri yenilenemedi" : data?.availability === "ACTIVE" && !current ? "Oran / ölçüm güncel değil" : rebuildReason(data?.reason);
  const jinxText = selected && selected.decisionId !== current?.decisionId
    ? `${formatSelection(selected.market)} için kaydedilmiş karar: ${selected.votesSupport}/${selected.votesUsed} baskı teyidi, ${selected.poolWins}/${selected.poolTotal} havuz desteği; yön çelişkisi ${selected.directionConflict ? "var" : "yok"}.`
    : current ? data?.jinx.summary : `Güncel veri/teyit bekleniyor · ${reason}`;
  const waitingTone = query.isError || data?.availability === "UNAVAILABLE" ? "neutral" : "warning";
  const wide = width >= 560;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.stack}>
      <Heading
        eyebrow="BTB"
        title="Karar ve kanıt"
        trailing={<Action busy={query.isFetching} icon="refresh" onPress={() => { void query.refetch(); }} title={query.isFetching ? "Yenileniyor…" : "Yenile"} />}
      />

      <Card accent={current ? semantic.intelligence : undefined}>
        {current ? (
          <View style={styles.currentBlock}>
            <View style={styles.rowBetween}>
              <Text style={styles.eyebrowBronze}>GÜNCEL BTB SEÇİMİ</Text>
              <RatingStars rating={current.stars} size={13} />
            </View>
            <Text accessibilityLiveRegion="polite" style={styles.currentMarket}>{formatSelection(current.market)}</Text>
            <Text style={styles.caption}>Yıldız: tutarlılık ve kanıt kalitesi</Text>
            <View style={styles.figures}>
              <TicketFigure label="güncel oran" value={formatQuote(current.quote)} />
              <TicketFigure align="right" label="tutarlılık puanı" value={formatScore(current.consistencyScore)} />
            </View>
          </View>
        ) : (
          <View accessibilityLiveRegion="polite" style={styles.currentBlock}>
            <TonePill
              dot
              label={query.isError ? "VERİ ALINAMADI" : data?.availability === "NOT_STARTED" ? "BAŞLAMADI" : data?.availability === "UNAVAILABLE" ? "KULLANILAMIYOR" : "TEYİT BEKLENİYOR"}
              tone={waitingTone}
            />
            <Text style={styles.waitingTitle}>Şu anda yayımlanmış güncel seçim yok</Text>
            <Text style={styles.waitingReason}>{reason}</Text>
          </View>
        )}
        <View style={styles.jinx}>
          <Image accessible={false} resizeMode="contain" source={jinxFace} style={styles.jinxFace} />
          <View style={styles.jinxBubble}>
            <Text style={styles.jinxName}>Jinx</Text>
            <Text style={styles.jinxText}>{jinxText}</Text>
          </View>
        </View>
      </Card>

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
          <Text style={styles.listCount}>{data?.history.length ?? 0}</Text>
        </View>
        {data?.history.length ? data.history.map(record => (
          <RecommendationRow
            key={record.decisionId}
            onPress={() => setSelectedId(record.decisionId)}
            record={record}
            selected={record.decisionId === selected?.decisionId}
            showTeams={false}
          />
        )) : <Text style={styles.empty}>Yayımlanmış öneri yok.</Text>}
      </Card>

      <Card padded={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showCandidates }}
          onPress={() => setShowCandidates(!showCandidates)}
          style={({ pressed, hovered }) => [styles.disclosure, hovered && styles.rowHover, pressed && styles.pressed]}
        >
          <View style={styles.headingCopy}>
            <Text style={styles.disclosureTitle}>{showCandidates ? "Diğer adayları gizle" : "Diğer adaylar ve elenme nedenleri"}</Text>
            <Text style={styles.caption}>Yayımlanmış birimlerden ayrı tutulur; bahis önerisi değildir.</Text>
          </View>
          <MaterialCommunityIcons color={semantic.intelligence} name={showCandidates ? "chevron-up" : "chevron-down"} size={iconSizes.control} />
        </Pressable>
        {showCandidates ? data?.candidates.map(c => {
          const status = c.selected ? { label: "EN İYİ ADAY", tone: "positive" as const } : c.admitted ? { label: "UYGUN, SEÇİLMEDİ", tone: "pending" as const } : { label: "ELENDİ", tone: "neutral" as const };
          return (
            <View key={c.market} style={styles.candidate}>
              <View style={styles.rowBetween}>
                <Text style={styles.candidateMarket}>{formatSelection(c.market)}</Text>
                <TonePill label={status.label} tone={status.tone} />
              </View>
              <Text style={styles.candidateReason}>{rebuildReason(c.reason)}</Text>
              <Text style={styles.candidateFacts}>
                Puan {formatScore(c.consistencyScore)} · {c.votesSupport}/{c.votesUsed} teyit · {c.poolWins}/{c.poolTotal} havuz desteği
              </Text>
            </View>
          );
        }) : null}
      </Card>
    </View>
  );
}

/** The 7/30 segment. */
function PeriodSwitch({ days, onChange }: { days: 7 | 30; onChange: (days: 7 | 30) => void }) {
  return (
    <View accessibilityRole="tablist" style={styles.segment}>
      {([7, 30] as const).map(option => (
        <Pressable
          accessibilityLabel={`${option} gün`}
          accessibilityRole="tab"
          accessibilityState={{ selected: days === option }}
          key={option}
          onPress={() => onChange(option)}
          style={({ pressed }) => [styles.segmentItem, days === option && styles.segmentItemActive, pressed && styles.pressed]}
        >
          <Text style={[styles.segmentText, days === option && styles.segmentTextActive]}>{option} gün</Text>
        </Pressable>
      ))}
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
 * Hypothetical one-unit results at the original quote (A7 question 36): last 7
 * or 30 Istanbul days by publication, five outcomes kept apart, a dash for a
 * ratio with no resolved risk, match-level risk retained, legacy kept out.
 */
export function RebuildReportPanel({ history = false, columns = false, aside }: {
  history?: boolean;
  /** Wide desktop: the report and its supporting links on the left, the published records on the right. */
  columns?: boolean;
  /** Supporting content kept under the report card, such as the legacy link. */
  aside?: ReactNode;
}) {
  const query = useQuery(rebuildReportQuery), router = useRouter(), [days, setDays] = useState<7 | 30>(7), [expanded, setExpanded] = useState(false);
  const data = query.data, period = data?.periods.find(p => p.days === days);
  const available = !query.isError && data?.availability === "AVAILABLE" && period;
  const recommendations = available ? data.recommendations.filter(r => rebuildCalendarDay(r.publishedAt) >= period.from) : [];
  return (
    <View style={[styles.stack, columns && styles.columns]}>
      <View style={[styles.stack, columns && styles.reportColumn]}>
      <Card>
        <View style={styles.reportHead}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrowBronze}>BTB</Text>
            <Text accessibilityRole="header" aria-level={2} style={styles.headingTitle}>Sonuçlar</Text>
          </View>
          <PeriodSwitch days={days} onChange={setDays} />
        </View>
        {!available ? (
          <View style={styles.waiting}>
            <TonePill dot label={query.isError ? "VERİ ALINAMADI" : "RAPOR BEKLENİYOR"} tone={query.isError ? "neutral" : "warning"} />
            <Text style={styles.waitingReason}>{query.isError ? "Veri alınamadı" : rebuildReason(data?.reason)}</Text>
            <Action icon="refresh" onPress={() => { void query.refetch(); }} title="Yenile" />
          </View>
        ) : (
          <View style={styles.reportBody}>
            <Text style={styles.period}>{days} gün · {formatReportRange(period.from, period.through)} · İstanbul</Text>
            {period.recommendations === 0 ? (
              <View style={styles.waiting}>
                <Text style={styles.waitingTitle}>Bu dönemde yayımlanmış öneri yok</Text>
                <Text style={styles.waitingReason}>BTB bir öneri yayımladığında ilk oranıyla burada sayılır.</Text>
              </View>
            ) : (
              <>
                <View style={styles.hero}>
                  <TicketFigure label="birim · varsayımsal" size="large" tone={unitsTone(period.net)} value={formatUnits(period.net)} />
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
              <Text style={styles.noteText}>Her öneri ilk oranıyla varsayımsal 1 birimdir. Aynı maçtaki öneriler bağımsız maç sayılmaz. Eski A3 kayıtları ayrı tutulur.</Text>
            </View>
            <Text style={styles.noteText}>{period.uncertainty ? `Maç bazlı keşif aralığı: ${formatRatio(period.uncertainty.lower)} — ${formatRatio(period.uncertainty.upper)}; küçük örneklemde kanıt sınırlıdır.` : "Belirsizlik hesabı için farklı maç kanıtı yetersiz."}</Text>
            <Action icon={expanded ? "chevron-up" : "chevron-down"} onPress={() => setExpanded(!expanded)} title={expanded ? "Kırılımları gizle" : "Yıldız / pazar / maç kırılımları"} />
            {expanded ? (
              <View style={styles.stackTight}>
                <BreakdownTable rows={period.byStar.map(s => ({ key: String(s.stars), label: <RatingStars rating={s.stars} size={12} />, settled: s.settled, net: s.net }))} title="YILDIZA GÖRE" />
                <BreakdownTable rows={period.byMarket.map(m => ({ key: m.market, label: formatSelection(m.market), settled: m.settled, net: m.net }))} title="PAZARA GÖRE" />
                <BreakdownTable rows={period.byMatch.map(m => ({ key: m.matchKey, label: matchLabel(m.matchKey, data.recommendations), settled: m.settled, net: m.net, extra: `${m.recommendations} öneri · risk ${m.totalRisk}` }))} title="MAÇA GÖRE" />
                {data.learning ? (
                  <View style={styles.learning}>
                    <Text style={styles.eyebrowMuted}>ÖĞRENME İNCELEMESİ</Text>
                    <Progress label="Sonuçlanan öneri" required={100} value={data.learning.overall.settled} />
                    <Progress label="Farklı maç" required={30} value={data.learning.overall.matches} />
                    <Progress label="Gün" required={2} value={data.learning.overall.days} />
                    <Text style={styles.noteText}>Yalnız inceleme içindir; kurallar yalnız onayla değişir.</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </Card>
      {aside}
      </View>
      {history && available ? (
        <View style={columns ? styles.historyColumn : null}>
        <Card padded={false}>
          <View style={styles.listHead}>
            <Text style={styles.eyebrowMuted}>İLK ÖNERİLER VE SONUÇLARI</Text>
            <Text style={styles.listCount}>{recommendations.length}</Text>
          </View>
          {recommendations.length ? recommendations.map(r => (
            <RecommendationRow
              key={r.decisionId}
              onPress={() => router.push({ pathname: "/match/[key]", params: { key: r.matchKey, decision: r.decisionId } } as never)}
              record={r}
            />
          )) : <Text style={styles.empty}>Bu dönemde yayımlanmış öneri yok.</Text>}
        </Card>
        </View>
      ) : null}
    </View>
  );
}

/** The latest published records, for the Overview's decision module. */
export function RecentRecommendations({ limit = 3 }: { limit?: number }) {
  const query = useQuery(rebuildReportQuery), router = useRouter();
  const records = query.data?.availability === "AVAILABLE" ? [...query.data.recommendations]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, limit) : [];
  if (!records.length) return null;
  return (
    <Card padded={false}>
      {records.map(r => (
        <RecommendationRow
          key={r.decisionId}
          onPress={() => router.push({ pathname: "/match/[key]", params: { key: r.matchKey, decision: r.decisionId } } as never)}
          record={r}
        />
      ))}
    </Card>
  );
}

/** Seven-day figures for the Overview strip; undefined while unavailable. */
export function useRebuildWeek() {
  const query = useQuery(rebuildReportQuery);
  const period = !query.isError && query.data?.availability === "AVAILABLE" ? query.data.periods.find(p => p.days === 7) : undefined;
  return { period, loading: query.isLoading, recommendations: query.data?.recommendations ?? [] };
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md, width: "100%" },
  columns: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xl },
  reportColumn: { width: 440, flexShrink: 0 },
  historyColumn: { flex: 1, minWidth: 0 },
  stackTight: { gap: spacing.lg },
  card: { borderRadius: 20, borderWidth: 1, borderColor: colors.borderSoft, ...shadows.card },
  cardBody: { padding: spacing.lg, gap: spacing.md },
  heading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.sm },
  headingCopy: { flex: 1, minWidth: 0 },
  headingTitle: { color: colors.text, ...typeScale.moduleTitle, marginTop: 2 },
  eyebrowBronze: { color: colors.bronze, ...typeScale.eyebrow },
  eyebrowMuted: { color: colors.textMuted, ...typeScale.eyebrow },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  caption: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  link: { color: semantic.intelligence, ...typeScale.bodyCompact, fontWeight: "700" },
  action: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, paddingHorizontal: spacing.sm, marginHorizontal: -spacing.sm, borderRadius: radii.md },
  actionHover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 },
  currentBlock: { gap: spacing.sm },
  currentMarket: { color: colors.text, ...typeScale.decision, fontSize: 20, lineHeight: 26 },
  figures: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.xs },
  waitingTitle: { color: colors.text, ...typeScale.decision },
  waitingReason: { color: colors.textMuted, ...typeScale.body },
  jinx: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  jinxFace: { width: 44, height: 44 },
  jinxBubble: { flex: 1, minWidth: 0, backgroundColor: colors.surfaceStrong, borderRadius: 14, borderTopLeftRadius: 4, padding: spacing.md, gap: 2 },
  jinxName: { color: colors.text, ...typeScale.label, fontWeight: "800", letterSpacing: 0 },
  jinxText: { color: colors.text, ...typeScale.body },
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
  disclosure: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, minHeight: 64 },
  disclosureTitle: { color: colors.text, ...typeScale.identity, fontWeight: "700" },
  candidate: { gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  candidateMarket: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700", flexShrink: 1 },
  candidateReason: { color: colors.textMuted, ...typeScale.bodyCompact },
  candidateFacts: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  reportHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" },
  reportBody: { gap: spacing.md },
  period: { color: colors.textMuted, ...typeScale.meta },
  waiting: { gap: spacing.sm, alignItems: "flex-start" },
  hero: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.lg },
  heroSide: { flexDirection: "row", gap: spacing.xl },
  outcome: { gap: spacing.sm },
  outcomeBar: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", gap: 2, backgroundColor: colors.surfaceStrong },
  outcomeEmpty: { flex: 1 },
  outcomeLegend: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 },
  exposure: { color: colors.text, ...typeScale.bodyCompact },
  segment: { flexDirection: "row", padding: 3, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundElevated },
  segmentItem: { minHeight: 38, minWidth: 64, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", borderRadius: 999 },
  segmentItemActive: { backgroundColor: colors.actionFill },
  segmentText: { color: colors.textMuted, ...typeScale.bodyCompact, fontWeight: "700" },
  segmentTextActive: { color: colors.onAction },
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
