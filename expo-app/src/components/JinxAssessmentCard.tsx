import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { AnalysisContext, JinxAssessment } from "@/src/api/schemas";
import { analysisSourceLabels, assessmentIsCurrent, assessmentLabels } from "@/src/mascot/jinx-assessment";
import { colors, semantic, spacing, radii, typeScale } from "@/src/theme/theme";
import { JinxMatchAnimator } from "@/src/mascot/JinxMatchAnimator";

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
  return <View style={styles.card}>
    <View style={styles.row}>
      <JinxMatchAnimator context={context} assessment={assessment} current={Boolean(current)} pending={pending} unavailable={error || stale || !context} />
      <Text accessibilityRole="header" aria-level={2} style={styles.title}>Jinx</Text>
      {current && verdict ? <Text accessibilityLiveRegion="polite" style={styles.verdict}>{assessmentLabels[verdict]}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={assessment ? "Jinx değerlendirmesini yenile" : "Jinx’e sor"}
        disabled={pending || !eligible} onPress={onAsk} style={[styles.action, (pending || !eligible) && styles.disabled]}>
        <Text style={styles.actionText}>{pending ? "Bakıyor…" : assessment ? "Yenile" : "Sor"}</Text>
      </Pressable>
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.reason}>{pending ? "Gösterilen maç verileri değerlendiriliyor."
      : !live ? "Maç devam etmiyor; yeni bahis değerlendirmesi yok."
      : !context?.selectionKey ? "Şu anda değerlendirilecek bir BTB seçimi yok."
      : error ? "Değerlendirme alınamadı. Veriyi yenileyip tekrar sor."
      : stale ? "Maç verisi değişti veya değerlendirme süresi doldu. Yeniden sor."
      : current ? assessment?.shortReason : "Skoru, maçın akışını ve bu seçimin riskini yorumla."}</Text>
    {current && assessment?.riskNote ? <Text style={styles.muted}>{assessment.riskNote}</Text> : null}
    {assessment && matches ? <>
      <View style={styles.row}>
        <Text style={styles.muted}>{new Date(assessment.evaluatedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          {stale ? " · Güncel değil" : " · Kazanç garantisi değildir"}</Text>
        <Pressable accessibilityRole="button" aria-expanded={details} accessibilityState={{ expanded: details }} onPress={() => setDetails(!details)} style={styles.detailsAction}>
          <Text style={styles.link}>{details ? "Kanıtı gizle" : "Kanıtı gör"}</Text>
        </Pressable>
      </View>
      {details ? <View style={styles.details}>
        {assessment.value ? <Text style={styles.reason}>Olasılık %{(assessment.value.probability * 100).toFixed(1)} · Adil oran {assessment.value.fairPrice.toFixed(2)} · Beklenen değer %{(assessment.value.expectedValue * 100).toFixed(1)}</Text> : null}
        {assessment.evidence.map((fact) => <Text key={fact.id} style={styles.reason}>{fact.text}</Text>)}
        <Pressable accessibilityRole="button" aria-expanded={sources} accessibilityState={{ expanded: sources }} onPress={() => setSources(!sources)} style={styles.sourceAction}>
          <Text style={styles.link}>Kaynak durumu · {Object.values(assessment.sourceAvailability).filter(state => state === "OK").length} alındı
            {Object.values(assessment.sourceAvailability).some(state => state === "SYNTHETIC") ? " · örnek veri içeriyor" : ""} · {sources ? "Gizle" : "Göster"}</Text>
        </Pressable>
        {sources ? Object.entries(assessment.sourceAvailability).map(([name, state]) => <Text key={name} style={styles.muted}>
          {analysisSourceLabels[name] ?? "Ek veri"}: {state === "OK" ? "alındı" : state === "SYNTHETIC" ? "demo" : state === "UNAVAILABLE" ? "alınamadı" : "kısmi"}
        </Text>) : null}
        {sources ? <Text style={styles.muted}>Verilerin alınma zamanı, kaynak ölçümlerinin aynı anda yapıldığını göstermez.</Text> : null}
        <Text style={styles.muted}>{assessment.explanationOrigin === "DETERMINISTIC" ? "Maç verilerinden kısa yorum" : "Verilere dayalı kısa Jinx yorumu"}</Text>
      </View> : null}
    </> : null}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.backgroundElevated, borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, marginTop: spacing.md, gap: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  title: { ...typeScale.decision, color: colors.text },
  verdict: { ...typeScale.identity, color: semantic.intelligence, flexShrink: 1 },
  reason: { ...typeScale.body, color: colors.text },
  muted: { ...typeScale.bodyCompact, color: colors.textMuted },
  action: { marginLeft: "auto", minHeight: 48, minWidth: 64, alignItems: "center", justifyContent: "center", borderRadius: radii.md, backgroundColor: semantic.actionFill, paddingHorizontal: spacing.md },
  actionText: { ...typeScale.body, color: semantic.onAction, fontWeight: "700" }, disabled: { opacity: 0.6 },
  detailsAction: { minHeight: 48, justifyContent: "center", marginLeft: "auto" },
  sourceAction: { minHeight: 48, justifyContent: "center" },
  link: { ...typeScale.body, color: colors.blue },
  details: { borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: spacing.sm, gap: spacing.xs }
});
