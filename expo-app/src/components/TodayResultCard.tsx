import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { rebuildCohortsReportQuery } from "@/src/api/queries";
import { useJinxPreferences } from "@/src/mascot/JinxPreferencesProvider";
import { jinxWeekQuip } from "@/src/mascot/jinx-week";
import { colors, iconSizes, interaction, numericFont, radii, semantic, shadows, spacing, typeScale } from "@/src/theme/theme";
import { formatUnits, outcomeSegments, unitsTone } from "@/src/utils/rebuild-display";
import { ChangeEmphasis } from "./ChangeEmphasis";
import { toneColor } from "./DecisionTicket";
import { SurfaceMaterial } from "./SurfaceMaterial";

const orb = require("../../assets/mascot/candidates/jinx-a-open.png");

/**
 * "BTB · Bugün" and Jinx's daily comment as one card (Özet). The result figure
 * and the sentence that explains it used to sit in two places and repeat the
 * same wins, losses and units; here Jinx tells the day and the figure stands
 * beside it. Same report, same neutral words as the bubble and "Günlük yorum"
 * (jinxWeekQuip), with the outcome bar the decision log already uses.
 */
export function TodayResultCard({ variant = "row" }: { variant?: "row" | "tile" }) {
  const report = useQuery(rebuildCohortsReportQuery);
  const preferences = useJinxPreferences();
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Beside the heading on roomy screens; on narrow phones (360 dp and below)
  // the figure takes its own line so the heading never squeezes.
  const roomy = variant === "tile" || width >= 380;
  const period = !report.isError && report.data?.availability === "AVAILABLE"
    ? report.data.periods.find((item) => item.key === "today")
    : undefined;
  const quip = jinxWeekQuip(period);
  const jinx = preferences.ready && !preferences.hidden;
  const loading = report.isPending && !period;
  const unavailable = !period && !loading;
  const active = Boolean(period && period.recommendations > 0);
  const tone = period ? unitsTone(period.net) : "neutral";
  const segments = period ? outcomeSegments(period) : [];
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  const title = loading ? "Bugünün sonucu hazırlanıyor"
    : unavailable ? "Bugünün raporu alınamadı"
    : active ? quip?.title ?? "Bugün"
    : "Bugün henüz öneri yok";
  const message = loading ? null
    : unavailable ? null
    : active ? null
    : jinx ? "Öneri yayımlandığında sonucunu burada takip ederim." : "Öneri yayımlandığında sonucu burada görünür.";
  const spoken = active && quip ? `${jinx ? "Jinx: " : ""}${quip.title}. ${quip.body}`
    : `BTB bugün: ${title}.${message ? ` ${message}` : ""}${unavailable ? " Rapor kendiliğinden yeniden denenir." : ""}`;

  const figure = active && period ? (
    <>
      <ChangeEmphasis kind="alert" token={period.net}>
        <Text numberOfLines={1} style={[styles.value, tone !== "neutral" ? { color: toneColor[tone] } : null]}>
          {formatUnits(period.net)}
        </Text>
      </ChangeEmphasis>
      <Text numberOfLines={roomy ? 1 : 2} style={[styles.valueCaption, !roomy && styles.valueCaptionShrink]}>varsayımsal birim</Text>
    </>
  ) : null;

  return (
    <View style={[styles.frame, variant === "tile" && styles.frameTile]}>
      <SurfaceMaterial radius={18} />
      <Pressable
        accessibilityHint="Tüm Super kararlarını ve sonuç raporunu açar"
        accessibilityLabel={spoken}
        accessibilityRole="button"
        onPress={() => router.push("/super" as never)}
        style={({ pressed, hovered }) => [styles.card, hovered && styles.hover, pressed && styles.pressed]}
      >
        {jinx ? <Image accessible={false} resizeMode="contain" source={orb} style={roomy ? styles.orb : styles.orbNarrow} /> : null}
        <View style={styles.copy}>
          {/* The figure sits beside the heading, so the outcome line below
              gets the card's full width and reads on one line. */}
          <View style={styles.head}>
            <View style={styles.headText}>
              <Text style={styles.eyebrow}>{jinx ? "JİNX · BTB BUGÜN" : "BTB · BUGÜN"}</Text>
              <Text numberOfLines={2} style={styles.title}>{title}</Text>
            </View>
            {figure && roomy ? <View style={styles.figure}>{figure}</View> : null}
          </View>
          {figure && !roomy ? <View style={styles.figureLine}>{figure}</View> : null}
          {active ? (
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.bar}>
              {total ? segments.map((segment) => (
                <View key={segment.key} style={{ flex: segment.count, backgroundColor: toneColor[segment.tone] }} />
              )) : null}
            </View>
          ) : loading ? <View style={[styles.bar, styles.barLoading]} /> : null}
          {/* A legend keyed to the bar's colours; it wraps between outcomes,
              never inside one. */}
          {active ? (
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.legendRow}>
              {segments.map((segment) => (
                <View key={segment.key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: toneColor[segment.tone] }]} />
                  <Text style={styles.legend}>{`${segment.count} ${segment.label}`}</Text>
                </View>
              ))}
            </View>
          ) : message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        <MaterialCommunityIcons accessible={false} color={colors.textMuted} name="chevron-right" size={iconSizes.control} />
      </Pressable>
      {/* Outside the card's own button, so two controls are never nested. */}
      {unavailable ? (
        <Pressable
          accessibilityLabel="Bugünün raporunu yeniden dene"
          accessibilityRole="button"
          accessibilityState={{ busy: report.isFetching }}
          hitSlop={6}
          onPress={() => { void report.refetch(); }}
          style={({ pressed }) => [styles.retry, jinx && (roomy ? styles.retryIndented : styles.retryIndentedNarrow), pressed && styles.retryPressed]}
        >
          <MaterialCommunityIcons accessible={false} color={semantic.intelligence} name="refresh" size={iconSizes.small} />
          <Text style={styles.retryText}>{report.isFetching ? "Deneniyor…" : "Tekrar dene"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.card
  },
  frameTile: {
    flex: 2,
    minWidth: 0,
    width: undefined
  },
  card: {
    minHeight: interaction.preferredTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18
  },
  hover: { backgroundColor: colors.surfaceStrong },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  orb: { width: 46, height: 46, alignSelf: "flex-start" },
  orbNarrow: { width: 38, height: 38, alignSelf: "flex-start" },
  copy: { flex: 1, minWidth: 0, gap: 6 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  headText: { flex: 1, minWidth: 0, gap: 4 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: 2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legend: { ...typeScale.label, color: colors.textMuted, letterSpacing: 0 },
  eyebrow: { ...typeScale.eyebrow, color: colors.gold },
  title: { ...typeScale.body, color: colors.text, fontWeight: "700" },
  message: { ...typeScale.bodyCompact, color: colors.textMuted },
  bar: {
    flexDirection: "row",
    height: 6,
    borderRadius: radii.round,
    overflow: "hidden",
    backgroundColor: colors.surfaceStrong,
    marginTop: 2,
    gap: 2
  },
  barLoading: { width: "60%", opacity: 0.7 },
  retry: {
    minHeight: interaction.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: spacing.md,
    marginLeft: 14,
    marginBottom: 14,
    marginTop: -spacing.xs,
    borderRadius: radii.round,
    backgroundColor: colors.blueSoft
  },
  // Lines the action up with the text beside Jinx.
  retryIndented: { marginLeft: 14 + 46 + spacing.md },
  retryIndentedNarrow: { marginLeft: 14 + 38 + spacing.md },
  retryPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  retryText: { ...typeScale.bodyCompact, color: semantic.intelligence, fontWeight: "700" },
  figure: { alignItems: "flex-end", flexShrink: 0 },
  figureLine: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  value: { ...numericFont("800"), color: colors.text, fontSize: 28, lineHeight: 30 },
  valueCaption: { ...typeScale.label, color: colors.textMuted, letterSpacing: 0, lineHeight: 15 },
  valueCaptionShrink: { flexShrink: 1 }
});
