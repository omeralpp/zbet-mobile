import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "@/src/theme/theme";
import { canRefreshScreenQuery } from "./refresh-data";

/** Refetch visible data in place, preserving filters, navigation and manual Jinx. */
export function RefreshDataButton() {
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
  return <View style={styles.row}>
    {state === "error" ? <Text accessibilityLiveRegion="polite" style={styles.status}>Yenilenemedi. Tekrar dene.</Text> : null}
    <Pressable accessibilityRole="button" accessibilityLabel="Ekrandaki verileri yenile" accessibilityState={{ busy: state === "pending" }}
      disabled={state === "pending"} onPress={() => void refresh()} style={[styles.button, state === "pending" ? styles.pending : null]}>
      <MaterialCommunityIcons name="refresh" size={19} color={colors.blue}/>
      <Text accessibilityLiveRegion="polite" style={styles.text}>{state === "pending" ? "Yenileniyor…" : state === "done" ? "Yenilendi" : "Yenile"}</Text>
    </Pressable>
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: spacing.sm },
  button: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radii.md },
  text: { color: colors.blue, fontWeight: "700", fontSize: 13 },
  status: { color: colors.textMuted, fontSize: 12 }, pending: { opacity: .6 }
});
