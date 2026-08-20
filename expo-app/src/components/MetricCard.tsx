import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SurfaceMaterial } from "./SurfaceMaterial";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  colors,
  iconSizes,
  interaction,
  radii,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type MetricCardProps = {
  icon: IconName;
  label: string;
  value: string;
  detail?: string;
  accent?: string;
  onPress?: () => void;
};

export function MetricCard({
  icon,
  label,
  value,
  detail,
  accent = colors.blue,
  onPress
}: MetricCardProps) {
  const content = (
    <>
      {/* A metric card's accent is its identity, so it earns a trace. It used to
          be a solid 3px bar across the full width, which is a lit border by
          another name - three of them side by side were the loudest thing on
          the screen and drowned out the live cards below. */}
      <SurfaceMaterial accent={accent} radius={radii.lg} />
      <View style={[styles.iconWrap, { backgroundColor: `${accent}1F` }]}>
        <MaterialCommunityIcons
          color={accent}
          name={icon}
          size={iconSizes.control}
        />
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
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityHint={`${label} ekranını açar`}
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 148,
    minHeight: interaction.preferredTouchTarget * 2.6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
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
    ...typeScale.metric
  },
  label: {
    color: colors.text,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  detail: {
    color: colors.textSubtle,
    ...typeScale.micro,
    marginTop: spacing.xs
  }
});
