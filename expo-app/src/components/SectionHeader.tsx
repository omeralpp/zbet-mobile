import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, interaction, radii, spacing, typeScale } from "@/src/theme/theme";

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
        <Text accessibilityRole="header" aria-level={2} style={styles.title}>{title}</Text>
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
    ...typeScale.moduleTitle
  },
  caption: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    marginTop: 2
  },
  action: {
    color: colors.blue,
    ...typeScale.bodyCompact,
    fontWeight: "700"
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
