import { useCallback, useState, type PropsWithChildren, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors } from "@/src/theme/theme";
import { CommandPalette } from "./CommandPalette";
import { DesktopSidebar } from "./DesktopSidebar";
import { ShortcutHelp } from "./ShortcutHelp";
import { RefreshDataButton } from "./RefreshDataButton";
import type { ShortcutAction } from "./shortcuts";
import { useDesktopShortcuts } from "./use-desktop-shortcuts";

/**
 * Desktop frame around every signed-in screen, detail screens included, so
 * navigation never disappears behind a pushed page. A compact window keeps the
 * phone layout and its bottom bar; the keyboard works at every width.
 */
export function AppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const [overlay, setOverlay] = useState<"palette" | "help" | null>(null);

  const onAction = useCallback(
    (action: ShortcutAction) => {
      if (action.kind === "navigate") {
        setOverlay(null);
        router.navigate(action.path);
      } else if (action.kind === "palette") {
        setOverlay("palette");
      } else if (action.kind === "help") {
        setOverlay("help");
      } else {
        setOverlay(null);
      }
    },
    [router]
  );
  useDesktopShortcuts(onAction);
  const close = useCallback(() => setOverlay(null), []);

  return (
    <View style={styles.shell}>
      {isAtLeast(breakpoint, "medium") ? (
        <DesktopSidebar
          expanded={isAtLeast(breakpoint, "wide")}
          onOpenHelp={() => setOverlay("help")}
          onOpenPalette={() => setOverlay("palette")}
        />
      ) : null}
      <View style={styles.content}><View style={styles.toolbar}><RefreshDataButton /></View>{children}</View>
      {overlay === "palette" ? <TopLayer><CommandPalette onClose={close} /></TopLayer> : null}
      {overlay === "help" ? <TopLayer><ShortcutHelp onClose={close} /></TopLayer> : null}
    </View>
  );
}

/**
 * react-native-web gives every view `z-index: 0`, so an overlay rendered in
 * the shell cannot rise above later siblings such as the mascot layer. A
 * fixed layer on <body> sits above the whole app; React context still flows.
 */
function TopLayer({ children }: { children: ReactNode }) {
  return createPortal(<div style={topLayerStyle}>{children}</div>, document.body);
}

const topLayerStyle = {
  display: "flex",
  inset: 0,
  position: "fixed",
  zIndex: 10000
} as const;

const styles = StyleSheet.create({
  toolbar: { minHeight: 44, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  shell: {
    backgroundColor: colors.background,
    flex: 1,
    flexDirection: "row"
  },
  content: {
    flex: 1,
    minWidth: 0
  }
});
