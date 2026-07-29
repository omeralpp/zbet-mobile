import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TotoProgram } from "@/src/api/schemas";
import { colors, radii, spacing } from "@/src/theme/theme";
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
  const active = program.status === "ACTIVE";

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
      <View style={styles.header}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            color={colors.green}
            name="ticket-confirmation-outline"
            size={22}
          />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Program {program.gcNo}</Text>
          <Text style={styles.week}>{program.weekText}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            active && styles.activeStatusPill
          ]}
        >
          <Text style={[styles.status, active && styles.activeStatus]}>
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
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md
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
    borderRadius: radii.md,
    backgroundColor: colors.greenSoft
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  week: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  statusPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft
  },
  status: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  activeStatusPill: {
    backgroundColor: colors.greenSoft
  },
  activeStatus: {
    color: colors.green
  },
  metrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: 2
  },
  track: {
    height: 5,
    borderRadius: radii.round,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
    marginTop: spacing.lg
  },
  fill: {
    height: "100%",
    borderRadius: radii.round,
    backgroundColor: colors.green
  },
  capacity: {
    color: colors.textSubtle,
    fontSize: 9,
    textAlign: "right",
    marginTop: spacing.xs
  }
});
