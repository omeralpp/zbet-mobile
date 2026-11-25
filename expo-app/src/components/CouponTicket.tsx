import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DailyCouponLeg, DailyCouponTier } from "@/src/api/daily-coupons-schema";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatRate } from "@/src/utils/format";
import { TonePill, toneColor } from "./DecisionTicket";
import { legResultLabel, settlementPresentation, tierNames, type LiveLegState } from "./daily-coupon-view";
import { SurfaceMaterial } from "./SurfaceMaterial";

const time = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", hour: "2-digit", minute: "2-digit" });

const legIcon = {
  PENDING: { name: "clock-outline", tone: "pending" },
  WON: { name: "check-circle", tone: "positive" },
  LOST: { name: "close-circle", tone: "negative" },
  VOID: { name: "minus-circle-outline", tone: "neutral" }
} as const;

function LegRow({ leg, live, onOpen, now }: { leg: DailyCouponLeg; live: LiveLegState | undefined; onOpen: (() => void) | undefined; now: number }) {
  const icon = leg.result ? legIcon[leg.result] : null;
  const lost = leg.result === "LOST";
  const score = leg.finalScore ? `MS ${leg.finalScore.home}–${leg.finalScore.away}` : live?.score;
  const status = leg.result && leg.result !== "PENDING" ? legResultLabel[leg.result]
    : live?.label ?? (Date.parse(leg.kickoffAt) <= now ? "Skor bekleniyor" : `Başlama ${time.format(new Date(leg.kickoffAt))}`);
  const label = `${leg.home} – ${leg.away}, ${leg.market} ${leg.selection}, oran ${formatRate(leg.odds)}, ${status}${score ? `, ${score}` : ""}`;
  // Before kickoff the start time takes the score's place, so the right
  // column always reads "score or start" and the row needs no third line.
  const upcoming = !score && !lost && !live?.label && (!leg.result || leg.result === "PENDING") && Date.parse(leg.kickoffAt) > now;
  const body = (
    <>
      <View accessible={false} style={styles.legIcon}>
        {icon ? <MaterialCommunityIcons color={toneColor[icon.tone]} name={icon.name} size={iconSizes.small} />
          : <View style={styles.legDot} />}
      </View>
      <View style={styles.legCopy}>
        <View style={styles.legLine}>
          <Text numberOfLines={2} style={[styles.fixture, lost && styles.fixtureLost]}>{leg.home} – {leg.away}</Text>
          {score ? <Text style={[styles.score, lost && { color: semantic.negative }]}>{score}</Text>
            : upcoming ? <Text style={styles.kickoff}>{time.format(new Date(leg.kickoffAt))}</Text> : null}
        </View>
        <View style={styles.legLine}>
          <Text numberOfLines={2} style={styles.selection}>{leg.market} · {leg.selection}</Text>
          <Text style={styles.odds}>{formatRate(leg.odds)}</Text>
        </View>
        {upcoming ? null : <Text style={[styles.meta, lost && styles.lostText]}>{lost ? "Kuponu yatıran maç" : status}</Text>}
      </View>
      {onOpen ? <MaterialCommunityIcons accessible={false} color={colors.textMuted} name="chevron-right" size={iconSizes.small} /> : null}
    </>
  );
  if (!onOpen) return <View accessibilityLabel={label} accessible style={[styles.leg, lost && styles.legLost]}>{body}</View>;
  return (
    <Pressable accessibilityHint="Maç detayını açar" accessibilityLabel={label} accessibilityRole="button" onPress={onOpen}
      style={({ hovered, pressed }) => [styles.leg, lost && styles.legLost, (hovered || pressed) && styles.legPressed]}>
      {body}
    </Pressable>
  );
}

/**
 * One Daily Coupons tier as a ticket: its result, total odds and every match,
 * each match with its own result and final score, and a tap through to the
 * match detail. A lost coupon names the match that lost it.
 */
export function CouponTicket({ tier, live, eyebrow, compact = false, now }: {
  tier: DailyCouponTier;
  live?: ReadonlyMap<string, LiveLegState>;
  eyebrow?: string;
  compact?: boolean;
  now: number;
}) {
  const router = useRouter();
  const from = usePathname();
  if (tier.status === "NO_QUALIFYING_COUPON") {
    return (
      <View style={[styles.ticket, compact && styles.ticketCompact]}>
        <SurfaceMaterial radius={radii.lg} />
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.tier}>{tierNames[tier.tier]}</Text>
        <Text style={styles.meta}>Bugün bu risk aralığında uygun kupon çıkmadı.</Text>
      </View>
    );
  }
  const result = settlementPresentation[tier.settlement];
  const settledLegs = tier.legs.filter((leg) => leg.result === "WON").length;
  const progress = tier.settlement === "PENDING" ? `${settledLegs}/${tier.legs.length} maç tuttu` : `${tier.legs.length} maç`;
  return (
    <View style={[styles.ticket, compact && styles.ticketCompact]}>
      <SurfaceMaterial {...(tier.settlement === "PENDING" ? { accent: semantic.intelligence } : {})} radius={radii.lg} />
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <View style={styles.head}>
        <View style={styles.headCopy}>
          <Text accessibilityRole="header" style={styles.tier}>{tierNames[tier.tier]}</Text>
          <View style={styles.headMeta}>
            <TonePill label={result.label} tone={result.tone} />
            <Text style={styles.meta}>{progress}</Text>
          </View>
        </View>
        <View accessibilityLabel={`Toplam oran ${formatRate(tier.totalOdds)}`} accessible style={styles.total}>
          <Text style={styles.totalOdds}>{formatRate(tier.totalOdds)}</Text>
          <Text style={styles.meta}>toplam oran</Text>
        </View>
      </View>
      <View style={styles.legs}>
        {tier.legs.map((leg) => (
          <LegRow key={leg.fixtureId} leg={leg} live={leg.matchKey ? live?.get(leg.matchKey) : undefined} now={now}
            onOpen={leg.matchKey ? () => router.push({ pathname: "/match/[key]", params: { key: leg.matchKey!, from } } as never) : undefined} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, overflow: "hidden", ...shadows.card },
  ticketCompact: { flex: 1, minWidth: 0 },
  eyebrow: { ...typeScale.eyebrow, color: colors.textMuted },
  head: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  headCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  headMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  tier: { ...typeScale.moduleTitle, color: colors.text },
  total: { alignItems: "flex-end" },
  totalOdds: { ...typeScale.metric, color: colors.text },
  legs: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  leg: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, borderRadius: radii.sm },
  legLost: { backgroundColor: semantic.negativeSoft },
  legPressed: { backgroundColor: colors.surfaceStrong },
  legIcon: { width: 22, alignItems: "center" },
  legDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  legCopy: { flex: 1, minWidth: 0, gap: 2 },
  legLine: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm },
  fixture: { ...typeScale.identity, color: colors.text, fontWeight: "700", flexShrink: 1 },
  fixtureLost: { color: colors.text },
  // Never shrinks: a long team name truncates instead of wrapping the score.
  score: { ...typeScale.metricCompact, color: colors.text, flexShrink: 0 },
  kickoff: { ...typeScale.metricCompact, color: colors.textMuted, flexShrink: 0 },
  selection: { ...typeScale.bodyCompact, color: colors.textMuted, flexShrink: 1 },
  odds: { ...typeScale.metricCompact, color: colors.text, flexShrink: 0 },
  meta: { ...typeScale.meta, color: colors.textMuted },
  lostText: { color: semantic.negative, fontWeight: "700" }
});
