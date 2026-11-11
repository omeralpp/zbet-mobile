import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { selectionComparisonQuery, selectionHistoryQuery } from "@/src/api/queries";
import type { MatchDetail } from "@/src/api/schemas";
import { emptySelectionComparison, type SelectionProposal } from "@/src/api/selection-comparison-schema";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatRate, formatSelection, formatSigned } from "@/src/utils/format";
import { currentSelectionComparison, historicalSelection, selectionArmDescriptions, selectionArmLabels, selectionArmStatus, selectionLabHasContent, selectionReason } from "./selection-lab-view";
import { SurfaceMaterial } from "./SurfaceMaterial";

export function SelectionLab({ match, focused, wide }: { match: MatchDetail; focused: boolean; wide: boolean }) {
  const query = useQuery({ ...selectionComparisonQuery(focused ? match.key : ""), refetchInterval: focused && match.status === "LIVE" ? 15000 : false });
  const historyQuery = useQuery({ ...selectionHistoryQuery(focused ? match.key : ""), refetchInterval: focused && match.status === "LIVE" ? 30000 : false });
  const [now, setNow] = useState(Date.now);
  const [expanded, setExpanded] = useState<SelectionProposal["id"] | null>(null);
  const [showExposure, setShowExposure] = useState(false);
  // null follows the content: folded while every arm is a placeholder.
  const [opened, setOpened] = useState<boolean | null>(null);
  useEffect(() => {
    if (!focused) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [focused]);
  const current = currentSelectionComparison(query.data, match, now, query.isError || !focused);
  const data = current ?? emptySelectionComparison(match.key);
  const first = historicalSelection(historyQuery.data, match.key, now, historyQuery.isError || !focused);
  const hasContent = selectionLabHasContent(current, first);
  const showBody = opened ?? hasContent;
  const reason = query.isError ? "Karşılaştırma alınamadı. Yeniden deneyebilirsin."
    : query.isLoading ? "Karşılaştırma yükleniyor…"
    : current ? "Aynı maç durumu · aynı karar anı"
    : selectionReason(query.data?.availability === "AVAILABLE" ? "FOOTBALL_STATE_CHANGED" : query.data?.reason ?? "NOT_PUBLISHED");

  const card = (arm: SelectionProposal) => { const status = selectionArmStatus(arm, query.isError); return <View key={arm.id} style={[styles.proposal, wide && arm.id !== "C1" && styles.wideProposal]}>
    <Text style={styles.eyebrow}>{arm.id === "C0" ? "REFERANS" : "DENEYSEL"}</Text>
    <Text accessibilityRole="header" style={styles.cardTitle}>{selectionArmLabels[arm.id]}</Text>
    <Text style={styles.selection}>{arm.selection ? formatSelection(arm.selection.market) : status.headline}</Text>
    {arm.selection ? <Text style={styles.quote}>Karşılaştırma oranı {formatRate(arm.selection.quote)}</Text>
      : status.note ? <Text style={styles.note}>{status.note}</Text> : null}
    {arm.probability !== null ? <Text style={styles.metric}>Model olasılığı %{(100*arm.probability).toFixed(1)}</Text> : null}
    {arm.expectedNet !== null ? <Text style={styles.metric}>Beklenen net {formatSigned(arm.expectedNet, 3)} birim</Text> : null}
    {arm.form ? <Text style={styles.note}>Form örneklemi · ev {arm.form.homeN} · dep {arm.form.awayN}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === arm.id }} aria-expanded={expanded === arm.id}
      onPress={() => setExpanded(expanded === arm.id ? null : arm.id)} style={styles.action}>
      <Text style={styles.actionText}>{expanded === arm.id ? "Açıklamayı kapat" : "Bu yöntem nasıl seçiyor?"}</Text>
    </Pressable>
    {expanded === arm.id ? <View style={styles.explanation}>
      <Text style={styles.note}>{selectionArmDescriptions[arm.id]}</Text>
      {arm.status !== "SELECTED" && status.note ? <Text style={styles.note}>{status.note}</Text> : null}
      {arm.form ? <Text style={styles.note}>Saha örneklemi · ev {arm.form.homeVenueN} · dep {arm.form.awayVenueN}</Text> : null}
      {arm.trialId ? <Text selectable style={styles.note}>Deney: {arm.trialId}</Text> : null}
    </View> : null}
  </View>; };

  const refresh = !current && !query.isLoading ? <Pressable accessibilityRole="button" accessibilityState={{ busy: query.isFetching }} disabled={query.isFetching || !focused}
    onPress={() => { void query.refetch(); if (historyQuery.isError) void historyQuery.refetch(); }} style={({ pressed, hovered }) => [styles.action, styles.actionRow, hovered && styles.actionHover, pressed && styles.actionPressed]}>
    <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="refresh" size={iconSizes.small} />
    <Text style={styles.actionText}>{query.isFetching ? "Yenileniyor…" : "Karşılaştırmayı yenile"}</Text></Pressable> : null;
  // Offered only while the arms are placeholders; real content is never folded away.
  const fold = !hasContent ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: showBody }} aria-expanded={showBody}
    onPress={() => setOpened(!showBody)} style={({ pressed, hovered }) => [styles.action, styles.actionRow, hovered && styles.actionHover, pressed && styles.actionPressed]}>
    <Text style={styles.actionText}>{showBody ? "Yöntemleri gizle" : "Yöntemleri göster"}</Text>
    <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name={showBody ? "chevron-up" : "chevron-down"} size={iconSizes.inline} /></Pressable> : null;

  return <View style={styles.panel}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.header}>
      <View style={styles.headerCopy}><Text style={styles.eyebrow}>SEÇİM LABORATUVARI</Text>
        <Text accessibilityRole="header" style={styles.title}>Aynı maç, farklı yaklaşımlar</Text></View>
      <View style={styles.badge}><Text style={styles.badgeText}>Araştırma</Text></View>
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.note}>{reason}</Text>
    {!showBody ? <View style={styles.foldedActions}>{fold}{refresh}</View> : <>
    <View style={[styles.cards, wide && styles.wideCards]}>{data.proposals.filter(arm => arm.id !== "C1").map(card)}</View>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: showExposure }} aria-expanded={showExposure}
      onPress={() => setShowExposure(!showExposure)} style={styles.action}>
      <Text style={styles.actionText}>{showExposure ? "Maç sınırı deneyini gizle" : "Maç başına sınır deneyini karşılaştır"}</Text>
    </Pressable>
    {showExposure ? card(data.proposals[1]!) : null}
    <View style={styles.proposal}>
      <Text style={styles.eyebrow}>GEÇMİŞ · VARSAYIMSAL</Text>
      <Text accessibilityRole="header" style={styles.cardTitle}>Maçın ilk C1 kararı</Text>
      {first ? <>
        <Text style={styles.selection}>{formatSelection(first.market)}</Text>
        <Text style={styles.quote}>Karar anındaki oran {formatRate(first.quote)}</Text>
        <Text style={styles.note}>{first.state.elapsed}′ · skor {first.state.homeScore}–{first.state.awayScore} · {first.state.period === "1H" ? "İlk yarı" : "İkinci yarı"}</Text>
        {first.reference ? <Text style={styles.note}>Aynı andaki BTB: {formatSelection(first.reference.market)} · {formatRate(first.reference.quote)}</Text> : null}
        <Text style={styles.note}>Bu maç için yeni C1 kararı üretilmez. Sonuç henüz değerlendirilmedi.</Text>
      </> : <Text style={styles.note}>{historyQuery.isError ? "Karar geçmişi alınamadı." : historyQuery.isLoading ? "Karar geçmişi yükleniyor…"
        : historyQuery.data?.reason === "PUBLICATION_PENDING" ? "İlk kararın yayını henüz doğrulanmadı."
        : historyQuery.data?.reason === "HISTORY_INVALID" ? "Karar kaydı doğrulanamadı."
        : "Bu maç için kaydedilmiş C1 kararı yok."}</Text>}
      <Text style={styles.note}>Geçmiş karar ve oran kaydıdır; güncel teklif değildir. Gerçek bahis işlemi içermez.</Text>
      {historyQuery.isError ? <Pressable accessibilityRole="button" disabled={!focused || historyQuery.isFetching}
        accessibilityState={{ busy: historyQuery.isFetching }} onPress={() => { void historyQuery.refetch(); }} style={styles.action}>
        <Text style={styles.actionText}>Karar geçmişini yenile</Text></Pressable> : null}
    </View>
    <Text style={styles.note}>Yöntemler aynı seçimi yapabilir veya seçimden kaçınabilir. Deneyler mevcut BTB modelini değiştirmez.</Text>
    <View style={styles.foldedActions}>{fold}{refresh}</View>
    </>}
  </View>;
}

