import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SuperLog } from "@/src/api/schemas";
import { colors, radii, spacing } from "@/src/theme/theme";
import {
  formatRate,
  formatSigned,
  formatSuperResult
} from "@/src/utils/format";
import { RatingStars } from "./RatingStars";

function resultColor(result: SuperLog["result"]): string {
  if (result === "WON") {
    return colors.green;
  }
  if (result === "LOST") {
    return colors.red;
  }
  if (result === "VOID") {
    return colors.textSubtle;
  }
  return colors.blue;
}

export function SuperLogCard({ log }: { log: SuperLog }) {
  const router = useRouter();
  const color = resultColor(log.result);

  return (
    <Pressable
      accessibilityHint="İlgili maçın detayını açar"
      accessibilityLabel={`${log.matchName}, ${log.rating} yıldız, ${formatSuperResult(log.result)}`}
      accessibilityRole="button"
      onPress={() =>
        router.push(`/match/${encodeURIComponent(log.matchKey)}` as never)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <RatingStars rating={log.rating} />
        <View style={[styles.resultPill, { backgroundColor: `${color}1F` }]}>
          <Text style={[styles.resultText, { color }]}>
            {formatSuperResult(log.result)}
          </Text>
        </View>
      </View>
      <Text numberOfLines={1} style={styles.match}>
        {log.matchName}
      </Text>
      <Text numberOfLines={1} style={styles.reason}>
        {log.reason}
      </Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.value}>{log.selectedOdd}</Text>
          <Text style={styles.label}>{log.elapsed}&apos; seçim</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={styles.value}>{formatRate(log.liveRate)}</Text>
          <Text style={styles.label}>oran</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={[styles.value, { color }]}>
            {log.profit === null ? "—" : formatSigned(log.profit)}
          </Text>
          <Text style={styles.label}>kâr</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  pressed: {
    opacity: 0.75
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  resultPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.round
  },
  resultText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  match: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
    marginTop: spacing.md
  },
  reason: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  alignEnd: {
    alignItems: "flex-end"
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  label: {
    color: colors.textSubtle,
    fontSize: 9,
    marginTop: 2
  }
});
