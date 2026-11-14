import { z } from "zod";

export const dailyCouponDateSchema = z.iso.date();

const timestamp = z.iso.datetime({ offset: true });
const tier = z.enum(["BANKO", "DENGELI", "RISKLI"]);
const text = z.string().trim().min(1);
const odds = z.number().finite().gt(1);

const leg = z.strictObject({
  fixtureId: text,
  home: text,
  away: text,
  kickoffAt: timestamp,
  market: text,
  selection: text,
  odds,
  quotedAt: timestamp,
  quoteTimeBasis: z.enum(["PROVIDER", "CAPTURE_UPPER_BOUND"]).optional(),
  rationale: text
});

const coupon = z.discriminatedUnion("status", [
  z.strictObject({
    tier,
    status: z.literal("AVAILABLE"),
    reason: text.nullable(),
    totalOdds: odds,
    legs: z.array(leg).min(1),
    settlement: z.enum(["PENDING", "WON", "LOST", "VOID"]),
    settlementUpdatedAt: timestamp.optional(),
    settlementRevision: z.number().int().positive().optional(),
    expiresAt: timestamp.nullish()
  }).refine((value) => (value.settlementUpdatedAt === undefined) === (value.settlementRevision === undefined), {
    message: "Settlement update time and revision must be provided together"
  }),
  z.strictObject({
    tier,
    status: z.literal("NO_QUALIFYING_COUPON"),
    reason: text,
    totalOdds: z.null(),
    legs: z.tuple([]),
    settlement: z.null(),
    expiresAt: z.null().optional()
  })
]);

const publication = z.strictObject({
  cutoffAt: timestamp,
  publishedAt: timestamp,
  expiresAt: timestamp.nullish(),
  sourceChannel: text,
  mode: z.enum(["PILOT", "DEMO"])
});

const envelope = {
  contractVersion: z.literal("daily-coupons.v1"),
  bettingDate: dailyCouponDateSchema,
  history: z.array(z.strictObject({
    bettingDate: dailyCouponDateSchema,
    status: z.literal("AVAILABLE")
  })).max(30)
};

export const dailyCouponsSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...envelope, status: z.literal("AVAILABLE"), publication, tiers: z.array(coupon).length(3) }),
  z.strictObject({ ...envelope, status: z.literal("AWAITING_PUBLICATION"), publication: z.null(), tiers: z.tuple([]) }),
  z.strictObject({ ...envelope, status: z.literal("UNAVAILABLE"), publication: z.null(), tiers: z.tuple([]) })
]).refine((value) => {
  const dates = value.history.map((day) => day.bettingDate);
  return !dates.includes(value.bettingDate) && new Set(dates).size === dates.length;
}, { message: "History must contain unique dates other than the requested day", path: ["history"] })
  .refine((value) => value.status !== "AVAILABLE" || new Set(value.tiers.map((item) => item.tier)).size === 3,
    { message: "A published day requires one entry for each tier", path: ["tiers"] });

export type DailyCoupons = z.infer<typeof dailyCouponsSchema>;
export type DailyCouponTier = z.infer<typeof coupon>;
export type DailyCouponPublication = z.infer<typeof publication>;
