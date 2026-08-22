import { durations } from "@/src/theme/motion";

export const mainTabTransitionSpec = {
  animation: "timing",
  config: { duration: durations.transition }
} as const;

export function mainTabTranslationRange(
  width: number
): readonly [number, number, number] {
  const distance = Number.isFinite(width) && width > 0 ? width : 1;
  return [-distance, 0, distance];
}
