import type { PropsWithChildren } from "react";

/**
 * Native: the app is its own shell, so this passes children through unchanged.
 * The web build's desktop frame (sidebar, command palette, keyboard) is the
 * twin in AppShell.web.tsx.
 */
export function AppShell({ children }: PropsWithChildren) {
  return children;
}
