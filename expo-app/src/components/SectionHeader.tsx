import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, iconSizes, interaction, radii, spacing, typeScale } from "@/src/theme/theme";

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
          accessibilityLabel={`${title}, ${actionLabel}`}
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed, hovered }) => [
            styles.actionButton,
            hovered && styles.hovered,
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.action}>{actionLabel}</Text>
          <MaterialCommunityIcons accessible={false} name="chevron-right" color={colors.blue} size={iconSizes.inline} />
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
  // The analytical blue on its own soft fill: a way into more of the same
  // data, never mistaken for the green primary action.
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.blueSoft,
    borderRadius: radii.round,
    justifyContent: "center",
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    gap: 2,
    paddingHorizontal: spacing.md
  },
  hovered: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.78 }
});
