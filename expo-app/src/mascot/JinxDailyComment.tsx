import { Image, StyleSheet, Text, View } from "react-native";
import { colors, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { useJinxPreferences } from "./JinxPreferencesProvider";
import { useJinxDailyQuip } from "./use-jinx-daily-quip";

const orb = require("../../assets/mascot/candidates/jinx-a-open.png");

/** Jinx's line under the daily Super result on Overview (NXT-OBS-174). */
export function JinxDailyComment() {
  const { mood, quip } = useJinxDailyQuip();
  const preferences = useJinxPreferences();
  if (!quip || !preferences.ready || preferences.hidden) return null;
  const accent = mood.kind === "POSITIVE" ? semantic.positive : mood.kind === "NEGATIVE" ? semantic.negative : colors.bronze;
  return <View accessible accessibilityLiveRegion="polite" accessibilityLabel={`Jinx: ${quip.body}`} style={[styles.row, { borderColor: accent }]}>
    <Image source={orb} resizeMode="contain" style={styles.orb} />
    <View style={styles.copy}>
      <Text style={[styles.title, { color: accent }]}>{quip.title}</Text>
      <Text style={styles.body}>{quip.body}</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  row: { width: "100%", flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderRadius: radii.lg,
    backgroundColor: colors.backgroundElevated, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  orb: { width: 44, height: 44 },
  copy: { flex: 1, gap: 2 },
  title: { ...typeScale.eyebrow },
  body: { ...typeScale.bodyCompact, color: colors.text, fontWeight: "600" }
});
