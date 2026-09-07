import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from "react-native-svg";
import type { LiveContext, MatchDetail, MatchInsight, SuperLog } from "@/src/api/schemas";
import { colors, radii, semantic, spacing } from "@/src/theme/theme";
import { OriginBadge } from "./IntelligenceNotice";
import { LiveContextFreshness } from "./LiveContextNotice";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { appendJourney, journeyDecisions, journeyEvents, journeyHeightAt, journeyMatchMinute, journeyRuns, sampleJourney, scoreAnchor, type JourneySample } from "./match-journey-v2";

const directions = {
  AGAINST: "Beklentiye karşı", TOWARD: "Beklenti yönünde",
  NEUTRAL: "Dağılım payı aynı", UNKNOWN: "Olay öncesi dağılım bilinmiyor"
};

/** The detail screen owns observations so collapsing/reordering a panel cannot
 * erase the line or stop observations. This is still temporary screen memory. */
export function useJourneyObservations(match: MatchDetail | undefined, insight: MatchInsight | undefined, observedAt: number, active: boolean) {
  const [observation, setObservation] = useState<{ at: number; samples: JourneySample[] }>({ at: 0, samples: [] });
  if (match && active && observedAt > observation.at) {
    const next = sampleJourney(match, insight, observedAt);
    setObservation({ at: observedAt, samples: next ? appendJourney(observation.samples, next) : observation.samples });
  }
  return observation.samples.filter((sample) => sample.matchKey === match?.key);
}

