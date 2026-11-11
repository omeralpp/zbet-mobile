import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { colors, iconSizes, interaction } from "@/src/theme/theme";
import { backFallbackTarget } from "./back-fallback";

/** The header's way up when the navigator has no history to go back to. */
export function HeaderBackFallback({ routeName }: { routeName: string }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityHint="Bir üst ekrana döner"
      accessibilityLabel="Geri"
      accessibilityRole="button"
      onPress={() => router.replace(backFallbackTarget(routeName))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons accessible={false} color={colors.text} name="arrow-left" size={iconSizes.control} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: interaction.minTouchTarget,
    height: interaction.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: interaction.minTouchTarget / 2
  },
  pressed: { opacity: 0.7 }
});
