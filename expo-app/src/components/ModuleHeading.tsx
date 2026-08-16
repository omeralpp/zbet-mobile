import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/src/theme/theme";

/**
 * Shared heading for a customizable analytical module.
 *
 * The eyebrow names the analytical category and the title names the module, so
 * a reordered stack still reads as a structured cockpit rather than a list of
 * unrelated cards.
 */
export function ModuleHeading({
  eyebrow,
  title
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    marginTop: spacing.xxl
  },
  eyebrow: {
    color: colors.green,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
    lineHeight: 24,
    marginTop: 2
  }
});
