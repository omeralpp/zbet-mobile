import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "@/src/auth/AuthProvider";
import { resolveAuthEntryPresentation } from "@/src/auth/entry-policy";
import { runtimeConfig } from "@/src/config/runtime";
import { colors, radii, spacing, themeMode } from "@/src/theme/theme";

export default function SignInScreen() {
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const presentation = resolveAuthEntryPresentation(runtimeConfig.authMode);

  const signIn = async () => {
    setSubmitting(true);
    try {
      await auth.signIn();
    } finally {
      setSubmitting(false);
    }
  };

  const unavailable = auth.status === "configuration-error";

  return (
    <LinearGradient
      colors={
        themeMode === "light"
          ? [colors.background, colors.backgroundElevated, colors.background]
          : [colors.background, "#071C31", colors.background]
      }
      style={styles.gradient}
    >
      <StatusBar style={themeMode === "light" ? "dark" : "light"} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons
              color={colors.green}
              name="soccer"
              size={44}
            />
          </View>
          <Text style={styles.eyebrow}>BTB MOBILE</Text>
          <Text style={styles.title}>Maçın ritmi,{`\n`}doğrudan cebinde.</Text>
          <Text style={styles.description}>
            BTB canlı maçları, Super karar geçmişi ve Spor Toto programları için
            hızlı, güvenli ve mobile özel deneyim.
          </Text>

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <MaterialCommunityIcons
                color={colors.blue}
                name="shield-lock-outline"
                size={22}
              />
            </View>
            <View style={styles.securityCopy}>
              <Text style={styles.securityTitle}>
                {presentation.securityTitle}
              </Text>
              <Text style={styles.securityText}>
                {presentation.securityText}
              </Text>
            </View>
          </View>

          {auth.error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons
                color={colors.red}
                name="alert-circle-outline"
                size={18}
              />
              <Text style={styles.errorText}>{auth.error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={submitting || unavailable}
            onPress={signIn}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              (submitting || unavailable) && styles.buttonDisabled
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {unavailable
                    ? "Bağlantı yapılandırılmalı"
                    : presentation.buttonText}
                </Text>
                <MaterialCommunityIcons
                  color={colors.background}
                  name="arrow-right"
                  size={20}
                />
              </>
            )}
          </Pressable>

          <Text style={styles.footer}>
            {presentation.footerText}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl
  },
  brandMark: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.xxl
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2
  },
  title: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginTop: spacing.sm
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.lg
  },
  securityCard: {
    flexDirection: "row",
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundElevated,
    padding: spacing.lg,
    marginTop: spacing.xxxl
  },
  securityIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    backgroundColor: colors.surfaceStrong
  },
  securityCopy: {
    flex: 1
  },
  securityTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  securityText: {
    color: colors.textSubtle,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.xs
  },
  errorBox: {
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.redSoft,
    padding: spacing.md,
    marginTop: spacing.lg
  },
  errorText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18
  },
  button: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.green,
    marginTop: spacing.xxl
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }]
  },
  buttonDisabled: {
    opacity: 0.48
  },
  buttonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "900"
  },
  footer: {
    color: colors.textSubtle,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.md
  }
});
