import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors, radii, spacing } from "@/src/theme/theme";

export function LoadingState({ label = "Veriler hazırlanıyor" }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.blue} size="large" />
      <Text style={styles.message}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        color={colors.red}
        name="cloud-alert-outline"
        size={34}
      />
      <Text style={styles.title}>Bağlantı kurulamadı</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        color={colors.textSubtle}
        name="soccer-field"
        size={34}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: spacing.md
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: spacing.sm
  },
  button: {
    marginTop: spacing.lg,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderRadius: radii.round,
    backgroundColor: colors.blue
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800"
  }
});
