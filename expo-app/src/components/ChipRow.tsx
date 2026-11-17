import type { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { spacing } from "@/src/theme/theme";

/**
 * One row of filter chips. On a phone it stays one line and scrolls sideways,
 * so a screen with several filter groups does not spend half its height on
 * wrapped chips; from the medium web width up the chips wrap as before.
 */
export function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  const breakpoint = useBreakpoint();
  const wraps = Platform.OS === "web" && isAtLeast(breakpoint, "medium");
  if (wraps) return <View accessibilityLabel={label} style={styles.wrap}>{children}</View>;
  return (
    <ScrollView accessibilityLabel={label} contentContainerStyle={styles.line} horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  scroll: { marginHorizontal: -spacing.lg, flexGrow: 0 },
  line: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg }
});
