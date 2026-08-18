import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SuperLog } from "@/src/api/schemas";
import {
  colors,
  radii,
  semantic,
  shadows,
  spacing,
  typeScale
} from "@/src/theme/theme";
import {
  formatDecisionReason,
  formatMatchKeyDateTime,
  formatRate,
  formatSigned,
  formatSuperResult
} from "@/src/utils/format";
import { superMatchIdentity } from "@/src/utils/super-match-identity";
import { hasAnyTeamLogo } from "@/src/utils/team-logo";
import { RatingStars } from "./RatingStars";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { TeamIdentityLine } from "./TeamIdentityLine";
import { TeamLogoPair } from "./TeamLogo";

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
  const identity = superMatchIdentity(log);
  // Energy marks the decisions still in play. A settled row is history and has
  // its result pill; an open one is the only thing on the screen that can still
  // change, which is what makes it worth the accent. Most rows are settled, so
  // the language stays scarce on its own.
  const open = log.result !== "WON" && log.result !== "LOST" && log.result !== "VOID";

  return (
    <Pressable
      accessibilityHint="Dokunulan Super kararının tarihsel detayını açar"
      accessibilityLabel={`${log.matchName}, ${log.rating} yıldız, ${formatSuperResult(log.result)}`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/super/[key]",
          params: {
            key: log.key
          }
        } as never)
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <SurfaceMaterial
        {...(open ? { accent: semantic.intelligence } : {})}
        radius={radii.lg}
      />
      <View style={styles.header}>
        <RatingStars rating={log.rating} />
        <View style={[styles.resultPill, { backgroundColor: `${color}1F` }]}>
          <Text style={[styles.resultText, { color }]}>
            {formatSuperResult(log.result)}
          </Text>
        </View>
      </View>
      {identity ? (
        <View style={styles.identityRow}>
          <TeamIdentityLine
            awayParticipantId={log.awayParticipantId}
            awayTeam={identity.awayTeam}
            homeParticipantId={log.homeParticipantId}
            homeTeam={identity.homeTeam}
          />
        </View>
      ) : (
        <View style={styles.matchRow}>
          {hasAnyTeamLogo(log.homeParticipantId, log.awayParticipantId) ? (
            <TeamLogoPair
              awayParticipantId={log.awayParticipantId}
              homeParticipantId={log.homeParticipantId}
              size="compact"
            />
          ) : null}
          <Text numberOfLines={1} style={styles.match}>
            {log.matchName}
          </Text>
        </View>
      )}
      <Text numberOfLines={1} style={styles.fixtureTime}>
        {formatMatchKeyDateTime(log.matchKey)}
      </Text>
      <Text numberOfLines={1} style={styles.reason}>
        {formatDecisionReason(log.reason)}
      </Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.value}>{log.selectedOdd}</Text>
          <Text style={styles.label}>{log.elapsed}&apos; seçim</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={styles.value}>{formatRate(log.liveRate)}</Text>
          <Text style={styles.label}>seçim oranı</Text>
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
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card
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
    ...typeScale.micro,
    textTransform: "uppercase"
  },
  identityRow: {
    marginTop: spacing.md,
    minHeight: 22
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    minHeight: 22
  },
  match: {
    color: colors.text,
    flexShrink: 1,
    ...typeScale.identity
  },
  reason: {
    color: colors.textMuted,
    ...typeScale.bodyCompact,
    marginTop: spacing.xs
  },
  fixtureTime: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
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
    ...typeScale.metricCompact
  },
  label: {
    color: colors.textSubtle,
    ...typeScale.label,
    marginTop: spacing.xs
  }
});
