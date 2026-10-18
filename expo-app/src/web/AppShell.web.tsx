import { useCallback, useState, type PropsWithChildren } from "react";
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
import { AccessibleDialog } from "./AccessibleDialog";

/**
 * Desktop frame around every signed-in screen, detail screens included, so
 * navigation never disappears behind a pushed page. A compact window keeps the
 * phone layout and its bottom bar; the keyboard works at every width.
 */
export function AppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const [overlay, setOverlay] = useState<"palette" | "help" | null>(null);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);
  const openOverlay = useCallback((next: "palette" | "help") => {
    setReturnFocus(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setOverlay(next);
  }, []);

  const onAction = useCallback(
    (action: ShortcutAction) => {
      if (action.kind === "navigate") {
        setOverlay(null);
        router.navigate(action.path);
      } else if (action.kind === "palette") {
        openOverlay("palette");
      } else if (action.kind === "help") {
        openOverlay("help");
      } else {
        setOverlay(null);
      }
    },
    [router, openOverlay]
  );
  useDesktopShortcuts(onAction, overlay !== null);
  const close = useCallback(() => setOverlay(null), []);

  return (
    <View style={styles.shell}>
      {isAtLeast(breakpoint, "medium") ? (
        <DesktopSidebar
          expanded={isAtLeast(breakpoint, "wide")}
          onOpenHelp={() => openOverlay("help")}
          onOpenPalette={() => openOverlay("palette")}
        />
      ) : null}
      <View style={styles.content}><View style={styles.toolbar}><RefreshDataButton /></View>{children}</View>
      {overlay === "palette" ? <AccessibleDialog label="Yüklenen verilerde ara" onClose={close} returnFocus={returnFocus}><CommandPalette onClose={close} /></AccessibleDialog> : null}
      {overlay === "help" ? <AccessibleDialog label="Klavye kısayolları" onClose={close} returnFocus={returnFocus}><ShortcutHelp onClose={close} /></AccessibleDialog> : null}
    </View>
  );
}

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
