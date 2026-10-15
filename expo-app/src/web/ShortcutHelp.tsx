import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typeScale } from "@/src/theme/theme";
import { shortcutHelp } from "./shortcuts";

/** The `?` overlay: every desktop shortcut on one card. */
export function ShortcutHelp({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.backdrop}>
      <Pressable accessibilityLabel="Kısayolları kapat" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityRole="summary" style={styles.panel}>
        <Text style={styles.title}>Klavye kısayolları</Text>
        {shortcutHelp.map((entry) => (
          <View key={entry.keys} style={styles.row}>
            <Text style={styles.keys}>{entry.keys}</Text>
            <Text style={styles.action}>{entry.action}</Text>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ hovered }) => [styles.close, hovered && styles.closeHover]}
        >
          <Text style={styles.closeText}>Kapat</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(1, 6, 12, 0.66)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 50
  },
  panel: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: 460,
    padding: spacing.xl,
    width: "92%"
  },
  title: {
    ...typeScale.moduleTitle,
    color: colors.text,
    marginBottom: spacing.sm
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg
  },
  keys: {
    ...typeScale.micro,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    minWidth: 104,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    textAlign: "center"
  },
  action: {
    ...typeScale.bodyCompact,
    color: colors.textMuted,
    flex: 1
  },
  close: {
    alignItems: "center",
    alignSelf: "flex-end",
    borderRadius: radii.round,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  closeHover: {
    backgroundColor: colors.surface
  },
  closeText: {
    ...typeScale.micro,
    color: colors.text
  }
});
