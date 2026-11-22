import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/src/theme/theme";

export function LogToolbar({ children, period, results, wide }: PropsWithChildren<{ period: ReactNode; results: ReactNode; wide: boolean }>) {
  return (
    <View style={[styles.toolbar, wide && styles.toolbarWide]}>
      <View style={[styles.filters, wide && styles.filtersWide]}>
        <View style={styles.scope}>{children}</View>
        {results}
      </View>
      <View style={styles.period}>{period}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { gap: spacing.sm, zIndex: 20 },
  toolbarWide: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.lg },
  filters: { gap: spacing.sm, flexShrink: 1 },
  filtersWide: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  scope: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  period: { alignSelf: "flex-start", zIndex: 20 }
});
