import { z } from "zod";

/**
 * Jinx notes (btb-jinx-notes.v1) and mascot lines (btb-jinx-lines.v1): short,
 * display-only Turkish sentences the BFF writes from its own facts. Nothing
 * here feeds a BTB decision.
 */
const isoDateTime = z.string().datetime({ offset: true });
export const jinxNotesSchema = z.strictObject({
  contractVersion: z.literal("btb-jinx-notes.v1"),
  matchKey: z.string().min(1),
  status: z.enum(["AVAILABLE", "DISABLED"]),
  notes: z.array(z.strictObject({
    kind: z.enum(["PRE", "DECISION", "POST"]),
    decisionId: z.string().regex(/^[0-9A-F]{32}$/).nullable(),
    text: z.string().min(1).max(160),
    generatedAt: isoDateTime
  })).max(40)
});
export type JinxNotes = z.infer<typeof jinxNotesSchema>;
export type JinxNote = JinxNotes["notes"][number];

export const jinxDailyLinesSchema = z.strictObject({
  contractVersion: z.literal("btb-jinx-lines.v1"),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["AVAILABLE", "DISABLED", "NO_FACTS", "UNAVAILABLE"]),
  signature: z.string().nullable(),
  stale: z.boolean(),
  lines: z.array(z.string().min(1).max(110)).max(12)
});
export type JinxDailyLines = z.infer<typeof jinxDailyLinesSchema>;

/**
 * The note the Jinx card shows: the match's closing note once it exists, else
 * the note of the decision on screen, else the newest decision's, else PRE.
 */
export function pickJinxNote(notes: JinxNotes | undefined, decisionId?: string | null): JinxNote | null {
  if (!notes || notes.status !== "AVAILABLE") return null;
  const list = notes.notes;
  return list.find((note) => note.kind === "POST")
    ?? (decisionId ? list.find((note) => note.kind === "DECISION" && note.decisionId === decisionId) : undefined)
    ?? list.find((note) => note.kind === "DECISION")
    ?? list.find((note) => note.kind === "PRE")
    ?? null;
}

/** A current pool line for the mascot, rotating by Istanbul hour; null when stale or empty. */
export function pickJinxLine(lines: JinxDailyLines | undefined, now: number): string | null {
  if (!lines || lines.status !== "AVAILABLE" || lines.stale || !lines.lines.length) return null;
  return lines.lines[Math.floor(now / 3_600_000) % lines.lines.length] ?? null;
}
