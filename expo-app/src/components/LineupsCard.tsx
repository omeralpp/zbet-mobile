import { memo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LiveContext, LiveLineupSide } from "@/src/api/schemas";
import { ModuleHeading } from "@/src/components/ModuleHeading";
import { LiveContextNotice } from "@/src/components/LiveContextNotice";
import {
  benchCount,
  groupStarters,
  positionLabels,
  resolveLineupsState
} from "@/src/components/live-context-view";
import { colors, radii, spacing } from "@/src/theme/theme";

/**
 * Lineups and formation.
 *
 * Secondary to the timeline: substitutes stay collapsed and no pitch graphic is
 * drawn, because the contract carries no coordinates and inventing a shape
 * would be a claim the data does not support.
 *
 * Player names are display data only. Nothing here is tappable, nothing routes
 * on a name, and no identity is derived from one.
 */

function SideHeader({
  side,
  label
}: {
  side: LiveLineupSide;
  label: string;
}) {
  return (
    <View style={styles.sideHeader}>
      <Text numberOfLines={1} style={styles.sideName}>
        {label}
      </Text>
      {side?.formation?.label ? (
        <Text style={styles.formation}>{side.formation.label}</Text>
      ) : null}
    </View>
  );
}

function SideBlock({
  side,
  label,
  expanded
}: {
  side: LiveLineupSide;
  label: string;
  expanded: boolean;
}) {
  if (!side) {
    return (
      <View style={styles.side}>
        <SideHeader label={label} side={side} />
        <Text style={styles.missing}>Kadro bilgisi yok</Text>
      </View>
    );
  }

  const grouped = groupStarters(side);

  return (
    <View style={styles.side}>
      <SideHeader label={label} side={side} />

      {side.manager?.rawName ? (
        <View style={styles.managerRow}>
          <MaterialCommunityIcons
            color={colors.textSubtle}
            name="account-tie"
            size={12}
          />
          <Text numberOfLines={1} style={styles.manager}>
            {side.manager.rawName}
          </Text>
        </View>
      ) : null}

      {grouped.length === 0 ? (
        <Text style={styles.missing}>İlk 11 bilgisi yok</Text>
      ) : (
        grouped.map((entry) => (
          <View key={entry.group} style={styles.group}>
            <Text style={styles.groupLabel}>{entry.label}</Text>
            {entry.players.map((slot, index) => (
              <View
                key={`${entry.group}-${slot.player?.rawName ?? index}`}
                style={styles.playerRow}
              >
                <Text style={styles.shirt}>
                  {slot.player?.shirtNumber ?? "–"}
                </Text>
                <Text numberOfLines={1} style={styles.player}>
                  {slot.player?.rawName ?? "—"}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}

      {expanded && side.substitutes.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>{positionLabels.BENCH}</Text>
          {side.substitutes.map((slot, index) => (
            <View
              key={`bench-${slot.player?.rawName ?? index}`}
              style={styles.playerRow}
            >
              <Text style={styles.shirt}>
                {slot.player?.shirtNumber ?? "–"}
              </Text>
              <Text numberOfLines={1} style={styles.player}>
                {slot.player?.rawName ?? "—"}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LineupsCardComponent({
  context,
  homeTeam,
  awayTeam,
  isLoading
}: {
  context?: LiveContext | undefined;
  homeTeam: string;
  awayTeam: string;
  isLoading?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const state = resolveLineupsState(context, isLoading);
  const lineups = context?.lineups ?? null;
  const bench = benchCount(context);

  return (
    <>
      <ModuleHeading eyebrow="KADROLAR" title="İlk 11 ve dizilişler" />
      <View style={styles.card}>
        {state === "LOADING" ? (
          <Text style={styles.loading}>Kadrolar yükleniyor…</Text>
        ) : state === "UNAVAILABLE" || !lineups ? (
          <LiveContextNotice availability={context?.availability} />
        ) : (
          <>
            <View style={styles.sides}>
              <SideBlock expanded={expanded} label={homeTeam} side={lineups.home} />
              <View style={styles.divider} />
              <SideBlock expanded={expanded} label={awayTeam} side={lineups.away} />
            </View>

            {bench > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setExpanded((value) => !value)}
                style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
              >
                <Text style={styles.toggleText}>
                  {expanded ? "Yedekleri gizle" : `Yedekler (${bench})`}
                </Text>
                <MaterialCommunityIcons
                  color={colors.blue}
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={16}
                />
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </>
  );
}

export const LineupsCard = memo(LineupsCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg
  },
  sides: {
    flexDirection: "row",
    gap: spacing.md
  },
  side: {
    flex: 1,
    minWidth: 0
  },
  divider: {
    backgroundColor: colors.borderSoft,
    width: 1
  },
  sideHeader: {
    borderBottomColor: colors.borderSoft,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm
  },
  sideName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900"
  },
  formation: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  },
  managerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  manager: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 10.5
  },
  group: {
    marginTop: spacing.md
  },
  groupLabel: {
    color: colors.textSubtle,
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  playerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 22
  },
  shirt: {
    color: colors.textSubtle,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    minWidth: 16,
    textAlign: "right"
  },
  player: {
    color: colors.text,
    flex: 1,
    fontSize: 11.5
  },
  missing: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.md
  },
  loading: {
    color: colors.textMuted,
    fontSize: 12,
    paddingVertical: spacing.md,
    textAlign: "center"
  },
  toggle: {
    alignItems: "center",
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 44,
    paddingTop: spacing.sm
  },
  pressed: {
    opacity: 0.7
  },
  toggleText: {
    color: colors.blue,
    fontSize: 12,
    fontWeight: "800"
  }
});
