import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
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
 * Jinx observes the displayed selection against live match facts. She never
 * selects or scores a market, and her commentary has no feedback path.
 *
 * Two properties are structural rather than editorial. First, nothing is
 * fetched until the user asks: an outlook that appeared on its own would read
 * as the product volunteering an opinion about every match it lists. Second,
 * every string is re-checked by the guard before it is drawn, and a refused
 * line is dropped rather than softened, because rewording it here would be this
 * component authoring a reading of its own.
 */
export function AskJinxCard({
  live,
  selectionKey,
  asked,
  isError,
  isLoading,
  onAsk,
  outlook
}: {
  live: boolean;
  selectionKey: string;
  asked: boolean;
  isError?: boolean;
  isLoading?: boolean;
  onAsk: () => void;
  outlook: JinxMatchOutlook | undefined;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const state = resolveOutlookState(outlook, { asked, isLoading, isError });

  if (!live || (asked && outlook?.reasonCode === "MATCH_NOT_LIVE")) {
    return <SystemState kind="UNAVAILABLE" title="Maç canlı değil." message="Jinx yalnız devam eden maçların yıldız seçimini yorumlar." />;
  }
  if (!selectionKey || (asked && outlook?.reasonCode === "NO_SELECTION")) {
    return <SystemState kind="UNAVAILABLE" title="Yorumlanacak yıldız seçimi yok." />;
  }
  if (asked && outlook?.selectionKey && outlook.selectionKey !== selectionKey) {
    return <Pressable accessibilityRole="button" onPress={onAsk} style={styles.entry}>
      <Text style={styles.entryBody}>Seçim değişti. Jinx&apos;e yeniden sor.</Text>
    </Pressable>;
  }

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
            Ekrandaki en yüksek yıldızlı seçimin verilerle tutarlılığını sor.
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
        {outlook?.origin === "DETERMINISTIC" ? (
          <Text style={styles.entryBody}>Veri özeti · Jinx yorumu alınamadı</Text>
        ) : <OriginBadge origin={outlook?.origin} />}
        {outlook?.origin !== "DETERMINISTIC" ? <Text style={styles.confidence}>SEÇİMİN VERİLERLE TUTARLILIĞI</Text> : null}
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
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showEvidence }} onPress={() => setShowEvidence(!showEvidence)} style={styles.evidenceToggle}>
        <Text style={styles.degradedText}>{state === "DEGRADED" ? "Veri kapsamı kısmi" : "Veri kapsamı"} · {showEvidence ? "Ayrıntıları gizle −" : "Eksikleri göster +"}</Text>
      </Pressable>
      {showEvidence ? <CaveatLine text={acceptUncertaintyNote(outlook?.uncertaintyNote)} /> : null}
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
  evidenceToggle: { minHeight: 44, justifyContent: "center" },
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
