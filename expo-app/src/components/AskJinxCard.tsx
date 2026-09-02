import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { JinxMatchOutlook, JinxOutlookSignal } from "@/src/api/schemas";
import {
  acceptBody,
  acceptHeadline,
  acceptUncertaintyNote,
  confidenceBand,
  confidenceLabels,
  directionLabels,
  informativeOnlyNotice,
  outlookFreshnessNotice,
  outlookSignals,
  resolveOutlookState
} from "@/src/mascot/jinx-match-outlook";
import {
  colors,
  iconSizes,
  interaction,
  radii,
  semantic,
  spacing,
  typeScale
} from "@/src/theme/theme";
import { CaveatLine, OriginBadge } from "./IntelligenceNotice";
import { SurfaceMaterial } from "./SurfaceMaterial";
import { SystemState } from "./StateView";

/**
 * Informative Ask Jinx match surface (M15 / TASK-0046).
 *
 * Jinx reads the match out loud. She does not decide anything, does not know
 * what anyone should do about it, and is not connected to the model, a Super
 * decision or a rating — the real centralized analyst is TASK-0011 under M11.
 *
 * Two properties are structural rather than editorial. First, nothing is
 * fetched until the user asks: an outlook that appeared on its own would read
 * as the product volunteering an opinion about every match it lists. Second,
 * every string is re-checked by the guard before it is drawn, and a refused
 * line is dropped rather than softened, because rewording it here would be this
 * component authoring a reading of its own.
 */
export function AskJinxCard({
  asked,
  isError,
  isLoading,
  onAsk,
  outlook
}: {
  asked: boolean;
  isError?: boolean;
  isLoading?: boolean;
  onAsk: () => void;
  outlook: JinxMatchOutlook | undefined;
}) {
  const state = resolveOutlookState(outlook, { asked, isLoading, isError });

  if (state === "IDLE") {
    return (
      <Pressable
        accessibilityHint="Bu maç için bilgilendirici bir okuma ister"
        accessibilityRole="button"
        onPress={onAsk}
        style={styles.entry}
      >
        <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
        <MaterialCommunityIcons
          color={semantic.intelligence}
          name="chat-question-outline"
          size={iconSizes.control}
        />
        <View style={styles.entryCopy}>
          <Text style={styles.entryTitle}>Jinx&apos;e sor</Text>
          <Text style={styles.entryBody}>
            Bu maç için kısa, bilgilendirici bir okuma al.
          </Text>
        </View>
      </Pressable>
    );
  }

  if (state === "LOADING") {
    return <SystemState kind="LOADING" title="Jinx maça bakıyor" />;
  }

  if (state === "UNAVAILABLE") {
    return (
      <SystemState
        kind="UNAVAILABLE"
        message="Jinx bu maç için şu anda bir okuma üretemiyor. Maç detayının geri kalanı etkilenmez."
      />
    );
  }

  const headline = acceptHeadline(outlook?.headline);
  const body = acceptBody(outlook?.body);
  const band = confidenceBand(outlook?.confidence);
  const signals = outlookSignals(outlook);
  const freshness = outlookFreshnessNotice(outlook);

  return (
    <View style={styles.card}>
      <SurfaceMaterial accent={semantic.intelligence} radius={radii.lg} />
      <View style={styles.header}>
        <OriginBadge origin={outlook?.origin} />
        {state === "DEGRADED" ? (
          <View style={styles.degradedPill}>
            <Text style={styles.degradedText}>Kısmi veri</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.headline}>{headline}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}

      {signals.length ? (
        <View style={styles.signals}>
          {signals.map((signal) => (
            <SignalChip key={signal.signalKey} signal={signal} />
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        {band ? (
          <Text style={styles.confidence}>{confidenceLabels[band]}</Text>
        ) : null}
        {freshness ? <Text style={styles.freshness}>{freshness}</Text> : null}
      </View>

      <CaveatLine text={acceptUncertaintyNote(outlook?.uncertaintyNote)} />
      <CaveatLine text={informativeOnlyNotice} />
    </View>
  );
}

/**
 * One named reason, coloured by direction.
 *
 * The colours say which way the reason points within this reading only. They
 * are not a verdict on the match and carry no won/lost meaning, so supporting
 * uses the analytical accent rather than the positive green that a settled
 * decision owns.
 */
function SignalChip({ signal }: { signal: JinxOutlookSignal }) {
  const accent =
    signal.direction === "SUPPORTING"
      ? semantic.intelligence
      : signal.direction === "OPPOSING"
        ? colors.bronze
        : colors.textSubtle;

  return (
    <View
      accessibilityLabel={`${directionLabels[signal.direction]}: ${signal.label}`}
      accessible
      style={[styles.chip, { borderColor: accent }]}
    >
      <View style={[styles.chipDot, { backgroundColor: accent }]} />
      <Text numberOfLines={2} style={styles.chipText}>
        {signal.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  entry: {
    alignItems: "center",
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: interaction.preferredTouchTarget,
    overflow: "hidden",
    padding: spacing.lg
  },
  entryCopy: {
    flexShrink: 1,
    gap: 2
  },
  entryTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  entryBody: {
    color: colors.textMuted,
    ...typeScale.label
  },
  card: {
    borderRadius: radii.lg,
    gap: spacing.md,
    overflow: "hidden",
    padding: spacing.lg
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  degradedPill: {
    backgroundColor: semantic.staleSoft,
    borderRadius: radii.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  degradedText: {
    color: semantic.stale,
    ...typeScale.label
  },
  headline: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19
  },
  signals: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    alignItems: "center",
    borderRadius: radii.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    maxWidth: "100%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  chipDot: {
    borderRadius: 3,
    height: 6,
    width: 6
  },
  chipText: {
    color: colors.textMuted,
    flexShrink: 1,
    ...typeScale.label
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  confidence: {
    color: semantic.intelligence,
    ...typeScale.label
  },
  freshness: {
    color: semantic.stale,
    ...typeScale.label
  }
});
