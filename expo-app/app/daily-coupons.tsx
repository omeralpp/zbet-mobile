import { useCallback, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { dailyCouponDateSchema, type DailyCouponPublication, type DailyCouponTier } from "@/src/api/daily-coupons-schema";
import { dailyCouponsQuery } from "@/src/api/queries";
import { FilterChip } from "@/src/components/FilterChip";
import { Screen } from "@/src/components/Screen";
import { EmptyState, ErrorState, LoadingState, SystemState } from "@/src/components/StateView";
import { isAtLeast } from "@/src/layout/breakpoints";
import { useBreakpoint } from "@/src/layout/use-breakpoint";
import { colors, iconSizes, interaction, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatRate } from "@/src/utils/format";

const timeZone = "Europe/Istanbul";
const dateKey = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
const longDate = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const shortDate = new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const time = new Intl.DateTimeFormat("tr-TR", { timeZone, hour: "2-digit", minute: "2-digit" });
const timeWithDate = new Intl.DateTimeFormat("tr-TR", { timeZone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const preciseTime = new Intl.DateTimeFormat("tr-TR", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" });

const tierNames = { BANKO: "Banko", DENGELI: "Dengeli", RISKLI: "Riskli" } as const;
const tierOrder = ["BANKO", "DENGELI", "RISKLI"] as const;
const settlementNames = { PENDING: "Sonuç bekliyor", WON: "Kazandı", LOST: "Kaybetti", VOID: "İptal" } as const;

export default function DailyCouponsScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  const router = useRouter();
  const breakpoint = useBreakpoint();
  const [now, setNow] = useState(Date.now);
  useFocusEffect(useCallback(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, []));
  const today = dateKey.format(now);
  const validatedDate = dailyCouponDateSchema.safeParse(date);
  const selected = validatedDate.success && validatedDate.data < today ? validatedDate.data : today;
  const isToday = selected === today;
  const query = useQuery(dailyCouponsQuery(selected, isToday));
  const day = query.isError ? undefined : query.data;
  const desktop = Platform.OS === "web" && isAtLeast(breakpoint, "medium");
  const wide = desktop && isAtLeast(breakpoint, "wide");
  const dayLabel = longDate.format(new Date(selected));
  const refresh = () => void query.refetch();
  const open = (value?: string) => router.setParams({ date: value ?? "" });
  const publication = day?.publication;

  return (
    <Screen
      title={desktop ? "Günlük Kuponlar" : dayLabel}
      {...(desktop ? { subtitle: dayLabel } : { edgeSwipeBack: true, onEdgeSwipeBack: () => router.canGoBack() ? router.back() : router.replace("/") })}
      wide
      contentStyle={styles.content}
      scrollProps={{ refreshControl: <RefreshControl colors={[colors.green]} onRefresh={refresh} refreshing={query.isFetching && !query.isPending} tintColor={colors.green} /> }}
    >
      {!isToday || (!desktop && day?.status === "AVAILABLE") ? (
        <View style={styles.toolbar}>
          {!isToday ? <FilterChip label="Bugüne dön" onPress={() => open()} selected={false} /> : null}
          {!desktop && day?.status === "AVAILABLE" ? (
            <Pressable accessibilityLabel="Kuponları yenile" accessibilityRole="button" accessibilityState={{ busy: query.isFetching }} disabled={query.isFetching} onPress={refresh} style={({ pressed }) => [styles.refresh, (pressed || query.isFetching) && styles.refreshPressed]}>
              <MaterialCommunityIcons accessible={false} name="refresh" color={colors.text} size={iconSizes.small} />
              <Text style={styles.body}>Yenile</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {query.isError ? <ErrorState error={query.error} onRetry={refresh} /> : null}
      {query.isPending ? <LoadingState label="Günlük kuponlar yükleniyor" /> : null}
      {day?.status === "AWAITING_PUBLICATION" ? (
        <EmptyState title="Günlük yayın bekleniyor" message="Günlük bülten kesimi Türkiye saatiyle 11.00. Doğrulama tamamlandığında kuponlar burada görünecek." />
      ) : null}
      {day?.status === "UNAVAILABLE" ? (
        <SystemState kind="UNAVAILABLE" title="Kupon yayını doğrulanamadı" message="Bu tarih için doğrulanmış bir kupon kaydı alınamadı." onRetry={refresh} />
      ) : null}

      {publication && day ? (
        <>
          <PublicationDetails publication={publication} />
          <View style={[styles.cards, wide && styles.cardsWide]}>
            {[...day.tiers].sort((left, right) => tierOrder.indexOf(left.tier) - tierOrder.indexOf(right.tier)).map((tier) => (
              <CouponCard key={tier.tier} tier={tier} mode={publication.mode} now={now} day={selected} past={!isToday} />
            ))}
          </View>
        </>
      ) : null}

      {day && day.history.length > 0 ? (
        <View style={styles.history}>
          <Text accessibilityRole="header" role="heading" aria-level={2} style={styles.heading}>Geçmiş yayınlar</Text>
          <View style={styles.toolbar}>
            {[...day.history].sort((left, right) => right.bettingDate.localeCompare(left.bettingDate)).map(({ bettingDate }) => (
              <FilterChip key={bettingDate} label={shortDate.format(new Date(bettingDate))} selected={false} onPress={() => open(bettingDate)} />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function formatTime(value: string | number, day: string) {
  const timestamp = new Date(value);
  return (dateKey.format(timestamp) === day ? time : timeWithDate).format(timestamp);
}

function PublicationDetails({ publication }: { publication: DailyCouponPublication }) {
  const demo = publication.mode === "DEMO";
  return (
    <View style={styles.publication}>
      <View style={styles.publicationHeader}>
        <Text style={[styles.caption, demo && styles.demo]}>{demo ? "Demo · gerçek kupon önerisi değil" : "Pilot yayın"}</Text>
        <Text style={styles.muted}>{publication.sourceChannel}</Text>
      </View>
      {demo ? <Text style={styles.muted}>Oranların ve marketlerin oynanabilirliği doğrulanmadı.</Text> : null}
      <View style={styles.publicationTimes}>
        <Text style={styles.body}>{demo ? "Bülten kaydı" : "Bülten kesimi"} {preciseTime.format(new Date(publication.cutoffAt))}</Text>
        <Text style={styles.body}>Yayın {preciseTime.format(new Date(publication.publishedAt))}</Text>
        <Text style={styles.muted}>Türkiye saati</Text>
      </View>
    </View>
  );
}

function CouponCard({ tier, mode, now, day, past }: { tier: DailyCouponTier; mode: DailyCouponPublication["mode"]; now: number; day: string; past: boolean }) {
  if (tier.status === "NO_QUALIFYING_COUPON") {
    return (
      <View style={styles.card}>
        <Text accessibilityRole="header" role="heading" aria-level={2} style={styles.heading}>{tierNames[tier.tier]}</Text>
        <Text style={styles.caption}>Uygun kupon yok</Text>
        <Text style={styles.muted}>{tier.reason}</Text>
      </View>
    );
  }

  const firstKickoffAt = Math.min(...tier.legs.map((leg) => Date.parse(leg.kickoffAt)));
  const expiresAt = Math.min(firstKickoffAt, tier.expiresAt ? Date.parse(tier.expiresAt) : Infinity);
  const closed = past || now >= expiresAt || tier.settlement !== "PENDING";
  const status = tier.settlement === "PENDING" && !closed ? "Maçlar başlamadı" : settlementNames[tier.settlement];
  const quoteLabel = mode === "DEMO" ? "Bülten oranı" : "Yayın oranı";
  const firstRationale = tier.legs[0]?.rationale;
  const sharedRationale = tier.legs.length > 1 && tier.legs.every((leg) => leg.rationale === firstRationale) ? firstRationale : undefined;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tierInfo}>
          <Text accessibilityRole="header" role="heading" aria-level={2} style={styles.heading}>{tierNames[tier.tier]}</Text>
          <Text style={[styles.caption, !closed && mode === "PILOT" && styles.preMatch]}>{status}</Text>
        </View>
        <View accessible accessibilityLabel={`Toplam ${quoteLabel.toLocaleLowerCase("tr-TR")} ${formatRate(tier.totalOdds)}`} style={styles.price}>
          <Text style={styles.totalOdds}>{formatRate(tier.totalOdds)}</Text>
          <Text style={styles.muted}>Toplam oran</Text>
        </View>
      </View>
      <Text style={styles.muted}>Kupon kapanışı {formatTime(expiresAt, day)}</Text>
      {tier.settlementUpdatedAt ? <Text style={styles.muted}>Sonuç kaydı {formatTime(tier.settlementUpdatedAt, day)}</Text> : null}
      {tier.reason ? <Text style={styles.body}>{tier.reason}</Text> : null}
      {sharedRationale && sharedRationale !== tier.reason ? <Text style={styles.body}>{sharedRationale}</Text> : null}
      <View style={styles.legs}>
        {tier.legs.map((leg) => (
          <View key={leg.fixtureId} style={styles.leg}>
            <Text style={styles.fixture}>{leg.home} – {leg.away}</Text>
            <View style={styles.legHeading}>
              <Text style={styles.selection}>{leg.market} · {leg.selection}</Text>
              <Text accessibilityLabel={`${quoteLabel} ${formatRate(leg.odds)}`} style={styles.selectionOdds}>{formatRate(leg.odds)}</Text>
            </View>
            <View style={styles.legTimes}>
              <Text style={styles.muted}>Başlama {formatTime(leg.kickoffAt, day)}</Text>
              <Text style={styles.muted}>{leg.quoteTimeBasis === "CAPTURE_UPPER_BOUND" ? "Bülten kaydı" : "Oran kaydı"} {formatTime(leg.quotedAt, day)}</Text>
            </View>
            {!sharedRationale && leg.rationale !== tier.reason ? <Text style={styles.muted}>{leg.rationale}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  toolbar: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  refresh: {
    alignItems: "center", borderColor: colors.border, borderRadius: radii.round, borderWidth: 1,
    flexDirection: "row", gap: spacing.xs, minHeight: interaction.minTouchTarget, paddingHorizontal: spacing.md
  },
  refreshPressed: { opacity: 0.75 },
  publication: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
  publicationHeader: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  publicationTimes: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: spacing.lg, rowGap: spacing.xs, marginTop: spacing.xs },
  cards: { gap: spacing.md },
  cardsWide: { flexDirection: "row", alignItems: "flex-start" },
  card: { flex: 1, minWidth: 0, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  tierInfo: { flex: 1, gap: spacing.xs },
  price: { alignItems: "flex-end" },
  heading: { ...typeScale.moduleTitle, color: colors.text },
  caption: { ...typeScale.bodyCompact, color: colors.text, fontWeight: "700" },
  muted: { ...typeScale.bodyCompact, color: colors.textMuted },
  body: { ...typeScale.body, color: colors.text },
  demo: { color: semantic.warning },
  preMatch: { color: semantic.intelligence },
  totalOdds: { ...typeScale.metric, color: colors.text },
  legs: { gap: spacing.md },
  leg: { borderTopColor: colors.borderSoft, borderTopWidth: 1, gap: spacing.xs, paddingTop: spacing.sm },
  legHeading: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  legTimes: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: spacing.xs },
  fixture: { ...typeScale.identity, color: colors.text },
  selection: { ...typeScale.bodyCompact, color: colors.text, flex: 1 },
  selectionOdds: { ...typeScale.metricCompact, color: colors.text },
  history: { gap: spacing.sm }
});
