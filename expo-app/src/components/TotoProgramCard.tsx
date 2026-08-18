import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoProgram } from "@/src/api/schemas";
import {
  colors,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { totoProgramTone } from "@/src/utils/toto-status";
import {
  formatProgramStatus,
  formatSigned
} from "@/src/utils/format";

export function TotoProgramCard({ program }: { program: TotoProgram }) {
  const pathname = usePathname();
  const router = useRouter();
  const capacity = Math.min(
    1,
    program.maxColumns > 0 ? program.columns / program.maxColumns : 0
  );
  const tone = totoProgramTone(program.status);
  const statusColor =
    tone === "LIVE"
      ? semantic.live
      : tone === "OPEN"
        ? semantic.intelligence
        : tone === "PROBLEM"
          ? semantic.negative
          : colors.textMuted;
  // Only a program that can still change earns the accent. A resulted one is
  // history and recedes, exactly as a settled Super row does.
  const inPlay = tone === "LIVE" || tone === "OPEN";

  return (
    <Pressable
      accessibilityHint="Toto program detayını açar"
      accessibilityLabel={`Program ${program.gcNo}, ${program.weekText}`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/toto/[gcNo]/[version]",
          params: {
            gcNo: program.gcNo,
            version: program.version,
            from: pathname
          }
        } as never)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <SurfaceMaterial
        {...(inPlay ? { accent: statusColor } : {})}
        radius={radii.lg}
      />
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: `${statusColor}1F` }]}>
          <MaterialCommunityIcons
            color={statusColor}
            name="ticket-confirmation-outline"
            size={22}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Program {program.gcNo}</Text>
          <Text style={styles.week}>{program.weekText}</Text>
        </View>
        <View
          style={[styles.statusPill, { backgroundColor: `${statusColor}1F` }]}
        >
          <Text style={[styles.status, { color: statusColor }]}>
            {formatProgramStatus(program.status)}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View>
          <Text style={styles.metricValue}>{program.columns}</Text>
          <Text style={styles.metricLabel}>kolon</Text>
        </View>
        <View>
          <Text style={styles.metricValue}>{formatSigned(program.cost, 0)}</Text>
          <Text style={styles.metricLabel}>maliyet</Text>
        </View>
        <View>
          <Text style={styles.metricValue}>
            {program.coverageHits ?? "—"}
          </Text>
          <Text style={styles.metricLabel}>kapsama isabet</Text>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${capacity * 100}%` }]} />
      </View>
      <Text style={styles.capacity}>
        {program.columns} / {program.maxColumns} kolon kapasitesi
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card
  },
  pressed: {
    opacity: 0.76
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.text,
    ...typeScale.decision
  },
  week: {
    color: colors.textMuted,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.round
  },
  status: {
    ...typeScale.micro,
    textTransform: "uppercase"
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  metricValue: {
    color: colors.text,
    ...typeScale.metricCompact
  },
  metricLabel: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  },
  track: {
    height: 5,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
    marginTop: spacing.lg
  },
  // Capacity is a readout, not an outcome, so it takes the analytical accent
  // rather than the colour of a won decision.
  fill: {
    height: "100%",
    borderRadius: radii.round,
    backgroundColor: semantic.intelligence
  },
  capacity: {
    color: colors.textSubtle,
    ...typeScale.label,
    textAlign: "right",
    marginTop: spacing.xs
  }
});
