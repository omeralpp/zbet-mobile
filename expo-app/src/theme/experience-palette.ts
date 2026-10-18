/**
 * Owner-approved Android/web palette, shared with the synthetic design lab.
 * NXT-OBS-171 (2026-10-18): the first ink/sage pass read as washed out on the
 * phone, so accents and card depth are saturated again while every text pair
 * keeps the 4.5:1 reading floor checked in accessible-colors.test.ts.
 */
export const experiencePalettes = {
  dark: {
    background: "#050F18", surface: "#0F2331", soft: "#173548", text: "#F7F5EC",
    muted: "#B6CAD4", border: "#2E5A6E", accent: "#3DDC97", onAccent: "#04281A",
    accentSoft: "#0E3B2C", warning: "#FFC845", warningSoft: "#3B3113", blue: "#62B0FF"
  },
  light: {
    background: "#F3F0E7", surface: "#FFFEF9", soft: "#E5EFEA", text: "#122A33",
    muted: "#455C63", border: "#B3C9C0", accent: "#0B6A4B", onAccent: "#FFFFFF",
    accentSoft: "#D9EEE3", warning: "#7A540A", warningSoft: "#F7EBCD", blue: "#1C5DA6"
  }
} as const;
