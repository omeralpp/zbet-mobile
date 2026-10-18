import { experiencePalettes } from "@/src/theme/experience-palette";
// Lab theme selection remains isolated; its approved colours are now shared.
export const prototypePalettes = experiencePalettes;

export type PrototypePalette = { [K in keyof typeof prototypePalettes.dark]: string };

export const labMotionStorageKey = "btb-design-lab-motion-v1";
