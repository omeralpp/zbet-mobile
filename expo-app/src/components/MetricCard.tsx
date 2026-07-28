import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing } from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type MetricCardProps = {
  icon: IconName;
  label: string;
  value: string;
  detail?: string;
  accent?: string;
};

export function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = colors.blue
}: MetricCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
        <MaterialCommunityIcons color={accent} name={icon} size={20} />
      </View>
      <Text numberOfLines={1} style={styles.value}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      {detail ? (
        <Text numberOfLines={1} style={styles.detail}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 148,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderTopWidth: 3,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  value: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.4
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 2
  },
  detail: {
    color: colors.textSubtle,
    fontSize: 11,
    marginTop: spacing.xs
  }
});
