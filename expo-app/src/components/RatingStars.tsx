import { StyleSheet, Text } from "react-native";
import { colors } from "@/src/theme/theme";

type RatingStarsProps = {
  rating: number;
  size?: number;
};

export function RatingStars({ rating, size = 14 }: RatingStarsProps) {
  if (rating <= 0) {
    return <Text style={[styles.empty, { fontSize: size }]}>İzleniyor</Text>;
  }

  return (
    <Text
      accessibilityLabel={`${rating} yıldız`}
      style={[styles.stars, { fontSize: size }]}
    >
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
    </Text>
  );
}

const styles = StyleSheet.create({
  stars: {
    color: colors.gold,
    letterSpacing: 1,
    fontWeight: "900"
  },
  empty: {
    color: colors.textSubtle,
    fontWeight: "700"
  }
});
