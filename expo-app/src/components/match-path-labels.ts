/**
 * Where a grouped mark's count badge sits on the match timeline: on the side
 * its minute label does not use. A home mark carries the label above it, so the
 * badge drops below; an away mark carries it below, so the badge stays on top
 * (NXT-OBS-253).
 */
export function countBadgeEdge(kind: string, side: string | null | undefined): "TOP" | "BOTTOM" {
  const labelled = kind === "GOAL" || kind === "RED_CARD";
  return labelled && side !== "AWAY" ? "BOTTOM" : "TOP";
}
