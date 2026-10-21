import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";

const jinx = require("../../assets/mascot/candidates/jinx-a-open.png");

/**
 * The v40 board's "Ekran bulunamadı" state: an unknown route, or a notification
 * link to a screen that no longer exists (such as a retired A3 Super decision).
 */
export function RouteNotFound() {
  const router = useRouter();
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <SurfaceMaterial radius={20} />
      <Image accessible={false} resizeMode="contain" source={jinx} style={styles.jinx} />
      <Text style={styles.eyebrow}>BTB MOBILE</Text>
      <Text accessibilityRole="header" style={styles.title}>Ekran bulunamadı</Text>
      <Text style={styles.message}>İstenen mobil rota mevcut değil veya bildirim bağlantısı artık geçerli değil.</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/")}
        style={({ pressed, hovered }) => [styles.button, hovered && styles.buttonHover, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Ana sayfaya dön</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 300,
    padding: spacing.xl,
    marginTop: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  jinx: { width: 72, height: 72, transform: [{ rotate: "12deg" }] },
  eyebrow: { color: colors.textMuted, ...typeScale.eyebrow },
  title: { color: colors.text, ...typeScale.moduleTitle, fontSize: 22, lineHeight: 28, textAlign: "center" },
  message: { color: colors.textMuted, ...typeScale.body, textAlign: "center", maxWidth: 360 },
  button: {
    minHeight: interaction.minTouchTarget,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: radii.round,
    backgroundColor: colors.actionFill
  },
  buttonHover: { opacity: 0.9 },
  pressed: { opacity: 0.72 },
  buttonText: { color: colors.onAction, ...typeScale.bodyCompact, fontWeight: "700" }
});
