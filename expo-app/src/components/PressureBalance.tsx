import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/src/theme/theme";
import { formatAbsolute } from "@/src/utils/format";
import {
  derivePressureBalance,
  type PressureDirection
} from "@/src/utils/pressure-balance";

export function PressureBalance({
  totalPressure,
  pressureDiff,
  label = "Karar anı baskı dengesi"
}: {
  totalPressure: number | null;
  pressureDiff: number | null;
  label?: string;
}) {
  const balance = derivePressureBalance(totalPressure, pressureDiff);
  const fillWidth: `${number}%` = `${balance.magnitudeRatio * 100}%`;
  const homeWidth: `${number}%` =
    balance.direction === "HOME" ? fillWidth : "0%";
  const awayWidth: `${number}%` =
    balance.direction === "AWAY" ? fillWidth : "0%";
  const directionLabel: Record<PressureDirection, string> = {
    HOME: "Ev sahibi baskısı",
    AWAY: "Deplasman baskısı",
    BALANCED: "Dengeli"
  };
  const value = balance.hasData ? formatAbsolute(pressureDiff ?? 0, 1) : "—";

  return (
    <View
      accessibilityLabel={
        balance.hasData
          ? `${label}, baskı farkı ${value}, ${directionLabel[balance.direction]}`
          : `${label}, veri bekleniyor`
      }
      style={styles.container}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.labels}>
        <Text style={styles.home}>Ev sahibi</Text>
        <View style={styles.valueBlock}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.caption}>
            {balance.hasData
              ? directionLabel[balance.direction]
              : "Veri bekleniyor"}
          </Text>
        </View>
        <Text style={styles.away}>Deplasman</Text>
      </View>
      <View style={styles.axis}>
        <View style={styles.homeTrack}>
          <View style={[styles.homeFill, { width: homeWidth }]} />
        </View>
        <View style={styles.zero} />
        <View style={styles.awayTrack}>
          <View style={[styles.awayFill, { width: awayWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: spacing.md
  },
  labels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  home: {
    flex: 1,
    color: colors.blue,
    fontSize: 10,
    fontWeight: "800"
  },
  away: {
    flex: 1,
    color: colors.green,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right"
  },
  valueBlock: {
    alignItems: "center",
    minWidth: 92
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  caption: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: 2
  },
  axis: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm
  },
  homeTrack: {
    flex: 1,
    height: 6,
    alignItems: "flex-end",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.surfaceStrong
  },
  awayTrack: {
    flex: 1,
    height: 6,
    alignItems: "flex-start",
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.surfaceStrong
  },
  homeFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.blue
  },
  awayFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.green
  },
  zero: {
    width: 3,
    height: 12,
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: colors.textMuted
  }
});
