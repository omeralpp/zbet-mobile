import { useMemo } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { dailyCouponsQuery } from "@/src/api/queries";
import type { MatchSummary } from "@/src/api/schemas";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, iconSizes, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatElapsed } from "@/src/utils/format";
import { istanbulDay } from "@/src/utils/rebuild-log";
import { CouponTicket, type LiveLegState } from "./CouponTicket";
import { sortedTiers, summarizeCoupons } from "./daily-coupon-view";
import { Action } from "./RebuildEvidencePanel";
import { SectionHeader } from "./SectionHeader";
import { SurfaceMaterial } from "./SurfaceMaterial";

/** Current score of today's coupon matches, from the match list Özet already holds. */
export function liveLegStates(matches: readonly MatchSummary[] | undefined): Map<string, LiveLegState> {
  const result = new Map<string, LiveLegState>();
  for (const match of matches ?? []) {
    if (match.status === "LIVE" || match.status === "HALF_TIME") {
      result.set(match.key, { score: `${match.homeScore}–${match.awayScore}`, label: `Canlı · ${formatElapsed(match.status, match.elapsed, match.clock ?? undefined)}` });
    } else if (match.status === "FINISHED") {
      result.set(match.key, { score: `${match.homeScore}–${match.awayScore}`, label: "Bitti · sonuç işleniyor" });
    }
  }
  return result;
}

function Notice({ icon, title, message, onRetry }: { icon: "progress-clock" | "cloud-alert-outline"; title: string; message: string; onRetry?: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.notice}>
      <SurfaceMaterial radius={radii.lg} />
      <MaterialCommunityIcons color={icon === "cloud-alert-outline" ? semantic.warning : semantic.intelligence} name={icon} size={iconSizes.control} />
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeText}>{message}</Text>
        {onRetry ? <Action icon="refresh" onPress={onRetry} title="Tekrar dene" /> : null}
      </View>
    </View>
  );
}

/**
 * Özet · Günlük kuponlar (owner direction 2026-11-17): today's three coupons
 * where the day starts, each match with its live or final score and a tap
 * through to the match. History and results live in Karar günlüğü.
 */
export function DailyCouponsOverview({ matches, now }: { matches: readonly MatchSummary[] | undefined; now: number }) {
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const { width } = useWindowDimensions();
  const wide = Platform.OS === "web" && isAtLeast(breakpoint, "wide");
  const today = istanbulDay(now);
  const query = useQuery(dailyCouponsQuery(today, true));
  const live = useMemo(() => liveLegStates(matches), [matches]);
  const day = query.isError ? undefined : query.data;
  const tiers = day?.status === "AVAILABLE" ? sortedTiers(day) : [];
  const summary = summarizeCoupons(tiers.flatMap((tier) => tier.status === "AVAILABLE" ? [{ day: today, tier }] : []));
  const demo = day?.status === "AVAILABLE" && day.publication.mode === "DEMO";
  const caption = day?.status === "AVAILABLE"
    ? [demo ? "Örnek veri · gerçek kupon değil" : "Bugünün 11.00 bülteni",
      summary.coupons ? [summary.wins ? `${summary.wins} kazandı` : null, summary.losses ? `${summary.losses} kaybetti` : null,
        summary.pending ? `${summary.pending} bekliyor` : null].filter(Boolean).join(" · ") : null].filter(Boolean).join(" · ")
    : "Banko, Dengeli ve Riskli kupon";
  const ticketWidth = Math.min(360, Math.max(260, width - 72));

  return (
    <View style={styles.module}>
      <SectionHeader
        actionLabel="Sonuçlar"
        caption={caption}
        onAction={() => router.push({ pathname: "/super", params: { view: "COUPONS" } } as never)}
        title="Günlük kuponlar"
      />
      {query.isPending ? <Notice icon="progress-clock" message="Bugünün kupon yayını kontrol ediliyor." title="Kuponlar yükleniyor" /> : null}
      {query.isError || day?.status === "UNAVAILABLE" ? (
        <Notice icon="cloud-alert-outline" message="Bugünün kupon yayını doğrulanamadı. Geçmiş sonuçlar Karar günlüğünde." onRetry={() => { void query.refetch(); }} title="Kuponlar şu an alınamadı" />
      ) : null}
      {day?.status === "AWAITING_PUBLICATION" ? (
        <Notice icon="progress-clock" message="Kuponlar Türkiye saatiyle 11.00 bülteninden sonra burada görünür." title="Bugünün kuponları hazırlanıyor" />
      ) : null}
      {tiers.length ? (
        wide ? (
          <View style={styles.row}>
            {tiers.map((tier) => <CouponTicket compact key={tier.tier} live={live} tier={tier} />)}
          </View>
        ) : (
          <ScrollView
            accessibilityLabel="Günlük kuponlar, yana kaydır"
            contentContainerStyle={styles.pager}
            decelerationRate="fast"
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={ticketWidth + spacing.md}
            style={styles.pagerScroll}
          >
            {tiers.map((tier) => (
              <View key={tier.tier} style={{ width: ticketWidth }}>
                <CouponTicket live={live} tier={tier} />
              </View>
            ))}
          </ScrollView>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  module: { gap: spacing.sm, width: "100%" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  pagerScroll: { marginHorizontal: -spacing.lg },
  pager: { gap: spacing.md, paddingHorizontal: spacing.lg },
  notice: { flexDirection: "row", gap: spacing.md, padding: spacing.lg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, overflow: "hidden" },
  noticeCopy: { flex: 1, gap: spacing.xs },
  noticeTitle: { ...typeScale.body, color: colors.text, fontWeight: "700" },
  noticeText: { ...typeScale.bodyCompact, color: colors.textMuted }
});
