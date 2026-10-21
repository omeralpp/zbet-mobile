/**
 * The two bundled families, as Android knows them.
 *
 * `app.config.ts` registers each one through the expo-font config plugin as an
 * XML font family, so a single name plus a `fontWeight` resolves to the right
 * face — the same way a system family does. The web build has its own twin
 * (font-families.web.ts) that adds a fallback stack.
 */
export const fontFamilies = {
  /** Manrope: every word on screen. */
  text: "Manrope",
  /** Barlow Condensed: scores, odds and metrics, read as one shape. */
  numeric: "BarlowCondensed"
} as const;
