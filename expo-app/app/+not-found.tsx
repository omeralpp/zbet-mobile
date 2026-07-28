import { Link } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Screen } from "@/src/components/Screen";
import { colors, spacing } from "@/src/theme/theme";

export default function NotFoundScreen() {
  return (
    <Screen eyebrow="BTB MOBILE" title="Ekran bulunamadı">
      <Text style={styles.message}>
        İstenen mobil rota mevcut değil veya bildirim bağlantısı artık geçerli
        değil.
      </Text>
      <Link href="/" style={styles.link}>
        Ana sayfaya dön
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.lg
  },
  link: {
    color: colors.blue,
    fontSize: 14,
    fontWeight: "900",
    marginTop: spacing.xl
  }
});
