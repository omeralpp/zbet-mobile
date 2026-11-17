import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { dailyCouponsQuery } from "@/src/api/queries";
import { colors, iconSizes, interaction, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatRate } from "@/src/utils/format";
import { TonePill } from "./DecisionTicket";
import { couponsForMatch, legResultLabel, settlementPresentation, tierNames } from "./daily-coupon-view";
import { SurfaceMaterial } from "./SurfaceMaterial";

const kickoffDay = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "long" });

/**
 * Match detail · Günlük kupon (owner direction 2026-11-17): when this match is
 * in a published Daily Coupon, say so under the score, with the coupon's pick,
 * its own result and the coupon's state. Absent when the match is in none.
 */
export function MatchCouponCard({ matchKey, today }: { matchKey: string; today: string }) {
  const router = useRouter();
  const day = matchKey.slice(0, 10);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today;
  const query = useQuery({ ...dailyCouponsQuery(day, day === today), enabled: valid });
  const published = query.data?.status === "AVAILABLE" ? query.data : undefined;
  const found = couponsForMatch(published, matchKey);
  if (!found.length) return null;
  const demo = published?.publication?.mode === "DEMO";
  const when = day === today ? "bugünün" : `${kickoffDay.format(new Date(day))}`;
  const title = found.length === 1
    ? `Bu maç ${when} ${tierNames[found[0]!.tier.tier]} kuponunda`
    : `Bu maç ${when} ${found.map((item) => tierNames[item.tier.tier]).join(" ve ")} kuponlarında`;

  return (
    <View style={styles.card}>
      <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
      <View style={styles.head}>
        <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="ticket-confirmation-outline" size={iconSizes.control} />
        <View style={styles.headCopy}>
          <Text style={styles.eyebrow}>GÜNLÜK KUPON{demo ? " · ÖRNEK VERİ" : ""}</Text>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
      </View>
      {found.map(({ tier, leg }) => {
        const couponResult = settlementPresentation[tier.settlement];
        const legState = leg.result ? legResultLabel[leg.result] : "Sonuç doğrulanmadı";
        return (
          <View key={tier.tier} style={styles.row}>
            <View style={styles.rowCopy}>
              <Text style={styles.pick}>{leg.market} · {leg.selection}</Text>
              <Text style={[styles.meta, leg.result === "LOST" && styles.lost, leg.result === "WON" && styles.won]}>
                {`Bu seçim: ${legState}${leg.finalScore ? ` · MS ${leg.finalScore.home}–${leg.finalScore.away}` : ""}`}
              </Text>
              <Text style={styles.meta}>{`${tierNames[tier.tier]} kuponu · ${tier.legs.length} maç · toplam oran ${formatRate(tier.totalOdds)}`}</Text>
            </View>
            <View style={styles.rowFigures}>
              <Text style={styles.odds}>{formatRate(leg.odds)}</Text>
              <TonePill label={couponResult.label} tone={couponResult.tone} />
            </View>
          </View>
        );
      })}
      <Pressable accessibilityHint="Karar günlüğünde kupon sonuçlarını açar" accessibilityRole="button"
        onPress={() => router.push({ pathname: "/super", params: { view: "COUPONS" } } as never)}
        style={({ hovered, pressed }) => [styles.action, (hovered || pressed) && styles.actionPressed]}>
        <Text style={styles.actionText}>Kuponun tüm maçları</Text>
        <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="chevron-right" size={iconSizes.small} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.md, marginTop: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, overflow: "hidden", ...shadows.card },
  head: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headCopy: { flex: 1, minWidth: 0, gap: 2 },
  eyebrow: { ...typeScale.eyebrow, color: semantic.intelligence },
  title: { ...typeScale.identity, color: colors.text, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowFigures: { alignItems: "flex-end", gap: spacing.xs },
  pick: { ...typeScale.body, color: colors.text, fontWeight: "700" },
  meta: { ...typeScale.meta, color: colors.textMuted },
  won: { color: semantic.positive, fontWeight: "700" },
  lost: { color: semantic.negative, fontWeight: "700" },
  odds: { ...typeScale.metricCompact, color: colors.text },
  action: { minHeight: interaction.minTouchTarget, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: spacing.xs },
  actionPressed: { opacity: 0.75 },
  actionText: { ...typeScale.label, color: semantic.intelligence, fontWeight: "700" }
});
