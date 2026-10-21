/**
 * Web twin of font-families.ts. React Native Web hands the string to CSS as
 * written, so the bundled family keeps a system fallback: a font that is still
 * loading, or blocked, must never drop a screen to the browser's serif default.
 * The faces themselves are registered by fonts.web.ts.
 */
export const fontFamilies = {
  text: "Manrope, system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif",
  numeric: "BarlowCondensed, Manrope, system-ui, \"Segoe UI\", Roboto, sans-serif"
} as const;