const styles = StyleSheet.create({
  // Its own gap and edge, like the cards on either side; the detail screen sets no gap.
  panel: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md, marginVertical: spacing.md, overflow: "hidden" },
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: spacing.sm },
  headerCopy: { flex: 1, minWidth: 180, gap: spacing.xs },
  title: { ...typeScale.moduleTitle, color: colors.text },
  // The app's eyebrow role; blue keeps research apart from the gold BTB decision.
  eyebrow: { ...typeScale.eyebrow, color: semantic.intelligence },
  badge: { backgroundColor: colors.blueSoft, borderRadius: radii.sm, padding: spacing.sm },
  badgeText: { ...typeScale.label, color: semantic.intelligence },
  cards: { gap: spacing.sm }, wideCards: { flexDirection: "row", alignItems: "stretch" },
  proposal: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  wideProposal: { flex: 1, minWidth: 0 },
  cardTitle: { ...typeScale.decision, color: colors.text },
  selection: { ...typeScale.decision, color: colors.text }, quote: { ...typeScale.body, color: colors.text },
  note: { ...typeScale.bodyCompact, color: colors.textMuted }, metric: { ...typeScale.body, color: colors.text },
  action: { minHeight: 44, justifyContent: "center", paddingVertical: spacing.sm },
  actionRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  actionHover: { opacity: 0.85 }, actionPressed: { opacity: 0.7 },
  foldedActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: spacing.lg },
  actionText: { ...typeScale.label, color: semantic.intelligence },
  explanation: { borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: spacing.sm, gap: spacing.sm }
});
