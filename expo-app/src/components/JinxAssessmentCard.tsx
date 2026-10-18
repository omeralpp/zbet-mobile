import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AnalysisContext, JinxAssessment, JinxLean } from "@/src/api/schemas";
import { analysisSourceLabels, assessmentIsCurrent, assessmentLabels, assessmentSignal, leanLabels, signalFacts } from "@/src/mascot/jinx-assessment";
import { colors, semantic, spacing, radii, typeScale } from "@/src/theme/theme";
import { JinxMatchAnimator } from "@/src/mascot/JinxMatchAnimator";

const leanColors: Record<JinxLean, string> = { FAVORABLE: semantic.positive, NEUTRAL: semantic.warning, UNFAVORABLE: semantic.negative };

export function JinxAssessmentCard({ context, assessment, pending, error, onAsk }: {
  context: AnalysisContext | undefined; assessment: JinxAssessment | undefined;
  pending: boolean; error: boolean; onAsk: () => void;
}) {
  const [details, setDetails] = useState(false);
  const [sources, setSources] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const matches = assessment?.matchKey === context?.matchKey;
  const current = matches && assessmentIsCurrent(assessment, context, now);
  const stale = Boolean(assessment && matches && !current);
  const live = ["LIVE", "HALF_TIME"].includes(context?.sources.matchDetail.status ?? "");
  const eligible = live && Boolean(context?.selectionKey);
  const verdict = current ? assessment?.verdict : undefined;
  const signal = current ? assessmentSignal(assessment) : null;
  // A policy verdict outranks the pilot lean; neither appears on stale data.
  const headline = verdict && verdict !== "WAIT" ? { text: assessmentLabels[verdict], color: verdict === "FAVORABLE" ? semantic.positive : semantic.negative }
    : signal?.lean ? { text: leanLabels[signal.lean], color: leanColors[signal.lean] }
    : verdict ? { text: assessmentLabels.WAIT, color: semantic.intelligence } : null;
  const match = context?.sources.matchDetail;
  // The large number already is the pool share, so its chip is not repeated.
  const facts = signal && match ? signalFacts(signal, match).filter(fact => fact.key !== "pool") : [];
  return <View style={styles.card}>
    <View style={styles.row}>
      <JinxMatchAnimator context={context} assessment={assessment} current={Boolean(current)} pending={pending} unavailable={error || stale || !context} />
      <View style={styles.heading}>
        <Text accessibilityRole="header" aria-level={2} style={styles.title}>Jinx</Text>
        {headline ? <Text accessibilityLiveRegion="polite" style={[styles.verdict, { color: headline.color }]}>{headline.text}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={assessment ? "Jinx değerlendirmesini yenile" : "Jinx’e sor"}
        disabled={pending || !eligible} onPress={onAsk} style={[styles.action, (pending || !eligible) && styles.disabled]}>
        <Text style={styles.actionText}>{pending ? "Bakıyor…" : assessment ? "Yenile" : "Sor"}</Text>
      </Pressable>
    </View>
    {signal ? <View accessible accessibilityLabel={`Jinx havuz güveni yüzde ${Math.round(signal.confidence * 100)}`} style={styles.confidenceRow}>
      <Text style={[styles.confidence, { color: signal.lean ? leanColors[signal.lean] : colors.text }]}>%{Math.round(signal.confidence * 100)}</Text>
      <Text style={styles.confidenceLabel}>havuz güveni</Text>
    </View> : null}
    {facts.length ? <View style={styles.facts}>{facts.map(fact => <View key={fact.key} style={styles.fact}>
      <Text style={styles.factLabel}>{fact.label}</Text><Text style={styles.factValue}>{fact.value}</Text>
    </View>)}</View> : null}
    <Text accessibilityLiveRegion="polite" style={styles.reason}>{pending ? "Havuzu, baskıyı ve oranı inceliyorum."
      : !live ? "Maç devam etmiyor."
      : !context?.selectionKey ? "Şu anda BTB seçimi yok."
      : error ? "Değerlendirme alınamadı. Tekrar sor."
      : stale ? "Maç verisi değişti. Yeniden sor."
      : current ? assessment?.shortReason : "Havuz, baskı ve oranla bu seçimi yorumlayayım."}</Text>
    {current && assessment?.riskNote ? <Text style={styles.muted}>{assessment.riskNote}</Text> : null}
    {assessment && matches ? <>
      <View style={styles.row}>
        <Text style={styles.muted}>{new Date(assessment.evaluatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          {stale ? " · Güncel değil" : ""}</Text>
        <Pressable accessibilityRole="button" aria-expanded={details} accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)} style={styles.detailsAction}>
          <Text style={styles.link}>{details ? "Kanıtı gizle" : "Kanıtı gör"}</Text>
        </Pressable>
      </View>
      {details ? <View style={styles.details}>
        {assessment.value ? <Text style={styles.reason}>Olasılık %{(assessment.value.probability * 100).toFixed(1)} · Adil oran {assessment.value.fairPrice.toFixed(2)} · Beklenen değer %{(assessment.value.expectedValue * 100).toFixed(1)}</Text> : null}
        {assessment.evidence.map((fact) => <Text key={fact.id} style={styles.reason}>{fact.text}</Text>)}
        <Pressable accessibilityRole="button" aria-expanded={sources} accessibilityState={{ expanded: sources }} onPress={() => setSources(!sources)} style={styles.sourceAction}>
          <Text style={styles.link}>Kaynaklar · {Object.values(assessment.sourceAvailability).filter(state => state === "OK").length} alındı
            {Object.values(assessment.sourceAvailability).some(state => state === "SYNTHETIC") ? " · örnek veri" : ""} · {sources ? "Gizle" : "Göster"}</Text>
        </Pressable>
        {sources ? Object.entries(assessment.sourceAvailability).map(([name, state]) => <Text key={name} style={styles.muted}>
          {analysisSourceLabels[name] ?? "Ek veri"}: {state === "OK" ? "alındı" : state === "SYNTHETIC" ? "demo" : state === "UNAVAILABLE" ? "alınamadı" : "kısmi"}
        </Text>) : null}
      </View> : null}
    </> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.backgroundElevated, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  heading: { flexShrink: 1, gap: 2 },
  title: { ...typeScale.decision, color: colors.text },
  verdict: { ...typeScale.identity, fontWeight: "800", flexShrink: 1 },
  confidenceRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  confidence: { fontSize: 40, lineHeight: 46, fontWeight: "800", fontVariant: ["tabular-nums"] },
  confidenceLabel: { ...typeScale.bodyCompact, color: colors.textMuted, fontWeight: "700" },
  facts: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  fact: { backgroundColor: colors.surfaceStrong, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, gap: 1 },
  factLabel: { ...typeScale.micro, color: colors.textMuted },
  factValue: { ...typeScale.bodyCompact, color: colors.text, fontWeight: "800", fontVariant: ["tabular-nums"] },
  reason: { ...typeScale.body, color: colors.text },
  muted: { ...typeScale.bodyCompact, color: colors.textMuted },
  action: { marginLeft: "auto", minHeight: 48, minWidth: 64, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: semantic.actionFill, paddingHorizontal: spacing.md },
  actionText: { ...typeScale.body, color: semantic.onAction, fontWeight: "700" }, disabled: { opacity: 0.6 },
  detailsAction: { minHeight: 48, justifyContent: "center", marginLeft: "auto" },
  sourceAction: { minHeight: 48, justifyContent: "center" },
  link: { ...typeScale.body, color: colors.blue },
  details: { borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: spacing.sm, gap: spacing.xs }
});
