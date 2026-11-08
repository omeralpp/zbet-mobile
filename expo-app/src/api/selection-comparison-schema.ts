import { z } from "zod";

export const selectionArms = ["C0", "C1", "C2", "C3"] as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const text = z.string().min(1).max(200).regex(/^[^\x00-\x1f]+$/);
const count = z.number().int().nonnegative();
const timestamp = z.string().datetime();
const market = z.enum(["Ms05a", "Ms05u", "Ms15a", "Ms15u", "Ms25a", "Ms25u", "Ms35a", "Ms35u", "Ms45a", "Ms45u",
  "Ms1", "MsX", "Ms2", "Ms1X", "MsX2", "H1", "H2", "Kgvar", "Kgyok"]);

const proposal = z.strictObject({
  id: z.enum(selectionArms), modelVersion: hash.nullable(), trialId: text.nullable(),
  status: z.enum(["SELECTED", "ABSTAIN", "UNAVAILABLE", "STOPPED"]), reason: text,
  selection: z.strictObject({ market, quote: z.number().finite().gt(1).max(1000), quoteAt: timestamp,
    quoteRef: text, publicationId: text }).nullable(),
  probability: z.number().finite().min(0).max(1).nullable(),
  probabilityValidation: z.strictObject({ method: z.literal("OUT_OF_TIME_REVIEWED"), reportSha256: hash }).nullable(),
  expectedNet: z.number().finite().nullable(),
  form: z.strictObject({ snapshotSha256: hash, homeN: count, awayN: count, homeVenueN: count, awayVenueN: count }).nullable(),
  explanationCodes: z.array(z.string().regex(/^[A-Z][A-Z0-9_]{0,63}$/)).max(12)
});

export const selectionComparisonSchema = z.strictObject({
  contractVersion: z.literal("selection-comparison.v1"), matchKey: text,
  researchOnly: z.literal(true), autoPromotion: z.literal(false),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE", "STALE"]), reason: text,
  snapshotId: hash.nullable(), sourceSnapshotId: hash.nullable(), asOf: timestamp.nullable(), expiresAt: timestamp.nullable(),
  state: z.strictObject({ homeScore: count, awayScore: count, elapsed: count.max(130), period: z.enum(["1H", "2H"]),
    homeRedCards: count, awayRedCards: count, revision: text }).nullable(),
  proposals: z.array(proposal).length(4)
}).superRefine((value, ctx) => {
  const invalid = (message: string) => ctx.addIssue({ code: "custom", message });
  const active = value.availability === "AVAILABLE";
  if (value.proposals.some((arm, i) => arm.id !== selectionArms[i])) invalid("Missing, duplicate or unordered arm");
  if (active) {
    if (!value.snapshotId || !value.sourceSnapshotId || !value.asOf || !value.expiresAt || !value.state)
      invalid("Available comparison requires a complete shared snapshot");
    if (value.asOf && value.expiresAt && (Date.parse(value.expiresAt) <= Date.parse(value.asOf) ||
      Date.parse(value.expiresAt)-Date.parse(value.asOf) > 120000)) invalid("Invalid publication lifetime");
  } else if (value.snapshotId !== null || value.sourceSnapshotId !== null || value.asOf !== null || value.expiresAt !== null || value.state !== null)
    invalid("Unavailable comparison must withhold snapshot values");
  for (const arm of value.proposals) {
    if (!active && (arm.status !== "UNAVAILABLE" || arm.form !== null)) invalid("Unavailable comparison contains an active arm");
    if ((arm.status === "SELECTED") !== (arm.selection !== null)) invalid("Selection and status disagree");
    if (arm.selection && (!arm.modelVersion || (arm.id !== "C0" && !arm.trialId))) invalid("Missing model/trial identity");
    if (arm.selection && value.asOf && (Date.parse(arm.selection.quoteAt) > Date.parse(value.asOf) ||
      Date.parse(value.asOf)-Date.parse(arm.selection.quoteAt) > 120000)) invalid("Quote is not decision-time evidence");
    if (arm.selection && value.expiresAt && Date.parse(value.expiresAt) > Date.parse(arm.selection.quoteAt)+15000)
      invalid("Publication must retain the RB1 15-second quote lifetime");
    if ((arm.probability === null) !== (arm.probabilityValidation === null)) invalid("Probability lacks reviewed validation");
    if (arm.probability !== null && arm.selection === null) invalid("Probability has no selected market");
    if (arm.expectedNet !== null && (arm.probability === null || !arm.selection ||
      Math.abs(arm.expectedNet-(arm.probability*arm.selection.quote-1)) > 1e-8)) invalid("Expected payoff disagrees with probability and price");
    if (arm.id === "C0" && (arm.probability !== null || arm.expectedNet !== null)) invalid("Champion stars are not probabilities");
    if (["C2", "C3"].includes(arm.id) && arm.selection &&
      (!arm.form || !arm.form.homeN || !arm.form.awayN || arm.probability === null)) invalid("Form selection lacks validated form/probability");
  }
});

export type SelectionComparison = z.infer<typeof selectionComparisonSchema>;
export type SelectionProposal = SelectionComparison["proposals"][number];

export function emptySelectionComparison(matchKey: string): SelectionComparison {
  return { contractVersion: "selection-comparison.v1", matchKey, researchOnly: true, autoPromotion: false,
    availability: "UNAVAILABLE", reason: "NOT_PUBLISHED", snapshotId: null, sourceSnapshotId: null,
    asOf: null, expiresAt: null, state: null, proposals: selectionArms.map(id => ({ id, modelVersion: null,
      trialId: null, status: "UNAVAILABLE", reason: "NOT_PUBLISHED", selection: null, probability: null,
      probabilityValidation: null, expectedNet: null, form: null, explanationCodes: [] })) };
}
