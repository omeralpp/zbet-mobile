import { z } from "zod";

/**
 * Uyarlamalar (owner decision 2026-11-24): the deviation bands that decide
 * which fixtures are loaded and which get predictions. The BFF lets only the
 * web client change them, and only once the system runs on PostgreSQL.
 */
export const deviationBandSchema = z.strictObject({
  deviation: z.string().regex(/^\d\.\d{2}$/),
  counter: z.number().int().positive().nullable(),
  active: z.boolean()
});

export const deviationChangeSchema = z.strictObject({
  changedAt: z.string().min(1),
  actor: z.string().min(1),
  deviation: z.string().regex(/^\d\.\d{2}$/),
  counter: z.strictObject({ from: z.number().int().nullable(), to: z.number().int().nullable() }),
  active: z.strictObject({ from: z.boolean(), to: z.boolean() })
});

export const adaptationDeviationsSchema = z.strictObject({
  contractVersion: z.literal("btb-adaptations.v1"),
  editable: z.boolean(),
  readOnlyReason: z.string().nullable(),
  bands: z.array(deviationBandSchema),
  changes: z.array(deviationChangeSchema)
});

export type DeviationBand = z.infer<typeof deviationBandSchema>;
export type AdaptationDeviations = z.infer<typeof adaptationDeviationsSchema>;
export type DeviationBandChange = { counter?: number; active?: boolean };
