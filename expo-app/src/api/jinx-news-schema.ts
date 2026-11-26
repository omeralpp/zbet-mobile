import { z } from "zod";

/**
 * Jinx "Maç gündemi" (btb-jinx-news.v1): a grounded, display-only brief of
 * recent news about a match's teams and competition. Every bullet cites at
 * least one listed source; nothing here feeds a BTB decision.
 */
const isoDateTime = z.string().datetime({ offset: true });
export const jinxNewsBriefSchema = z.strictObject({
  schemaVersion: z.literal("btb-jinx-news.v1"),
  matchKey: z.string().min(1),
  status: z.enum(["AVAILABLE", "NO_RECENT_NEWS", "DISABLED", "FAILED", "LIMITED", "SKIPPED"]),
  displayOnly: z.literal(true),
  generatedAt: isoDateTime.nullable(),
  observedAt: isoDateTime,
  refreshAvailableAt: isoDateTime.optional(),
  bullets: z.array(z.strictObject({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    text: z.string().min(1).max(240),
    sources: z.array(z.number().int().nonnegative()).min(1).max(8)
  })).max(5),
  sources: z.array(z.strictObject({ title: z.string().min(1).max(120), url: z.string().url().startsWith("https://") })).max(8)
}).superRefine((value, ctx) => {
  if ((value.status === "AVAILABLE") !== (value.bullets.length > 0)
    || value.bullets.some((bullet) => bullet.sources.some((index) => index >= value.sources.length))) {
    ctx.addIssue({ code: "custom", message: "Inconsistent Jinx news brief" });
  }
});
export type JinxNewsBrief = z.infer<typeof jinxNewsBriefSchema>;
