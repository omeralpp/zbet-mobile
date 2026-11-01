import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, textFont, typeScale } from "@/src/theme/theme";

type RatingStarsProps = {
  rating: number;
  size?: number;
};

/**
 * Stars on their five-point scale: the earned ones in rating gold, the rest in
 * the border tone, so "3" reads as three of five instead of a bare count.
 */
export function RatingStars({ rating, size = 14 }: RatingStarsProps) {
  if (rating <= 0) {
    return <Text style={[styles.empty, { fontSize: size, lineHeight: Math.round(size * 1.3) }]}>İzleniyor</Text>;
  }
  const earned = Math.max(0, Math.min(5, rating));

  return (
    <Text
      accessibilityLabel={`${earned} / 5 yıldız`}
      style={[styles.stars, { fontSize: size, lineHeight: Math.round(size * 1.3) }]}
    >
      {"★".repeat(earned)}
      <Text style={styles.unearned}>{"★".repeat(5 - earned)}</Text>
    </Text>
  );
}

/**
 * A published RB1 record’s stars in a decision hero. They measure consistency
 * and evidence quality, so the hero draws them as the same stars as every row
 * and ticket and names them once: Kanıt kalitesi (NXT-OBS-241).
 */
export function EvidenceQuality({ stars, size = 15 }: { stars: number; size?: number }) {
  return (
    <View accessible accessibilityLabel={`Kanıt kalitesi, ${Math.max(0, Math.min(5, stars))} / 5 yıldız`} style={styles.quality}>
      <RatingStars rating={stars} size={size} />
      <Text style={styles.qualityLabel}>Kanıt kalitesi · {Math.max(0, Math.min(5, stars))}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  quality: {
    gap: spacing.xs
  },
  qualityLabel: {
    color: colors.textSubtle,
    ...typeScale.label
  },
  stars: {
    color: colors.gold,
    letterSpacing: 1,
    ...textFont("700")
  },
  unearned: {
    color: colors.border
  },
  empty: {
    color: colors.textSubtle,
    ...textFont("700")
  }
});
