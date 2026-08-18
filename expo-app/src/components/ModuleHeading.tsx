import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typeScale } from "@/src/theme/theme";

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
    // Bronze rather than BTB green: a module label is structure, and green is
    // reserved for reporting that something went well.
    color: colors.bronze,
    ...typeScale.eyebrow
  },
  title: {
    color: colors.text,
    ...typeScale.moduleTitle,
    marginTop: spacing.xs
  }
});
