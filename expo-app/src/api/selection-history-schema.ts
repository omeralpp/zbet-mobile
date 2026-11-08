import { z } from "zod";

const text = z.string().min(1).max(200).regex(/^[^\x00-\x1f]+$/);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const timestamp = z.string().datetime();
const count = z.number().int().nonnegative();
const market = z.enum(["Ms05a", "Ms05u", "Ms15a", "Ms15u", "Ms25a", "Ms25u", "Ms35a", "Ms35u", "Ms45a", "Ms45u",
  "Ms1", "MsX", "Ms2", "Ms1X", "MsX2", "H1", "H2", "Kgvar", "Kgyok"]);
const decision = z.strictObject({
  armId: z.literal("C1"), publicationId: z.string().regex(/^[A-F0-9]{32}$/), trialId: text, modelVersion: hash,
  recordedAt: timestamp, market, quote: z.number().finite().gt(1).max(1000), quoteAt: timestamp, quoteRef: text,
  sourceSnapshotId: hash,
  state: z.strictObject({ homeScore: count, awayScore: count, elapsed: count.max(130), period: z.enum(["1H", "2H"]),
    homeRedCards: count, awayRedCards: count, revision: text }),
  reference: z.strictObject({ market, quote: z.number().finite().gt(1).max(1000), publicationId: text }).nullable(),
  hypotheticalStakeUnits: z.literal(1), resultStatus: z.literal("NOT_EVALUATED"), publicationSha256: hash
});
export const selectionHistorySchema = z.strictObject({
  contractVersion: z.literal("selection-history.v1"), matchKey: text, researchOnly: z.literal(true),
  autoPromotion: z.literal(false), currentOffer: z.literal(false), availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
  reason: text, firstDecision: decision.nullable()
}).superRefine((value,ctx) => {
  if ((value.availability === "AVAILABLE") !== Boolean(value.firstDecision))
    ctx.addIssue({ code: "custom", message: "History availability and decision disagree" });
  const d=value.firstDecision;
  if (d && (Date.parse(d.quoteAt)>Date.parse(d.recordedAt) || Date.parse(d.recordedAt)-Date.parse(d.quoteAt)>=15000))
    ctx.addIssue({ code: "custom", message: "History must retain the original fresh decision quote" });
});
export type SelectionHistory = z.infer<typeof selectionHistorySchema>;
export function emptySelectionHistory(matchKey: string): SelectionHistory {
  return { contractVersion: "selection-history.v1", matchKey, researchOnly: true, autoPromotion: false,
    currentOffer: false, availability: "UNAVAILABLE", reason: "NOT_RECORDED", firstDecision: null };
}