export function MatchJourneyV2({ match, logs, liveContext, samples, synthetic, onDecisionPress, currentDecisionKey }: {
  match: MatchDetail;
  logs: SuperLog[];
  liveContext: LiveContext | undefined;
  samples: JourneySample[];
  synthetic: boolean;
  onDecisionPress?: (decision: SuperLog) => void;
  currentDecisionKey?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const latest = samples.at(-1);
  const anchor = scoreAnchor(match.scoreDistribution, match.homeScore, match.awayScore);
  const decisions = journeyDecisions(logs, match.key, samples);
  const events = journeyEvents(liveContext, samples);
  const minute = journeyMatchMinute(match);
  const lastMinute = Math.max(90, minute ?? 0, ...samples.map((sample) => sample.minute), ...decisions.map((decision) => decision.minute), ...events.map((event) => event.minute));
  const toX = (at: number) => 42 + at / lastMinute * 292;
  const toY = (level: number) => 30 + (1 - level) * 118;
  const axisY = 181;
  const ticks = [0, 15, 30, 45, 60, 75, 90, ...(lastMinute > 90 ? [lastMinute] : [])];
  const plotted = samples.filter((sample) => sample.level !== null);
  const runs = journeyRuns(samples);
  const hasLine = runs.some((run) => run.length > 1);
  const markers = [
    ...decisions.map((decision) => ({ ...decision, kind: "SUPER" as const, label: `★${decision.rating} ${decision.market}` })),
    ...events.map((event) => ({ ...event, kind: "EVENT" as const, level: journeyHeightAt(samples, event.minute) }))
  ].sort((a, b) => a.minute - b.minute || a.key.localeCompare(b.key));
  const chosen = markers.find((marker) => marker.key === selected);
  const selectedLog = chosen?.kind === "SUPER" ? logs.find((log) => log.key === chosen.key) : undefined;
  const coverage = hasLine ? `${plotted[0]?.minute}′–${plotted.at(-1)?.minute}′ gözlendi · boşluklar gözlenmedi`
    : match.status === "FINISHED" ? "Bu maçın dakika geçmişi kaydedilmedi; akış eğrisi mevcut değil."
    : plotted.length ? `${plotted[0]?.minute}′ itibarıyla izleniyor; dakika ilerledikçe çizgi uzar.`
    : match.status === "NOT_STARTED" ? "Maç başlayıp skor dağılımı geldiğinde çizgi ilerleyecek."
    : "Dakika ve skor dağılımı gözlemi bekleniyor.";
  const eventUnavailable = !liveContext?.timeline || liveContext.freshness?.stale || liveContext.freshness?.refreshFailed;

  return (
    <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <View style={styles.header}>
        <Text style={styles.title}>{match.status === "FINISHED" ? "Maç sonu" : minute === null ? "Maç akışı" : `${minute}′ · Maç akışı`}</Text>
        <Text style={styles.tag}>GÖRSEL DENEME</Text>
      </View>
      <OriginBadge origin={synthetic ? "SYNTHETIC" : "LIVE"} />
      <Text style={styles.body}>{match.homeScore}-{match.awayScore} · ev–deplasman{anchor ? ` · skor sırası #${anchor.rank} · %${Math.round(anchor.probability * 100)}` : " · dağılım bekleniyor"}</Text>
      <Svg viewBox="0 0 354 224" width="100%" height={240} accessibilityLabel="Tek maç akışı. Yatay eksen maç dakikası, yükseklik skorun olağanlığı. Gol, kart ve Super işaretleri aynı dakika ekseninde. Gözlenmeyen eğri çizilmez.">
        <SvgText x={2} y={22} fill={colors.textMuted} fontSize={10}>Olağan</SvgText>
        <SvgText x={2} y={151} fill={colors.textMuted} fontSize={10}>Sıra dışı</SvgText>
        {[0, 45, 90].map((at) => <Line key={at} x1={toX(at)} x2={toX(at)} y1={27} y2={axisY} stroke={colors.borderSoft} strokeDasharray="3 5" />)}
        <Line x1={42} x2={334} y1={axisY} y2={axisY} stroke={colors.textSubtle} strokeWidth={1} />
        {minute !== null && match.status !== "FINISHED" ? <Line x1={toX(minute)} x2={toX(minute)} y1={28} y2={axisY} stroke={semantic.intelligence} strokeOpacity={0.4} strokeDasharray="2 4" /> : null}
        {runs.filter((run) => run.length > 1).map((run, index) => <Polyline key={index}
          points={run.map((point) => `${toX(point.minute)},${toY(point.level!)}`).join(" ")}
          fill="none" stroke={semantic.intelligence} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />)}
        {plotted.filter((point, index) => !point.connects || index === plotted.length - 1).map((point) => <Circle key={point.minute} cx={toX(point.minute)} cy={toY(point.level!)} r={3.5} fill={semantic.intelligence} />)}
        {!hasLine ? <SvgText x={196} y={94} fill={colors.textMuted} textAnchor="middle" fontSize={10}>{match.status === "FINISHED" ? "Dakika geçmişi mevcut değil" : plotted.length ? "Sonraki dakika bekleniyor" : "Dağılım gözlemi bekleniyor"}</SvgText> : null}
        {markers.map((marker, index) => {
          const x = toX(marker.minute);
          const baseY = marker.level === null ? axisY : toY(marker.level);
          const overlaps = markers.slice(0, index).filter((prior) => Math.abs(prior.minute - marker.minute) < 2 && (prior.level === null) === (marker.level === null)).length;
          const y = baseY - 12 - (overlaps % 3) * 15;
          return <G key={marker.key}>
            <Line x1={x} x2={x} y1={baseY} y2={y} stroke={colors.textSubtle} {...(marker.level === null ? { strokeDasharray: "2 3" } : {})} />
            {marker.kind === "SUPER" ? <SvgText x={x} y={y} fontSize={15} textAnchor="middle" fill={semantic.warning} onPress={() => setSelected(marker.key)}>★</SvgText>
              : marker.label.startsWith("Gol") ? <Circle cx={x} cy={y - 4} r={4.5} stroke={colors.text} strokeWidth={1.5} fill={marker.direction === "AGAINST" ? semantic.surprise : colors.surface} onPress={() => setSelected(marker.key)} />
              : <Rect x={x - 3.5} y={y - 10} width={7} height={10} rx={1} fill={semantic.negative} onPress={() => setSelected(marker.key)} />}
          </G>;
        })}
        {ticks.map((at) => <SvgText key={at} x={toX(at)} y={lastMinute > 90 && at === lastMinute ? 220 : 207} textAnchor="middle" fill={colors.textMuted} fontSize={10}>{at}′</SvgText>)}
      </Svg>
      <Text style={styles.note}>{coverage}</Text>
      <Text style={styles.note}>Mavi: maçın yolu · ○ Gol · ▪ Kart · ★ Super</Text>
      <View style={styles.markers}>{markers.map((marker) => <Pressable key={marker.key} onPress={() => setSelected(marker.key)} accessibilityRole="button"
        accessibilityLabel={`${marker.minute}. dakika, ${marker.label}, ${marker.level === null ? "o dakikanın eğrisi bilinmiyor" : "gözlenen eğri üzerinde"}`}
        style={[styles.marker, marker.kind === "SUPER" && styles.superMarker, selected === marker.key && styles.chosen]}>
        <Text style={[styles.markerText, marker.kind === "SUPER" && styles.superText]}>{marker.minute}′ {marker.label}{marker.key === currentDecisionKey ? " · güncel" : ""}</Text>
      </Pressable>)}</View>
      {chosen ? <View style={styles.selection}>
        <Text style={styles.body}>{chosen.minute}′ · {chosen.label}{chosen.kind === "EVENT" ? ` · ${directions[chosen.direction]}` : ""}</Text>
        <Text style={styles.note}>{chosen.level === null ? "O dakikanın eğrisi gözlenmedi; işaret yalnız zamanını gösterir." : "İşaret bu oturumda gözlenen eğriye hizalıdır."}</Text>
        {selectedLog && onDecisionPress ? <Pressable accessibilityRole="button" onPress={() => onDecisionPress(selectedLog)}><Text style={styles.link}>Super kararını aç →</Text></Pressable> : null}
      </View> : null}
      {eventUnavailable ? <Text style={styles.note}>Gol ve kart dakikaları şu anda mevcut değil.</Text> : !events.length && match.homeScore + match.awayScore > 0 ? <Text style={styles.note}>Skor ilerledi; gol dakikaları henüz gelmedi.</Text> : null}
      <LiveContextFreshness ageSeconds={liveContext?.freshness?.ageSeconds} stale={liveContext?.freshness?.stale} refreshFailed={liveContext?.freshness?.refreshFailed} />
      <Text style={styles.note}>{latest?.underdogPressure == null ? "Baskı verisi yok; dağılım çizgisi kullanılıyor." : latest.underdogPressure > 0 ? "Baskı favori olmayanda · eğilim hafif aşağı." : "Baskı favori yönünde · olağanlık eğilimi korunuyor."}</Text>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)}><Text style={styles.link}>{details ? "Okuma kurallarını gizle −" : "Okuma kuralları ve veri sınırları +"}</Text></Pressable>
      {details ? <View style={styles.selection}>
        <Text style={styles.note}>Yüksek çizgi: mevcut skor dağılımda önde. Skor sırası ve payı seviyeyi, güncel baskı eğilimi belirler. Kırmızı kart baskıya ikinci kez eklenmez.</Text>
        <Text style={styles.note}>Gol ve kartın yönü, olaydan önceki aynı 5 dakikalık dilimde gözlenen dağılımla değerlendirilir. Önceki dağılım yoksa yön bilinmez.</Text>
        <Text style={styles.note}>Aynı benzer maç kaynağının devre skoruna göre daraltılmış sonuç havuzu kullanılır. Eksik/gizli skor sıfır sayılmaz. Skor payları dakika olasılığı değildir.</Text>
        <Text style={styles.note}>Ölçek ve baskı etkisi kalibre edilmedi; tahminleri etkilemez. Eğri maç detayı açıkken gözlenir, bu ekran kapanınca silinir. Super karar anındaki durum kaydedilmez.</Text>
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg, borderRadius: radii.lg, gap: spacing.sm, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", flexShrink: 1 },
  tag: { color: semantic.warning, fontSize: 9, fontWeight: "800" },
  body: { color: colors.text, fontSize: 12, lineHeight: 18 },
  note: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  markers: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  marker: { paddingHorizontal: 9, paddingVertical: 8, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.md },
  superMarker: { borderColor: semantic.warning },
  chosen: { backgroundColor: colors.surface },
  markerText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  superText: { color: semantic.warning },
  selection: { gap: spacing.sm, paddingTop: spacing.sm },
  link: { color: semantic.intelligence, fontSize: 12, fontWeight: "700", paddingVertical: spacing.sm }
});
