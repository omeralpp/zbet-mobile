import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { rebuildMatchQuery, rebuildReportQuery } from "@/src/api/queries";
import type { RebuildRecommendation } from "@/src/api/rebuild-schemas";
import { currentRebuild, rebuildCalendarDay, rebuildReason } from "@/src/utils/rebuild-current";
import { colors, fontWeights, radii, spacing } from "@/src/theme/theme";
import { formatSelection } from "@/src/utils/format";

export function useRebuildClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  return now;
}
const resultLabel = { WIN: "Kazandı", LOSS: "Kaybetti", VOID: "İptal", PENDING: "Bekliyor", UNRESOLVED: "Çözülemedi" } as const;
const capLabel: Record<string, string> = { sample: "Havuz", direction: "Yön", timing: "Ölçüm zamanı", xg: "xG kapsamı", time_goals: "Dakika / gereken gol" };
const number = (text: string | null) => text === null ? "—" : text;
function Action({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.action}><Text style={styles.link}>{title}</Text></Pressable>;
}
function Facts({ record }: { record: RebuildRecommendation }) {
  return <View style={styles.stack}>
    <Text style={styles.title}>{formatSelection(record.market)} · {"★".repeat(record.stars)}</Text>
    <Text style={styles.body}>{record.minute}′ · {record.homeScore}–{record.awayScore} · İlk oran {record.quote}</Text>
    <Text style={styles.body}>Tutarlılık puanı {record.consistencyScore} · {record.poolWins}/{record.poolTotal} havuz desteği · {record.votesSupport}/{record.votesUsed} baskı teyidi</Text>
    <Text style={styles.body}>Lider skorlar: {record.leaders.map(s => `${s.home}–${s.away}`).join(" · ") || "—"}</Text>
    {record.votes.map((vote, i) => <Text key={vote.endsAt} style={styles.body}>
      {i + 1}. aralık · {vote.supports ? "Destekliyor" : "Ters oy"} · Ev {vote.home} / Deplasman {vote.away} / Toplam {vote.total}
    </Text>)}
    <Text style={styles.body}>Puan kesintileri · Havuz: 20 × ({record.poolTotal}−{record.poolWins})/{record.poolTotal} · Yön: {record.directionConflict ? 20 : 0} · Ters oy: {record.dissent ? 5 : 0}</Text>
    <Text style={styles.body}>Yıldız tavanları · {Object.entries(record.caps).map(([key, value]) => `${capLabel[key]} ${value}`).join(" · ")}</Text>
    <Text style={styles.muted}>Yıldız: tutarlılık ve kanıt kalitesi. Havuz desteği farklı SAP referans kayıtlarını sayar; fiziksel maç tekilliği doğrulanmamıştır.</Text>
    <Text style={styles.body}>{resultLabel[record.result.state]} · {number(record.result.net)} birim · Sonuç revizyonu {record.result.revision}</Text>
  </View>;
}
export function RebuildEvidencePanel({ matchKey }: { matchKey: string }) {
  const query = useQuery(rebuildMatchQuery(matchKey)), now = useRebuildClock();
  const params = useLocalSearchParams<{ decision?: string | string[] }>();
  const [selectedId, setSelectedId] = useState<string | null>(null), [showCandidates, setShowCandidates] = useState(false);
  const data = query.data, current = !query.isError ? currentRebuild(data, now) : null;
  const requested = typeof params.decision === "string" ? params.decision : null;
  const selected = data?.history.find(h => h.decisionId === (selectedId || requested || current?.decisionId));
  const reason = query.isError ? "Veri yenilenemedi" : data?.availability === "ACTIVE" && !current ? "Oran / ölçüm güncel değil" : rebuildReason(data?.reason);
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.title}>BTB · Karar ve kanıt</Text>
    <Text accessibilityLiveRegion="polite" style={styles.body}>{current ? `${formatSelection(current.market)} · ${"★".repeat(current.stars)} · Güncel oran ${current.quote}` : `Güncel veri/teyit bekleniyor · ${reason}`}</Text>
    <Action title={query.isFetching ? "Yenileniyor…" : "Yenile"} onPress={() => { void query.refetch(); }} />
    <Text style={styles.label}>Jinx</Text>
    <Text style={styles.body}>{selected && selected.decisionId !== current?.decisionId
      ? `${formatSelection(selected.market)} için kaydedilmiş karar: ${selected.votesSupport}/${selected.votesUsed} baskı teyidi, ${selected.poolWins}/${selected.poolTotal} havuz desteği; yön çelişkisi ${selected.directionConflict ? "var" : "yok"}.`
      : current ? data?.jinx.summary : `Güncel veri/teyit bekleniyor · ${reason}`}</Text>
    {selected ? <Facts record={selected} /> : null}
    {data?.history.length ? <View style={styles.stack}>
      <Text style={styles.label}>Maç boyunca öneriler</Text>
      {data.history.map(record => <Action key={record.decisionId} title={`${record.minute}′ · ${formatSelection(record.market)} · ${"★".repeat(record.stars)} · ${resultLabel[record.result.state]}`}
        onPress={() => setSelectedId(record.decisionId)} />)}
    </View> : <Text style={styles.muted}>Yayımlanmış öneri yok.</Text>}
    <Action title={showCandidates ? "Diğer adayları gizle" : "Diğer adaylar ve elenme nedenleri"} onPress={() => setShowCandidates(!showCandidates)} />
    {showCandidates ? data?.candidates.map(c => <View key={c.market} style={styles.candidate}>
      <Text style={styles.body}>{formatSelection(c.market)} · {c.selected ? "En iyi aday" : c.admitted ? "Uygun, seçilmedi" : "Elendi"}</Text>
      <Text style={styles.muted}>{rebuildReason(c.reason)} · Puan {number(c.consistencyScore)} · {c.votesSupport}/{c.votesUsed} teyit · {c.poolWins}/{c.poolTotal} havuz desteği</Text>
    </View>) : null}
  </View>;
}
export function RebuildReportPanel({ history = false }: { history?: boolean }) {
  const query = useQuery(rebuildReportQuery), router = useRouter(), [days, setDays] = useState<7 | 30>(7), [expanded, setExpanded] = useState(false);
  const data = query.data, period = data?.periods.find(p => p.days === days);
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.title}>BTB · Sonuçlar</Text>
    <View style={styles.row}><Action title="7 gün" onPress={() => setDays(7)} /><Action title="30 gün" onPress={() => setDays(30)} />
      <Action title="Yenile" onPress={() => { void query.refetch(); }} /></View>
    {query.isError || data?.availability !== "AVAILABLE" || !period ? <Text style={styles.body}>Rapor bekleniyor · {query.isError ? "Veri alınamadı" : rebuildReason(data?.reason)}</Text> : <View style={styles.stack}>
      <Text style={styles.body}>{days} gün · {period.from} — {period.through} · İstanbul</Text>
      <Text style={styles.title}>{period.net} birim · ROI {period.roi === null ? "—" : `%${(period.roi * 100).toFixed(1)}`}</Text>
      <Text style={styles.body}>{period.wins} kazandı · {period.losses} kaybetti · {period.pending} bekliyor · {period.unresolved} çözülemedi · {period.voids} iptal</Text>
      <Text style={styles.body}>{period.recommendations} öneri / {period.matches} maç · Toplam risk {period.totalRisk} · Sonuçlanan risk {period.risk} · İsabet {period.hitRate === null ? "—" : `%${(period.hitRate * 100).toFixed(1)}`}</Text>
      <Text style={styles.muted}>Her öneri ilk oranıyla varsayımsal 1 birimdir. Aynı maçtaki öneriler bağımsız maç sayılmaz. Eski A3 kayıtları ayrı tutulur.</Text>
      <Text style={styles.muted}>{period.uncertainty ? `Maç bazlı keşif aralığı: %${(period.uncertainty.lower * 100).toFixed(1)} — %${(period.uncertainty.upper * 100).toFixed(1)}; küçük örneklemde kanıt sınırlıdır.` : "Belirsizlik hesabı için farklı maç kanıtı yetersiz."}</Text>
      <Action title={expanded ? "Kırılımları gizle" : "Yıldız / pazar / maç kırılımları"} onPress={() => setExpanded(!expanded)} />
      {expanded ? <View style={styles.stack}>
        {period.byStar.map(s => <Text key={s.stars} style={styles.body}>{"★".repeat(s.stars)} · {s.settled} sonuç · {s.net} birim</Text>)}
        {period.byMarket.map(m => <Text key={m.market} style={styles.body}>{formatSelection(m.market)} · {m.settled} sonuç · {m.net} birim</Text>)}
        {period.byMatch.map(m => <Text key={m.matchKey} style={styles.body}>{m.matchKey.slice(0, 10)} · {m.recommendations} öneri · Risk {m.totalRisk} · {m.net} birim</Text>)}
        {data.learning ? <Text style={styles.muted}>Öğrenme incelemesi: {data.learning.overall.settled}/100 sonuç, {data.learning.overall.matches}/30 maç, {data.learning.overall.days}/2 gün. Kurallar yalnız onayla değişir.</Text> : null}
      </View> : null}
      {history ? <View style={styles.stack}>
        <Text style={styles.label}>İlk öneriler ve sonuçları</Text>
        {data.recommendations.filter(r => rebuildCalendarDay(r.publishedAt) >= period.from).map(r => <View key={r.decisionId} style={styles.candidate}>
          <Action title={`${r.homeTeam} – ${r.awayTeam} · ${r.minute}′ · ${formatSelection(r.market)} · ${"★".repeat(r.stars)}`}
            onPress={() => router.push({ pathname: "/match/[key]", params: { key: r.matchKey, decision: r.decisionId } } as never)} />
          <Text style={styles.body}>İlk oran {r.quote} · {resultLabel[r.result.state]} · {number(r.result.net)} birim</Text>
        </View>)}
      </View> : null}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm, width: "100%" },
  stack: { gap: spacing.sm }, row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  title: { color: colors.text, fontSize: 19, fontWeight: fontWeights.bold }, body: { color: colors.text, fontSize: 14, lineHeight: 21 },
  label: { color: colors.text, fontSize: 15, fontWeight: fontWeights.bold }, muted: { color: colors.textSubtle, fontSize: 12, lineHeight: 18 },
  link: { color: colors.blue, fontSize: 14, fontWeight: fontWeights.medium }, action: { minHeight: 44, justifyContent: "center", paddingVertical: spacing.xs },
  candidate: { borderTopWidth: 1, borderTopColor: colors.surfaceStrong, paddingTop: spacing.sm, gap: spacing.xs }
});
