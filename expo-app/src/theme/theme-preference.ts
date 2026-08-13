export type ThemeMode = "dark" | "light";

export function parseThemeMode(value: string | null | undefined): ThemeMode {
  return value === "light" ? "light" : "dark";
}
