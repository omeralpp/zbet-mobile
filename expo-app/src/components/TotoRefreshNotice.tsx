import { StyleSheet, Text, View } from "react-native";
import { colors, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatTimestamp } from "@/src/utils/format";
import { Action } from "./RebuildEvidencePanel";

/** Cached Toto evidence stays readable while a failed request is retried. */
export function TotoRefreshNotice({ receivedAt, refreshing, onRetry }: {
  receivedAt: number;
  refreshing: boolean;
  onRetry: () => void;
}) {
  const received = receivedAt > 0 ? formatTimestamp(new Date(receivedAt).toISOString()) : "alınma zamanı bilinmiyor";
  return (
    <View style={styles.frame}><View accessibilityRole="alert" style={styles.notice}>
      <Text style={styles.title}>Toto verileri yenilenemedi</Text>
      <Text style={styles.copy}>Son alınan kayıtlar gösteriliyor · {received}. Programın durumu ve sonuçlar güncel olmayabilir.</Text>
      <Action busy={refreshing} icon="refresh" onPress={() => { if (!refreshing) onRetry(); }} title={refreshing ? "Yeniden deneniyor…" : "Tekrar dene"} />
    </View></View>
  );
}

const styles = StyleSheet.create({
  frame: { width: "100%", maxWidth: 960, alignSelf: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  notice: { gap: spacing.sm, marginBottom: spacing.md, padding: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: semantic.warning, backgroundColor: colors.backgroundElevated },
  title: { ...typeScale.body, color: colors.text, fontWeight: "700" },
  copy: { ...typeScale.bodyCompact, color: colors.textMuted }
});
