import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoProgram } from "@/src/api/schemas";
import {
  colors,
  iconSizes,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { totoProgramTone } from "@/src/utils/toto-status";
import {
  formatProgramStatus
} from "@/src/utils/format";

export function totoStatusColor(status: TotoProgram["status"]): string {
  const tone = totoProgramTone(status);
  // Waiting for results wears the v40 board's gold (owner decision
  // 2026-10-21); the tone itself stays "open" in toto-status.ts.
  return tone === "LIVE"
    ? semantic.live
    : tone === "OPEN"
      ? colors.gold
      : tone === "PROBLEM"
        ? semantic.negative
        : colors.textMuted;
}

export function TotoProgramCard({ program }: { program: TotoProgram }) {
  const pathname = usePathname();
  const router = useRouter();
  const capacity = Math.min(
    1,
    program.maxColumns > 0 ? program.columns / program.maxColumns : 0
  );
  const tone = totoProgramTone(program.status);
  const statusColor = totoStatusColor(program.status);
  // Only a program that can still change earns the accent. A resulted one is
  // history and recedes, exactly as a settled decision row does.
  const inPlay = tone === "LIVE" || tone === "OPEN";

  // The theoretical prize lives in the program itself (v40 board); the card
  // stays the program's columns, cost and coverage.
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
        radius={20}
      />
      <View style={styles.header}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            color={inPlay ? statusColor : colors.textMuted}
            name="ticket-confirmation-outline"
            size={iconSizes.control}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Program {program.gcNo}</Text>
          <Text style={styles.week}>{program.weekText}</Text>
        </View>
        <View style={styles.statusStack}>
          <View
            style={[styles.statusPill, inPlay ? { backgroundColor: `${statusColor}24` } : null]}
          >
            {inPlay ? <View style={[styles.statusDot, { backgroundColor: statusColor }]} /> : null}
            <Text style={[styles.status, { color: inPlay ? statusColor : colors.text }]}>
              {formatProgramStatus(program.status).toLocaleUpperCase("tr-TR")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{program.columns}</Text>
          <Text style={styles.metricLabel}>kolon</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(program.cost)}</Text>
          <Text style={styles.metricLabel}>maliyet</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {program.coverageHits ?? "—"}
          </Text>
          <Text style={styles.metricLabel}>kapsama isabet</Text>
        </View>
      </View>

      <Text style={styles.contextNote}>Kapsama isabeti, kuponun kazandığı anlamına gelmez. Maliyet birimi belirtilmedi.</Text>

      <View style={styles.capacityBlock}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${capacity * 100}%` }]} />
        </View>
        <View style={styles.capacityRow}>
          <Text style={styles.capacityLabel}>Kolon kapasitesi</Text>
          <Text style={styles.capacityValue}>
            {program.columns} / {program.maxColumns}
          </Text>
        </View>
      </View>
      <View style={styles.open}>
        <Text style={styles.openText}>Programı aç</Text>
        <MaterialCommunityIcons color={semantic.intelligence} name="chevron-right" size={iconSizes.small} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    gap: 14,
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
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surfaceStrong
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.text,
    ...typeScale.moduleTitle
  },
  week: {
    color: colors.textMuted,
    ...typeScale.bodyCompact
  },
  statusPill: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: radii.round,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusDot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  statusStack: {
    alignItems: "flex-end",
    flexShrink: 0,
    gap: spacing.xs
  },
  status: {
    ...typeScale.eyebrow
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  metric: {
    flex: 1,
    minWidth: 0
  },
  metricValue: {
    color: colors.text,
    ...typeScale.metric,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "800"
  },
  metricLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    letterSpacing: 0
  },
  capacityBlock: {
    gap: 6
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden"
  },
  // Capacity is a readout, not an outcome, so it takes the analytical accent
  // rather than the colour of a won decision.
  fill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: semantic.intelligence
  },
  capacityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  capacityLabel: {
    color: colors.textMuted,
    ...typeScale.label,
    fontWeight: "700",
    letterSpacing: 0
  },
  capacityValue: {
    color: colors.text,
    ...typeScale.metricCompact,
    fontSize: 14,
    lineHeight: 18
  },
  open: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 2
  },
  openText: {
    color: semantic.intelligence,
    ...typeScale.bodyCompact,
    fontSize: 14,
    fontWeight: "700"
  },
  contextNote: { ...typeScale.bodyCompact, color: colors.textMuted }
});
