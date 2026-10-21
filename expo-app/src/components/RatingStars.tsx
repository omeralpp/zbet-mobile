import { StyleSheet, Text } from "react-native";
import { colors, textFont } from "@/src/theme/theme";

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

const styles = StyleSheet.create({
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
