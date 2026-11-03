import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { colors, iconSizes, radii, spacing, textFont } from "@/src/theme/theme";

/**
 * The app's one way to open Bilyoner (owner request 2026-11-03, NXT-OBS-243).
 *
 * Every screen used to draw its own Bilyoner action: a 48 pt outlined box on
 * Maç detayı, a 50 pt full-width pill on Toto, plain text links elsewhere, and
 * two spellings of the suffix. This keeps one size, shape, icon and the
 * front-vowel spelling "Bilyoner'de". `primary` fills it green only where opening Bilyoner is the
 * screen's main next step (an active Toto program); everywhere else it is the
 * outlined form. It is content-sized on both clients and announces itself as a
 * link, because it leaves the app.
 */
export function BilyonerButton({
  hint,
  label = "Bilyoner'de aç",
  onPress,
  primary = false,
  style
}: {
  hint: string;
  label?: string;
  onPress: () => void;
  primary?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const ink = primary ? colors.background : colors.text;
  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="link"
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        hovered && (primary ? styles.primaryHover : styles.secondaryHover),
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.label, { color: ink }]}>{label}</Text>
      <MaterialCommunityIcons color={ink} name="open-in-new" size={iconSizes.small} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radii.round,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 20
  },
  // A transparent border keeps the filled form exactly as large as the outline.
  primary: { backgroundColor: colors.green, borderColor: "transparent", borderWidth: 1 },
  primaryHover: { opacity: 0.9 },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
  secondaryHover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.8 },
  label: { ...textFont("700"), fontSize: 15, lineHeight: 20 }
});
