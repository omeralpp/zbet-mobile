import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { mobileApi } from "@/src/api";
import { jinxNewsQuery } from "@/src/api/queries";
import { colors, iconSizes, interaction, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { jinxNewsView } from "@/src/utils/jinx-news-view";

/**
 * Jinx "Maç gündemi" (owner 2026-11-25): recent news about the two teams and
 * the competition, each line with its sources. Display only; it never feeds a
 * BTB decision, which the footnote says. Hidden while the BFF has it off.
 */
export function JinxNewsBrief({ matchKey }: { matchKey: string }) {
  const query = useQuery(jinxNewsQuery(matchKey));
  const client = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  // A minute clock is enough: it only decides when "Yeniden tara" appears.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const view = jinxNewsView(query.data, { loading: query.isLoading, error: query.isError, now });
  if (view.kind === "HIDDEN") return null;
  const refresh = async () => {
    setRefreshing(true);
    try { client.setQueryData(jinxNewsQuery(matchKey).queryKey, await mobileApi.getJinxNewsBrief(matchKey, true)); }
    catch { await query.refetch(); }
    finally { setRefreshing(false); setNow(Date.now()); }
  };
  return (
    <View style={styles.block}>
      <View style={styles.head}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="newspaper-variant-outline" size={iconSizes.small} />
          <Text accessibilityRole="header" aria-level={3} style={styles.title}>Maç gündemi</Text>
        </View>
        {view.canRefresh ? (
          <Pressable accessibilityRole="button" accessibilityState={{ busy: refreshing }} disabled={refreshing} onPress={() => { void refresh(); }}
            style={({ pressed, hovered }) => [styles.refresh, hovered && styles.hover, pressed && styles.pressed]}>
            <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="refresh" size={iconSizes.inline} />
            <Text style={styles.refreshText}>{refreshing ? "Taranıyor…" : "Yeniden tara"}</Text>
          </Pressable>
        ) : null}
      </View>
      {view.kind === "AVAILABLE" ? (
        <View style={styles.items}>
          {view.items.map((item) => (
            <View key={item.key} style={styles.item}>
              <Text style={styles.date}>{item.date}</Text>
              <View style={styles.itemBody}>
                <Text style={styles.text}>{item.text}</Text>
                <View style={styles.sources}>
                  {item.sources.map((source) => (
                    <Pressable accessibilityHint="Kaynağı tarayıcıda açar" accessibilityLabel={`Kaynak ${source.number}: ${source.title}`} accessibilityRole="link"
                      key={`${item.key}-${source.number}`} onPress={() => { void Linking.openURL(source.url); }}
                      style={({ pressed, hovered }) => [styles.source, hovered && styles.hover, pressed && styles.pressed]}>
                      <Text numberOfLines={1} style={styles.sourceText}>{source.number} · {source.title}</Text>
                      <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="open-in-new" size={12} />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text accessibilityLiveRegion="polite" style={styles.message}>{view.message}</Text>
      )}
      <Text style={styles.note}>{[view.generated, "Google Haberler başlıklarından derlenir, kaynakta doğrulayın", "BTB kararını etkilemez"].filter(Boolean).join(" · ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: spacing.sm, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { color: colors.text, ...typeScale.bodyCompact, fontWeight: "700" },
  refresh: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, borderRadius: radii.round },
  refreshText: { color: semantic.intelligence, ...typeScale.label, letterSpacing: 0, fontWeight: "700" },
  items: { gap: 10 },
  item: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  date: { width: 52, paddingTop: 2, color: colors.textMuted, ...typeScale.label, letterSpacing: 0, fontVariant: ["tabular-nums"] },
  itemBody: { flex: 1, minWidth: 0, gap: 6 },
  text: { color: colors.text, ...typeScale.body },
  sources: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  source: { maxWidth: 220, minHeight: 28, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, borderRadius: radii.sm,
    borderWidth: 1, borderColor: colors.borderSoft },
  sourceText: { flexShrink: 1, color: semantic.intelligence, ...typeScale.label, letterSpacing: 0 },
  message: { color: colors.textMuted, ...typeScale.bodyCompact },
  note: { color: colors.textSubtle, ...typeScale.label, letterSpacing: 0 },
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.72 }
});
