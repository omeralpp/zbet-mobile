import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SurfaceMaterial } from "@/src/components/SurfaceMaterial";
import { colors, iconSizes, semantic, spacing, typeScale } from "@/src/theme/theme";
import { useJinxPreferences } from "./JinxPreferencesProvider";
import { useJinxDailyQuip } from "./use-jinx-daily-quip";

const orb = require("../../assets/mascot/candidates/jinx-a-open.png");

/**
 * Jinx's card on Overview (v40 board): the same RB1 seven-day comment as the
 * ambient bubble, in neutral words. A row under the phone's figures, a fourth
 * tile beside them on desktop. It opens the decision log.
 */
export function JinxDailyComment({ variant = "row" }: { variant?: "row" | "tile" }) {
  const { quip } = useJinxDailyQuip();
  const preferences = useJinxPreferences();
  const router = useRouter();
  if (!quip || !preferences.ready || preferences.hidden) return null;
  const tile = variant === "tile";
  return (
    <Pressable
      accessibilityHint="Karar günlüğünü açar"
      accessibilityLabel={`Jinx: ${quip.title}. ${quip.body}`}
      accessibilityRole="button"
      onPress={() => router.push("/super")}
      style={({ pressed, hovered }) => [tile ? styles.tile : styles.card, hovered && styles.hover, pressed && styles.pressed]}
    >
      <SurfaceMaterial radius={18} />
      <Image accessible={false} resizeMode="contain" source={orb} style={tile ? styles.orbTile : styles.orb} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>JİNX · BTB BUGÜN</Text>
        <Text style={styles.title}>{quip.title}</Text>
        <Text style={styles.body}>{quip.body}</Text>
        {tile ? <Text style={styles.link}>Karar günlüğü</Text> : null}
      </View>
      {tile ? null : <MaterialCommunityIcons color={colors.textMuted} name="chevron-right" size={iconSizes.control} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  tile: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  hover: { borderColor: colors.border },
  pressed: { opacity: 0.78 },
  orb: { width: 52, height: 52 },
  orbTile: { width: 44, height: 44 },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  eyebrow: { ...typeScale.eyebrow, color: colors.gold },
  title: { ...typeScale.bodyCompact, color: colors.text, fontWeight: "700" },
  body: { ...typeScale.bodyCompact, color: colors.textMuted, marginTop: spacing.xs / 2 },
  link: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700", marginTop: spacing.xs }
});
