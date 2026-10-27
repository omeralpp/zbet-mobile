import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RebuildStatistics } from "@/src/api/rebuild-statistics-schemas";
import { colors, interaction, radii, semantic, spacing, typeScale } from "@/src/theme/theme";
import { statisticsRows, statisticsStatus } from "@/src/utils/rebuild-statistics-view";
import { ComparisonRow } from "./ComparisonRow";
import { SurfaceMaterial } from "./SurfaceMaterial";

/**
 * Canlı saha dengesi on RB1: the whole panel comes from one verified
 * observation (btb-match-statistics.v1), never mixed with the legacy match
 * columns. When the backend withholds current values the reason is said once
 * and no row is drawn from older data.
 */
const timeFormat = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });

export function RebuildStatisticsPanel({ statistics, isLoading, isError, homeTeam, awayTeam, onRetry, isRefreshing = false }: {
  statistics: RebuildStatistics | undefined;
  isLoading: boolean;
  isError: boolean;
  homeTeam?: string;
  awayTeam?: string;
  onRetry?: () => void;
  isRefreshing?: boolean;
}) {
  const [showMissing, setShowMissing] = useState(false);
  if (!statistics) {
    return <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <Text style={styles.message}>{isLoading ? "İstatistikler yükleniyor…" : isError ? "İstatistikler alınamadı." : "İstatistik yok."}</Text>
      {!isLoading && onRetry ? <Pressable accessibilityRole="button" accessibilityState={{ busy: isRefreshing }} disabled={isRefreshing} onPress={onRetry} style={styles.missingAction}><Text style={styles.missingText}>{isRefreshing ? "Yenileniyor…" : "İstatistikleri yeniden dene"}</Text></Pressable> : null}
    </View>;
  }
  const status = statisticsStatus(statistics);
  const rows = statisticsRows(statistics);
  const missing = rows.filter(row => row.home === null && row.away === null);
  const visible = showMissing ? rows : rows.filter(row => row.home !== null || row.away !== null);
  const complete = rows.filter(row => row.home !== null && row.away !== null).length;
  const reading = [statistics.elapsed !== null ? `${statistics.elapsed}′` : null,
    statistics.observedAt ? timeFormat.format(new Date(statistics.observedAt)) : null].filter(Boolean).join(" · ");
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.status}>
      <View style={[styles.dot, status.tone === "live" ? styles.dotLive : status.tone === "partial" ? styles.dotPartial : styles.dotMuted]} />
      <View style={styles.statusCopy}>
        <Text style={styles.statusText}>{status.values ? statistics.availability === "PARTIAL" ? "Bazı ölçümler eksik" : "Doğrulanmış ölçüm" : status.text}</Text>
        {status.values ? <Text style={styles.reading}>{reading}{reading ? " · " : ""}{complete}/{rows.length} karşılaştırma</Text> : null}
      </View>
    </View>
    {status.values ? <>
      {homeTeam && awayTeam ? <View style={styles.teams}>
        <View style={styles.team}><Text style={styles.side}>Ev sahibi</Text><Text numberOfLines={2} style={styles.home}>{homeTeam}</Text></View>
        <View style={[styles.team, styles.awayTeam]}><Text style={styles.side}>Deplasman</Text><Text numberOfLines={2} style={styles.away}>{awayTeam}</Text></View>
      </View> : null}
      {visible.map((row) => <ComparisonRow key={row.metric} away={row.away} awayText={row.awayText}
        home={row.home} homeText={row.homeText} label={row.label} note={row.note} />)}
      {missing.length ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMissing }} aria-expanded={showMissing} onPress={() => setShowMissing(!showMissing)} style={styles.missingAction}>
        <Text style={styles.missingText}>{showMissing ? "Eksik ölçümleri gizle" : `${missing.length} eksik başlığı göster`}</Text>
      </Pressable> : null}
      <Text style={styles.reading}>0: ölçülen değer · —: ölçüm yok</Text>
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md },
  teams: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  team: { flex: 1, minWidth: 0, gap: spacing.xs },
  awayTeam: { alignItems: "flex-end" },
  side: { ...typeScale.label, color: colors.textMuted },
  home: { ...typeScale.bodyCompact, color: colors.blue, fontWeight: "700" },
  away: { ...typeScale.bodyCompact, color: colors.orange, textAlign: "right", fontWeight: "700" },
  missingAction: { minHeight: interaction.minTouchTarget, justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.borderSoft },
  missingText: { ...typeScale.bodyCompact, color: semantic.intelligence },
  status: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLive: { backgroundColor: semantic.live },
  dotPartial: { backgroundColor: colors.gold },
  dotMuted: { backgroundColor: colors.textMuted },
  statusCopy: { flex: 1, gap: spacing.xs },
  statusText: { ...typeScale.bodyCompact, fontWeight: "700", color: colors.text },
  reading: { ...typeScale.label, color: colors.textMuted, lineHeight: 18 },
  message: { ...typeScale.bodyCompact, color: colors.textMuted }
});
