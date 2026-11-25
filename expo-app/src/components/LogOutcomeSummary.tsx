import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";
import { formatUnits, unitsTone } from "@/src/utils/rebuild-display";
import { toneColor } from "./DecisionTicket";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { SurfaceMaterial } from "./SurfaceMaterial";

type Props = {
  counts: Parameters<typeof OutcomeDistribution>[0]["counts"];
  net: string;
  netLabel: string;
  hitRate: string;
  roi: string;
  wide: boolean;
};

export function LogOutcomeSummary({ counts, net, netLabel, hitRate, roi, wide }: Props) {
  const tone = unitsTone(net);
  const extras = [
    counts.pending ? `${counts.pending} bekliyor` : null,
    counts.unresolved ? `${counts.unresolved} çözülemedi` : null,
    counts.voids ? `${counts.voids} iptal` : null
  ].filter(Boolean);
  if (wide) {
    // Desktop: the same four tiles as the Şampiyon tab of the same screen.
    return (
      <View style={styles.tiles}>
        <Tile label={netLabel} value={formatUnits(net)} color={tone === "neutral" ? colors.text : toneColor[tone]} />
        <Tile label="ROI · birim başına" value={roi} />
        <Tile label="isabet" value={hitRate} />
        <Tile label={["kazandı · kaybetti", ...extras].join(" · ")}>
          <Text numberOfLines={1} style={styles.tileValue}>
            <Text style={{ color: semantic.positive }}>{counts.wins}</Text>
            <Text style={styles.tileDot}> · </Text>
            <Text style={{ color: semantic.negative }}>{counts.losses}</Text>
          </Text>
          <OutcomeDistribution counts={counts} />
        </Tile>
      </View>
    );
  }
  return (
    <View style={styles.summary}>
      <SurfaceMaterial radius={16} />
      <View style={[styles.metrics, wide && styles.metricsWide]}>
        <Metric label={netLabel} value={formatUnits(net)} color={tone === "neutral" ? colors.text : toneColor[tone]} />
        <Metric label="ROI" value={roi} />
        <Metric label="İsabet" value={hitRate} />
      </View>
      <View style={styles.outcomes}>
        <Text style={styles.outcomeText}>
          <Text style={{ color: semantic.positive }}>{counts.wins} kazandı</Text>
          {" · "}
          <Text style={{ color: semantic.negative }}>{counts.losses} kaybetti</Text>
          {extras.length ? ` · ${extras.join(" · ")}` : ""}
        </Text>
        <OutcomeDistribution counts={counts} />
      </View>
    </View>
  );
}

function Tile({ value, label, color = colors.text, children }: { value?: string; label: string; color?: string; children?: ReactNode }) {
  return (
    <View style={styles.tile}>
      <SurfaceMaterial radius={16} />
      {children ?? <Text numberOfLines={1} style={[styles.tileValue, { color }]}>{value}</Text>}
      <Text numberOfLines={1} style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function Metric({ label, value, color = colors.text }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 16,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  metrics: { flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: spacing.sm },
  metricsWide: { columnGap: spacing.xl },
  metric: { flexGrow: 1, flexBasis: 64, gap: 2 },
  value: { color: colors.text, ...typeScale.metric, fontSize: 24, lineHeight: 27 },
  label: { color: colors.textMuted, ...typeScale.meta },
  outcomes: { borderTopColor: colors.borderSoft, borderTopWidth: 1, paddingTop: spacing.sm },
  outcomeText: { color: colors.textMuted, ...typeScale.bodyCompact, fontWeight: "700" },
  // Same measures as the Şampiyon tiles (RebuildDecisionLog).
  tiles: { flexDirection: "row", gap: spacing.md },
  tile: { flex: 1, minWidth: 0, gap: 2, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.borderSoft },
  tileValue: { color: colors.text, ...typeScale.metric, fontSize: 32, lineHeight: 36, fontWeight: "800" },
  tileDot: { color: colors.textMuted },
  tileLabel: { color: colors.textMuted, ...typeScale.label, letterSpacing: 0 }
});
