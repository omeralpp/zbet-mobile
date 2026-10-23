import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RebuildStatistics } from "@/src/api/rebuild-statistics-schemas";
import { colors, radii, semantic, spacing, textFont, typeScale } from "@/src/theme/theme";
import { statisticsRows, statisticsStatus } from "@/src/utils/rebuild-statistics-view";
import { ComparisonRow } from "./ComparisonRow";
import { SurfaceMaterial } from "./SurfaceMaterial";

/**
 * Canlı saha dengesi on RB1: the whole panel comes from one verified
 * observation (btb-match-statistics.v1), never mixed with the legacy match
 * columns. When the backend withholds current values the reason is said once
 * and no row is drawn from older data.
 */
export function RebuildStatisticsPanel({ statistics, isLoading, isError, homeTeam, awayTeam }: {
  statistics: RebuildStatistics | undefined;
  isLoading: boolean;
  isError: boolean;
  homeTeam?: string;
  awayTeam?: string;
}) {
  const [showMissing, setShowMissing] = useState(false);
  if (!statistics) {
    return <View style={styles.card}>
      <SurfaceMaterial radius={radii.lg} />
      <Text style={styles.message}>{isLoading ? "İstatistikler yükleniyor…" : isError ? "İstatistikler alınamadı." : "İstatistik yok."}</Text>
    </View>;
  }
  const status = statisticsStatus(statistics);
  const rows = statisticsRows(statistics);
  const missing = rows.filter(row => row.home === null && row.away === null);
  const visible = showMissing ? rows : rows.filter(row => row.home !== null || row.away !== null);
  return <View style={styles.card}>
    <SurfaceMaterial radius={radii.lg} />
    <View style={styles.status}>
      <View style={[styles.dot, status.tone === "live" ? styles.dotLive : status.tone === "partial" ? styles.dotPartial : styles.dotMuted]} />
      <Text style={styles.statusText}>{status.text}</Text>
    </View>
    {status.values ? <>
      {homeTeam && awayTeam ? <View style={styles.teams}><Text style={styles.home}>{homeTeam}</Text><Text style={styles.away}>{awayTeam}</Text></View> : null}
      {visible.map((row) => <ComparisonRow key={row.metric} away={row.away} awayText={row.awayText}
        home={row.home} homeText={row.homeText} label={row.label} note={row.note} />)}
      {missing.length ? <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMissing }} onPress={() => setShowMissing(!showMissing)} style={styles.missingAction}>
        <Text style={styles.missingText}>{showMissing ? "Eksik ölçümleri gizle" : `${missing.length} ölçüm yok · ayrıntıları göster`}</Text>
      </Pressable> : null}
    </> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.lg, borderWidth: 1, borderColor: colors.borderSoft, padding: spacing.lg, gap: spacing.md },
  teams: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  home: { ...typeScale.label, color: colors.blue, flex: 1, fontWeight: "700" },
  away: { ...typeScale.label, color: colors.orange, flex: 1, textAlign: "right", fontWeight: "700" },
  missingAction: { minHeight: 44, justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.borderSoft },
  missingText: { ...typeScale.bodyCompact, color: semantic.intelligence },
  status: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLive: { backgroundColor: semantic.live },
  dotPartial: { backgroundColor: colors.gold },
  dotMuted: { backgroundColor: colors.textMuted },
  statusText: { ...textFont("500"), fontSize: 13, lineHeight: 18, color: colors.textMuted, flex: 1 },
  message: { ...typeScale.bodyCompact, color: colors.textMuted }
});
