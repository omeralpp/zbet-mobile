import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, iconSizes, spacing, typeScale } from "@/src/theme/theme";

/**
 * The app's one way to open Bilyoner (owner requests 2026-11-03, NXT-OBS-243).
 *
 * Every screen used to draw its own Bilyoner action: a 48 pt outlined box on
 * Maç detayı, a 50 pt full-width pill on Toto, plain text links elsewhere, and
 * two spellings of the suffix. The owner then chose one look for all of them:
 * the Toto green with dark ink, spanning its column with the label centred,
 * shaped like Super kararı's "Maç detayına git" (56 pt, 18 pt corners). It
 * keeps the front-vowel spelling "Bilyoner'de" and announces itself as a
 * link, because it leaves the app.
 */
export function BilyonerButton({
  hint,
  label = "Bilyoner'de aç",
  onPress,
  style
}: {
  hint: string;
  label?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={onPress}
      style={({ hovered, pressed }) => [styles.button, hovered && styles.hover, pressed && styles.pressed, style]}
    >
      <Text style={styles.label}>{label}</Text>
      <MaterialCommunityIcons color={colors.background} name="open-in-new" size={iconSizes.small} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.green,
    borderRadius: 18,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: spacing.lg
  },
  hover: { opacity: 0.9 },
  pressed: { opacity: 0.8 },
  label: { ...typeScale.identity, color: colors.background, fontWeight: "700" }
});
