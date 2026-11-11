import { experiencePalettes } from "./experience-palette";
/**
 * Filled actions use their own foreground; analytical blue never implies success.
 *
 * `starOff` is the unearned part of a five-star rating. It used the border
 * colour, which read 1.4–1.7:1 on light cards and 2.2:1 on dark ones, so a
 * rating lost its "of five". It now clears 3:1 on the card surface, the floor
 * for a graphic that carries meaning (NXT-OBS-257).
 */
export const accessibleColors = {
  dark: { actionFill: experiencePalettes.dark.accent, onAction: experiencePalettes.dark.onAccent, textSubtle: experiencePalettes.dark.muted, starOff: "#44778C" },
  light: { actionFill: experiencePalettes.light.accent, onAction: experiencePalettes.light.onAccent, textSubtle: experiencePalettes.light.muted, starOff: "#7B968C" }
} as const;

/**
 * Status text that sits on its own soft fill: result pills and the
 * current-selection chip. The light green is one step darker than the earlier
 * #0E7C47, which read 4.33:1 on the soft green, under the reading floor
 * (NXT-OBS-256).
 */
export const statusText = {
  dark: { positive: "#4ADE80" },
  light: { positive: "#0D7743" }
} as const;
