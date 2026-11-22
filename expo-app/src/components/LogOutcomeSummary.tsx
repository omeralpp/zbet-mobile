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
  outcomeText: { color: colors.textMuted, ...typeScale.bodyCompact, fontWeight: "700" }
});
