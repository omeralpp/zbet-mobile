import { StyleSheet, Text, View } from "react-native";
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";
import {
  resolveSignalSegments,
  signalAccessibilityLabel
} from "@/src/utils/signal-meter";

/**
 * BTB's rating drawn as signal strength.
 *
 * Lit segments use the intelligence accent rather than the rating gold: the
 * meter states how strongly BTB holds this selection, which is an analytical
 * claim, not a quality score. Gold stays with the stars in list rows where a
 * quick five-shape read is genuinely the fastest thing to parse.
 *
 * Dim segments stay visible so the ceiling is always legible — a bar that only
 * drew what it had would make a two out of five look like a full meter on a
 * short track.
 */
export function SignalMeter({
  rating,
  label = "sinyal"
}: {
  rating: number | null | undefined;
  label?: string;
}) {
  const segments = resolveSignalSegments(rating);

  return (
    <View
      accessibilityLabel={signalAccessibilityLabel(rating)}
      accessible
      style={styles.container}
    >
      <View style={styles.track}>
        {segments.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              segment === "LIT" ? styles.segmentLit : styles.segmentDim
            ]}
          />
        ))}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs
  },
  track: {
    flexDirection: "row",
    gap: 3
  },
  segment: {
    width: 16,
    height: 4,
    borderRadius: 2
  },
  segmentLit: {
    backgroundColor: semantic.intelligence
  },
  segmentDim: {
    backgroundColor: colors.borderSoft
  },
  label: {
    color: colors.textSubtle,
    ...typeScale.label
  }
});
