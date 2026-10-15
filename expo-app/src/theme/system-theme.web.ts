import type { ThemeMode } from "./theme-preference";

/**
 * Web twin of applySystemTheme. A browser has no native appearance API or
 * widgets; the document's color-scheme keeps scrollbars and form controls in
 * the same theme, and the body background stops a white flash on overscroll.
 */
export function applySystemTheme(mode: ThemeMode, background: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.style.colorScheme = mode;
  document.documentElement.style.backgroundColor = background;
  document.body.style.backgroundColor = background;
}
