import { StyleSheet, View } from "react-native";
import { radii, semantic, spacing } from "@/src/theme/theme";

type OutcomeCounts = {
  wins: number;
  losses: number;
  pending: number;
  unresolved?: number;
  voids?: number;
};

/** A visual counterpart to the exact outcome counts printed beside each summary. */
export function OutcomeDistribution({ counts }: { counts: OutcomeCounts }) {
  const segments = [
    { count: counts.wins, color: semantic.positive },
    { count: counts.losses, color: semantic.negative },
    { count: counts.pending, color: semantic.intelligence },
    { count: counts.unresolved ?? 0, color: semantic.warning },
    { count: counts.voids ?? 0, color: semantic.neutral }
  ].filter(segment => segment.count > 0);
  if (!segments.length) return null;
  return (
    <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.track}>
      {segments.map(segment => (
        <View key={segment.color} style={{ flex: segment.count, backgroundColor: segment.color }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", alignSelf: "stretch", height: 5, borderRadius: radii.round,
    overflow: "hidden", marginVertical: spacing.xs }
});
