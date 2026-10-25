import { z } from "zod";

export const jinxFactIds = ["DECISION", "PRESSURE", "POOL", "DIRECTION", "SCORE"] as const;
export const jinxRb1ExplanationSchema = z.strictObject({
  contractVersion: z.literal("jinx-rb1-explainer.v1"),
  matchKey: z.string().min(1),
  asOf: z.string().datetime({ offset: true }),
  decisionId: z.string().regex(/^[0-9A-F]{32}$/).nullable(),
  evidenceKey: z.string().min(1).max(1500).nullable(),
  origin: z.enum(["LIVE", "DETERMINISTIC"]),
  availability: z.enum(["OK", "UNAVAILABLE"]),
  reasonCode: z.enum(["DISABLED", "NO_DECISION", "REBUILD_UNAVAILABLE", "INVALID_EVIDENCE",
    "LOCAL_SPACING", "LOCAL_HOURLY_CAP", "PROVIDER_FAILURE", "VALIDATION_REJECTED", "EVIDENCE_STALE"]).nullable(),
  facts: z.array(z.strictObject({ id: z.enum(jinxFactIds), text: z.string().min(1).max(500) })).max(5)
}).superRefine((value, ctx) => {
  const available = value.availability === "OK";
  const ids = new Set(value.facts.map(fact => fact.id));
  if ((available ? (!value.decisionId || !value.evidenceKey || ids.size !== 5 || value.facts.length !== 5)
    : (value.decisionId !== null || value.evidenceKey !== null || value.facts.length !== 0))
    || (value.origin === "LIVE" ? (!available || value.reasonCode !== null) : value.reasonCode === null)) {
    ctx.addIssue({ code: "custom", message: "Inconsistent RB1 explanation identity or facts" });
  }
});
export type JinxRb1Explanation = z.infer<typeof jinxRb1ExplanationSchema>;
