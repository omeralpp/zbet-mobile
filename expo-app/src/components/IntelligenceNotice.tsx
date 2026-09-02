import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { IntelligenceOrigin } from "@/src/api/schemas";
import { originNotice } from "./team-form-view";
import {
  colors,
  iconSizes,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";

/**
 * The synthetic-data badge for every M15 intelligence surface.
 *
 * One component rather than three, because three copies of this label would
 * eventually become three different labels, and the whole point is that a
 * reader learns exactly one mark and trusts it everywhere. It renders nothing
 * at all for live data: a badge that appears on every card is decoration, and
 * decoration is not a disclosure.
 *
 * It is drawn in the caution vocabulary rather than as a neutral chip. A card
 * showing invented numbers should not look like a card showing evidence.
 */
export function OriginBadge({
  origin
}: {
  origin: IntelligenceOrigin | undefined;
}) {
  const label = originNotice(origin);
  if (!label) {
    return null;
  }

  return (
    <View accessibilityRole="text" style={styles.badge}>
      <MaterialCommunityIcons
        color={semantic.warning}
        name="flask-outline"
        size={iconSizes.micro}
      />
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

/**
 * A caveat line beneath a surface's content.
 *
 * Rendered in full rather than truncated. A caveat the reader has to expand is
 * a caveat the product does not really want them to read.
 */
export function CaveatLine({ text }: { text: string | null }) {
  if (!text) {
    return null;
  }
  return <Text style={styles.caveat}>{text}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: semantic.warningSoft,
    borderRadius: radii.round,
    flexDirection: "row",
    flexShrink: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  badgeText: {
    color: semantic.warning,
    flexShrink: 1,
    ...typeScale.label
  },
  caveat: {
    color: colors.textSubtle,
    ...typeScale.label
  }
});
