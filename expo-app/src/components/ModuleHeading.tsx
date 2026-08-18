import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typeScale } from "@/src/theme/theme";

/**
 * Shared heading for a customizable analytical module.
 *
 * The eyebrow names the analytical category and the title names the module, so
 * a reordered stack still reads as a structured cockpit rather than a list of
 * unrelated cards.
 *
 * `trailing` carries a control that belongs to the module as a whole rather
 * than to its contents — today the collapse chevron. It sits on the title line
 * because that is the line the user reads to decide whether they want the
 * module open; without a slot here a panel would have to grow a second header
 * beside this one and the stack would lose its single heading grammar.
 */
export function ModuleHeading({
  eyebrow,
  title,
  trailing
}: {
  eyebrow: string;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {trailing ?? null}
      </View>
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
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginTop: spacing.xs
  },
  title: {
    color: colors.text,
    ...typeScale.moduleTitle,
    // A long Turkish module title yields to the trailing control instead of
    // pushing it off the row.
    flexShrink: 1
  }
});
