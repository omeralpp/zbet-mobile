import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { LiveContextAvailability } from "@/src/api/schemas";
import {
  resolveFreshnessNotice,
  unavailableMessage
} from "@/src/components/live-context-view";
import { colors, semantic, spacing, typeScale } from "@/src/theme/theme";

/**
 * Honest state for live context that could not be retrieved.
 *
 * The user is told what they can act on — the data is not available right now,
 * the rest of the screen still works — and nothing else. No provider name, no
 * HTTP status, no error code, no hint that a third party exists at all.
 *
 * `UNAVAILABLE` and `FAILED` deliberately read the same to the user: both mean
 * "no events to show right now", and the difference only matters to telemetry.
 */
export function LiveContextNotice({
  availability
}: {
  availability?: LiveContextAvailability | undefined;
}) {
  const message = unavailableMessage(availability);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        color={semantic.unavailable}
        name="timeline-clock-outline"
        size={26}
      />
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.body}>
        Maç detayının geri kalanı etkilenmez.
      </Text>
    </View>
  );
}

/**
 * Freshness line for retrieved-but-unconfirmed data.
 *
 * `stale` and `refreshFailed` are separate signals from the contract and are
 * reported separately: age past the threshold is not the same as "we could not
 * reach the source to confirm this". Neither is ever presented as confirmed
 * current data.
 */
export function LiveContextFreshness({
  ageSeconds,
  stale,
  refreshFailed
}: {
  ageSeconds?: number | null | undefined;
  stale?: boolean | undefined;
  refreshFailed?: boolean | undefined;
}) {
  const notice = resolveFreshnessNotice({ ageSeconds, stale, refreshFailed });
  if (!notice.visible || !notice.message) {
    return null;
  }
  const message = notice.message;

  return (
    <View accessibilityLabel={message} accessible style={styles.freshness}>
      <MaterialCommunityIcons
        color={semantic.stale}
        name="clock-alert-outline"
        size={12}
      />
      <Text style={styles.freshnessText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg
  },
  title: {
    color: colors.text,
    ...typeScale.label,
    textAlign: "center"
  },
  body: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    textAlign: "center"
  },
  freshness: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end",
    marginTop: spacing.sm
  },
  freshnessText: {
    color: semantic.stale,
    ...typeScale.label
  }
});
