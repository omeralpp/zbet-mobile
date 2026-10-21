import { StyleSheet, View } from "react-native";
import { colors } from "@/src/theme/theme";

/**
 * Faint pitch markings behind a match hero: halfway line, centre circle and
 * the two penalty boxes. Decoration only, hidden from assistive technology.
 */
export function PitchMarkings({ circle = 128, boxes = true }: { circle?: number; boxes?: boolean }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={styles.pitch}>
      <View style={styles.halfway} />
      <View style={[styles.circle, { width: circle, height: circle, borderRadius: circle / 2 }]} />
      {boxes ? (
        <>
          <View style={[styles.box, styles.boxHome]} />
          <View style={[styles.box, styles.boxAway]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pitch: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5
  },
  halfway: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: colors.border
  },
  circle: {
    borderWidth: 1,
    borderColor: colors.border
  },
  box: {
    position: "absolute",
    top: "28%",
    height: "34%",
    width: 22,
    borderWidth: 1,
    borderColor: colors.border
  },
  boxHome: {
    left: -1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4
  },
  boxAway: {
    right: -1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4
  }
});
