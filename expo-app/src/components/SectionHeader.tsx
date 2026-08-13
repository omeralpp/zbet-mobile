import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, interaction, radii, spacing } from "@/src/theme/theme";

type SectionHeaderProps = {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({
  title,
  caption,
  actionLabel,
  onAction
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          hitSlop={10}
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xxl,
    marginBottom: spacing.md
  },
  copy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800"
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  action: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "900"
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: radii.round,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: interaction.minTouchTarget,
    paddingHorizontal: spacing.md
  },
  pressed: {
    backgroundColor: colors.borderSoft,
    borderColor: colors.blue,
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  }
});
