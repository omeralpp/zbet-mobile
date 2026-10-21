import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, iconSizes, interaction, semantic, spacing, typeScale } from "@/src/theme/theme";
import { canRefreshScreenQuery } from "./refresh-data";

/**
 * Refetch visible data in place, preserving filters, navigation and manual Jinx.
 *
 * `icon` is the compact form in the phone brand bar, where the spinner glyph
 * alone carries the action and the label moves into speech; `button` is the
 * outlined desktop control beside the page title.
 */
export function RefreshDataButton({ variant = "button" }: { variant?: "button" | "icon" }) {
  const client = useQueryClient();
  const running = useRef(false);
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const refresh = async () => {
    if (running.current) return;
    running.current = true;
    setState("pending");
    try {
      await client.refetchQueries({ type: "active", predicate: query => canRefreshScreenQuery(query.queryKey) }, { throwOnError: true });
      setState("done");
    } catch { setState("error"); }
    finally { running.current = false; }
  };
  const label = state === "pending" ? "Yenileniyor…" : state === "done" ? "Yenilendi" : "Yenile";
  const icon = variant === "icon";
  return <View style={styles.row}>
    {state === "error" ? <Text accessibilityLiveRegion="polite" style={styles.status}>{icon ? "Yenilenemedi" : "Yenilenemedi. Tekrar dene."}</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel="Ekrandaki verileri yenile" accessibilityState={{ busy: state === "pending" }}
      disabled={state === "pending"} onPress={() => void refresh()}
      style={({ hovered, pressed }) => [icon ? styles.iconButton : styles.button, hovered && styles.hovered, (pressed || state === "pending") && styles.pending]}>
      <MaterialCommunityIcons name="refresh" size={icon ? 22 : iconSizes.inline} color={colors.blue}/>
      {icon ? null : <Text accessibilityLiveRegion="polite" style={styles.text}>{label}</Text>}
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.sm },
  button: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  iconButton: { width: interaction.minTouchTarget, height: interaction.minTouchTarget, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  hovered: { backgroundColor: colors.surfaceStrong },
  text: { color: colors.blue, ...typeScale.bodyCompact, fontWeight: "700" },
  status: { color: semantic.warning, ...typeScale.label },
  pending: { opacity: .6 }
});
