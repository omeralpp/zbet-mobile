import { experiencePalettes } from "./experience-palette";
/** Filled actions use their own foreground; analytical blue never implies success. */
export const accessibleColors = {
  dark: { actionFill: experiencePalettes.dark.accent, onAction: experiencePalettes.dark.onAccent, textSubtle: experiencePalettes.dark.muted },
  light: { actionFill: experiencePalettes.light.accent, onAction: experiencePalettes.light.onAccent, textSubtle: experiencePalettes.light.muted }
} as const;
